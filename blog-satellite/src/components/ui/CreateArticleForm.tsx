"use client"

import { useState } from "react"
import TiptapEditor from "@/components/ui/TiptapEditor"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createArticle, saveDraft } from "@/actions/articles/action"
import { useActionState } from "react"
import { User } from "@prisma/client"
import { useEffect } from "react"
 


interface ArticleFormProps {
    users: User[]
    isAdmin: boolean;
}


export default function ArticleForm({users, isAdmin}: ArticleFormProps) {

const [content, setContent] = useState('')
const [draftId, setDraftId] = useState<string | null>(null)
const [title, setTitle] = useState("")
const [excerpt, setExcerpt] = useState("")
const [metaTitle, setMetaTitle] = useState("")
const [metaDescription, setMetaDescription] = useState("")
const [isSaving, setIsSaving] = useState(false)
const [state, formAction, isPending] = useActionState(createArticle, null)
useEffect(() => {
    if(!title && !content) return

    const timer = setTimeout(async () => {
        setIsSaving(true)
        const result = await saveDraft(draftId, {title, content, excerpt, image: null, authorIdFromForm: null, metaDescription, metaTitle})
        if(result?.success && result?.id && !draftId) {
            setDraftId(result.id)
        }
        setIsSaving(false)
    }, 5000 )
    return () => clearTimeout(timer)
}, [title, content])

    return(
        <>
            <form action={formAction} className="space-y-2 flex flex-col">
                <label htmlFor="title" className="font-semibold">Titre de l&apos;article</label>
                <Input name="title" type="text" placeholder="Ajouter le titre de l'article" value={title} onChange={(e) => setTitle(e.target.value)}></Input>
                <label htmlFor="excerpt" className="font-semibold" >Courte description de l&apos;article</label>
                <Input name="excerpt" type="text" placeholder="Court résumé de votre article de blog" value={excerpt} onChange={(e) => setExcerpt(e.target.value)}></Input>
                <label htmlFor="metadescription" className="font-semibold">Méta-description</label>
                <Input name="metadescription" type="text" placeholder="Ajouter la méta-description" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)}></Input>
                <label htmlFor="metatitle" className="font-semibold">Méta-title</label>
                <Input name="metatitle" type="text" placeholder="Ajouter le méta-titre (titre de l'article visible depuis Google)" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}></Input>
                <label htmlFor="content" className="font-semibold">Contenu de votre article</label>
                <Input type="hidden" name="content" value={content}></Input>
                <TiptapEditor onChange={setContent}/>
                
                {isAdmin && (
                     <select name="authorId">
                        <option value="">Sélectionner un utilisateur</option>
                        {users.map((user) => (
                             <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                     </select>
                )}
               
                <Button type="submit" className="cursor-pointer" disabled={isPending}>Créer l&apos;article</Button>
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