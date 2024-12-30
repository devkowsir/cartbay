import { GOOGLE_REDIRECT_URL } from "@/config";
import db from "@/db/postgres";
import { getAuthCookie } from "@/lib/jose";
import { createAuth, createUser, getUserData } from "@/services/auth";
import { GoogleUserInfo, GoogleUserTokens, User } from "@/types/auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const searchParams = new URL(req.url).searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const origin = new URL(req.url).origin;
    // here the state is redirect url from auth flow without origin. source is in calling the getGoogleSignInUrl
    // in sign-in and sign-up pages
    const state = searchParams.get("state");
    const successRedirect = new URL(state ? decodeURIComponent(state) : "/", origin);
    const failureRedirect = new URL("/sign-in", origin);
    if (error) {
      failureRedirect.searchParams.set("error", encodeURIComponent(error));
      return NextResponse.redirect(failureRedirect);
    }
    if (!code) {
      failureRedirect.searchParams.set("error", "auth_code_missing");
      return NextResponse.redirect(failureRedirect);
    }

    const tokenRequestResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: code,
        redirect_uri: GOOGLE_REDIRECT_URL!,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRequestResponse.ok) {
      failureRedirect.searchParams.set("error", "invalid_auth_code");
      return NextResponse.redirect(failureRedirect);
    }

    const googleTokens: GoogleUserTokens = await tokenRequestResponse.json();

    const googleUserInfoRequestResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${googleTokens.access_token}` },
    });
    if (!googleUserInfoRequestResponse.ok) {
      failureRedirect.searchParams.set("error", "invalid_access_token");
      return NextResponse.redirect(failureRedirect);
    }

    const googleUserInfo: GoogleUserInfo = await googleUserInfoRequestResponse.json();

    let user: User | Awaited<ReturnType<typeof getUserData>>;
    const foundUser = await getUserData(googleUserInfo.email);

    if (foundUser && foundUser.authType !== "google") {
      failureRedirect.searchParams.set("error", "you_are_not_registered_using_google_sign-in_method");
      return NextResponse.redirect(failureRedirect);
    }

    if (!foundUser) {
      user = await db.transaction(async () => {
        const newUser = await createUser({
          name: googleUserInfo.name,
          email: googleUserInfo.email,
          photoUrl: googleUserInfo.picture,
        });
        await createAuth({
          authType: "google",
          email: googleUserInfo.email,
          userId: newUser.id,
          refreshToken: googleTokens.refresh_token || null,
        });
        return newUser;
      });
    } else user = foundUser;

    successRedirect.searchParams.set("success", `sign-${googleTokens.refresh_token ? "up" : "in"}_successful.`);
    const response = NextResponse.redirect(successRedirect);
    const { token, options } = await getAuthCookie(user);
    response.cookies.set("token", token, options);
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Something went wrong!" },
      { status: 500 }
    );
  }
};
