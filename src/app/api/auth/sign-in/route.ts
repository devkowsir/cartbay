import { getAuthCookie } from "@/lib/jose";
import { signInSchema } from "@/lib/zod/auth-schemas";
import { getUserData } from "@/services/auth";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { data, success } = signInSchema.safeParse(body);

    if (!success) return NextResponse.json({ message: "Invalid SignIn Data." }, { status: 400 });

    const { email, password } = data;

    const user = await getUserData(email);

    if (!user) return NextResponse.json({ message: `User not found with email ${email}` }, { status: 401 });
    if (user.authType !== "email")
      return NextResponse.json({ message: `You are not registered using email and password method.` }, { status: 400 });

    const isPasswordValid = await bcrypt.compare(password, user.hashedPass!);

    if (!isPasswordValid) return NextResponse.json({ message: `Password did not match.` }, { status: 401 });

    const response = NextResponse.json({ message: "Successfully signed in." }, { status: 200 });
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
