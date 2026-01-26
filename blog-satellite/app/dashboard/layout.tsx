import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import Header from "@/components/ui/Header"
import AppSideBar from "@/components/ui/app-sidebar"
import "../globals.css";


export default function Layout({ children }: { children: React.ReactNode }) {
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