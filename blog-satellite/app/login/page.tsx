import { signIn } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Mail, ArrowRight, XCircle } from "lucide-react"

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {

    const params = await searchParams
    const error = params?.error

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md mx-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-600 text-white mb-4">
                        <Mail className="h-7 w-7" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Bienvenue</h1>
                    <p className="text-sm text-gray-500 mt-2">Connectez-vous pour accéder à votre tableau de bord</p>
                </div>

                {/* Erreur */}
                {error === "AccessDenied" && (
                    <div className="flex items-center gap-2 text-sm px-4 py-3 rounded-lg mb-6 bg-red-50 text-red-700">
                        <XCircle className="h-4 w-4 flex-shrink-0" />
                        Email non autorisé. Contactez un administrateur.
                    </div>
                )}

                {/* Formulaire */}
                <form
                    action={async (formData: FormData) => {
                        "use server"
                        const email = formData.get("email") as string
                        try {
                            await signIn("resend", { email, redirectTo: "/dashboard" })
                        } catch (error) {
                            if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
                                throw error
                            }
                            redirect("/login/?error=AccessDenied")
                        }
                    }}
                    className="bg-white rounded-xl border shadow-sm p-6 space-y-5"
                >
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Adresse email
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="vous@exemple.com"
                            required
                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        />
                    </div>

                    <button
                        type="submit"
                        className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors cursor-pointer"
                    >
                        Recevoir le lien de connexion
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </form>

                <p className="text-xs text-center text-gray-400 mt-6">
                    Un lien magique sera envoyé à votre adresse email
                </p>
            </div>
        </div>
    )
}
