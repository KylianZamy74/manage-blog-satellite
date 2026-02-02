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
            color: { default: '#2563eb' },    // bleu par défaut
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
            'a',
            mergeAttributes({
                href,
                style,
                'data-cta': variant,       // marqueur pour parseHTML + utile pour Analytics plus tard
                target: '_blank',
                rel: 'noopener noreferrer',
            }),
            text,  // le texte affiché dans le bouton
        ]
    },
    parseHTML() {
        return [
            {
                tag: 'a[data-cta]',
                getAttrs: (element) => {
                    if (typeof element === 'string') return false
                    return {
                        href: element.getAttribute('href'),
                        text: element.textContent,
                        variant: element.getAttribute('data-cta') || 'primary',
                        // On essaie de récupérer la couleur depuis le style inline
                        color: element.style.backgroundColor || element.style.color || '#2563eb',
                    }
                },
            },
        ]
    },
    addNodeView(){
        return ReactNodeViewRenderer(CtaButtonView)
    }


}
)
