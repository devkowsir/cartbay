"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect, RedirectType, useRouter } from "next/navigation";
import { use, useState } from "react";
import { useForm } from "react-hook-form";
import { LuEye, LuEyeOff, LuLoaderCircle } from "react-icons/lu";
import { z } from "zod";

const schema = z.object({
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
});

type Schema = z.infer<typeof schema>;

const Page = ({ searchParams }: { searchParams: Promise<{ code: string | null }> }) => {
  const router = useRouter();
  const { code } = use(searchParams);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<Schema>({ resolver: zodResolver(schema) });

  if (!code || typeof code !== "string") {
    redirect("/sign-in", RedirectType.replace);
  }

  const onSubmit = async (data: z.infer<typeof schema>) => {
    if (data.password !== data.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, newPassword: data.password }),
      });
      const { message } = await response.json();
      if (!response.ok) throw new Error(message);
      toast({ title: "Password reset was successful." });
      router.push("/sign-in");
    } catch (err) {
      console.error(err);
      toast({ title: err instanceof Error ? err.message : "Something went wrong!", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-foreground text-2xl font-semibold">Create New Password</h1>
      <form className="flex flex-col gap-2 w-full mx-auto text-left" onSubmit={handleSubmit(onSubmit)}>
        <div className="relative">
          <Input
            type={isPasswordVisible ? "text" : "password"}
            labelText="Password"
            placeholder="Password"
            minLength={6}
            required
            {...register("password")}
          />
          {isPasswordVisible ? (
            <LuEye
              className="absolute bottom-2.5 right-2 w-4 text-foreground/75 cursor-pointer"
              onClick={() => setIsPasswordVisible((prev) => !prev)}
            />
          ) : (
            <LuEyeOff
              className="absolute bottom-2.5 right-2 w-4 text-foreground/75 cursor-pointer"
              onClick={() => setIsPasswordVisible((prev) => !prev)}
            />
          )}
        </div>
        <div className="relative">
          <Input
            type={isConfirmPasswordVisible ? "text" : "password"}
            labelText="Confirm Password"
            placeholder="Confirm password"
            minLength={6}
            required
            {...register("confirmPassword")}
          />
          {isConfirmPasswordVisible ? (
            <LuEye
              className="absolute bottom-2.5 right-2 w-4 text-foreground/75 cursor-pointer"
              onClick={() => setIsConfirmPasswordVisible((prev) => !prev)}
            />
          ) : (
            <LuEyeOff
              className="absolute bottom-2.5 right-2 w-4 text-foreground/75 cursor-pointer"
              onClick={() => setIsConfirmPasswordVisible((prev) => !prev)}
            />
          )}
        </div>
        <Button className="mt-2 items-center" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex gap-2 items-center">
              <LuLoaderCircle className="animate-spin" />
              Saving
            </span>
          ) : (
            <span>Update Password</span>
          )}
        </Button>
      </form>
    </div>
  );
};

export default Page;
