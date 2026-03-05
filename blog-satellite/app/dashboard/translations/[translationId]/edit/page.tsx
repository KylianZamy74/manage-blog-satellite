import { getTranslation } from "@/actions/translations/action"
import TranslationEditForm from "@/components/ui/TranslationEditForm"
import { SUPPORTED_LOCALES } from "@/lib/deepl"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function EditTranslationPage({
    params,
}: {
    params: Promise<{ translationId: string }>
}) {
    const { translationId } = await params

    const translation = await getTranslation(translationId)
    if (!translation) {
        return <div className="p-8">Traduction non trouvée</div>
    }

    const locale = SUPPORTED_LOCALES.find((l) => l.code === translation.locale)

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto mb-8">
                <Link
                    href={`/dashboard/articles/${translation.articleId}/edit`}
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour à l&apos;article
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                    Éditer la traduction
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    {locale?.flag} {locale?.name ?? translation.locale} — {translation.article.title}
                </p>
            </div>
            <TranslationEditForm translation={translation} />
        </div>
    )
}
