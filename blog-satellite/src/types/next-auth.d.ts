import {Role} from "@prisma/client"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: Role
            slug: string | null
        } & DefaultSession["user"]
    }
    interface User {
        role: Role
        sulg: string | null
    }
}