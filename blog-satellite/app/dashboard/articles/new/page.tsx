
import { getUsers } from "@/actions/users/action"
import ArticleForm from "@/components/ui/CreateArticleForm"
import { auth } from "@/lib/auth"

export default async function NewArticle() {

const session = await auth()
const isAdmin = session?.user?.role === 'ADMIN'
const usersResult = await getUsers()
const users = Array.isArray(usersResult) ? usersResult : []

return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Nouvel article</h1>
                <p className="text-sm text-gray-500 mt-1">Rédigez et sauvegardez votre article en brouillon</p>
            </div>
            <ArticleForm users={users} isAdmin={isAdmin} />
        </div>
    )
}