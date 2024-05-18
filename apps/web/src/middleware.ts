import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const clonedPathname = url.pathname;

  // Define the routes that a guest should be able to view
  const guestRoutes = [
    "/forgot-password",
    "/reset-password",
    "/auth-challenge",
  ];

  // Check if the current path matches any of the guest routes
  const isGuestRoute = guestRoutes.some((route) =>
    clonedPathname.startsWith(route),
  );

  if (url.pathname !== "/login" && !isGuestRoute) {
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
