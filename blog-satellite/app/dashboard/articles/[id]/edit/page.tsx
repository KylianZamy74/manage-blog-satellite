
import { getArticle } from "@/actions/articles/action"
import { getUsers } from "@/actions/users/action"
import EditArticleForm from "@/components/ui/EditArticleForm"
import { auth } from "@/lib/auth"

export default async function editArticle({params}: {params: Promise<{id: string}>}) {
const {id} = await params

const article = await getArticle(id)
if (!article || 'success' in article) {
      return <div>Article non trouvé</div>
  }

const session = await auth()
const isAdmin = session?.user?.role === 'ADMIN'
const usersResult = await getUsers()
const users = Array.isArray(usersResult) ? usersResult : []

return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Modifier l&apos;article</h1>
                <p className="text-sm text-gray-500 mt-1">{article.title}</p>
            </div>
            <EditArticleForm article={article} users={users} isAdmin={isAdmin} />
        </div>
    )
}