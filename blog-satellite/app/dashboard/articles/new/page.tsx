
import { createArticle } from "@/actions/articles/action"
import { getUsers } from "@/actions/users/action"
import ArticleForm from "@/components/ui/ArticleForm"
import { auth } from "@/lib/auth"

export default async function NewArticle() {

const session = await auth()
const isAdmin = session?.user?.role === 'ADMIN'
const usersResult = await getUsers()
const users = Array.isArray(usersResult) ? usersResult : []

return (
        
        <div className="p-8">
            <h1 className="text-2xl font-semibold">Test Tiptap</h1>
            <ArticleForm users={users} isAdmin={isAdmin} />
        </div>
        
    )
}