"use client"

import { useId, useState, type ReactNode } from "react"
import { uploadImage } from "@/lib/upload-image"

interface ImageUploadTriggerProps {
    onUploaded: (url: string) => void
    children: (open: () => void, uploading: boolean) => ReactNode
}

export default function ImageUploadTrigger({ onUploaded, children }: ImageUploadTriggerProps) {
    const inputId = useId()
    const [uploading, setUploading] = useState(false)
    const open = () => document.getElementById(inputId)?.click()

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        e.target.value = ""
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

    return (
        <>
            <input
                id={inputId}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                hidden
                onChange={handleChange}
            />
            {children(open, uploading)}
        </>
    )
}
