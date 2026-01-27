"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

interface ArticleAction {
    success: boolean
    message: string
}
function slugify(text: string) {
    if (!text)
        return '';
    let slug = text.toLowerCase().trim();
    slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    slug = slug.replace(/[^a-z0-9\s-]/g, ' ').trim();
    slug = slug.replace(/[\s-]+/g, '-');
    return slug;
}


export async function createArticle(prevState: ArticleAction | null, formData: FormData): Promise<ArticleAction> {

    
  const title = formData.get('title') as string
  const contentRaw = formData.get('content') as string
  const content = JSON.parse(contentRaw)
  const image = formData.get("image") as string | null
  const excerpt = formData.get("excerpt") as string
  const metaDescription = formData.get("metadescription") as string
  const slug = slugify(title)
  const session = await auth()
  if(!session?.user?.id){
    return({success: false, message:"Aucun utilisateur authentifié"})
  }
  const authorIdFromForm = formData.get("authorId") as string | null
  const authorId = authorIdFromForm ||session?.user.id
  
  if (!title || !content) {
    return {success:false, message: "Titre et contenu requis"}
  }
  
  try {
    const article = await prisma.article.create({
      data: {
        title,
        content,
        slug,
        image,
        excerpt,
        metaDescription,
        authorId,
        status: 'DRAFT'
      }
    })

 
  } catch (error) {
    console.error(error)
    if ((error as any).code === 'P2002') {
        return { success: false, message: "Un article avec ce titre existe déjà" }
      }
    return {success: false, message:"Echec lors de la création de l'article"}
  }
 
  revalidatePath('/dashboard/articles')
  return {success: true, message: "Article créer avec succès"}
}

export async function editArticle(id: string, formData: FormData){

    const title = formData.get("title") as string
    const contentRaw = formData.get("content") as string
    const content = JSON.parse(contentRaw)
    const slug = formData.get("slug") as string
    const excerpt = formData.get("excerpt") as string
    const session = await auth()
    if(!session?.user?.id) {
        return { success: false, message: "Non authentifié" }
    }
    const existingArticle = await prisma.article.findUnique({where: {id}})
    if(!existingArticle || existingArticle.authorId !== session.user.id) {
        return {success: false, message:"Non autorisé"}
    }

    try {
        await prisma.article.update({
            where: { id },
            data: {title, content, slug, excerpt}
        })
        revalidatePath("/dashboard/articles")
        return {success: true, message:"Modification de l'article effectué avec succès"}
    } 
    catch (error) {
    console.error(error)
    return {success: false, message:"Echec lors de l'édition d'un article"}
    }
}

export async function deleteArticle(id:string){

    const session = await auth()
    if(!session?.user.id) {
          return { success: false, message: "Non authentifié" }
    }

     const article = await prisma.article.findUnique({ where: { id } })
    if (!article || article.authorId !== session.user.id) {
      return { success: false, message: "Non autorisé" }
    }

    try {
        await prisma.article.delete({
            where: {id}
        })
        revalidatePath("/dashboard/articles")
        return {success: true, message:"Supresssion de l'article effectué avec succès"}
    } catch (error) {
        console.error(error)
        return {success: false, message:"Echec lors de la suppression de l'article"}
    }
}

export async function getArticles() {

    try {
        const articles = await prisma.article.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return articles
    } catch (error) {
        return {success: false, message:"Echec lors de la récupération des articles"}
    }
}

export async function getArticle(id: string) {
    try {
        const article = await prisma.article.findUnique({
            where: {id}
        })
        return article

    } catch (error) {
        console.error(error)
        return {success:false, message:"Echec lors de la récupération de l'article"}
    }
}
