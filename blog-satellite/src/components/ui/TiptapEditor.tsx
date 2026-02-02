"use client"

import { useEditor, EditorContent, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageResize from 'tiptap-extension-resize-image'
import { Button } from '@/components/ui/button'
import { Bold, Italic, Heading1, Heading2, Heading3, List, Quote, ImageIcon } from 'lucide-react'
import { CldUploadWidget } from 'next-cloudinary';
import Link from '@tiptap/extension-link'
import { Link2 } from 'lucide-react'
import { useCallback } from 'react'
import { CtaButton } from '@/lib/tiptap/cta-button-extensions'

interface TiptapEditorProps {
    content?: string | object
    onChange: (json: string) => void
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            ImageResize.configure({
                inline: true,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { target: '_blank', rel: "noopener noreferrer" }
            }),
            CtaButton
        ],
        content: content
            ? (typeof content === 'string' ? JSON.parse(content) : content)
            : '<p>Écris ici...</p>',
        onUpdate: ({ editor }) => {
            onChange(JSON.stringify(editor.getJSON()))
        },
        immediatelyRender: false,
    })


    const setLink = useCallback(() => {
        if (!editor) return
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('URL', previousUrl)

        // cancelled
        if (url === null) {
            return
        }

        // empty
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()

            return
        }

        // update link
        try {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        } catch (e) {
            alert((e as Error).message)
        }
    }, [editor])

    if (!editor) return null

    return (
        <>
            <div className="border rounded-lg overflow-hidden">
                {/* Toolbar */}
                <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
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
                    <CldUploadWidget
                        uploadPreset="blog_images"
                        onSuccess={(result) => {
                            if (typeof result.info === 'object' && result.info.secure_url) {
                                editor.chain().focus().setImage({ src: result.info.secure_url }).run()
                            }
                        }}
                    >
                        {({ open }) => (
                            <Button type="button" variant="ghost" size="sm" onClick={() => open()}>
                                <ImageIcon className="h-4 w-4" />
                            </Button>
                        )}
                    </CldUploadWidget>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().insertContent({ type: 'ctaButton' }).run()}
                    >
                        CTA
                    </Button>
                </div>

                <EditorContent
                    editor={editor}
                    className="p-4 min-h-[300px]"
                />
            </div>
        </>

    )

}