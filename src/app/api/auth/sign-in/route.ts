import { TOKEN_AGE } from "@/config";
import { getToken } from "@/lib/utils";
import { signInSchema, userResponseSchema } from "@/lib/zod/auth-schemas";
import { getUserData } from "@/services/auth";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { data, success } = signInSchema.safeParse(body);

    if (!success) return new NextResponse(null, { status: 400, statusText: "Invalid SignUp Data." });

    const { email, password } = data;

    const user = await getUserData(email);

    if (!user) return new NextResponse(null, { status: 401, statusText: `User not found with email ${email}` });
    if (user.authType !== "email")
      return new NextResponse(null, {
        status: 400,
        statusText: `You are not registered using email and password method.`,
      });

    const isPasswordValid = await bcrypt.compare(password, user.hashedPass!);

    if (!isPasswordValid) return new NextResponse(null, { status: 401, statusText: `Password did not match.` });

    const response = new NextResponse(JSON.stringify(userResponseSchema.parse(user)), {
      status: 200,
      statusText: "Successfully signed in.",
    });
    response.cookies.set("token", getToken({ id: user.id }), {
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
