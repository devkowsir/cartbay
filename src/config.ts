export const USER_ROLES = ["customer", "seller", "admin"] as const;
export const TOKEN_AGE = 60 * 60 * 24 * 7; // 7 day
export const GOOGLE_REDIRECT_URL =
  process.env.NODE_ENV == "development"
    ? "http://localhost:3000/api/auth/callback/google"
    : "https://cartbay.vercel.app";
