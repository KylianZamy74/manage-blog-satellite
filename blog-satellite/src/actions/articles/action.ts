"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import slugify from "@/lib/slugify";
import { extractFirstImage } from "@/lib/extract-image";

function canEditArticle(article: { authorId: string, status: string }, userId: string, userRole: string): boolean {
    const isOwner = article.authorId === userId
    const isAdminWithDraft = userRole === 'ADMIN' && article.status === 'DRAFT'
    return isOwner || isAdminWithDraft
}

export async function editArticle(id: string, prevState: any, formData: FormData) {

    const title = formData.get("title") as string
    const contentRaw = formData.get("content") as string
    const content = JSON.parse(contentRaw)
    const metaDescription = formData.get("metadescription") as string
    const metaTitle = formData.get("metatitle") as string
    const slug = slugify(title)
    const excerpt = formData.get("excerpt") as string
    const image = formData.get("image") as string | null
    const coverImage = image || extractFirstImage(content)
    const assignedAuthorIdRaw = formData.get("assignedAuthorId") as string | null
    const assignedAuthorId = assignedAuthorIdRaw || null

    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "Non authentifié" }
    }
    const existingArticle = await prisma.article.findUnique({ where: { id } })
    if (!existingArticle) {
        return { success: false, message: "Article non trouvé" }
    }
    if (!canEditArticle(existingArticle, session.user.id, session.user.role)) {
        return { success: false, message: "Non autorisé" }
    }

    // Seul un admin peut assigner un utilisateur
    const updateData: any = { title, content, metaDescription, metaTitle, slug, excerpt, image: coverImage }
    if (session.user.role === 'ADMIN') {
        updateData.assignedAuthorId = assignedAuthorId
    }

    try {
        await prisma.article.update({
            where: { id },
            data: updateData
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
    if (!article) {
        return { success: false, message: "Article non trouvé" }
    }
    if (!canEditArticle(article, session.user.id, session.user.role)) {
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

export async function saveDraft(id: string | null, data: { title: string, content: string, excerpt: string |null, image: string |null, authorIdFromForm: string |null, metaDescription: string |null, metaTitle: string |null }) {


    const slug = slugify(data.title)
    const coverImage = data.image || (data.content ? extractFirstImage(JSON.parse(data.content)) : null) 
    const session = await auth()
    if (!session?.user?.id) {
        return ({ success: false, message: "Aucun utilisateur authentifié" })
    }
    // Le brouillon appartient TOUJOURS à l'admin connecté
    // L'utilisateur assigné est stocké séparément et sera transféré à la publication
    const authorId = session.user.id
    const assignedAuthorId = data.authorIdFromForm || null

    if (id === null) {
        try {
            const article = await prisma.article.create({
                data: {
                    title: data.title,
                    content: JSON.parse(data.content),
                    slug,
                    image: coverImage,
                    excerpt: data.excerpt,
                    metaDescription: data.metaDescription,
                    metaTitle: data.metaTitle,
                    authorId,
                    assignedAuthorId,
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
            const existingArticle = await prisma.article.findUnique({ where: { id } })
            if (!existingArticle) {
                return { success: false, message: "Article non trouvé" }
            }
            if (!canEditArticle(existingArticle, session.user.id, session.user.role)) {
                return { success: false, message: "Non autorisé" }
            }

            try {
                await prisma.article.update({
                    where: { id },
                    data: { title: data.title, content: JSON.parse(data.content), excerpt: data.excerpt, image: coverImage, assignedAuthorId, metaDescription: data.metaDescription }
                })
                revalidatePath("/dashboard/articles")
                return { success: true, message: "Modification de l'article effectué avec succès" }
            } catch (error) {
                return { success: false, message: "Echec lors de l'édition d'un article" }
            }
        }
    }

    export async function publishArticle(id: string) {
            const session = await auth()
            if (!session?.user?.id) {
                return { success: false, message: "Non authentifié" }
            }

            const article = await prisma.article.findUnique({ where: { id } })
            if (!article) {
                return { success: false, message: "Article non trouvé" }
            }
            if (!canEditArticle(article, session.user.id, session.user.role)) {
                return { success: false, message: "Non autorisé" }
            }

            // À la publication, transférer l'ownership à l'utilisateur assigné (si défini)
            const newAuthorId = article.assignedAuthorId || article.authorId

            await prisma.article.update({
                where: { id },
                data: {
                    status: "PUBLISHED",
                    publishedAt: new Date(),
                    authorId: newAuthorId,
                    assignedAuthorId: null
                }
            })
            revalidatePath("/dashboard/articles")
            return { success: true, message: "Article publié !" }
        }
