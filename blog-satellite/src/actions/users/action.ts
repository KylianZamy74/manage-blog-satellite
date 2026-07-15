'use server'

import {prisma} from "@/lib/prisma"
import slugify from "@/lib/slugify"
import { revalidatePath } from 'next/cache'
import { auth } from "@/lib/auth"

interface ActionResult {
    success: boolean,
    message: string
}


export async function createUser(prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {

  const session = await auth()
  if (!session?.user?.id) {
    return {success: false, message: "Non authentifié"}
  }
  if (session.user.role !== 'ADMIN') {
    return {success: false, message: "Non autorisé"}
  }

  const email = formData.get('email') as string
  const name = formData.get('name') as string

  const slug = slugify(name)


    if (!email) {
    return {success: false, message: "Cet email n'existe pas"}
  }

  const existingEmail = await prisma.user.findUnique({
    where: { email }
  })

  if(existingEmail) {
    return {success: false, message: "Email déjà existant"}
  }

try {
    const user = await prisma.user.create({
    data: {
      email,
      name,
      slug,
      role: "CLIENT"
    }
  })
 
} catch (error) {
    console.error(error)
    return {success: false, message: "Echec dans la création de l'utilisateur"}
}
revalidatePath('/dashboard/admin/users')
return {success: true, message: "Utilisateur créer avec succès ! "}
}



export async function deleteUser(id: string){

    const session = await auth()
    if (!session?.user?.id) {
        return {success: false, message: "Non authentifié"}
    }
    if (session.user.role !== 'ADMIN') {
        return {success: false, message: "Non autorisé"}
    }

    try {
         await prisma.user.delete({
        where: { id }
    })
    revalidatePath('/dashboard/admin/users')
    } catch (error) {
        return {success: false, message: "Echec dans la destruction utilisateur"}
    }
    return {success: true, message: "Utilisateur détruit avec succès !"}
}

export async function getUsers() {
  const session = await auth()
  if (!session?.user?.id) {
    return {success: false, message: "Non authentifié"}
  }
  if (session.user.role !== 'ADMIN') {
    return {success: false, message: "Non autorisé"}
  }
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return users
  } catch (error) {
    console.error(error)
    return {success: false, message: "Erreur lors de la récupération des utilisateurs"}
  }
}

export async function getUser(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return {success: false, message: "Non authentifié"}
  }
  if (session.user.role !== 'ADMIN') {
    return {success: false, message: "Non autorisé"}
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    })
    return user
  } catch (error) {
    console.error(error)
    return {success: false, message: `Erreur lors de la récupération de l'utilisateur`}

  }
}