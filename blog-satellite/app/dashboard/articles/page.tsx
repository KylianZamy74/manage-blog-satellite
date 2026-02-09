import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { getMyArticles } from "@/actions/articles/action"
import Link from "next/link"
import { Eye, Pencil, ImageOff } from "lucide-react"
import DeleteButton from "@/components/ui/DeleteButton"
import UnpublishButton from "@/components/ui/UnpublishButton"


export default async function MyArticle() {

    const articles = await getMyArticles()

    if(!Array.isArray(articles)) {
        return <p>Erreur lors du chargement des articles</p>
    }

    

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Mes articles</h1>
                <Link
                    href="/dashboard/articles/new"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    + Nouvel article
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                    <Card
                        className="group relative overflow-hidden pt-0 border transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                        key={article.id}
                    >
                        {/* ── IMAGE COVER OU PLACEHOLDER ── */}
                        {article.image ? (
                            <img
                                src={article.image}
                                alt={article.title}
                                className="aspect-video w-full object-cover"
                            />
                        ) : (
                            <div className="aspect-video w-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                <ImageOff className="h-10 w-10 text-slate-300" />
                            </div>
                        )}

                        {/* ── BADGE STATUT ── */}
                        <div className="absolute top-3 right-3">
                            <span className={`
                                px-2.5 py-1 rounded-full text-xs font-semibold
                                ${article.status === 'DRAFT'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                }
                            `}>
                                {article.status === 'DRAFT' ? 'Brouillon' : 'Publié'}
                            </span>
                        </div>

                        <CardHeader>
                            <CardTitle className="line-clamp-1">{article.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                                {article.excerpt || "Aucun extrait"}
                            </CardDescription>
                        </CardHeader>

                        {/* ── BOUTONS D'ACTION ── */}
                        <CardFooter>
                            <div className="flex flex-col gap-2 w-full">
                                <div className="flex gap-2 w-full">
                                    <Link
                                        href={`/dashboard/articles/${article.id}/preview/`}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors"
                                    >
                                        <Eye className="h-4 w-4" />
                                        Preview
                                    </Link>
                                    <Link
                                        href={`/dashboard/articles/${article.id}/edit/`}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Editer
                                    </Link>
                                    <DeleteButton articleId={article.id} />
                                </div>
                                {article.status === 'PUBLISHED' && (
                                    <UnpublishButton articleId={article.id} />
                                )}
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
