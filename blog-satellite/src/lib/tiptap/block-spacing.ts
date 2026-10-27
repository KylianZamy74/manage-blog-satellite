/** normal vertical margin of image and CTA blocks */
export const BLOCK_MARGIN_PX = 16

// Free space above a block moved below the content (spaceBefore, px), added to its normal margin
export const blockMargin = (spaceBefore: unknown) =>
    `${BLOCK_MARGIN_PX + (Number(spaceBefore) || 0)}px 0 ${BLOCK_MARGIN_PX}px`

export const spaceBeforeAttribute = {
    default: 0,
    parseHTML: (element: HTMLElement) => Math.max(0, Math.round((parseFloat(element.style.marginTop) || 0) - BLOCK_MARGIN_PX)),
}
