"use client"

import { Input } from "@/components/ui/input"
import { createUser } from "@/actions/users/action"
import { useActionState } from "react"
import { Mail, User, CheckCircle, XCircle } from "lucide-react"

export default function CreateUser() {

    const [state, formAction, isPending] = useActionState(createUser, null)

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-lg mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Nouvel utilisateur</h1>
                    <p className="text-sm text-gray-500 mt-1">Ajoutez un nouveau membre à la plateforme</p>
                </div>

                {state && (
                    <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-lg mb-6 ${state.success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        {state.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        {state.message}
                    </div>
                )}

                <form action={formAction} className="bg-white rounded-xl border shadow-sm p-6 space-y-5">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            Prénom
                        </label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Prénom de l'utilisateur"
                            name="name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            Adresse email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="exemple@email.com"
                            name="email"
                            required
                        />
                    </div>

                    <button
                        disabled={isPending}
                        type="submit"
                        className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 px-6 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                        {isPending ? "Création en cours..." : "Créer l'utilisateur"}
                    </button>
                </form>
            </div>
        </div>
    )
}
