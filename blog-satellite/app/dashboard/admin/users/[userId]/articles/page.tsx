import { getArticlesByUser } from "@/actions/articles/action"
import { getUser } from "@/actions/users/action"
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import AdminDeleteArticleButton from "@/components/ui/AdminDeleteArticleButton"
import Link from "next/link"
import { ArrowLeft, Pencil, ImageOff, FileText } from "lucide-react"
import { notFound } from "next/navigation"

interface UserArticlesPageProps {
    params: Promise<{ userId: string }>
}

export default async function UserArticlesPage({ params }: UserArticlesPageProps) {
    const { userId } = await params

    const [user, articles] = await Promise.all([
        getUser(userId),
        getArticlesByUser(userId),
    ])

    if (!user || !("id" in user)) {
        notFound()
    }

    if (!Array.isArray(articles)) {
        return <p>Erreur lors du chargement des articles</p>
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/dashboard/admin/users"
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour aux utilisateurs
                </Link>
            </div>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Articles de {user.name}</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {articles.length} article{articles.length > 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            {/* Liste vide */}
            {articles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <FileText className="h-10 w-10 mb-3" />
                    <p className="text-sm">Cet utilisateur n&apos;a aucun article</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article) => (
                        <Card
                            key={article.id}
                            className="group relative overflow-hidden pt-0 border transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                        >
                            {/* Image cover */}
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

                            {/* Badge statut */}
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

                            <CardFooter>
                                <div className="flex gap-2 w-full">
                                    <Link
                                        href={`/dashboard/articles/${article.id}/edit/`}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Éditer
                                    </Link>
                                    <AdminDeleteArticleButton
                                        articleId={article.id}
                                        articleTitle={article.title}
                                    />
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
