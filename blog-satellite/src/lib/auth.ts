import NextAuth from "next-auth"
import Resend from "next-auth/providers/resend"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

 
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: "onboarding@resend.dev",
    }),
  ],
   callbacks: {
      session({ session, user }) {
        session.user.id = user.id
        session.user.role = user.role
        session.user.slug = user.slug
        return session
      },
    },
    pages: {
        signIn: "/login",
        verifyRequest: "/login/verify"
    }

})