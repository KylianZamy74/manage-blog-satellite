import { getArticle } from "@/actions/articles/action";
import { getTranslations } from "@/actions/translations/action";
import ArticlePreviewComponent from "@/components/ui/ArticlePreview";

export default async function PreviewArticle({ params }: { params: Promise<{ id: string }> }) {

    const { id } = await params

    const article = await getArticle(id)

    if (!article || 'success' in article) {
        return <div>Article non trouvé</div>
    }
    if (!article.content) return <div>Pas de contenu</div>

    const translations = await getTranslations(id)

    return (
        <ArticlePreviewComponent
            content={article.content as object}
            articleId={article.id}
            articleTitle={article.title}
            translations={translations.map(t => ({
                locale: t.locale,
                title: t.title,
                content: t.content as object,
            }))}
        />
    )

}