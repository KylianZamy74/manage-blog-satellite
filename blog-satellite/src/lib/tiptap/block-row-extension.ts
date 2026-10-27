import { Node, mergeAttributes } from '@tiptap/core'
import { Plugin, type Transaction } from '@tiptap/pm/state'
import { BLOCK_MARGIN_PX } from '@/lib/tiptap/block-spacing'

/** space between the blocks of a row */
export const ROW_GAP_PX = 16

// A row holds at least two blocks: one left alone goes back to the page, an empty one disappears
function unwrapLoneRows(tr: Transaction) {
    for (let i = tr.doc.childCount - 1; i >= 0; i--) {
        const row = tr.doc.child(i)
        if (row.type.name !== 'blockRow' || row.childCount > 1) continue
        let start = 0
        for (let j = 0; j < i; j++) start += tr.doc.child(j).nodeSize
        tr.replaceWith(start, start + row.nodeSize, row.firstChild ? [row.firstChild] : [])
    }
    return tr
}

// Images and CTAs side by side: created by dropping a block next to another one (see useBlockDrag),
// unwrapped after any change (drag, delete, undo…) as soon as only one block is left
export const BlockRow = Node.create({
    name: 'blockRow',
    group: 'block',
    content: '(customImage | ctaButton)+',

    parseHTML() {
        return [{ tag: 'div[data-row]' }]
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, {
            'data-row': '',
            style: `display: flex; flex-wrap: wrap; gap: ${ROW_GAP_PX}px; align-items: center; margin: ${BLOCK_MARGIN_PX}px 0`,
        }), 0]
    },

    addProseMirrorPlugins() {
        return [new Plugin({
            appendTransaction: (transactions, _oldState, newState) => {
                if (!transactions.some((tr) => tr.docChanged)) return null
                const tr = unwrapLoneRows(newState.tr)
                return tr.docChanged ? tr : null
            },
        })]
    },
})
