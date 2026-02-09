import { Mail, CheckCircle } from "lucide-react"

export default function VerifyLogin() {

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md mx-4 text-center">
                {/* Icone */}
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 mb-6">
                    <CheckCircle className="h-8 w-8" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-3">Email envoyé !</h1>

                <div className="bg-white rounded-xl border shadow-sm p-6">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 text-blue-600 mb-4">
                        <Mail className="h-6 w-6" />
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Un lien de connexion a été envoyé à votre adresse email.
                        Vérifiez votre boîte de réception et cliquez sur le lien pour accéder à votre tableau de bord.
                    </p>
                    <p className="text-xs text-gray-400 mt-4">
                        Pensez à vérifier vos spams si vous ne trouvez pas l&apos;email.
                    </p>
                </div>
            </div>
        </div>
    )
}
