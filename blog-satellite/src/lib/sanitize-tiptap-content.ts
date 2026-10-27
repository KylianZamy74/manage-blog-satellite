// Défense en profondeur : neutralise les valeurs dangereuses dans le JSON TipTap
// avant écriture en base (le renderer public échappe déjà tout à l'affichage,
// mais on évite en plus de stocker des payloads malveillants).

const SAFE_URL_SCHEME = /^(https?:|mailto:|tel:)/i
const SAFE_HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/
const SAFE_WIDTH = /^\d{1,4}(\.\d{1,2})?(px|%)$/
const SAFE_OFFSET = /^\d{1,2}(\.\d{1,2})?%$/
const ALIGNS = ["left", "center", "right"]

function sanitizeUrlValue(value: unknown): string {
    const url = typeof value === "string" ? value.trim() : ""
    if (!url) return "#"
    const isRelative = url.startsWith("/") && !url.startsWith("//")
    if (SAFE_URL_SCHEME.test(url) || isRelative || url.startsWith("#")) {
        return url
    }
    return "#"
}

function sanitizeWidthValue(value: unknown): string {
    return typeof value === "string" && SAFE_WIDTH.test(value) ? value : "100%"
}

function sanitizeAlignValue(value: unknown, fallback: string): string {
    return typeof value === "string" && ALIGNS.includes(value) ? value : fallback
}

// Free horizontal position: only meaningful for left-aligned blocks
function sanitizeOffsetValue(value: unknown, align: string): string | null {
    return align === "left" && typeof value === "string" && SAFE_OFFSET.test(value) ? value : null
}

function sanitizeColorValue(value: unknown, fallback = "#2563eb"): string {
    return typeof value === "string" && SAFE_HEX_COLOR.test(value) ? value : fallback
}

function sanitizeNode(node: unknown): unknown {
    if (Array.isArray(node)) {
        return node.map(sanitizeNode)
    }
    if (!node || typeof node !== "object") {
        return node
    }

    const source = node as Record<string, unknown>
    const sanitized: Record<string, unknown> = { ...source }

    if (sanitized.attrs && typeof sanitized.attrs === "object") {
        const attrs: Record<string, unknown> = { ...(sanitized.attrs as Record<string, unknown>) }

        if (sanitized.type === "ctaButton" || sanitized.type === "customImage" || sanitized.type === "image") {
            if ("href" in attrs) attrs.href = sanitizeUrlValue(attrs.href)
            if ("src" in attrs) attrs.src = sanitizeUrlValue(attrs.src)
            if ("width" in attrs) attrs.width = sanitizeWidthValue(attrs.width)
        }
        if (sanitized.type === "ctaButton" || sanitized.type === "customImage") {
            attrs.align = sanitizeAlignValue(attrs.align, sanitized.type === "ctaButton" ? "left" : "center")
            attrs.offset = sanitizeOffsetValue(attrs.offset, attrs.align as string)
        }
        if (sanitized.type === "ctaButton") {
            attrs.color = sanitizeColorValue(attrs.color)
        }
        if (sanitized.type === "imageGallery" && Array.isArray(attrs.images)) {
            attrs.images = (attrs.images as Array<Record<string, unknown>>).map((img) => ({
                ...img,
                src: sanitizeUrlValue(img?.src),
                width: sanitizeWidthValue(img?.width),
            }))
        }

        sanitized.attrs = attrs
    }

    if (Array.isArray(sanitized.marks)) {
        sanitized.marks = (sanitized.marks as Array<Record<string, unknown>>).map((mark) => {
            if (mark?.type === "link" && mark.attrs && typeof mark.attrs === "object") {
                return {
                    ...mark,
                    attrs: { ...(mark.attrs as Record<string, unknown>), href: sanitizeUrlValue((mark.attrs as Record<string, unknown>).href) },
                }
            }
            return mark
        })
    }

    if (Array.isArray(sanitized.content)) {
        sanitized.content = sanitized.content.map(sanitizeNode)
    }

    return sanitized
}

export function sanitizeTiptapContent<T>(doc: T): T {
    return sanitizeNode(doc) as T
}
