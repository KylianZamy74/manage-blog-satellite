"use client"

import { Trash2 } from "lucide-react"
import { useState } from "react"
import { deleteArticle } from "@/actions/articles/action"
import ConfirmModal from "./ConfirmModal"

interface DeleteButtonProps {
    articleId: string
}

export default function DeleteButton({ articleId }: DeleteButtonProps) {

    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                className="flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                onClick={() => setIsOpen(true)}
            >
                <Trash2 className="h-4 w-4" />
            </button>

            {isOpen && (
                <ConfirmModal
                    title="Supprimer l'article"
                    message="Voulez-vous vraiment supprimer cet article ? Cette action est irréversible."
                    confirmLabel="Supprimer"
                    confirmClassName="bg-red-600 text-white hover:bg-red-700"
                    onConfirm={async () => {
                        await deleteArticle(articleId)
                        setIsOpen(false)
                    }}
                    onCancel={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
