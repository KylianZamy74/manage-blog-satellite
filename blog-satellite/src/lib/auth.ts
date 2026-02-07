import NextAuth from "next-auth"
import Resend from "next-auth/providers/resend"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

 
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: "onboarding@resend.dev",
    }),
  ],
   callbacks: 
   {
      async signIn({user}) {
        if(!user.email) return false
        const existingUser = await prisma.user.findUnique({
          where: {email: user.email}
        })
        if(!existingUser) return false
        return true
      },
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