"use client"

import { Trash2 } from "lucide-react"
import { useState } from "react"
import { adminDeleteArticle } from "@/actions/articles/action"
import ConfirmModal from "./ConfirmModal"

interface AdminDeleteArticleButtonProps {
    articleId: string
    articleTitle: string
}

export default function AdminDeleteArticleButton({ articleId, articleTitle }: AdminDeleteArticleButtonProps) {

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
                    message={`Voulez-vous vraiment supprimer "${articleTitle}" ? Cette action est irréversible.`}
                    confirmLabel="Supprimer"
                    confirmClassName="bg-red-600 text-white hover:bg-red-700"
                    onConfirm={async () => {
                        await adminDeleteArticle(articleId)
                        setIsOpen(false)
                    }}
                    onCancel={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
