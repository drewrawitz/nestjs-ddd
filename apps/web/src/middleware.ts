import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const clonedPathname = url.pathname;

  if (url.pathname !== "/login") {
    if (!request.cookies.has("connect.sid")) {
      url.pathname = `/login`;

      // No need to redirect to / since that is the default
      const shouldRedirect = !["/"].includes(clonedPathname);
      const urlSuffix = shouldRedirect ? `?redirect=${clonedPathname}` : "";
      return NextResponse.redirect(url + urlSuffix);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
