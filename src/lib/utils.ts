import { GOOGLE_REDIRECT_URL } from "@/config";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getGoogleSignInUrl = (redirect?: string | null) => {
  const searchParams = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    redirect_uri: GOOGLE_REDIRECT_URL,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
  });
  if (redirect) searchParams.set("state", encodeURIComponent(redirect));
  return `https://accounts.google.com/o/oauth2/v2/auth?${searchParams.toString()}`;
};
