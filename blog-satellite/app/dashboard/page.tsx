import { auth } from "@/lib/auth"
import Link from "next/link"
import { FileText, PenLine, BookOpen, ArrowRight } from "lucide-react"

export default async function DashboardPage() {

    const session = await auth()
    const firstName = session?.user?.name || "vous"

    return (
        <div className="p-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-2xl font-bold text-gray-900">Bonjour, {firstName}</h1>
                    <p className="text-sm text-gray-500 mt-1">Que souhaitez-vous faire aujourd&apos;hui ?</p>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Consulter mes articles */}
                    <Link href="/dashboard/articles" className="group">
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-100 border border-sky-200/60 p-8 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                            <div className="h-12 w-12 rounded-xl bg-sky-200/60 text-sky-700 flex items-center justify-center mb-5">
                                <FileText className="h-6 w-6" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Consulter mes articles</h2>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Retrouvez tous vos articles, modifiez-les ou consultez leur statut de publication.
                            </p>
                            <div className="flex items-center gap-1 text-sm font-medium text-sky-700 mt-5 group-hover:gap-2 transition-all">
                                Voir mes articles
                                <ArrowRight className="h-4 w-4" />
                            </div>
                        </div>
                    </Link>

                    {/* Ajouter un article */}
                    <Link href="/dashboard/articles/new" className="group">
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200/60 p-8 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                            <div className="h-12 w-12 rounded-xl bg-amber-200/60 text-amber-700 flex items-center justify-center mb-5">
                                <PenLine className="h-6 w-6" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Ajouter un article</h2>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Rédigez un nouvel article et sauvegardez-le en brouillon ou publiez-le directement.
                            </p>
                            <div className="flex items-center gap-1 text-sm font-medium text-amber-700 mt-5 group-hover:gap-2 transition-all">
                                Rédiger un article
                                <ArrowRight className="h-4 w-4" />
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Guide */}
                <div className="mt-6">
                    <Link href="/dashboard/guide" className="group">
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 border border-emerald-200/60 p-8 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                            <div className="h-12 w-12 rounded-xl bg-emerald-200/60 text-emerald-700 flex items-center justify-center mb-5">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">📝 Guide de rédaction</h2>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Apprenez à structurer un article optimisé pour Google : titres, meta, images, CTA et un prompt IA prêt à l&apos;emploi.
                            </p>
                            <div className="flex items-center gap-1 text-sm font-medium text-emerald-700 mt-5 group-hover:gap-2 transition-all">
                                Lire le guide
                                <ArrowRight className="h-4 w-4" />
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}
