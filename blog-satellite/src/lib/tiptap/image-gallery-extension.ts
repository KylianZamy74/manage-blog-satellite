import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ImageGalleryView from '@/components/ui/ImageGalleryView'

export const ImageGallery = Node.create({
    name: 'imageGallery',

    group: 'block',
    atom: true,
    draggable: true,

    addAttributes() {
        return {
            images: {
                default: [],
                parseHTML: (element: HTMLElement) => {
                    const imgs = element.querySelectorAll('img')
                    return Array.from(imgs).map((img) => ({
                        src: img.getAttribute('src') || '',
                        alt: img.getAttribute('alt') || '',
                        width: img.style.width || '100%',
                    }))
                },
                renderHTML: () => ({}),
            },
            columns: { default: 3 },
            gap: { default: 8 },
        }
    },

    renderHTML({ HTMLAttributes }) {
        const { images, columns, gap } = HTMLAttributes

        const gridStyle = [
            'display: grid',
            `grid-template-columns: repeat(${columns}, 1fr)`,
            `gap: ${gap}px`,
            'margin: 16px 0',
            'align-items: start',
        ].join('; ')

        const imageList = (images || []) as Array<{ src: string; alt: string; width?: string }>
        const imgElements = imageList.map((img) => {
            return [
                'img',
                mergeAttributes({
                    src: img.src,
                    alt: img.alt || '',
                    style: `width: ${img.width || '100%'}; height: auto; border-radius: 8px`,
                }),
            ] as const
        })

        return [
            'div',
            { style: gridStyle, 'data-gallery': 'true' },
            ...imgElements,
        ]
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-gallery]',
                getAttrs: (element) => {
                    if (typeof element === 'string') return false
                    const imgs = element.querySelectorAll('img')
                    const images = Array.from(imgs).map((img) => ({
                        src: img.getAttribute('src') || '',
                        alt: img.getAttribute('alt') || '',
                        width: img.style.width || '100%',
                    }))
                    const style = element.getAttribute('style') || ''
                    const colMatch = style.match(/repeat\((\d+)/)
                    const gapMatch = style.match(/gap:\s*(\d+)/)
                    return {
                        images,
                        columns: colMatch ? parseInt(colMatch[1]) : 3,
                        gap: gapMatch ? parseInt(gapMatch[1]) : 8,
                    }
                },
            },
        ]
    },

    addNodeView() {
        return ReactNodeViewRenderer(ImageGalleryView)
    },
})
