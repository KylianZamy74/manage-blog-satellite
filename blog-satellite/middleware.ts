import { auth } from "@/lib/auth"
 

export const runtime = "nodejs"
export default auth((req) => {

  if (!req.auth && !req.nextUrl.pathname.startsWith("/login")) {
    return Response.redirect(new URL("/login", req.nextUrl.origin))
  }
  
  if(req.nextUrl.pathname.startsWith("/dashboard/admin")){
    if(req.auth?.user?.role !== "ADMIN") {
      return Response.redirect(new URL("/dashboard", req.nextUrl.origin))
    }
  }

})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

