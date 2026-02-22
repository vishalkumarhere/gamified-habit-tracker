import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { seedDefaultsForNewUser } from "@/lib/storage-supabase";

/**
 * Get the app origin for redirects. Use NEXT_PUBLIC_APP_URL in production
 * (e.g. https://your-app.vercel.app) to avoid serverless request.url issues.
 */
function getAppOrigin(request: NextRequest): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedHost && forwardedProto) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return url.origin;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const origin = getAppOrigin(request);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.redirect(`${origin}/login?error=config`);
  }

  if (code) {
    // Create the redirect response first so cookies can be set on it.
    // This ensures the session cookies are attached to the response we return.
    const redirectUrl = `${origin}${next}`;
    const response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await seedDefaultsForNewUser(data.user.id, supabase);
      }
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
