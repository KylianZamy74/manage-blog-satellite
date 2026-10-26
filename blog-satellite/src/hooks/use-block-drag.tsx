"use client"

import { useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import type { Editor } from "@tiptap/react"

export type BlockAlign = "left" | "center" | "right"

const DRAG_THRESHOLD_PX = 4
const GRID_COLUMNS = 12
/** distance (as a share of the editor width) under which center and edges win over the grid */
const EDGE_SNAP = 0.04

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
}

// After a drag, the browser still fires a click on release: swallow it so the settings popover stays closed
export function swallowNextClick() {
    const stop = (e: MouseEvent) => { e.stopPropagation(); e.preventDefault() }
    window.addEventListener("click", stop, { capture: true, once: true })
    setTimeout(() => window.removeEventListener("click", stop, { capture: true }), 300)
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

    const findTarget = (x: number, y: number, blockLeft: number, width: number): DropTarget | null => {
        const view = editor.view
        const rect = view.dom.getBoundingClientRect()
        const hit = view.posAtCoords({ left: Math.min(Math.max(x, rect.left + 1), rect.right - 1), top: y })
        if (!hit) return null
        const $pos = view.state.doc.resolve(hit.pos)
        const blockStart = $pos.depth > 0 ? $pos.before(1) : hit.pos
        const blockRect = (view.nodeDOM(blockStart) as HTMLElement | null)?.getBoundingClientRect?.()
        const after = blockRect ? y > blockRect.top + blockRect.height / 2 : false
        const block = view.state.doc.nodeAt(blockStart)
        return {
            ...snapPlacement(blockLeft - rect.left, width, rect.width),
            pos: after && block ? blockStart + block.nodeSize : blockStart,
            lineY: blockRect ? (after ? blockRect.bottom : blockRect.top) : y,
        }
    }

    const startDrag = (e: React.PointerEvent<HTMLElement>) => {
        if (e.button !== 0) return
        const box = e.currentTarget.getBoundingClientRect()
        const grabX = e.clientX - box.left
        const startX = e.clientX
        const startY = e.clientY
        let current: DropTarget | null = null
        let dragging = false

        const onMove = (move: PointerEvent) => {
            if (!dragging && Math.hypot(move.clientX - startX, move.clientY - startY) < DRAG_THRESHOLD_PX) return
            dragging = true
            move.preventDefault()
            current = findTarget(move.clientX, move.clientY, move.clientX - grabX, box.width)
            setDrag(current && { target: current, width: box.width, height: box.height })
        }
        const onUp = () => {
            window.removeEventListener("pointermove", onMove)
            window.removeEventListener("pointerup", onUp)
            setDrag(null)
            if (!dragging) return
            swallowNextClick()
            const from = getPos()
            if (current === null || from === undefined) return
            const node = editor.state.doc.nodeAt(from)
            if (!node) return
            const moved = node.type.create({ ...node.attrs, align: current.align, offset: current.offset })
            const tr = editor.state.tr.delete(from, from + node.nodeSize)
            tr.insert(tr.mapping.map(current.pos), moved)
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
