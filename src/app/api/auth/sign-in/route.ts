import { TOKEN_AGE } from "@/config";
import db from "@/db/postgres";
import { auth, users } from "@/db/postgres/schema";
import { getToken } from "@/lib/utils";
import { signInSchema, userResponseSchema } from "@/lib/zod/auth-schemas";
import bcrypt from "bcrypt";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { data, success } = signInSchema.safeParse(body);

    if (!success) return new NextResponse(null, { status: 400, statusText: "Invalid SignUp Data." });

    const { email, password } = data;

    const [foundUser] = await db
      .select()
      .from(auth)
      .where(and(eq(auth.email, email), eq(auth.authType, "email")))
      .innerJoin(users, eq(users.id, auth.userId));

    if (!foundUser) return new NextResponse(null, { status: 401, statusText: `User not found with email ${email}` });

    const isPasswordValid = await bcrypt.compare(password, foundUser.auth.hashedPass!);

    if (!isPasswordValid) return new NextResponse(null, { status: 401, statusText: `Password did not match.` });

    const response = new NextResponse(JSON.stringify(userResponseSchema.parse(foundUser.users)), {
      status: 200,
      statusText: "Successfully signed in.",
    });
    response.cookies.set("token", getToken(foundUser.users), {
      maxAge: TOKEN_AGE,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV == "production",
    });
    return response;
  } catch (error) {
    console.error(error);
    return new NextResponse(null, {
      status: 500,
      statusText: error instanceof Error ? error.message : "Something went wrong!",
    });
  }
};
