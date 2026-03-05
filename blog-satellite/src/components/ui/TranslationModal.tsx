"use client"

import { useState } from "react"
import { SUPPORTED_LOCALES } from "@/lib/deepl"
import { translateArticle } from "@/actions/translations/action"
import { Languages, Loader2, CheckCircle, XCircle, X, RefreshCw } from "lucide-react"

interface TranslationModalProps {
    articleId: string
    existingLocales: string[]
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export default function TranslationModal({
    articleId,
    existingLocales,
    open,
    onOpenChange,
    onSuccess,
}: TranslationModalProps) {
    const [selectedLocales, setSelectedLocales] = useState<string[]>([])
    const [isTranslating, setIsTranslating] = useState(false)
    const [results, setResults] = useState<
        { locale: string; success: boolean; error?: string }[] | null
    >(null)

    if (!open) return null

    const toggleLocale = (code: string) => {
        setSelectedLocales((prev) =>
            prev.includes(code)
                ? prev.filter((l) => l !== code)
                : [...prev, code]
        )
    }

    const handleTranslate = async () => {
        if (selectedLocales.length === 0) return
        setIsTranslating(true)
        setResults(null)

        const response = await translateArticle(articleId, selectedLocales)

        if (response.results) {
            setResults(response.results)
        }
        setIsTranslating(false)
        onSuccess()
    }

    const handleClose = () => {
        setSelectedLocales([])
        setResults(null)
        onOpenChange(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={handleClose}>
            <div
                className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Languages className="h-5 w-5 text-blue-600" />
                        Traduire l&apos;article
                    </h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Résultats */}
                {results && (
                    <div className="mb-4 space-y-2">
                        {results.map((r) => {
                            const locale = SUPPORTED_LOCALES.find((l) => l.code === r.locale)
                            return (
                                <div
                                    key={r.locale}
                                    className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                                        r.success
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-red-50 text-red-700"
                                    }`}
                                >
                                    {r.success ? (
                                        <CheckCircle className="h-4 w-4" />
                                    ) : (
                                        <XCircle className="h-4 w-4" />
                                    )}
                                    {locale?.flag} {locale?.name}
                                    {r.error && (
                                        <span className="text-xs ml-auto">{r.error}</span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Grille de langues */}
                {!isTranslating && (
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {SUPPORTED_LOCALES.map((locale) => {
                            const isExisting = existingLocales.includes(locale.code)
                            const isSelected = selectedLocales.includes(locale.code)

                            return (
                                <button
                                    key={locale.code}
                                    type="button"
                                    onClick={() => toggleLocale(locale.code)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all cursor-pointer ${
                                        isSelected
                                            ? "border-blue-500 bg-blue-50 text-blue-700"
                                            : isExisting
                                              ? "border-gray-200 bg-gray-50 text-gray-500"
                                              : "border-gray-200 hover:border-gray-300 text-gray-700"
                                    }`}
                                >
                                    <span className="text-xl">{locale.flag}</span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{locale.name}</span>
                                        {isExisting && (
                                            <span className="text-xs flex items-center gap-1">
                                                <RefreshCw className="h-3 w-3" />
                                                Re-traduire
                                            </span>
                                        )}
                                    </div>
                                    {isSelected && (
                                        <CheckCircle className="h-4 w-4 ml-auto text-blue-600" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                )}

                {/* Loading */}
                {isTranslating && (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                        <p className="text-sm text-gray-600">
                            Traduction en cours ({selectedLocales.length} langue{selectedLocales.length > 1 ? "s" : ""})...
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                        {results ? "Fermer" : "Annuler"}
                    </button>
                    {!results && (
                        <button
                            onClick={handleTranslate}
                            disabled={isTranslating || selectedLocales.length === 0}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                            {isTranslating
                                ? "Traduction..."
                                : `Traduire (${selectedLocales.length})`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
