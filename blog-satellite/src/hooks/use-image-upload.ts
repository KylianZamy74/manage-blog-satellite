"use client"

import { useState } from "react"
import { pickImageFile, uploadImage } from "@/lib/upload-image"

// Single upload flow (picker → optimize → R2) shared by the editor toolbar, slash menu and gallery
export function useImageUpload(onUploaded: (url: string) => void) {
    const [uploading, setUploading] = useState(false)

    const open = async () => {
        const file = await pickImageFile()
        if (!file) return
        setUploading(true)
        try {
            onUploaded(await uploadImage(file))
        } catch (error) {
            alert((error as Error).message)
        } finally {
            setUploading(false)
        }
    }

    return { open, uploading }
}
