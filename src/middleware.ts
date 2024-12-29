import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "./lib/jose";
import { TokenPayload, UserRole } from "./types/auth";
import { USER_ROLES } from "./config";

// open for all
const PUBLIC_ROUTES = ["/", "/category", "/search", "/product", "/cart", "/wishlist"];
// open for only logged out users
const AUTH_ROUTES = ["/sign-up", "/sign-in", "/reset-password"];

const ROLE_BASED_ROUTES: Record<UserRole, string[]> = {
  customer: ["/profile", "/orders"],
  seller: ["/store"],
  admin: ["/dashboard"],
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const url = new URL(req.url);
  // access public routes
  if (PUBLIC_ROUTES.some((route) => url.pathname == route)) return NextResponse.next();

  // token is missing
  if (!token) {
    // accessing auth route
    if (AUTH_ROUTES.some((route) => url.pathname == route)) return NextResponse.next();
    // trying to access protected routes
    return NextResponse.redirect(new URL(`/sign-in?redirect=${encodeURIComponent(url.href)}`, url.origin));
  }

  // token found
  try {
    // validate the token and extrack user info
    const payload = await validateToken<TokenPayload>(token);
    if (!payload) {
      // invalid token and trying to access auth routes.
      if (AUTH_ROUTES.some((route) => url.pathname == route)) {
        const response = NextResponse.next();
        response.cookies.delete("token");
        return response;
      }
      // trying to access protected routes
      const response = NextResponse.redirect(new URL(`/sign-in?redirect=${encodeURIComponent(url.href)}`, url.origin));
      response.cookies.delete("token");
      return response;
    }

    // user is logged in but trying to access auth routes
    if (AUTH_ROUTES.some((route) => url.pathname == route)) {
      const redirect = url.searchParams.get("redirect");
      return NextResponse.redirect(redirect ? decodeURIComponent(redirect) : url.origin);
    }

    // allowed routes for the user roles.
    const notAllowedRoutes = USER_ROLES.filter((role) => !payload.roles.includes(role))
      .map((role) => ROLE_BASED_ROUTES[role])
      .flat();
    // check if accessing route is valid for user role
    if (notAllowedRoutes.some((route) => url.pathname == route)) return NextResponse.redirect(url.origin);

    return NextResponse.next();
  } catch (err) {
    // redirect the user on token verification failure
    console.error("JWT verification failed:", err);
    // redirect response
    const response = NextResponse.redirect("/");
    // delete the invalid token
    response.headers.delete("token");
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images).*)",
  ],
};
