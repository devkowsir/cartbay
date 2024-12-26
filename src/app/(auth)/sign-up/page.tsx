"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { signUpSchema, type TSignUpSchema } from "@/lib/zod/auth-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { LuEye, LuEyeOff, LuLoaderCircle } from "react-icons/lu";
import { z } from "zod";

const Page = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<TSignUpSchema>({ resolver: zodResolver(signUpSchema) });

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(response.statusText);
      const user = await response.json();
      // store user in memory
      console.log(user);
      toast({ title: "Sign Up Successful." });
    } catch (err) {
      console.error(err);
      const title = err instanceof Error ? err.message : "Something went wrong!";
      toast({ title, variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-foreground text-2xl font-semibold">Create New Account</h1>
      <form className="flex flex-col gap-2 w-full mx-auto text-left" onSubmit={handleSubmit(onSubmit)}>
        <Input type="text" labelText="Name" placeholder="John Doe" required {...register("name")} />
        <Input type="text" labelText="Email" placeholder="you@example.com" required {...register("email")} />
        <div className="relative">
          <Input
            type={isPasswordVisible ? "text" : "password"}
            labelText="Password"
            placeholder="Your password"
            minLength={6}
            required
            {...register("password")}
          />
          {isPasswordVisible ? (
            <LuEye
              className="absolute bottom-2 right-2 w-4 text-foreground/75 cursor-pointer"
              onClick={() => setIsPasswordVisible((prev) => !prev)}
            />
          ) : (
            <LuEyeOff
              className="absolute bottom-2 right-2 w-4 text-foreground/75 cursor-pointer"
              onClick={() => setIsPasswordVisible((prev) => !prev)}
            />
          )}
        </div>
        <Button className="mt-2 items-center" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex gap-2 items-center">
              <LuLoaderCircle className="animate-spin" />
              Signing Up
            </span>
          ) : (
            <span>Sign Up</span>
          )}
        </Button>
      </form>
      <div className="text-center text-xs text-foreground/75">
        <span>
          Already have an account?{" "}
          <Link href={"/sign-in"} className={`text-primary text-xs font-semibold`}>
            Sign In
          </Link>
        </span>
      </div>
    </div>
  );
};

export default Page;
