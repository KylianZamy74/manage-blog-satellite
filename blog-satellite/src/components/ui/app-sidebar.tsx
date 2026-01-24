import { FileText, Home, Icon, PenSquare, Settings } from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/auth"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

const menuItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Mes articles",
        url: "/dashboard/articles",
        icon: FileText,
    },
    {
        title: "Nouvel article",
        url: "/dashboard/articles/new",
        icon: PenSquare,
    },
]

const itemAdmin = [
    {
        title: "Créer un utilisateur",
        url: "/dashboard/admin/users/new",
        icon: PenSquare
    }
]

const bottomItems = [
    {
        title: "Paramètres",
        url: "/dashboard/settings",
        icon: Settings,
    },
]

export default async function AppSideBar() {

    const session = await auth()
    const isAdmin = session?.user?.role === 'ADMIN'

    return (
        <Sidebar>
            <SidebarHeader className="border-b px-6 py-4">
                <span className="font-semibold">Blog Satellite</span>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
                                            <item.icon className="size-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        
                            {isAdmin && itemAdmin.map((item) => (
                                 <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                    <Link  href={item.url}>
                                        <item.icon className="size-4" />
                                        <span>{item.title}</span>
                                    </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t">
                <SidebarMenu>
                    {bottomItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild>
                                <Link href={item.url}>
                                    <item.icon className="size-4" />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}