export const USER_ROLES = ["customer", "seller", "admin"] as const;
export const TOKEN_AGE = 60 * 60 * 24 * 7; // 7 day
export const ORIGIN = process.env.NODE_ENV == "development" ? "http://localhost:3000" : "https://cartbay.vercel.app";
export const GOOGLE_REDIRECT_URL = `${ORIGIN}/api/auth/callback/google`;
