"use client"

import { useState } from "react"
import { SUPPORTED_LOCALES } from "@/lib/deepl"
import { deleteTranslation } from "@/actions/translations/action"
import { Pencil, Trash2 } from "lucide-react"
import ConfirmModal from "@/components/ui/ConfirmModal"
import Link from "next/link"

interface Translation {
    id: string
    locale: string
    title: string
    status: string
}

interface TranslationListProps {
    translations: Translation[]
    onTranslationChange: () => void
}

export default function TranslationList({
    translations,
    onTranslationChange,
}: TranslationListProps) {
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

    if (translations.length === 0) {
        return (
            <p className="text-sm text-gray-400 italic">
                Aucune traduction pour cet article.
            </p>
        )
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        await deleteTranslation(deleteTarget)
        setDeleteTarget(null)
        onTranslationChange()
    }

    return (
        <>
            <div className="space-y-2">
                {translations.map((t) => {
                    const locale = SUPPORTED_LOCALES.find((l) => l.code === t.locale)
                    return (
                        <div
                            key={t.id}
                            className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="text-lg shrink-0">{locale?.flag ?? t.locale}</span>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">
                                        {t.title}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {locale?.name ?? t.locale}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span
                                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                        t.status === "REVIEWED"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-amber-100 text-amber-700"
                                    }`}
                                >
                                    {t.status === "REVIEWED" ? "Révisée" : "Auto"}
                                </span>
                                <Link
                                    href={`/dashboard/translations/${t.id}/edit`}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                                    title="Éditer"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Link>
                                <button
                                    onClick={() => setDeleteTarget(t.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                    title="Supprimer"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {deleteTarget && (
                <ConfirmModal
                    title="Supprimer la traduction"
                    message="Cette traduction sera définitivement supprimée. Continuer ?"
                    confirmLabel="Supprimer"
                    confirmClassName="bg-red-600 text-white hover:bg-red-700"
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </>
    )
}
