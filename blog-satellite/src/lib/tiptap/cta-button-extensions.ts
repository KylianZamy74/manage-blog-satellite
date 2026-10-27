import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import CtaButtonView from '@/components/ui/CtaButtonView'
import { blockMargin, spaceBeforeAttribute } from '@/lib/tiptap/block-spacing'

/** Hover color of a CTA: the chosen one, or the main color automatically darkened */
export const ctaHoverColor = (color: string, hoverColor: string | null) =>
    hoverColor ?? `color-mix(in srgb, ${color} 80%, black)`

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
            hoverColor: { default: null },   // null = couleur principale assombrie automatiquement
            align: { default: 'left' },
            spaceBefore: spaceBeforeAttribute,
            offset: { default: null },   // décalage depuis la gauche (ex. '25%'), seulement si align = left
        }
    },
    renderHTML({ HTMLAttributes }) {
        const { href, text, variant, color, hoverColor } = HTMLAttributes
        const baseStyles = [
            'display: inline-block',
            'padding: 12px 24px',
            'border-radius: 8px',
            'font-weight: 600',
            'font-size: 16px',
            'text-decoration: none',
            'text-align: center',
            'cursor: pointer',
            'transition: background-color 0.2s, border-color 0.2s, color 0.2s',
            `--cta-hover: ${ctaHoverColor(color, hoverColor)}`,
        ].join('; ')

        const variantStyles = variant === 'primary'
            ? `background-color: ${color}; color: white; border: 2px solid ${color}`
            : `background-color: transparent; color: ${color}; border: 2px solid ${color}`

        const style = `${baseStyles}; ${variantStyles}${HTMLAttributes.offset ? `; margin-left: ${HTMLAttributes.offset}` : ''}`

        return [
            'div',
            { style: `text-align: ${HTMLAttributes.align}; margin: ${blockMargin(HTMLAttributes.spaceBefore)}` },
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
                        offset: (link as HTMLElement).style.marginLeft || null,
                        hoverColor: /^#[0-9a-fA-F]{3,8}$/.test((link as HTMLElement).style.getPropertyValue('--cta-hover'))
                            ? (link as HTMLElement).style.getPropertyValue('--cta-hover')
                            : null,
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
