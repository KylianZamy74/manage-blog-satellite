import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import CtaButtonView from '@/components/ui/CtaButtonView'

export const CtaButton = Node.create({
    name: 'ctaButton',
    group: 'block',
    atom: true,
    addAttributes() {
        return {
            href: { default: '#' },
            text: { default: 'Cliquez ici' },
            variant: { default: 'primary' },   // 'primary' | 'secondary'
            color: { default: '#2563eb' },
            align: { default: 'left' },   // bleu par défaut
        }
    },
    renderHTML({ HTMLAttributes }) {
        const { href, text, variant, color } = HTMLAttributes
        const baseStyles = [
            'display: inline-block',
            'padding: 12px 24px',
            'border-radius: 8px',
            'font-weight: 600',
            'font-size: 16px',
            'text-decoration: none',
            'text-align: center',
            'cursor: pointer',
            'transition: opacity 0.2s',
        ].join('; ')

        const variantStyles = variant === 'primary'
            ? `background-color: ${color}; color: white; border: 2px solid ${color}`
            : `background-color: transparent; color: ${color}; border: 2px solid ${color}`

        const style = `${baseStyles}; ${variantStyles}`

        return [
            'div',
            { style: `text-align: ${HTMLAttributes.align}; margin: 16px 0` },
            [
                'a',
                mergeAttributes({
                    href,
                    style,
                    'data-cta': variant,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                }),
                text,
            ],
        ]
    },
    parseHTML() {
        return [
            {
                tag: 'div:has(> a[data-cta])',
                getAttrs: (element) => {
                    if (typeof element === 'string') return false
                    const link = element.querySelector('a[data-cta]')
                    if (!link) return false
                    return {
                        href: link.getAttribute('href'),
                        text: link.textContent,
                        variant: link.getAttribute('data-cta') || 'primary',
                        color: (link as HTMLElement).style.backgroundColor || (link as HTMLElement).style.color || '#2563eb',
                        align: element.style.textAlign || 'left',
                    }
                },
            },
        ]
    },
    addNodeView() {
        return ReactNodeViewRenderer(CtaButtonView)
    }


}
)
