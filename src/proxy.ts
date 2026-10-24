import { NextResponse, type NextRequest } from "next/server";

// Quick cookie check so signed-out visitors go to the login page; the API
// routes still verify the session itself.
export function proxy(request: NextRequest) {
  const signedIn = request.cookies.has("session");
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/dashboard") && !signedIn) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if ((pathname === "/" || pathname === "/signup") && signedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/signup", "/dashboard/:path*"],
};
