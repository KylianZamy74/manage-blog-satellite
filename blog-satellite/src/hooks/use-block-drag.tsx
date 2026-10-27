"use client"

import { useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import type { Editor } from "@tiptap/react"

export type BlockAlign = "left" | "center" | "right"

const DRAG_THRESHOLD_PX = 4
const GRID_COLUMNS = 12
/** distance (as a share of the editor width) under which center and edges win over the grid */
const EDGE_SNAP = 0.04
/** room kept under the dragged block when the editor grows, and viewport margin that triggers auto-scroll */
const GROW_MARGIN_PX = 60
const AUTO_SCROLL_PX = 12

interface Placement {
    align: BlockAlign
    /** left offset as a % of the editor width, only for align "left" (null = flush left) */
    offset: string | null
    /** ghost left position in px from the editor's left edge */
    left: number
}

interface DropTarget extends Placement {
    /** document position where the block will be inserted */
    pos: number
    /** viewport y of the insertion line */
    lineY: number
    /** empty paragraphs inserted before the block when it is dropped below the content */
    blankLines: number
}

// After a drag, the browser still fires a click on release: swallow it so the settings popover stays closed
export function swallowNextClick() {
    const stop = (e: MouseEvent) => { e.stopPropagation(); e.preventDefault() }
    window.addEventListener("click", stop, { capture: true, once: true })
    setTimeout(() => window.removeEventListener("click", stop, { capture: true }), 300)
}

// Height of an empty paragraph (line + margin), to turn a drop distance into blank lines
const blankLineHeight = (dom: HTMLElement) => {
    const style = getComputedStyle(dom.querySelector("p") ?? dom)
    return (parseFloat(style.lineHeight) || 24) + (parseFloat(style.marginBottom) || 0)
}

// Center and edges first (perfect centering is effortless), otherwise the nearest of 12 columns
export function snapPlacement(left: number, width: number, editorWidth: number): Placement {
    const edge = editorWidth * EDGE_SNAP
    const column = editorWidth / GRID_COLUMNS
    if (Math.abs(left + width / 2 - editorWidth / 2) < edge) return { align: "center", offset: null, left: (editorWidth - width) / 2 }
    if (left + width > editorWidth - edge) return { align: "right", offset: null, left: editorWidth - width }
    const maxColumn = Math.floor((editorWidth - width) / column)
    const col = Math.min(maxColumn, Math.max(0, Math.round(left / column)))
    if (col === 0) return { align: "left", offset: null, left: 0 }
    return { align: "left", offset: `${Math.round((col * 10000) / GRID_COLUMNS) / 100}%`, left: col * column }
}

// Snap-grid drag for editor blocks (image, CTA): drag freely, the editor shows a 12-column grid,
// a ghost where the block will land and the insertion line; on release the block is moved there.
// A simple click (no movement) is left to the block (opens its settings).
export function useBlockDrag(editor: Editor, getPos: () => number | undefined) {
    const [drag, setDrag] = useState<{ target: DropTarget; width: number; height: number } | null>(null)

    const findTarget = (x: number, y: number, block: { left: number; top: number; width: number }, from?: number): DropTarget | null => {
        const view = editor.view
        const rect = view.dom.getBoundingClientRect()
        const hit = view.posAtCoords({ left: Math.min(Math.max(x, rect.left + 1), rect.right - 1), top: y })
        if (!hit) return null
        const doc = view.state.doc
        const $pos = doc.resolve(hit.pos)
        // Below the last block (empty bottom of the frame): drop after the last block
        const blockStart = $pos.depth > 0 ? $pos.before(1)
            : hit.pos >= doc.content.size && doc.lastChild ? doc.content.size - doc.lastChild.nodeSize : hit.pos
        const blockRect = (view.nodeDOM(blockStart) as HTMLElement | null)?.getBoundingClientRect?.()
        const after = blockRect ? y > blockRect.top + blockRect.height / 2 : false
        const node = doc.nodeAt(blockStart)
        const target = {
            ...snapPlacement(block.left - rect.left, block.width, rect.width),
            pos: after && node ? blockStart + node.nodeSize : blockStart,
            lineY: blockRect ? (after ? blockRect.bottom : blockRect.top) : y,
            blankLines: 0,
        }
        if (target.pos < doc.content.size || !doc.lastChild) return target
        // Below the content: blank lines fill the gap so the block lands where it is dropped
        // (measured from the last block other than the dragged one, which leaves its place)
        let lastStart = doc.content.size - doc.lastChild.nodeSize
        if (lastStart === from && doc.childCount > 1) lastStart -= doc.child(doc.childCount - 2).nodeSize
        const bottom = (view.nodeDOM(lastStart) as HTMLElement | null)?.getBoundingClientRect().bottom ?? y
        const line = blankLineHeight(view.dom)
        const blankLines = Math.max(0, Math.round((block.top - bottom) / line))
        return { ...target, blankLines, lineY: bottom + blankLines * line }
    }

    const startDrag = (e: React.PointerEvent<HTMLElement>) => {
        if (e.button !== 0) return
        const box = e.currentTarget.getBoundingClientRect()
        const grabX = e.clientX - box.left
        const grabY = e.clientY - box.top
        const startX = e.clientX
        const startY = e.clientY
        let current: DropTarget | null = null
        let dragging = false

        const onMove = (move: PointerEvent) => {
            if (!dragging && Math.hypot(move.clientX - startX, move.clientY - startY) < DRAG_THRESHOLD_PX) return
            dragging = true
            move.preventDefault()
            // The editor grows under the pointer and the page scrolls, so a block can be taken further down
            const dom = editor.view.dom
            const editorRect = dom.getBoundingClientRect()
            const needed = move.clientY - editorRect.top + box.height + GROW_MARGIN_PX
            if (needed > editorRect.height) dom.style.minHeight = `${needed}px`
            if (move.clientY > window.innerHeight - GROW_MARGIN_PX) window.scrollBy(0, AUTO_SCROLL_PX)
            current = findTarget(move.clientX, move.clientY, { left: move.clientX - grabX, top: move.clientY - grabY, width: box.width }, getPos())
            setDrag(current && { target: current, width: box.width, height: box.height })
        }
        const onUp = () => {
            window.removeEventListener("pointermove", onMove)
            window.removeEventListener("pointerup", onUp)
            setDrag(null)
            editor.view.dom.style.minHeight = ""
            if (!dragging) return
            swallowNextClick()
            const from = getPos()
            if (current === null || from === undefined) return
            const node = editor.state.doc.nodeAt(from)
            if (!node) return
            const moved = node.type.create({ ...node.attrs, align: current.align, offset: current.offset })
            const tr = editor.state.tr.delete(from, from + node.nodeSize)
            const blanks = Array.from({ length: current.blankLines }, () => editor.schema.nodes.paragraph.create())
            tr.insert(tr.mapping.map(current.pos), [...blanks, moved])
            editor.view.dispatch(tr)
        }
        window.addEventListener("pointermove", onMove)
        window.addEventListener("pointerup", onUp)
    }

    const overlay: ReactNode = drag && typeof document !== "undefined"
        ? createPortal(<DropGuide editor={editor} {...drag} />, document.body)
        : null

    return { startDrag, dragging: drag !== null, overlay }
}

function DropGuide({ editor, target, width, height }: { editor: Editor; target: DropTarget; width: number; height: number }) {
    const rect = editor.view.dom.getBoundingClientRect()
    return (
        <div className="pointer-events-none fixed z-50" style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}>
            <div className="grid h-full gap-1" style={{ gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)` }}>
                {Array.from({ length: GRID_COLUMNS }, (_, i) => (
                    <div key={i} className="rounded-sm bg-blue-500/5 border-x border-blue-300/30" />
                ))}
            </div>
            {target.align === "center" && <div className="absolute top-0 bottom-0 w-px bg-pink-500" style={{ left: rect.width / 2 }} />}
            <div className="absolute left-0 right-0 h-0.5 rounded bg-blue-600" style={{ top: target.lineY - rect.top }} />
            <div
                className="absolute rounded-lg border-2 border-blue-500 bg-blue-500/15"
                style={{ left: target.left, top: target.lineY - rect.top + 4, width, height: Math.min(height, 160) }}
            />
        </div>
    )
}
