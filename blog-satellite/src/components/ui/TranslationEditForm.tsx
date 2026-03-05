"use client"

import { useState } from "react"
import { useActionState } from "react"
import TiptapEditor from "@/components/ui/TiptapEditor"
import { Input } from "@/components/ui/input"
import { updateTranslation } from "@/actions/translations/action"
import { ChevronDown, FileText, Search, CheckCircle, XCircle } from "lucide-react"

interface TranslationEditFormProps {
    translation: {
        id: string
        title: string
        content: any
        excerpt: string | null
        metaTitle: string | null
        metaDescription: string | null
    }
}

export default function TranslationEditForm({ translation }: TranslationEditFormProps) {
    const [content, setContent] = useState(JSON.stringify(translation.content))
    const [showSeo, setShowSeo] = useState(false)

    async function handleSubmit(_prevState: any, formData: FormData) {
        const title = formData.get("title") as string
        const excerpt = formData.get("excerpt") as string
        const metaTitle = formData.get("metatitle") as string
        const metaDescription = formData.get("metadescription") as string

        return updateTranslation(translation.id, {
            title,
            content,
            excerpt: excerpt || null,
            metaTitle: metaTitle || null,
            metaDescription: metaDescription || null,
        })
    }

    const [state, formAction, isPending] = useActionState(handleSubmit, null)

    return (
        <form action={formAction} className="max-w-4xl mx-auto space-y-6">
            {/* Message de retour */}
            {state && (
                <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-lg ${state.success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    {state.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {state.message}
                </div>
            )}

            {/* Section principale */}
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-5">
                <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        Titre traduit
                    </label>
                    <Input
                        id="title"
                        name="title"
                        type="text"
                        placeholder="Titre de la traduction"
                        defaultValue={translation.title}
                        className="text-lg"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="excerpt" className="text-sm font-medium text-gray-700">
                        Courte description
                    </label>
                    <Input
                        id="excerpt"
                        name="excerpt"
                        type="text"
                        placeholder="Court résumé traduit"
                        defaultValue={translation.excerpt ?? ""}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="content" className="text-sm font-medium text-gray-700">
                        Contenu traduit
                    </label>
                    <Input type="hidden" name="content" value={content} />
                    <TiptapEditor content={content} onChange={setContent} />
                </div>
            </div>

            {/* Section SEO (dépliable) */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <button
                    type="button"
                    onClick={() => setShowSeo(!showSeo)}
                    className="w-full flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Search className="h-4 w-4 text-gray-400" />
                        Référencement SEO
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showSeo ? "rotate-180" : ""}`} />
                </button>
                {showSeo && (
                    <div className="px-6 pb-6 space-y-4 border-t pt-4">
                        <div className="space-y-2">
                            <label htmlFor="metatitle" className="text-sm font-medium text-gray-700">
                                Méta-titre
                            </label>
                            <Input
                                id="metatitle"
                                name="metatitle"
                                type="text"
                                placeholder="Titre visible dans les résultats Google"
                                defaultValue={translation.metaTitle ?? ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="metadescription" className="text-sm font-medium text-gray-700">
                                Méta-description
                            </label>
                            <Input
                                id="metadescription"
                                name="metadescription"
                                type="text"
                                placeholder="Description visible dans les résultats Google"
                                defaultValue={translation.metaDescription ?? ""}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Bouton soumettre */}
            <div className="pb-8">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 px-6 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                    {isPending ? "Enregistrement..." : "Enregistrer la traduction"}
                </button>
            </div>
        </form>
    )
}
