"use client"

import { useState } from "react"
import { swallowNextClick } from "@/hooks/use-block-drag"

const MIN_WIDTH_PX = 60
// Magnetic widths (% of the container): free resize everywhere else
const SNAP_PERCENTS = [25, 100 / 3, 50, 200 / 3, 75, 100]
const SNAP_DISTANCE_PX = 10

interface ResizeStart {
    /** element whose width follows the pointer (keeps the image ratio through height: auto) */
    frame: HTMLElement
    container: HTMLElement
    /** horizontal side being dragged: 1 right, -1 left, 0 none (top/bottom edge) */
    dirX: 1 | -1 | 0
    /** vertical side being dragged: 1 bottom, -1 top, 0 none (left/right edge) */
    dirY: 1 | -1 | 0
    /** true when the image is centered: it grows on both sides, so the drag counts twice */
    symmetric: boolean
    /** called once on release with the new width, e.g. "57.32%" */
    onCommit: (width: string) => void
}

// Free, continuous drag-to-resize for editor images (mouse and touch), like resizing a window:
// the frame width is updated directly on each animation frame while dragging, and the
// attribute is written once on release as a % of the container (responsive on the blog).
export function useResizeDrag() {
    const [resizing, setResizing] = useState(false)

    const startResize = (e: React.PointerEvent, { frame, container, dirX, dirY, symmetric, onCommit }: ResizeStart) => {
        e.preventDefault()
        e.stopPropagation()
        const startX = e.clientX
        const startY = e.clientY
        const startWidth = frame.offsetWidth
        const ratio = startWidth / (frame.offsetHeight || startWidth)
        const containerWidth = container.clientWidth || startWidth
        const factor = symmetric ? 2 : 1
        let width = startWidth
        let frameRequest = 0
        setResizing(true)

        const onMove = (move: PointerEvent) => {
            // Corners follow whichever axis moved the most, converted to a width through the image ratio
            const fromX = dirX * (move.clientX - startX)
            const fromY = dirY * (move.clientY - startY) * ratio
            const delta = Math.abs(fromX) >= Math.abs(fromY) ? fromX : fromY
            width = Math.min(containerWidth, Math.max(MIN_WIDTH_PX, startWidth + delta * factor))
            const snap = SNAP_PERCENTS.map((p) => (p / 100) * containerWidth).find((w) => Math.abs(w - width) < SNAP_DISTANCE_PX)
            if (snap !== undefined) width = snap
            cancelAnimationFrame(frameRequest)
            frameRequest = requestAnimationFrame(() => { frame.style.width = `${width}px` })
        }
        const onUp = () => {
            window.removeEventListener("pointermove", onMove)
            window.removeEventListener("pointerup", onUp)
            cancelAnimationFrame(frameRequest)
            setResizing(false)
            swallowNextClick()
            onCommit(`${Math.round((width / containerWidth) * 10000) / 100}%`)
        }
        window.addEventListener("pointermove", onMove)
        window.addEventListener("pointerup", onUp)
    }

    return { resizing, startResize }
}
