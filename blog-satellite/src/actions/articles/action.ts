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

export async function editArticle(id: string, prevState: any, formData: FormData) {

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

    const validation = createArticleSchema.safeParse({
        title: formData.get("title"),
        content: formData.get("content"),
        excerpt: formData.get("excerpt"),
        metaDescription: formData.get("metadescription"),
        metaTitle: formData.get("metatitle"),
        image: formData.get("image"),
        authorIdFromForm: formData.get("assignedAuthorId"),
    })
    if (!validation.success) {
        return { success: false, message: validation.error.issues[0]?.message || "Données invalides" }
    }
    const { title, content: contentRaw, excerpt, metaDescription, metaTitle, image, authorIdFromForm } = validation.data

    const content = sanitizeTiptapContent(JSON.parse(contentRaw))
    const slug = slugify(title)
    const coverImage = image || extractFirstImage(content)
    const assignedAuthorId = authorIdFromForm || null

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

export async function saveDraft(id: string | null, data: { title: string, content: string, excerpt: string |null, image: string |null, authorIdFromForm: string |null, metaDescription: string |null, metaTitle: string |null }) {

    const session = await auth()
    if (!session?.user?.id) {
        return ({ success: false, message: "Aucun utilisateur authentifié" })
    }

    const validation = createArticleSchema.safeParse(data)
    if (!validation.success) {
        return { success: false, message: validation.error.issues[0]?.message || "Données invalides" }
    }
    const validated = validation.data

    const content = sanitizeTiptapContent(JSON.parse(validated.content))
    const slug = slugify(validated.title)
    const coverImage = validated.image || extractFirstImage(content)
    const authorId = session.user.id
    const assignedAuthorId = validated.authorIdFromForm || null

    if (id === null) {
        try {
            const article = await prisma.article.create({
                data: {
                    title: validated.title,
                    content,
                    slug,
                    image: coverImage,
                    excerpt: validated.excerpt,
                    metaDescription: validated.metaDescription,
                    metaTitle: validated.metaTitle,
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
                    data: { title: validated.title, content, slug, excerpt: validated.excerpt, image: coverImage, assignedAuthorId, metaDescription: validated.metaDescription, metaTitle: validated.metaTitle }
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
