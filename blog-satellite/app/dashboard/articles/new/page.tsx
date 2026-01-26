"use client"

import { useState } from "react"
import TiptapEditor from "@/components/ui/TiptapEditor"

export default function NewArticle() {

const [content, setContent] = useState('')

    return(
        <>
        <div className="p-8">
            <h1 className="text-2xl font-semibold">Test Tiptap</h1>
            <TiptapEditor onChange={setContent}/>
        </div>
        <pre className="mt-4 p-4 bg-gray-100 text-xs overflow-auto max-h-[200px]">
          {content}
        </pre>
        </>
    )
}