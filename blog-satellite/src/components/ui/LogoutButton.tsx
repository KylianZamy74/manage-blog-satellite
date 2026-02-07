"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarMenuButton } from "@/components/ui/sidebar"

export default function LogoutButton() {
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" })
  }

  return (
    <>
      <SidebarMenuButton
        className="cursor-pointer bg-red-200 hover:bg-red-300"
        onClick={() => setOpen(true)}
      >
        <LogOut className="size-4" />
        <span>Déconnexion</span>
      </SidebarMenuButton>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold mb-2">Déconnexion</h2>
            <p className="text-gray-600 mb-6">Êtes-vous sûr de vouloir vous déconnecter ?</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Non
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                Oui
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
