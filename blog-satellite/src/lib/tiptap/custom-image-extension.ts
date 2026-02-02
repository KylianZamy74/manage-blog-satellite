import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import CustomImageView from '@/components/ui/CustomImageView'

export const CustomImage = Node.create({
    name: 'customImage',

    group: 'block',
    atom: true,
    draggable: true,

    addAttributes() {
        return {
            src:   { default: null },
            alt:   { default: '' },
            width: { default: '100%' },
            align: { default: 'center' },
        }
    },

    renderHTML({ HTMLAttributes }) {
        const { src, alt, width, align } = HTMLAttributes

        return [
            'div',
            { style: `text-align: ${align}; margin: 16px 0` },
            [
                'img',
                mergeAttributes({
                    src,
                    alt,
                    style: `width: ${width}; max-width: 100%; height: auto; border-radius: 8px`,
                    draggable: 'false',
                }),
            ],
        ]
    },

    parseHTML() {
        return [
            {
                tag: 'div:has(> img)',
                getAttrs: (element) => {
                    if (typeof element === 'string') return false
                    const img = element.querySelector('img')
                    if (!img) return false
                    return {
                        src: img.getAttribute('src'),
                        alt: img.getAttribute('alt') || '',
                        width: img.style.width || '100%',
                        align: element.style.textAlign || 'center',
                    }
                },
            },
            {
                tag: 'img[src]',
                getAttrs: (element) => {
                    if (typeof element === 'string') return false
                    return {
                        src: element.getAttribute('src'),
                        alt: element.getAttribute('alt') || '',
                        width: element.style.width || '100%',
                        align: 'center',
                    }
                },
            },
        ]
    },

    addNodeView() {
        return ReactNodeViewRenderer(CustomImageView)
    },
})
