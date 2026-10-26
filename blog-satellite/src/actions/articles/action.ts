"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import slugify from "@/lib/slugify";
import { extractFirstImage } from "@/lib/extract-image";
import { createArticleSchema } from "@/lib/schemas/article";
import { sanitizeTiptapContent } from "@/lib/sanitize-tiptap-content";

function canEditArticle(article: { authorId: string, status: string }, userId: string, userRole: string): boolean {
    const isOwner = article.authorId === userId
    const isAdminWithDraft = userRole === 'ADMIN' && article.status === 'DRAFT'
    return isOwner || isAdminWithDraft
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

export async function unpublishArticle(id: string) {

    const session = await auth()
    if (!session?.user.id) {
        return { success: false, message: "Non authentifié" }
    }

    const article = await prisma.article.findUnique({ where: { id } })
    if (!article) {
        return { success: false, message: "Article non trouvé" }
    }
    if (article.authorId !== session.user.id && session.user.role !== 'ADMIN') {
        return { success: false, message: "Non autorisé" }
    }
    if (article.status !== 'PUBLISHED') {
        return { success: false, message: "L'article n'est pas publié" }
    }

    try {
        await prisma.article.update({
            where: { id },
            data: { status: 'DRAFT' }
        })
        revalidatePath("/dashboard/articles")
        return { success: true, message: "L'article a été dépublié avec succès" }
    } catch (error) {
        console.error(error)
        return { success: false, message: "Echec lors de la dépublication de l'article" }
    }
}

export async function getArticles() {

    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, message: "Non authentifié" }
    }
    if (session.user.role !== 'ADMIN') {
        return { success: false, message: "Non autorisé" }
    }
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
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, message: "Non authentifié" }
    }
    try {
        const article = await prisma.article.findUnique({
            where: { id }
        })
        if (!article) {
            return { success: false, message: "Article non trouvé" }
        }
        if (!canEditArticle(article, session.user.id, session.user.role)) {
            return { success: false, message: "Non autorisé" }
        }
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

export async function getArticlesByUser(userId: string) {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, message: "Non authentifié" }
    }
    if (session.user.role !== 'ADMIN') {
        return { success: false, message: "Non autorisé" }
    }
    try {
        const articles = await prisma.article.findMany({
            where: { authorId: userId },
            orderBy: { createdAt: 'desc' }
        })
        const articlesWithCover = articles.map((article) => ({
            ...article,
            image: article.image || extractFirstImage(article.content)
        }))
        return articlesWithCover
    } catch (error) {
        console.error(error)
        return { success: false, message: "Echec lors de la récupération des articles" }
    }
}

export async function adminDeleteArticle(id: string) {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, message: "Non authentifié" }
    }
    if (session.user.role !== 'ADMIN') {
        return { success: false, message: "Non autorisé" }
    }
    const article = await prisma.article.findUnique({ where: { id } })
    if (!article) {
        return { success: false, message: "Article non trouvé" }
    }
    try {
        await prisma.article.delete({ where: { id } })
        revalidatePath("/dashboard/admin/users")
        return { success: true, message: "Article supprimé avec succès" }
    } catch (error) {
        console.error(error)
        return { success: false, message: "Echec lors de la suppression de l'article" }
    }
}

export type ArticleInput = { title: string, content: string, excerpt: string | null, image: string | null, authorIdFromForm: string | null, metaDescription: string | null, metaTitle: string | null }

// Creates (id === null) or updates an article. Single save path for the editor (autosave and manual save).
export async function saveArticle(id: string | null, data: ArticleInput) {

    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, message: "Non authentifié" }
    }

    const validation = createArticleSchema.safeParse(data)
    if (!validation.success) {
        return { success: false, message: validation.error.issues[0]?.message || "Données invalides" }
    }
    const validated = validation.data

    const content = sanitizeTiptapContent(JSON.parse(validated.content))
    const fields = {
        title: validated.title,
        content,
        slug: slugify(validated.title),
        image: validated.image || extractFirstImage(content),
        excerpt: validated.excerpt,
        metaDescription: validated.metaDescription,
        metaTitle: validated.metaTitle,
    }
    // Only an admin can assign an article; for anyone else the existing assignment is left untouched
    const isAdmin = session.user.role === 'ADMIN'
    const assignment = isAdmin ? { assignedAuthorId: validated.authorIdFromForm || null } : {}

    try {
        if (id === null) {
            const article = await prisma.article.create({
                data: { ...fields, ...assignment, authorId: session.user.id, status: 'DRAFT' }
            })
            revalidatePath("/dashboard/articles")
            return { success: true, id: article.id }
        }

        const existingArticle = await prisma.article.findUnique({ where: { id } })
        if (!existingArticle) {
            return { success: false, message: "Article non trouvé" }
        }
        if (!canEditArticle(existingArticle, session.user.id, session.user.role)) {
            return { success: false, message: "Non autorisé" }
        }
        await prisma.article.update({ where: { id }, data: { ...fields, ...assignment } })
        revalidatePath("/dashboard/articles")
        return { success: true, id }
    } catch (error) {
        console.error(error)
        if ((error as { code?: string }).code === 'P2002') {
            return { success: false, message: "Un article avec ce titre existe déjà" }
        }
        return { success: false, message: "Échec de l'enregistrement de l'article" }
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
