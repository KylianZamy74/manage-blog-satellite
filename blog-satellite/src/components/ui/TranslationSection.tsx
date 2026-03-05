"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronDown, Languages } from "lucide-react"
import TranslationModal from "@/components/ui/TranslationModal"
import TranslationList from "@/components/ui/TranslationList"
import { getTranslations } from "@/actions/translations/action"

interface TranslationSectionProps {
    articleId: string
}

export default function TranslationSection({ articleId }: TranslationSectionProps) {
    const [showTranslations, setShowTranslations] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [translations, setTranslations] = useState<
        { id: string; locale: string; title: string; status: string }[]
    >([])

    const loadTranslations = useCallback(async () => {
        const data = await getTranslations(articleId)
        if (Array.isArray(data)) {
            setTranslations(data)
        }
    }, [articleId])

    useEffect(() => {
        loadTranslations()
    }, [loadTranslations])

    const existingLocales = translations.map((t) => t.locale)

    return (
        <>
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <button
                    type="button"
                    onClick={() => setShowTranslations(!showTranslations)}
                    className="w-full flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Languages className="h-4 w-4 text-gray-400" />
                        Traductions
                        {translations.length > 0 && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                {translations.length}
                            </span>
                        )}
                    </span>
                    <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${showTranslations ? "rotate-180" : ""}`}
                    />
                </button>
                {showTranslations && (
                    <div className="px-6 pb-6 space-y-4 border-t pt-4">
                        <button
                            type="button"
                            onClick={() => setShowModal(true)}
                            className="w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                            Traduire cet article
                        </button>
                        <TranslationList
                            translations={translations}
                            onTranslationChange={loadTranslations}
                        />
                    </div>
                )}
            </div>

            <TranslationModal
                articleId={articleId}
                existingLocales={existingLocales}
                open={showModal}
                onOpenChange={setShowModal}
                onSuccess={loadTranslations}
            />
        </>
    )
}
