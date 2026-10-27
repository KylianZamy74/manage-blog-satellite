"use client"

import { useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import type { Editor } from "@tiptap/react"
import type { Node as ProseMirrorNode } from "@tiptap/pm/model"
import { BLOCK_MARGIN_PX } from "@/lib/tiptap/block-spacing"
import { ROW_GAP_PX } from "@/lib/tiptap/block-row-extension"

export type BlockAlign = "left" | "center" | "right"

const DRAG_THRESHOLD_PX = 4
const GRID_COLUMNS = 12
/** distance (as a share of the editor width) under which center and edges win over the grid */
const EDGE_SNAP = 0.04
/** room kept under the dragged block when the editor grows, and viewport margin that triggers auto-scroll */
const GROW_MARGIN_PX = 60
const AUTO_SCROLL_PX = 12
/** free space above a block dropped below the content snaps to this step */
const SPACE_STEP_PX = 8
/** share of a block's width, on each side, where dropping puts the dragged block next to it */
const BESIDE_ZONE = 1 / 3
const MOVABLE_BLOCKS = ["customImage", "ctaButton"]
const ROW = "blockRow"

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
    /** viewport y where the block will appear once dropped (the ghost's top) */
    top: number
    /** free space above the block (px) when it is dropped below the content, 0 otherwise */
    spaceBefore: number
    /** set when the block is dropped next to another image or CTA: they share a row */
    beside?: Beside
}

interface Beside {
    /** position of the block it goes next to */
    pos: number
    side: "before" | "after"
    /** visible box of that block (viewport) */
    rect: DOMRect
}

/** true when the block at this position sits in a row, next to other blocks */
export const isInRow = (editor: Editor, getPos: () => number | undefined) => {
    const pos = getPos()
    return pos !== undefined && editor.state.doc.resolve(pos).parent.type.name === ROW
}

// After a drag, the browser still fires a click on release: swallow it so the settings popover stays closed
export function swallowNextClick() {
    const stop = (e: MouseEvent) => { e.stopPropagation(); e.preventDefault() }
    window.addEventListener("click", stop, { capture: true, once: true })
    setTimeout(() => window.removeEventListener("click", stop, { capture: true }), 300)
}

const isBlank = (node: ProseMirrorNode) => node.type.name === "paragraph" && node.content.size === 0

const marginOf = (dom: Element | null | undefined, side: "marginTop" | "marginBottom") =>
    dom ? parseFloat(getComputedStyle(dom)[side]) || 0 : 0

// Vertical margins collapse: the space between two blocks is the larger of the two margins
const gap = (above: Element | null | undefined, marginTop: number) => Math.max(marginOf(above, "marginBottom"), marginTop)

/** what the dragged block frees when it leaves its place, measured once at drag start */
interface DraggedBlock {
    from: number
    /** height the content below moves up by (block + its margins) */
    freed: number
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

    // The ghost shows where the block will really appear once dropped: what follows the dragged block
    // moves up by the room it frees, and margins collapse like in the document
    const findTarget = (x: number, y: number, block: { left: number; top: number; width: number }, dragged: DraggedBlock): DropTarget | null => {
        const view = editor.view
        const rect = view.dom.getBoundingClientRect()
        const beside = findBeside(x, y, dragged)
        if (beside) {
            const left = beside.side === "before" ? beside.rect.left - ROW_GAP_PX - block.width : beside.rect.right + ROW_GAP_PX
            return { align: "left", offset: null, left: left - rect.left, pos: beside.pos, top: beside.rect.top, spaceBefore: 0, beside }
        }
        const hit = view.posAtCoords({ left: Math.min(Math.max(x, rect.left + 1), rect.right - 1), top: y })
        if (!hit) return null
        const doc = view.state.doc
        const $pos = doc.resolve(hit.pos)
        // Below the last block (empty bottom of the frame): drop after the last block
        const blockStart = $pos.depth > 0 ? $pos.before(1)
            : hit.pos >= doc.content.size && doc.lastChild ? doc.content.size - doc.lastChild.nodeSize : hit.pos
        const blockDom = view.nodeDOM(blockStart) as HTMLElement | null
        const blockRect = blockDom?.getBoundingClientRect?.()
        const after = blockRect ? y > blockRect.top + blockRect.height / 2 : false
        const node = doc.nodeAt(blockStart)
        const pos = after && node ? blockStart + node.nodeSize : blockStart
        const placement = snapPlacement(block.left - rect.left, block.width, rect.width)
        const shift = (at: number) => (dragged.from < at ? dragged.freed : 0)
        // End of the content: after the last block that is neither blank (e.g. the editor's trailing line) nor the dragged one
        let contentEnd = doc.content.size
        for (let i = doc.childCount - 1; i >= 0; i--) {
            const start = contentEnd - doc.child(i).nodeSize
            if (start !== dragged.from && !isBlank(doc.child(i))) break
            contentEnd = start
        }
        const lastContent = doc.resolve(contentEnd).nodeBefore
        if (pos < contentEnd || !lastContent) {
            const top = !blockRect ? y
                : after ? blockRect.bottom + gap(blockDom, BLOCK_MARGIN_PX)
                : blockRect.top - gap(blockDom?.previousElementSibling, marginOf(blockDom, "marginTop")) + gap(blockDom?.previousElementSibling, BLOCK_MARGIN_PX)
            return { ...placement, pos, top: top - shift(blockStart), spaceBefore: 0 }
        }
        // Below the content: right after it, with free space above the block so it lands where it is dropped
        const lastStart = contentEnd - lastContent.nodeSize
        const lastDom = view.nodeDOM(lastStart) as HTMLElement | null
        const base = (lastDom?.getBoundingClientRect().bottom ?? y)
            + gap(lastDom, BLOCK_MARGIN_PX) - shift(lastStart)
        const spaceBefore = Math.max(0, Math.round((block.top - base) / SPACE_STEP_PX) * SPACE_STEP_PX)
        return { ...placement, pos: contentEnd, top: base + spaceBefore, spaceBefore }
    }

    // Pointer on the outer third of another image or CTA (or the empty space beside it): the block goes next to it
    const findBeside = (x: number, y: number, dragged: DraggedBlock): Beside | null => {
        const view = editor.view
        const hovered = document.elementFromPoint(x, y)
        if (!hovered || !view.dom.contains(hovered)) return null
        let found: Beside | null = null
        view.state.doc.descendants((node, pos) => {
            if (found || !MOVABLE_BLOCKS.includes(node.type.name) || pos === dragged.from) return !found
            const wrapper = (view.nodeDOM(pos) as HTMLElement | null)?.querySelector<HTMLElement>("[data-node-view-wrapper]")
            if (!wrapper?.contains(hovered)) return false
            const rect = (wrapper.firstElementChild ?? wrapper).getBoundingClientRect()
            const zone = rect.width * BESIDE_ZONE
            const side = x < rect.left + zone ? "before" : x > rect.right - zone ? "after" : null
            if (side) found = { pos, side, rect }
            return false
        })
        return found
    }

    const startDrag = (e: React.PointerEvent<HTMLElement>) => {
        const from = getPos()
        if (e.button !== 0 || from === undefined) return
        const box = e.currentTarget.getBoundingClientRect()
        const wrapper = editor.view.nodeDOM(from) as HTMLElement | null
        const marginTop = marginOf(wrapper, "marginTop")
        const prev = wrapper?.previousElementSibling
        const next = wrapper?.nextElementSibling
        const dragged: DraggedBlock = {
            from,
            // how far the next block moves up once the dragged one is gone
            freed: wrapper && next && !isInRow(editor, getPos)
                ? next.getBoundingClientRect().top - wrapper.getBoundingClientRect().top + gap(prev, marginTop) - gap(prev, marginOf(next, "marginTop"))
                : 0,
        }
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
            current = findTarget(move.clientX, move.clientY, { left: move.clientX - grabX, top: move.clientY - grabY, width: box.width }, dragged)
            setDrag(current && { target: current, width: box.width, height: box.height })
        }
        const onUp = () => {
            window.removeEventListener("pointermove", onMove)
            window.removeEventListener("pointerup", onUp)
            setDrag(null)
            editor.view.dom.style.minHeight = ""
            if (!dragging) return
            swallowNextClick()
            if (current === null) return
            const node = editor.state.doc.nodeAt(from)
            if (!node) return
            const tr = editor.state.tr.delete(from, from + node.nodeSize)
            if (current.beside) {
                // In a row, position comes from the order of the blocks: no alignment, offset or free space
                const moved = node.type.create({ ...node.attrs, align: "left", offset: null, spaceBefore: 0 })
                const at = tr.mapping.map(current.beside.pos)
                const target = tr.doc.nodeAt(at)
                if (!target) return
                if (tr.doc.resolve(at).parent.type.name === ROW) {
                    tr.insert(current.beside.side === "after" ? at + target.nodeSize : at, moved)
                } else {
                    const neighbour = target.type.create({ ...target.attrs, align: "left", offset: null, spaceBefore: 0 })
                    const blocks = current.beside.side === "after" ? [neighbour, moved] : [moved, neighbour]
                    tr.replaceWith(at, at + target.nodeSize, editor.schema.nodes[ROW].create(null, blocks))
                }
            } else {
                const moved = node.type.create({ ...node.attrs, align: current.align, offset: current.offset, spaceBefore: current.spaceBefore })
                tr.insert(tr.mapping.map(current.pos), moved)
            }
            // Blank lines left at the very end serve nothing (the editor keeps its own trailing line)
            let end = tr.doc.content.size
            for (let i = tr.doc.childCount - 1; i >= 0 && isBlank(tr.doc.child(i)); i--) end -= tr.doc.child(i).nodeSize
            tr.delete(end, tr.doc.content.size)
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
            {target.beside ? (
                // vertical bar: the block goes next to this one, in the same row
                <div
                    className="absolute w-0.5 rounded bg-blue-600"
                    style={{
                        left: (target.beside.side === "before" ? target.beside.rect.left - ROW_GAP_PX / 2 : target.beside.rect.right + ROW_GAP_PX / 2) - rect.left,
                        top: target.beside.rect.top - rect.top,
                        height: target.beside.rect.height,
                    }}
                />
            ) : (
                <div className="absolute left-0 right-0 h-0.5 rounded bg-blue-600" style={{ top: target.top - rect.top - 6 }} />
            )}
            <div
                className="absolute rounded-lg border-2 border-blue-500 bg-blue-500/15"
                style={{ left: target.left, top: target.top - rect.top, width, height: Math.min(height, 160) }}
            />
        </div>
    )
}
