import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    console.log("🔍 Middleware running for:", request.nextUrl.pathname);

    const response = NextResponse.next();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: (name: string) => request.cookies.get(name)?.value,
                set: (name: string, value: string, options: CookieOptions) => {
                    response.cookies.set(name, value, options);
                },
                remove: (name: string, options: CookieOptions) => {
                    response.cookies.set(name, "", { ...options, maxAge: 0 });
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    console.log("👤 User:", user?.email ?? "No user");
    console.log("📍 Path:", request.nextUrl.pathname);

    const pathname = request.nextUrl.pathname;

    if (!user && !pathname.startsWith("/login")) {
        console.log("⛔ Not logged in, redirecting to /login");
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    if (user && pathname.startsWith("/login")) {
        console.log("✅ Already logged in, redirecting to /");
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
    }

    console.log("✅ Allowing access to:", pathname);
    return response;
}
