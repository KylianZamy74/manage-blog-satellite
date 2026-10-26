"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import TiptapEditor from "@/components/ui/TiptapEditor"
import { Input } from "@/components/ui/input"
import { saveArticle } from "@/actions/articles/action"
import { Article, User } from "@prisma/client"
import { Eye, Search, UserPlus, Check, AlertCircle, Loader2 } from "lucide-react"
import TranslationSection from "@/components/ui/TranslationSection"

interface ArticleEditorProps {
    article?: Article
    users: User[]
    isAdmin: boolean
}

type SaveStatus = { state: "idle" | "dirty" | "saving" | "saved" | "error"; message?: string }

const AUTOSAVE_DELAY_MS = 2000
const MIN_TITLE_LENGTH = 3
const META_TITLE_MAX = 60
const META_DESCRIPTION_MAX = 155
const EMPTY_DOC = JSON.stringify({ type: "doc", content: [] })

// Single editor for creating and editing. Drafts autosave; published articles save on demand
// so that the live blog doesn't change on every keystroke.
export default function ArticleEditor({ article, users, isAdmin }: ArticleEditorProps) {
    const router = useRouter()
    const [id, setId] = useState<string | null>(article?.id ?? null)
    const [form, setForm] = useState({
        title: article?.title ?? "",
        excerpt: article?.excerpt ?? "",
        content: article ? JSON.stringify(article.content) : EMPTY_DOC,
        metaTitle: article?.metaTitle ?? "",
        metaDescription: article?.metaDescription ?? "",
        assignedAuthorId: article?.assignedAuthorId ?? "",
    })
    const [status, setStatus] = useState<SaveStatus>({ state: "idle" })
    const isPublished = article?.status === "PUBLISHED"
    const dirty = status.state === "dirty" || status.state === "error"
    const latest = useRef({ id, form })
    useEffect(() => { latest.current = { id, form } }, [id, form])

    const update = (patch: Partial<typeof form>) => {
        setForm((f) => ({ ...f, ...patch }))
        setStatus({ state: "dirty" })
    }

    const save = async () => {
        const { id: currentId, form: f } = latest.current
        if (f.title.trim().length < MIN_TITLE_LENGTH) {
            setStatus({ state: "error", message: `Ajoutez un titre (${MIN_TITLE_LENGTH} caractères minimum) pour enregistrer` })
            return false
        }
        setStatus({ state: "saving" })
        const result = await saveArticle(currentId, {
            title: f.title,
            content: f.content,
            excerpt: f.excerpt || null,
            image: null,
            authorIdFromForm: f.assignedAuthorId || null,
            metaTitle: f.metaTitle || null,
            metaDescription: f.metaDescription || null,
        })
        if (!result.success) {
            setStatus({ state: "error", message: result.message })
            return false
        }
        if (!currentId && result.id) {
            setId(result.id)
            // Refreshing the page now reopens this draft instead of a blank editor
            window.history.replaceState(null, "", `/dashboard/articles/${result.id}/edit`)
        }
        setStatus((s) => (s.state === "saving" ? { state: "saved" } : s))
        return true
    }

    // Autosave drafts once the author pauses typing
    useEffect(() => {
        if (isPublished || status.state !== "dirty") return
        if (form.title.trim().length < MIN_TITLE_LENGTH) return
        const timer = setTimeout(save, AUTOSAVE_DELAY_MS)
        return () => clearTimeout(timer)
    }, [form, status.state, isPublished])

    useEffect(() => {
        if (!dirty) return
        const warn = (e: BeforeUnloadEvent) => e.preventDefault()
        window.addEventListener("beforeunload", warn)
        return () => window.removeEventListener("beforeunload", warn)
    }, [dirty])

    const handlePreview = async () => {
        if (dirty && !(await save())) return
        if (latest.current.id) router.push(`/dashboard/articles/${latest.current.id}/preview`)
    }

    const effectiveMetaTitle = form.metaTitle || form.title
    const effectiveMetaDescription = form.metaDescription || form.excerpt

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between gap-4 min-h-6">
                    <SaveIndicator status={status} isPublished={isPublished} />
                    {isPublished && (
                        <button
                            type="button"
                            onClick={save}
                            disabled={!dirty || status.state === "saving"}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed"
                        >
                            Enregistrer les modifications
                        </button>
                    )}
                </div>

                <textarea
                    aria-label="Titre de l'article"
                    placeholder="Titre de l'article"
                    rows={1}
                    value={form.title}
                    onChange={(e) => update({ title: e.target.value })}
                    className="w-full resize-none border-none bg-transparent text-3xl font-bold text-gray-900 placeholder:text-gray-300 outline-none [field-sizing:content]"
                />
                <textarea
                    aria-label="Courte description"
                    placeholder="Courte description (affichée dans la liste des articles et sur Google)"
                    rows={1}
                    value={form.excerpt}
                    onChange={(e) => update({ excerpt: e.target.value })}
                    className="w-full resize-none border-none bg-transparent text-lg text-gray-600 placeholder:text-gray-300 outline-none [field-sizing:content]"
                />

                <TiptapEditor content={form.content} onChange={(content) => update({ content })} />
            </div>

            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
                <h2 className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Search className="h-4 w-4 text-gray-400" />
                    Référencement SEO
                    <span className="font-normal text-gray-400">· repris du titre et de la description si laissés vides</span>
                </h2>
                <SeoField
                    id="metatitle"
                    label="Méta-titre"
                    value={form.metaTitle}
                    fallback={form.title}
                    length={effectiveMetaTitle.length}
                    max={META_TITLE_MAX}
                    onChange={(metaTitle) => update({ metaTitle })}
                />
                <SeoField
                    id="metadescription"
                    label="Méta-description"
                    value={form.metaDescription}
                    fallback={form.excerpt}
                    length={effectiveMetaDescription.length}
                    max={META_DESCRIPTION_MAX}
                    onChange={(metaDescription) => update({ metaDescription })}
                />
            </div>

            {id && <TranslationSection articleId={id} />}

            {isAdmin && (
                <div className="bg-white rounded-xl border shadow-sm p-6 space-y-3">
                    <label htmlFor="assignedAuthorId" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-gray-400" />
                        Assigner à un utilisateur
                    </label>
                    <select
                        id="assignedAuthorId"
                        value={form.assignedAuthorId}
                        onChange={(e) => update({ assignedAuthorId: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Aucun (reste à l&apos;admin)</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="pb-8">
                <button
                    type="button"
                    onClick={handlePreview}
                    disabled={!id || status.state === "saving"}
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium py-3 px-6 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                    <Eye className="h-4 w-4" />
                    Prévisualiser votre article
                </button>
            </div>
        </div>
    )
}

function SaveIndicator({ status, isPublished }: { status: SaveStatus; isPublished: boolean }) {
    if (status.state === "saving") {
        return <span className="flex items-center gap-1.5 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" />Enregistrement…</span>
    }
    if (status.state === "saved") {
        return <span className="flex items-center gap-1.5 text-sm text-emerald-600"><Check className="h-4 w-4" />Enregistré</span>
    }
    if (status.state === "error") {
        return <span className="flex items-center gap-1.5 text-sm text-red-600"><AlertCircle className="h-4 w-4" />{status.message}</span>
    }
    if (status.state === "dirty" && isPublished) {
        return <span className="text-sm text-amber-600">Modifications non enregistrées (l&apos;article publié n&apos;est pas encore mis à jour)</span>
    }
    return <span className="text-sm text-gray-400">{isPublished ? "Article publié" : "Brouillon enregistré automatiquement"}</span>
}

interface SeoFieldProps {
    id: string
    label: string
    value: string
    fallback: string
    length: number
    max: number
    onChange: (value: string) => void
}

function SeoField({ id, label, value, fallback, length, max, onChange }: SeoFieldProps) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
                <span className={`text-xs ${length > max ? "text-red-600" : "text-gray-400"}`}>{length} / {max}</span>
            </div>
            <Input id={id} type="text" value={value} placeholder={fallback} onChange={(e) => onChange(e.target.value)} />
        </div>
    )
}
