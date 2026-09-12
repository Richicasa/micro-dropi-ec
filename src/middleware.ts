import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname.startsWith("/login");
  const isProtectedPath =
    pathname === "/" ||
    pathname.startsWith("/billetera") ||
    pathname.startsWith("/catalogo") ||
    pathname.startsWith("/pedidos") ||
    pathname.startsWith("/equipo");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let hasValidSession = false;

  // 1. Verificación primaria con Supabase SSR Cookies
  if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith("http") && !supabaseUrl.includes("tu-proyecto")) {
    try {
      const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value)
              );
              response = NextResponse.next({
                request,
              });
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              );
            },
          },
        }
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        hasValidSession = true;
      }
    } catch {
      hasValidSession = false;
    }
  }

  // 2. Cookie de respaldo para sesión asignada / desarrollo
  if (!hasValidSession) {
    const sessionCookie = request.cookies.get("dropi_session")?.value;
    if (sessionCookie && sessionCookie.length > 5) {
      hasValidSession = true;
    }
  }

  // REGLA 1: Bloquear acceso no autenticado a rutas protegidas -> Redirigir a /login
  if (!hasValidSession && isProtectedPath) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // REGLA 2: Si ya está autenticado e intenta ir a /login -> Redirigir a /billetera
  if (hasValidSession && isAuthPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/billetera";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Aplica el middleware a todas las rutas de la aplicación excepto:
     * - _next/static (archivos estáticos compilados)
     * - _next/image (optimización de imágenes)
     * - favicon.ico, íconos y assets multimedia
     * - /api/* (webhooks de couriers y endpoints backend protegidos por token interno)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
