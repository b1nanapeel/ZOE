import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createProxySupabase } from "@/lib/supabase-proxy";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const PUBLIC_PATHS = ["/login", "/signup"];
const AUTH_PATHS = ["/login", "/signup"];

function rateLimitResponse(
  request: NextRequest,
): NextResponse | null {
  if (!request.nextUrl.pathname.startsWith("/api/")) return null;
  const ip = clientIp(request);
  const result = checkRateLimit(ip);
  if (result.ok) return null;
  const retrySeconds = Math.max(
    1,
    Math.ceil((result.resetAt - Date.now()) / 1000),
  );
  return NextResponse.json(
    { error: "Rate limit exceeded. Slow down and try again shortly." },
    {
      status: 429,
      headers: {
        "Retry-After": retrySeconds.toString(),
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": Math.ceil(result.resetAt / 1000).toString(),
      },
    },
  );
}

export async function proxy(request: NextRequest) {
  const limited = rateLimitResponse(request);
  if (limited) return limited;

  const response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  if (!isSupabaseConfigured()) return response;

  const supabase = createProxySupabase(request, response);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = PUBLIC_PATHS.includes(pathname);
  const isAuthPage = AUTH_PATHS.includes(pathname);

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};
