"use client";

import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useServerToast = () => {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const searchParams = new URL(window.location.href).searchParams;
    const error = searchParams.get("error");
    const success = searchParams.get("success");
    if (error) {
      toast({ title: error.replaceAll(/_/g, " "), variant: "destructive" });
      router.replace("/sign-in");
      return;
    }
    if (success) {
      toast({ title: success.replaceAll(/_/g, " "), variant: "destructive" });
      router.replace("/sign-in");
      return;
    }
  }, []);
};
