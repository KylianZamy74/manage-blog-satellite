"use client"

import { useState } from "react"
import TiptapEditor from "@/components/ui/TiptapEditor"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { editArticle } from "@/actions/articles/action"
import { useActionState } from "react"
import { Article } from "@prisma/client"
 


interface ArticleFormProps {
    article: Article
}


export default function ArticleForm({article}: ArticleFormProps) {

const [content, setContent] = useState(JSON.stringify(article.content))
const editArticleWithId = editArticle.bind(null, article.id)
const [state, formAction, isPending] = useActionState(editArticleWithId, null)


    return(
        <>
            <form action={formAction} className="space-y-2 flex flex-col">
                <label htmlFor="title"  className="font-semibold">Titre de l&apos;article</label>
                <Input name="title" type="text" placeholder="Ajouter le titre de l'article" defaultValue={article.title}></Input>
                <label htmlFor="excerpt" className="font-semibold">Courte description de l&apos;article</label>
                <Input name="excerpt" type="text" placeholder="Court résumé de votre article de blog" defaultValue={article.excerpt ?? ""}></Input>
                <label htmlFor="metadescription" className="font-semibold">Méta-description</label>
                <Input name="metadescription" type="text" placeholder="Ajouter la méta-description" defaultValue={article.metaDescription ?? ""}></Input>
                <label htmlFor="metatitle" className="font-semibold">Méta-title</label>
                <Input name="metatitle" type="text" placeholder="Ajouter le méta-titre (titre de l'article visible depuis Google)" defaultValue={article.metaTitle ?? ""}></Input>
                <label htmlFor="content" className="font-semibold">Contenu de votre article</label>
                <Input type="hidden" name="content" value={content}></Input>
                <TiptapEditor content={content} onChange={setContent}/>
                <Button type="submit" className="cursor-pointer" disabled={isPending}>Modifier l&apos;article</Button>
            </form>
             {state && (
                    <p className={state.success ? "text-green-400" : "text-red-400"}>{state.message}</p>
                )}
        <pre className="mt-4 p-4 bg-gray-100 text-xs overflow-auto max-h-[200px]">
          {content}
        </pre>
        </>
    )
}