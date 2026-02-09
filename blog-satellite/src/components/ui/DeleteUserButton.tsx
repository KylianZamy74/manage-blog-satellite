"use client"

import { Trash2 } from "lucide-react"
import { useState } from "react"
import { deleteUser } from "@/actions/users/action"
import ConfirmModal from "./ConfirmModal"

interface DeleteUserButtonProps {
    userId: string
    userName: string
}

export default function DeleteUserButton({ userId, userName }: DeleteUserButtonProps) {

    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                className="flex items-center justify-center p-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                onClick={() => setIsOpen(true)}
            >
                <Trash2 className="h-4 w-4" />
            </button>

            {isOpen && (
                <ConfirmModal
                    title="Supprimer l'utilisateur"
                    message={`Voulez-vous vraiment supprimer ${userName} ? Cette action est irréversible.`}
                    confirmLabel="Supprimer"
                    confirmClassName="bg-red-600 text-white hover:bg-red-700"
                    onConfirm={async () => {
                        await deleteUser(userId)
                        setIsOpen(false)
                    }}
                    onCancel={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
