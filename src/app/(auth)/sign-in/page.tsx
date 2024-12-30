"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getGoogleSignInUrl } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BiLogoGoogle } from "react-icons/bi";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type Schema = z.infer<typeof schema>;

const Page = ({ searchParams }: { searchParams: { redirect: string | null } }) => {
  const router = useRouter();
  const { redirect } = searchParams;
  const [isReseting, setIsReseting] = useState(false);
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isPasswordResetDialogShown, setIsPasswordResetDialogShown] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    getValues,
  } = useForm<Schema>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const { message } = await response.json();
      if (!response.ok) throw new Error(message);
      router.push(redirect ? decodeURIComponent(redirect) : "/");
      toast({ title: "Sign In Successful." });
    } catch (err) {
      console.error(err);
      const title = err instanceof Error ? err.message : "Something went wrong!";
      toast({ title, variant: "destructive" });
    }
  };

  const handleForgotPassword = async () => {
    setIsReseting(true);
    try {
      const email = getValues("email");
      const response = await fetch(`/api/auth/reset-password?email=${email}`);
      const { message } = await response.json();
      if (!response.ok) throw new Error(message);
      toast({ title: "A password reset link has been sent." });
    } catch (err) {
      if (err instanceof Error) toast({ title: err.message, variant: "destructive" });
      else toast({ title: "Something went wrong!", variant: "destructive" });
    } finally {
      setIsReseting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-foreground text-2xl font-semibold">Welcome Back</h1>
      <form className="shrink-0 flex flex-col gap-2 w-full mx-auto text-left" onSubmit={handleSubmit(onSubmit)}>
        <Input type="text" labelText="Email" placeholder="you@example.com" required {...register("email")} />
        <div className="relative">
          <Input
            type={isPasswordShown ? "text" : "password"}
            labelText="Password"
            placeholder="Your password"
            minLength={6}
            required
            {...register("password")}
          />
          {isPasswordShown ? (
            <Eye
              className="absolute bottom-2.5 right-2 w-4 text-foreground/75 cursor-pointer"
              onClick={() => setIsPasswordShown((prev) => !prev)}
            />
          ) : (
            <EyeOff
              className="absolute bottom-2.5 right-2 w-4 text-foreground/75 cursor-pointer"
              onClick={() => setIsPasswordShown((prev) => !prev)}
            />
          )}
        </div>
        <div className="flex justify-end">
          <Button
            className={`text-xs p-1 h-min text-foreground/75 hover:bg-primary/25`}
            variant={"ghost"}
            size={"sm"}
            onClick={() => setIsPasswordResetDialogShown(true)}
            type="button"
          >
            Forgot Password?
          </Button>
        </div>
        <Button className="mt-2 items-center" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex gap-2 items-center">
              <Loader2 className="animate-spin" />
              Signing In
            </span>
          ) : (
            <span>Sign In</span>
          )}
        </Button>
      </form>
      <div className="text-center text-xs text-foreground/75">
        <span>
          Don&apos;t have account?{" "}
          <Link href={"/sign-up"} className={`text-primary text-xs font-semibold`}>
            Sign Up
          </Link>
        </span>
      </div>
      <div className="my-4 relative">
        <span className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-sm font-medium bg-background">
          Or
        </span>
        <hr className="border-border/25 border-t" />
      </div>
      <div>
        <Link
          className={`${buttonVariants({ variant: "outline", className: "w-full flex items-center gap-2" })}`}
          href={`${getGoogleSignInUrl(redirect)}`}
        >
          <BiLogoGoogle className="fill-current stroke-current" />
          Sign In with Google
        </Link>
      </div>
      <Dialog open={isPasswordResetDialogShown} onOpenChange={() => setIsPasswordResetDialogShown(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Email</DialogTitle>
            <DialogDescription className="text-foreground/50">
              We will send a password reset email. Please confirm your email.
            </DialogDescription>
          </DialogHeader>
          <Input labelText="Email" type="email" className="col-span-3" {...register("email")} autoFocus={false} />
          <DialogFooter>
            <Button type="button" onClick={handleForgotPassword} disabled={isReseting}>
              {isReseting ? "Sending Email" : "Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;
