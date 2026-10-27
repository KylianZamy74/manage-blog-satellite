"use client"

import { useEditor, EditorContent, useEditorState, type Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder, CharacterCount } from '@tiptap/extensions'
import type { EditorView } from '@tiptap/pm/view'
import type { SuggestionProps } from '@tiptap/suggestion'
import { CustomImage } from '@/lib/tiptap/custom-image-extension'
import { Button } from '@/components/ui/button'
import { Bold, Italic, Heading1, Heading2, Heading3, List, Quote, ImageIcon, Link2 } from 'lucide-react'
import Link from '@tiptap/extension-link'
import { useRef, useState } from 'react'
import { CtaButton } from '@/lib/tiptap/cta-button-extensions'
import { ImageGallery } from '@/lib/tiptap/image-gallery-extension'
import { SlashCommand, type SlashItem } from '@/lib/tiptap/slash-command-extension'
import TextAlign from '@tiptap/extension-text-align'
import { AlignCenter, AlignLeft, AlignRight, LayoutGrid } from 'lucide-react'
import { pickImageFile, uploadImage } from '@/lib/upload-image'

interface TiptapEditorProps {
    content?: string | object
    onChange: (json: string) => void
}

interface SlashMenuState {
    items: SlashItem[]
    index: number
    command: (item: SlashItem) => void
    rect: DOMRect | null
}

const WORDS_PER_MINUTE = 200

const imageFiles = (files?: FileList | null) => Array.from(files ?? []).filter((f) => f.type.startsWith('image/'))

const normalizeUrl = (url: string) =>
    /^(https?:|mailto:|tel:|\/|#)/i.test(url) ? url : `https://${url}`

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
    const [slashMenu, setSlashMenu] = useState<SlashMenuState | null>(null)
    const slashRef = useRef<SlashMenuState | null>(null)
    const [pendingUploads, setPendingUploads] = useState(0)
    const [linkUrl, setLinkUrl] = useState<string | null>(null)

    const updateSlash = (next: SlashMenuState | null) => {
        slashRef.current = next
        setSlashMenu(next)
    }

    // Single image path for the toolbar button, the « / » menu, paste and drop
    const insertImageFiles = async (view: EditorView, files: File[], pos?: number) => {
        setPendingUploads((n) => n + files.length)
        for (const file of files) {
            try {
                const src = await uploadImage(file)
                const node = view.state.schema.nodes.customImage.create({ src })
                view.dispatch(pos === undefined ? view.state.tr.replaceSelectionWith(node) : view.state.tr.insert(pos, node))
            } catch (error) {
                alert((error as Error).message)
            } finally {
                setPendingUploads((n) => n - 1)
            }
        }
    }

    const pickAndInsertImage = async (view: EditorView) => {
        const file = await pickImageFile()
        if (file) insertImageFiles(view, [file])
    }

    const toSlashState = (props: SuggestionProps<SlashItem>, index = 0): SlashMenuState => ({
        items: props.items, index, command: props.command, rect: props.clientRect?.() ?? null,
    })

    const editor = useEditor({
        extensions: [
            StarterKit,
            CustomImage,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { target: '_blank', rel: "noopener noreferrer" }
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],  // les types de nodes qui supportent l'alignement
            }),
            CtaButton,
            ImageGallery,
            Placeholder.configure({ placeholder: 'Commencez à écrire… ou tapez « / » pour insérer un bloc' }),
            CharacterCount,
            SlashCommand.configure({
                items: [
                    { title: 'Titre 2', keywords: 'h2 heading', run: (e) => e.chain().focus().setHeading({ level: 2 }).run() },
                    { title: 'Titre 3', keywords: 'h3 heading', run: (e) => e.chain().focus().setHeading({ level: 3 }).run() },
                    { title: 'Liste', keywords: 'list puces', run: (e) => e.chain().focus().toggleBulletList().run() },
                    { title: 'Citation', keywords: 'quote blockquote', run: (e) => e.chain().focus().toggleBlockquote().run() },
                    { title: 'Image', keywords: 'photo picture', run: (e) => pickAndInsertImage(e.view) },
                    { title: 'Galerie', keywords: 'gallery images', run: (e) => e.chain().focus().insertContent({ type: 'imageGallery' }).run() },
                    { title: 'Bouton CTA', keywords: 'cta button lien', run: (e) => e.chain().focus().insertContent({ type: 'ctaButton' }).run() },
                ],
                render: () => ({
                    onStart: (props) => updateSlash(toSlashState(props)),
                    onUpdate: (props) => updateSlash(toSlashState(props)),
                    onExit: () => updateSlash(null),
                    onKeyDown: ({ event }) => {
                        const menu = slashRef.current
                        if (!menu || menu.items.length === 0) return false
                        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                            const step = event.key === 'ArrowDown' ? 1 : -1
                            updateSlash({ ...menu, index: (menu.index + step + menu.items.length) % menu.items.length })
                            return true
                        }
                        if (event.key === 'Enter') {
                            menu.command(menu.items[menu.index])
                            return true
                        }
                        if (event.key === 'Escape') {
                            updateSlash(null)
                            return true
                        }
                        return false
                    },
                }),
            }),
        ],
        content: content
            ? (typeof content === 'string' ? JSON.parse(content) : content)
            : '',
        onUpdate: ({ editor }) => {
            onChange(JSON.stringify(editor.getJSON()))
        },
        editorProps: {
            // The writing area fills the whole frame, so blocks can be placed down to the bottom
            attributes: { class: 'py-4 min-h-[300px]' },
            handlePaste: (view, event) => {
                const files = imageFiles(event.clipboardData?.files)
                if (files.length === 0) return false
                insertImageFiles(view, files)
                return true
            },
            handleDrop: (view, event, _slice, moved) => {
                const files = imageFiles(event.dataTransfer?.files)
                if (moved || files.length === 0) return false
                event.preventDefault()
                insertImageFiles(view, files, view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos)
                return true
            },
        },
        immediatelyRender: false,
    })

    const words = useEditorState({
        editor,
        selector: ({ editor }) => (editor?.storage.characterCount.words() as number | undefined) ?? 0,
    }) ?? 0

    if (!editor) return null

    return (
        <div className="border rounded-lg">
            {/* Toolbar (reste visible en haut de l'écran pendant la rédaction) */}
            <div className="sticky top-0 z-20 flex flex-wrap gap-1 p-2 border-b bg-gray-50 rounded-t-lg">
                <Button
                    type="button"
                    variant={editor.isActive('bold') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={editor.isActive('italic') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                >
                    <Heading1 className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                    <Heading2 className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                    <Heading3 className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                >
                    <Quote className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => pickAndInsertImage(editor.view)}>
                    <ImageIcon className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().insertContent({ type: 'ctaButton' }).run()}
                >
                    CTA
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().insertContent({ type: 'imageGallery' }).run()}
                >
                    <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                >
                    <AlignLeft />

                </Button>
                <Button
                    type="button"
                    variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                >
                    <AlignCenter />

                </Button>
                <Button
                    type="button"
                    variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                >
                    <AlignRight />
                </Button>
            </div>

            {/* Menu flottant sur la sélection : mise en forme et lien */}
            <BubbleMenu
                editor={editor}
                options={{ placement: 'top' }}
                className="flex items-center gap-1 rounded-lg border bg-white p-1 shadow-lg"
            >
                {linkUrl === null ? (
                    <>
                        <BubbleButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
                            <Bold className="h-4 w-4" />
                        </BubbleButton>
                        <BubbleButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
                            <Italic className="h-4 w-4" />
                        </BubbleButton>
                        <BubbleButton active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                            <Heading2 className="h-4 w-4" />
                        </BubbleButton>
                        <BubbleButton active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                            <Heading3 className="h-4 w-4" />
                        </BubbleButton>
                        <BubbleButton active={editor.isActive('link')} onClick={() => setLinkUrl(editor.getAttributes('link').href ?? '')}>
                            <Link2 className="h-4 w-4" />
                        </BubbleButton>
                    </>
                ) : (
                    <input
                        autoFocus
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                applyLink(editor, linkUrl)
                                setLinkUrl(null)
                            }
                            if (e.key === 'Escape') setLinkUrl(null)
                        }}
                        onBlur={() => setLinkUrl(null)}
                        placeholder="Coller un lien puis Entrée (vide = retirer)"
                        className="w-72 px-2 py-1 text-sm outline-none"
                    />
                )}
            </BubbleMenu>

            {/* Menu de la commande « / » */}
            {slashMenu && slashMenu.items.length > 0 && slashMenu.rect && (
                <div
                    className="fixed z-50 w-56 rounded-lg border bg-white p-1 shadow-lg"
                    style={{ top: slashMenu.rect.bottom + 6, left: slashMenu.rect.left }}
                >
                    {slashMenu.items.map((item, i) => (
                        <button
                            key={item.title}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); slashMenu.command(item) }}
                            className={`w-full rounded px-3 py-1.5 text-left text-sm ${i === slashMenu.index ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            {item.title}
                        </button>
                    ))}
                </div>
            )}

            <EditorContent
                editor={editor}
                className="px-4"
            />

            {/* Pied : volume de l'article et raccourcis */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-t text-xs text-gray-500">
                <span>
                    {words} mot{words > 1 ? 's' : ''} · {Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))} min de lecture
                    {pendingUploads > 0 && ' · Envoi de l’image…'}
                </span>
                <span>Astuces : « / » pour un bloc, « ## » pour un titre, « - » pour une liste, coller ou glisser une image</span>
            </div>
        </div>
    )
}

function applyLink(editor: Editor, url: string) {
    const chain = editor.chain().focus().extendMarkRange('link')
    if (url.trim() === '') chain.unsetLink().run()
    else chain.setLink({ href: normalizeUrl(url.trim()) }).run()
}

function BubbleButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <Button type="button" variant={active ? 'default' : 'ghost'} size="sm" onClick={onClick}>
            {children}
        </Button>
    )
}
