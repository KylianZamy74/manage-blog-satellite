"use client"

import { useState } from "react"
import TiptapEditor from "@/components/ui/TiptapEditor"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createArticle } from "@/actions/articles/action"
import { useActionState } from "react"
import { User } from "@prisma/client"
 


interface ArticleFormProps {
    users: User[]
    isAdmin: boolean;
}


export default function ArticleForm({users, isAdmin}: ArticleFormProps) {

const [content, setContent] = useState('')
const [state, formAction, isPending] = useActionState(createArticle, null)


    return(
        <>
            <form action={formAction} className="space-y-2 flex flex-col">
                <label htmlFor="title" className="font-semibold">Titre de l&apos;article</label>
                <Input name="title" type="text" placeholder="Ajouter le titre de l'article"></Input>
                <label htmlFor="excerpt" className="font-semibold">Courte description de l&apos;article</label>
                <Input name="excerpt" type="text" placeholder="Court résumé de votre article de blog"></Input>
                <label htmlFor="metadescription" className="font-semibold">Méta-description</label>
                <Input name="metadescription" type="text" placeholder="Ajouter la méta-description"></Input>
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