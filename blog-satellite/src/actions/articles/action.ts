"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { createArticleSchema } from "@/lib/schemas/article";

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

function extractFirstImage(content: any) {
    if (!content) return null
    if (content.type === 'imageResize' && content.attrs?.src) {
        return content.attrs.src
    }

    if (content.content && Array.isArray(content.content)) {
        for (const node of content.content) {
            const found = extractFirstImage(node)
            if (found) return found
        }
    }
    return null
}


export async function createArticle(prevState: ArticleAction | null, formData: FormData): Promise<ArticleAction> {

    const rawData = {
        title: formData.get('title') as string,
        content: formData.get('content') as string,
        excerpt: formData.get('excerpt'),
        image: formData.get("image") as string | null,
        authorIdFromForm: formData.get("authorId") as string | null,
        metaDescription: formData.get("metadescription") as string
    }
    const result = createArticleSchema.safeParse(rawData)
    if (!result.success) {
        const firstError = result.error.issues[0]?.message
        return { success: false, message: firstError || "Donnés invalides" }
    }
    const { title, content, excerpt, metaDescription, image, authorIdFromForm } = result.data
    const slug = slugify(title)
    const coverImage = image || extractFirstImage(JSON.parse(content))
    const session = await auth()
    if (!session?.user?.id) {
        return ({ success: false, message: "Aucun utilisateur authentifié" })
    }
    const authorId = authorIdFromForm || session?.user.id

    if (!title || !content) {
        return { success: false, message: "Titre et contenu requis" }
    }

    try {
        const article = await prisma.article.create({
            data: {
                title,
                content,
                slug,
                image: coverImage,
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
        return { success: false, message: "Echec lors de la création de l'article" }
    }

    revalidatePath('/dashboard/articles')
    return { success: true, message: "Article créer avec succès" }
}

export async function editArticle(id: string, prevState: any, formData: FormData) {

    const title = formData.get("title") as string
    const contentRaw = formData.get("content") as string
    const content = JSON.parse(contentRaw)
    const metaDescription = formData.get("metadescription") as string
    const slug = slugify(title)
    const excerpt = formData.get("excerpt") as string
    const image = formData.get("image") as string | null
    const coverImage = image || extractFirstImage(content)

    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "Non authentifié" }
    }
    const existingArticle = await prisma.article.findUnique({ where: { id } })
    if (!existingArticle || existingArticle.authorId !== session.user.id) {
        return { success: false, message: "Non autorisé" }
    }

    try {
        await prisma.article.update({
            where: { id },
            data: { title, content, metaDescription, slug, excerpt, image: coverImage }
        })
        revalidatePath("/dashboard/articles")
        return { success: true, message: "Modification de l'article effectué avec succès" }
    }
    catch (error) {
        console.error(error)
        return { success: false, message: "Echec lors de l'édition d'un article" }
    }
}

export async function deleteArticle(id: string) {

    const session = await auth()
    if (!session?.user.id) {
        return { success: false, message: "Non authentifié" }
    }

    const article = await prisma.article.findUnique({ where: { id } })
    if (!article || article.authorId !== session.user.id) {
        return { success: false, message: "Non autorisé" }
    }

    try {
        await prisma.article.delete({
            where: { id }
        })
        revalidatePath("/dashboard/articles")
        return { success: true, message: "Supresssion de l'article effectué avec succès" }
    } catch (error) {
        console.error(error)
        return { success: false, message: "Echec lors de la suppression de l'article" }
    }
}

export async function getArticles() {

    try {
        const articles = await prisma.article.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return articles
    } catch (error) {
        return { success: false, message: "Echec lors de la récupération des articles" }
    }
}

export async function getArticle(id: string) {
    try {
        const article = await prisma.article.findUnique({
            where: { id }
        })
        return article

    } catch (error) {
        console.error(error)
        return { success: false, message: "Echec lors de la récupération de l'article" }
    }
}

export async function getMyArticles() {

    const session = await auth()
    if (!session) {
        return { success: false, message: "Aucune session actives" }
    }
    try {
        const articles = await prisma.article.findMany({
            where: { authorId: session.user.id },
            orderBy: { createdAt: 'desc' }
        })
        const articlesWithCover = articles.map((article) => ({
            ...article,
            coverImage: extractFirstImage(article.content)
        }))
        return articlesWithCover

    } catch (error) {
        console.error(error)
        return { success: false, message: "Echec lors de la récupération de l'article" }
    }
}

export async function saveDraft(id: string | null, data: { title, content, excerpt, image, authorIdFromForm, metaDescription }) {


    const slug = slugify(data.title)
    const coverImage = data.image || extractFirstImage(JSON.parse(data.content))
    const session = await auth()
    if (!session?.user?.id) {
        return ({ success: false, message: "Aucun utilisateur authentifié" })
    }
    const authorId = data.authorIdFromForm || session?.user.id

    if (id === null) {
        try {
            const article = await prisma.article.create({
                data: {
                    title: data.title,
                    content: data.content,
                    slug,
                    image: coverImage,
                    excerpt: data.excerpt,
                    metaDescription: data.metaDescription,
                    authorId,
                    status: 'DRAFT'
                }
            })
            return { success: true, id: article.id }
        } catch (error) {
            console.error(error)
            if ((error as any).code === 'P2002') {
                return { success: false, message: "Un article avec ce titre existe déjà" }
            }
            return { success: false, message: "Echec lors de la création de l'article" }
        }
    } else  {

            try {
                const updatedArticle = await prisma.article.update({
                    where: { id },
                    data: { title: data.title, content: data.content, excerpt: data.excerpt, image: coverImage, authorId: authorId, metaDescription: data.metaDescription }
                })
                revalidatePath("/dashboard/articles")
                return { success: true, message: "Modification de l'article effectué avec succès" }
            } catch (error) {
                return { success: false, message: "Echec lors de l'édition d'un article" }
            }
        }
    }
