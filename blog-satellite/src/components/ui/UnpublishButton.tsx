"use client"

import { ArchiveRestore } from "lucide-react"
import { useState } from "react"
import { unpublishArticle } from "@/actions/articles/action"
import ConfirmModal from "./ConfirmModal"

interface UnpublishButtonProps {
    articleId: string
}

export default function UnpublishButton({ articleId }: UnpublishButtonProps) {

    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors cursor-pointer"
                onClick={() => setIsOpen(true)}
            >
                <ArchiveRestore className="h-4 w-4" />
                Dépublier
            </button>

            {isOpen && (
                <ConfirmModal
                    title="Dépublier l'article"
                    message="Cet article repassera en brouillon et ne sera plus visible publiquement."
                    confirmLabel="Dépublier"
                    confirmClassName="bg-orange-500 text-white hover:bg-orange-600"
                    onConfirm={async () => {
                        await unpublishArticle(articleId)
                        setIsOpen(false)
                    }}
                    onCancel={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
