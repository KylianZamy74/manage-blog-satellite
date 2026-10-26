const MAX_DIMENSION = 2000
const WEBP_QUALITY = 0.85

// Resize to MAX_DIMENSION and convert to WebP in the browser (GIFs kept as-is to preserve animation)
async function optimize(file: File): Promise<Blob> {
    if (file.type === "image/gif") return file
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const canvas = new OffscreenCanvas(Math.round(bitmap.width * scale), Math.round(bitmap.height * scale))
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const webp = await canvas.convertToBlob({ type: "image/webp", quality: WEBP_QUALITY })
    return webp.size < file.size ? webp : file
}

export async function uploadImage(file: File): Promise<string> {
    const body = new FormData()
    body.append("file", await optimize(file))

    const res = await fetch("/api/upload", { method: "POST", body })
    const data = await res.json().catch(() => ({})) as { url?: string; message?: string }
    if (!res.ok || !data.url) throw new Error(data.message || "Échec de l'envoi de l'image")
    return data.url
}

export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif"

// Opens the native file picker; resolves with null if the user cancels
export function pickImageFile(): Promise<File | null> {
    return new Promise((resolve) => {
        const input = document.createElement("input")
        input.type = "file"
        input.accept = ACCEPTED_IMAGE_TYPES
        input.onchange = () => resolve(input.files?.[0] ?? null)
        input.oncancel = () => resolve(null)
        input.click()
    })
}
