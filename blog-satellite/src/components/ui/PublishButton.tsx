"use client"

import { publishArticle } from "@/actions/articles/action"
import { Button } from "./button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Loader2 } from "lucide-react"

interface PublishButtonProps {
    articleId: string
    setIsOpen: (open: boolean) => void
}

export default function PublishButton({ articleId, setIsOpen }: PublishButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const router = useRouter()

    const handlePublish = async () => {
        setIsLoading(true)
        const result = await publishArticle(articleId)

        if (result.success) {
            setIsSuccess(true)
            // Redirige vers la liste après 2 secondes
            setTimeout(() => {
                setIsOpen(false)
                router.push("/dashboard/articles")
            }, 2000)
        }

        setIsLoading(false)
    }

    return (
        // ── BACKDROP : couvre tout l'écran, semi-transparent ──
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setIsOpen(false)}
        >
            {/* ── MODALE : stopPropagation pour pas fermer en cliquant dedans ── */}
            <div
                className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                {isSuccess ? (
                    // ── ÉTAT SUCCÈS ──
                    <div className="flex flex-col items-center gap-4 py-4">
                        <CheckCircle className="h-16 w-16 text-emerald-500" />
                        <p className="text-lg font-semibold text-emerald-700">
                            Article publie avec succes !
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Redirection en cours...
                        </p>
                    </div>
                ) : (
                    // ── ÉTAT CONFIRMATION ──
                    <div className="flex flex-col items-center gap-6">
                        <div className="text-center">
                            <p className="text-lg font-semibold">
                                Publier cet article ?
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Il sera visible par vos lecteurs via l&apos;API publique.
                            </p>
                        </div>

                        <div className="flex gap-3 w-full">
                            <Button
                                onClick={handlePublish}
                                disabled={isLoading}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Oui, publier"
                                )}
                            </Button>
                            <Button
                                onClick={() => setIsOpen(false)}
                                variant="outline"
                                className="flex-1 cursor-pointer"
                            >
                                Annuler
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
