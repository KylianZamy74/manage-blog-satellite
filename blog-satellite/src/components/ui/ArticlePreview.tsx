"use client"
import { useEditor, EditorContent } from '@tiptap/react'
import { CustomImage } from '@/lib/tiptap/custom-image-extension'
import StarterKit from '@tiptap/starter-kit'
import { CtaButton } from '@/lib/tiptap/cta-button-extensions'
import { ImageGallery } from '@/lib/tiptap/image-gallery-extension'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { Button } from './button'
import { useState, useEffect } from 'react'
import PublishButton from './PublishButton'
import { ArrowLeft, Send } from 'lucide-react'
import NextLink from 'next/link'

interface Translation {
    locale: string
    title: string
    content: object
}

const LOCALE_LABELS: Record<string, string> = {
    FR: "Francais",
    EN: "English",
    NL: "Nederlands",
    DE: "Deutsch",
    ES: "Espanol",
    IT: "Italiano",
    PT: "Portugues",
}

interface ArticlePreviewComponentProps {
    content?: string | object
    articleId: string
    articleTitle: string
    translations?: Translation[]
}

export default function ArticlePreviewComponent({ content, articleId, articleTitle, translations = [] }: ArticlePreviewComponentProps) {

    const [activeLocale, setActiveLocale] = useState<string>("FR")

    const activeTranslation = translations.find(t => t.locale === activeLocale)
    const displayTitle = activeLocale === "FR" ? articleTitle : (activeTranslation?.title ?? articleTitle)
    const displayContent = activeLocale === "FR" ? content : (activeTranslation?.content ?? content)

    const editor = useEditor({
        extensions: [
            StarterKit,
            CustomImage,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { target: '_blank', rel: "noopener noreferrer" }
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            CtaButton,
            ImageGallery,
        ],
        editable: false,
        content: displayContent,
        immediatelyRender: false
    })

    // Mettre a jour le contenu de l'editeur quand la langue change
    useEffect(() => {
        if (editor && !editor.isDestroyed && displayContent) {
            editor.commands.setContent(displayContent as object)
        }
    }, [activeLocale, editor, displayContent])

    const [isOpen, setIsOpen] = useState<boolean>(false)

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* ── BARRE DU HAUT ── */}
            <div className="flex items-center justify-between mb-8">
                <NextLink
                    href="/dashboard/articles"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour aux articles
                </NextLink>

                <Button
                    onClick={() => setIsOpen(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer"
                >
                    <Send className="h-4 w-4 mr-2" />
                    Publier l&apos;article
                </Button>
            </div>

            {/* ── SELECTEUR DE LANGUE ── */}
            {translations.length > 0 && (
                <div className="flex items-center gap-2 mb-6">
                    {["FR", ...translations.map(t => t.locale)].map((locale) => (
                        <button
                            key={locale}
                            onClick={() => setActiveLocale(locale)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                                activeLocale === locale
                                    ? "bg-foreground text-background"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                        >
                            {LOCALE_LABELS[locale] || locale}
                        </button>
                    ))}
                </div>
            )}

            {/* ── TITRE ── */}
            <h1 className="text-3xl font-bold mb-8">{displayTitle}</h1>

            {/* ── BANDEAU PREVIEW ── */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-8">
                <p className="text-sm text-amber-800">
                    Vous etes en mode <span className="font-semibold">previsualisation</span>.
                    Ceci est le rendu final de votre article tel que vos lecteurs le verront.
                    {activeLocale !== "FR" && (
                        <span className="ml-1 font-semibold">
                            (Version {LOCALE_LABELS[activeLocale] || activeLocale})
                        </span>
                    )}
                </p>
            </div>

            {/* ── CONTENU ── */}
            <div className="prose max-w-none">
                <EditorContent editor={editor} />
            </div>

            {/* ── MODALE ── */}
            {isOpen && (
                <PublishButton articleId={articleId} setIsOpen={setIsOpen} />
            )}
        </div>
    )
}
