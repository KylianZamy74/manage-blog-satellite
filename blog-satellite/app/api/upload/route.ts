import { NextResponse } from "next/server"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { auth } from "@/lib/auth"

const MAX_SIZE = 5 * 1024 * 1024

// Real file type from its first bytes (the client-sent MIME type can't be trusted)
const SIGNATURES: { ext: string; type: string; match: (b: Uint8Array) => boolean }[] = [
    { ext: "jpg", type: "image/jpeg", match: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
    { ext: "png", type: "image/png", match: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
    { ext: "gif", type: "image/gif", match: (b) => String.fromCharCode(...b.slice(0, 4)) === "GIF8" },
    {
        ext: "webp", type: "image/webp",
        match: (b) => String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP",
    },
]

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ message: "Non authentifié" }, { status: 401 })
    }

    const file = (await req.formData()).get("file")
    if (!(file instanceof File)) {
        return NextResponse.json({ message: "Aucun fichier reçu" }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
        return NextResponse.json({ message: "Image trop lourde (5 Mo maximum)" }, { status: 413 })
    }

    const bytes = new Uint8Array(await file.arrayBuffer())
    const format = SIGNATURES.find((s) => s.match(bytes))
    if (!format) {
        return NextResponse.json({ message: "Format non supporté (JPEG, PNG, WebP ou GIF)" }, { status: 415 })
    }

    const { env } = getCloudflareContext()
    const key = `${session.user.id}/${crypto.randomUUID()}.${format.ext}`

    try {
        await env.IMAGES_BUCKET.put(key, bytes, {
            httpMetadata: { contentType: format.type, cacheControl: "public, max-age=31536000, immutable" },
        })
    } catch (error) {
        console.error("R2 upload failed:", error)
        return NextResponse.json({ message: "Échec de l'envoi de l'image" }, { status: 500 })
    }

    return NextResponse.json({ url: `${env.R2_PUBLIC_URL}/${key}` })
}
