"use client"

import { useState } from "react"

const MIN_PERCENT = 10

interface ResizeStart {
    image: HTMLElement
    container: HTMLElement
    /** 1 for a right-side handle, -1 for a left-side handle */
    direction: 1 | -1
    /** true when the image is centered: it grows on both sides, so the drag counts twice */
    symmetric: boolean
    /** called once on release with the new width, e.g. "60%" */
    onCommit: (width: string) => void
}

// Drag-to-resize for editor images (mouse and touch). Width is a % of the container so the
// image stays responsive on the public blog; the attribute is written once, on release.
export function useResizeDrag() {
    const [livePercent, setLivePercent] = useState<number | null>(null)

    const startResize = (e: React.PointerEvent, { image, container, direction, symmetric, onCommit }: ResizeStart) => {
        e.preventDefault()
        e.stopPropagation()
        const startX = e.clientX
        const startWidth = image.offsetWidth
        const containerWidth = container.clientWidth || startWidth
        const factor = direction * (symmetric ? 2 : 1)
        let percent = Math.round((startWidth / containerWidth) * 100)
        setLivePercent(percent)

        const onMove = (move: PointerEvent) => {
            const width = startWidth + (move.clientX - startX) * factor
            percent = Math.min(100, Math.max(MIN_PERCENT, Math.round((width / containerWidth) * 100)))
            setLivePercent(percent)
        }
        const onUp = () => {
            window.removeEventListener("pointermove", onMove)
            window.removeEventListener("pointerup", onUp)
            setLivePercent(null)
            onCommit(`${percent}%`)
        }
        window.addEventListener("pointermove", onMove)
        window.addEventListener("pointerup", onUp)
    }

    return { livePercent, startResize }
}
