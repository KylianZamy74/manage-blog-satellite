"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useSession } from "next-auth/react"
export default function Header() {

const {data: session} = useSession()



    return (
        <header className="flex h-14 items-center gap-4 border-b px-6">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            <div className="flex-1">
                <h1 className="text-sm font-medium">Tableau de bord</h1>
            </div>
            <div className="text-sm text-muted-foreground">
                {session?.user?.email}
            </div>
        </header>
    )
}