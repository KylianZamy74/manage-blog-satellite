"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createUser } from "@/actions/users/action"
import { useActionState } from "react"


export default function CreateUser() {

const [state, formAction, isPending] = useActionState(createUser, null )

    return(

        <div className="flex items-center justify-center h-full">
            <form action={formAction} className="space-y-5">
                
                    <div >
                        <label htmlFor="email">Rentre l&apos;adresse mail</label>
                        <Input type="email" placeholder="Email" name="email" required />
                    </div>
                
                
                    <div >
                        <label htmlFor="name">Rentre le prénom de l&apos;utilisateur</label>
                        <Input type="name" placeholder="Prénom" name="name" required />
                    </div>
                
                <Button disabled={isPending} type="submit" className="cursor-pointer w-full flex justify-center">{isPending ? "Creation en cours..." : "Créer le nouvel utilisateur"}</Button>
                {state && (
                    <p className={state.success ? "text-green-400" : "text-red-400"}>{state.message}</p>
                )}
            </form>
        </div>
    )
}