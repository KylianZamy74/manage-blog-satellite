
import { getArticle } from "@/actions/articles/action"
import EditArticleForm from "@/components/ui/EditArticleForm"

export default async function editArticle({params}: {params: Promise<{id: string}>}) {
const {id} = await params

const article = await getArticle(id)
if (!article || 'success' in article) {
      return <div>Article non trouvé</div>
  }

return (
        
        <div className="p-8">
            <h1 className="text-2xl font-semibold">Test Tiptap</h1>
            <EditArticleForm article={article} />
        </div>
        
    )
}