"use client";

import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const UrlMessages = () => {
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const { pathname, searchParams } = new URL(window.location.href);
    const error = searchParams.get("error");
    const success = searchParams.get("success");

    if (error) {
      toast({ title: error[0].toUpperCase() + error.slice(1).replaceAll("_", " "), variant: "destructive" });
      // replace error message from url
      searchParams.delete("error");
      router.replace(`${pathname}?${searchParams.toString()}`);
    }
    if (success) {
      toast({ title: success[0].toUpperCase() + success.slice(1).replaceAll("_", " ") });
      // replace success message from url
      searchParams.delete("success");
      router.replace(`${pathname}?${searchParams.toString()}`);
    }
  }, []);

  return <></>;
};

export default UrlMessages;
