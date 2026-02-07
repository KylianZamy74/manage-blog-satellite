"use client"

import { useState, useEffect, useCallback } from "react"
import TiptapEditor from "@/components/ui/TiptapEditor"
import { Input } from "@/components/ui/input"
import { saveDraft } from "@/actions/articles/action"
import { User } from "@prisma/client"
import Link from "next/link"

interface ArticleFormProps {
    users: User[]
    isAdmin: boolean;
}

export default function ArticleForm({ users, isAdmin }: ArticleFormProps) {

    const [content, setContent] = useState('')
    const [draftId, setDraftId] = useState<string | null>(null)
    const [title, setTitle] = useState("")
    const [excerpt, setExcerpt] = useState("")
    const [metaTitle, setMetaTitle] = useState("")
    const [metaDescription, setMetaDescription] = useState("")
    const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)

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
        setIsSaving(false)
    }, [draftId, title, content, excerpt, selectedAuthorId, metaDescription, metaTitle])

    useEffect(() => {
        if (!title && !content) return
        const timer = setTimeout(save, 5000)
        return () => clearTimeout(timer)
    }, [title, content, excerpt, metaDescription, metaTitle, save])

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
        <>
            <div className="space-y-2 flex flex-col">
                <label htmlFor="title" className="font-semibold">Titre de l&apos;article</label>
                <Input name="title" type="text" placeholder="Ajouter le titre de l'article" value={title} onChange={(e) => setTitle(e.target.value)} />
                <label htmlFor="excerpt" className="font-semibold">Courte description de l&apos;article</label>
                <Input name="excerpt" type="text" placeholder="Court résumé de votre article de blog" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
                <label htmlFor="metadescription" className="font-semibold">Méta-description</label>
                <Input name="metadescription" type="text" placeholder="Ajouter la méta-description" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
                <label htmlFor="metatitle" className="font-semibold">Méta-title</label>
                <Input name="metatitle" type="text" placeholder="Ajouter le méta-titre (titre de l'article visible depuis Google)" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
                <label htmlFor="content" className="font-semibold">Contenu de votre article</label>
                <TiptapEditor onChange={setContent} />

                {isAdmin && (
                    <select
                        name="authorId"
                        value={selectedAuthorId || ""}
                        onChange={handleAuthorChange}
                        className="p-2 border rounded"
                    >
                        <option value="">Sélectionner un utilisateur</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                )}

                {isSaving && <p className="text-gray-500">Sauvegarde en cours...</p>}

                {draftId ? (
                    <Link href={`/dashboard/articles/${draftId}/preview`} className="cursor-pointer bg-amber-900 rounded-lg p-4 text-white text-center">
                        Prévisualiser votre article
                    </Link>
                ) : (
                    <button disabled className="bg-gray-400 p-4 rounded-lg text-white">
                        Prévisualiser votre article
                    </button>
                )}
            </div>
            <pre className="mt-4 p-4 bg-gray-100 text-xs overflow-auto max-h-[200px]">
                {content}
            </pre>
        </>
    )
}
