"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import TiptapEditor from "@/components/ui/TiptapEditor"
import { Input } from "@/components/ui/input"
import { saveDraft } from "@/actions/articles/action"
import { User } from "@prisma/client"
import { Save, Eye, ChevronDown, FileText, Search, UserPlus } from "lucide-react"

interface ArticleFormProps {
    users: User[]
    isAdmin: boolean;
}

export default function ArticleForm({ users, isAdmin }: ArticleFormProps) {

    const router = useRouter()
    const [content, setContent] = useState('')
    const [draftId, setDraftId] = useState<string | null>(null)
    const [title, setTitle] = useState("")
    const [excerpt, setExcerpt] = useState("")
    const [metaTitle, setMetaTitle] = useState("")
    const [metaDescription, setMetaDescription] = useState("")
    const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [showSeo, setShowSeo] = useState(false)

    // Ref pour avoir toujours les dernières valeurs (évite les closures stale au unmount)
    const latestRef = useRef({ draftId, title, content, excerpt, selectedAuthorId, metaDescription, metaTitle })
    useEffect(() => {
        latestRef.current = { draftId, title, content, excerpt, selectedAuthorId, metaDescription, metaTitle }
    }, [draftId, title, content, excerpt, selectedAuthorId, metaDescription, metaTitle])

    // Flag pour savoir si des changements sont en attente de sauvegarde
    const hasUnsavedChanges = useRef(false)
    const lastSavedContent = useRef('')

    useEffect(() => {
        if (content && content !== lastSavedContent.current) {
            hasUnsavedChanges.current = true
        }
    }, [content, title, excerpt, metaDescription, metaTitle])

    const save = useCallback(async () => {
        if (!title && !content) return
        setIsSaving(true)
        const result = await saveDraft(draftId, {
            title,
            content,
            excerpt,
            image: null,
            authorIdFromForm: selectedAuthorId,
            metaDescription,
            metaTitle
        })
        if (result?.success && result?.id && !draftId) {
            setDraftId(result.id)
        }
        hasUnsavedChanges.current = false
        lastSavedContent.current = content
        setIsSaving(false)
        return result
    }, [draftId, title, content, excerpt, selectedAuthorId, metaDescription, metaTitle])

    // Auto-save avec debounce de 5s
    useEffect(() => {
        if (!title && !content) return
        const timer = setTimeout(save, 5000)
        return () => clearTimeout(timer)
    }, [title, content, excerpt, metaDescription, metaTitle, save])

    // Sauvegarde immédiate avant de quitter la page (navigation interne ou fermeture)
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges.current) {
                e.preventDefault()
            }
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [])

    // Sauvegarde immédiate puis navigation vers le preview
    const handlePreview = async () => {
        if (!draftId) return
        if (hasUnsavedChanges.current) {
            await save()
        }
        router.push(`/dashboard/articles/${draftId}/preview`)
    }

    const handleAuthorChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newAuthorId = e.target.value || null
        setSelectedAuthorId(newAuthorId)

        if (draftId && newAuthorId) {
            setIsSaving(true)
            await saveDraft(draftId, {
                title,
                content,
                excerpt,
                image: null,
                authorIdFromForm: newAuthorId,
                metaDescription,
                metaTitle
            })
            setIsSaving(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Indicateur de sauvegarde */}
            {isSaving && (
                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                    <Save className="h-4 w-4 animate-pulse" />
                    Sauvegarde en cours...
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
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
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
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="content" className="text-sm font-medium text-gray-700">
                        Contenu
                    </label>
                    <TiptapEditor onChange={setContent} />
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
                                value={metaTitle}
                                onChange={(e) => setMetaTitle(e.target.value)}
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
                                value={metaDescription}
                                onChange={(e) => setMetaDescription(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Section Admin - Assignation */}
            {isAdmin && (
                <div className="bg-white rounded-xl border shadow-sm p-6 space-y-3">
                    <label htmlFor="authorId" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-gray-400" />
                        Assigner à un utilisateur
                    </label>
                    <select
                        id="authorId"
                        name="authorId"
                        value={selectedAuthorId || ""}
                        onChange={handleAuthorChange}
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Sélectionner un utilisateur</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Bouton preview */}
            <div className="pb-8">
                {draftId ? (
                    <button
                        type="button"
                        onClick={handlePreview}
                        disabled={isSaving}
                        className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-xl transition-colors cursor-pointer disabled:cursor-wait"
                    >
                        <Eye className="h-4 w-4" />
                        {isSaving ? "Sauvegarde avant prévisualisation..." : "Prévisualiser votre article"}
                    </button>
                ) : (
                    <button
                        disabled
                        className="flex items-center justify-center gap-2 w-full bg-gray-200 text-gray-400 font-medium py-3 px-6 rounded-xl cursor-not-allowed"
                    >
                        <Eye className="h-4 w-4" />
                        Prévisualiser votre article
                    </button>
                )}
            </div>
        </div>
    )
}
