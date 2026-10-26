import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import Header from "@/components/ui/Header"
import AppSideBar from "@/components/ui/app-sidebar"
import "../globals.css";
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"


export default async function Layout({ children }: { children: React.ReactNode }) {
    if (!(await auth())) redirect("/login")
    return (
        <SidebarProvider>
            <AppSideBar />
            <SidebarInset>
                <Header />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}