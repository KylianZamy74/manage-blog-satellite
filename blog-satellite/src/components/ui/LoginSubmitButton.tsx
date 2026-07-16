"use client"

import { useFormStatus } from "react-dom"
import { ArrowRight, Loader2 } from "lucide-react"

export function LoginSubmitButton() {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending}
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {pending ? (
                <>
                    Envoi en cours...
                    <Loader2 className="h-4 w-4 animate-spin" />
                </>
            ) : (
                <>
                    Recevoir le lien de connexion
                    <ArrowRight className="h-4 w-4" />
                </>
            )}
        </button>
    )
}
