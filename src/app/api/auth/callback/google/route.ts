import { GOOGLE_REDIRECT_URL } from "@/config";
import db from "@/db/postgres";
import { getToken } from "@/lib/jwt";
import { createAuth, createUser, getUserData } from "@/services/auth";
import { GoogleUserInfo, GoogleUserTokens, User } from "@/types/auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const searchParams = new URL(req.url).searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state");
    const origin = new URL(req.url).origin;
    const successRedirect = (state || origin).replace(/\/$/, "");
    const failureRedirect = `${origin}/sign-in`;
    console.log("🚀 ~ file: route.ts:14 ~ redirectBaseUrl:", failureRedirect);

    if (error) return NextResponse.redirect(`${failureRedirect}?error=${encodeURIComponent(error)}`);
    if (!code) return NextResponse.redirect(`${failureRedirect}?error=auth_code_missing`);

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
    if (!tokenRequestResponse.ok) NextResponse.redirect(`${failureRedirect}?error=invalid_auth_code`);

    const googleTokens: GoogleUserTokens = await tokenRequestResponse.json();

    const googleUserInfoRequestResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${googleTokens.access_token}` },
    });
    if (!googleUserInfoRequestResponse.ok) NextResponse.redirect(`${failureRedirect}?error=invalid_access_token`);

    const googleUserInfo: GoogleUserInfo = await googleUserInfoRequestResponse.json();

    let user: User | Awaited<ReturnType<typeof getUserData>>;
    const foundUser = await getUserData(googleUserInfo.email);

    if (foundUser && foundUser.authType !== "google")
      return NextResponse.redirect(`${failureRedirect}?error=you_are_not_registered_using_google_sign-in_method.`);

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

    const message = `sign-${googleTokens.refresh_token ? "up" : "in"}_successful.`;
    const response = NextResponse.redirect(`${successRedirect}?success=${message}`);
    const { token, options } = getToken(user);
    response.cookies.set("token", token, options);
    return response;
  } catch (error) {
    console.error(error);
    return new NextResponse(null, {
      status: 500,
      statusText: error instanceof Error ? error.message : "Something went wrong!",
    });
  }
};
