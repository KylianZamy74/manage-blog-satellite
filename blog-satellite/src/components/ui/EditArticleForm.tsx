"use client"

import { useState } from "react"
import TiptapEditor from "@/components/ui/TiptapEditor"
import { Input } from "@/components/ui/input"
import { editArticle } from "@/actions/articles/action"
import { useActionState } from "react"
import { Article, User } from "@prisma/client"
import { ChevronDown, FileText, Search, UserPlus, CheckCircle, XCircle } from "lucide-react"

interface ArticleFormProps {
    article: Article
    users: User[]
    isAdmin: boolean
}

export default function ArticleForm({ article, users, isAdmin }: ArticleFormProps) {

    const [content, setContent] = useState(JSON.stringify(article.content))
    const [showSeo, setShowSeo] = useState(false)
    const editArticleWithId = editArticle.bind(null, article.id)
    const [state, formAction, isPending] = useActionState(editArticleWithId, null)

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
                        Titre de l&apos;article
                    </label>
                    <Input
                        id="title"
                        name="title"
                        type="text"
                        placeholder="Ajouter le titre de l'article"
                        defaultValue={article.title}
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
                        placeholder="Court résumé de votre article de blog"
                        defaultValue={article.excerpt ?? ""}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="content" className="text-sm font-medium text-gray-700">
                        Contenu
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
                                defaultValue={article.metaTitle ?? ""}
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
                                defaultValue={article.metaDescription ?? ""}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Section Admin - Assignation */}
            {isAdmin && (
                <div className="bg-white rounded-xl border shadow-sm p-6 space-y-3">
                    <label htmlFor="assignedAuthorId" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-gray-400" />
                        Assigner à un utilisateur
                    </label>
                    <select
                        id="assignedAuthorId"
                        name="assignedAuthorId"
                        defaultValue={article.assignedAuthorId ?? ""}
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Aucun (reste à l&apos;admin)</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Bouton soumettre */}
            <div className="pb-8">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 px-6 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                    {isPending ? "Modification en cours..." : "Modifier l'article"}
                </button>
            </div>
        </form>
    )
}
