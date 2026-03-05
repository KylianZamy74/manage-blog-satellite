"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import slugify from "@/lib/slugify"
import { translateTexts } from "@/lib/deepl"
import { translateTiptapContent } from "@/lib/tiptap-translator"

function canEditArticle(
    article: { authorId: string; status: string },
    userId: string,
    userRole: string
): boolean {
    const isOwner = article.authorId === userId
    const isAdminWithDraft = userRole === "ADMIN" && article.status === "DRAFT"
    return isOwner || isAdminWithDraft
}

export async function translateArticle(
    articleId: string,
    locales: string[]
) {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, message: "Non authentifié" }
    }

    const article = await prisma.article.findUnique({ where: { id: articleId } })
    if (!article) {
        return { success: false, message: "Article non trouvé" }
    }
    if (!canEditArticle(article, session.user.id, session.user.role)) {
        return { success: false, message: "Non autorisé" }
    }

    const results: { locale: string; success: boolean; error?: string }[] = []

    for (const locale of locales) {
        try {
            // Traduire les champs texte en un seul appel batch
            const textsToTranslate = [
                article.title,
                article.excerpt || "",
                article.metaTitle || "",
                article.metaDescription || "",
            ]

            const [translatedTitle, translatedExcerpt, translatedMetaTitle, translatedMetaDescription] =
                await translateTexts(textsToTranslate, locale)

            // Traduire le contenu TipTap
            const translatedContent = await translateTiptapContent(
                article.content,
                locale
            )

            const translatedSlug = slugify(translatedTitle)

            await prisma.articleTranslation.upsert({
                where: {
                    articleId_locale: { articleId, locale },
                },
                create: {
                    articleId,
                    locale,
                    title: translatedTitle,
                    slug: translatedSlug,
                    content: translatedContent,
                    excerpt: article.excerpt ? translatedExcerpt : null,
                    metaTitle: article.metaTitle ? translatedMetaTitle : null,
                    metaDescription: article.metaDescription ? translatedMetaDescription : null,
                    status: "AUTO",
                },
                update: {
                    title: translatedTitle,
                    slug: translatedSlug,
                    content: translatedContent,
                    excerpt: article.excerpt ? translatedExcerpt : null,
                    metaTitle: article.metaTitle ? translatedMetaTitle : null,
                    metaDescription: article.metaDescription ? translatedMetaDescription : null,
                    status: "AUTO",
                },
            })

            results.push({ locale, success: true })
        } catch (error) {
            console.error(`Erreur traduction ${locale}:`, error)
            results.push({
                locale,
                success: false,
                error: error instanceof Error ? error.message : "Erreur inconnue",
            })
        }
    }

    revalidatePath("/dashboard/articles")
    return { success: true, results }
}

export async function getTranslations(articleId: string) {
    const session = await auth()
    if (!session?.user?.id) {
        return []
    }

    return prisma.articleTranslation.findMany({
        where: { articleId },
        orderBy: { locale: "asc" },
    })
}

export async function getTranslation(translationId: string) {
    const session = await auth()
    if (!session?.user?.id) {
        return null
    }

    return prisma.articleTranslation.findUnique({
        where: { id: translationId },
        include: { article: true },
    })
}

export async function updateTranslation(
    translationId: string,
    data: {
        title: string
        content: string
        excerpt?: string | null
        metaTitle?: string | null
        metaDescription?: string | null
    }
) {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, message: "Non authentifié" }
    }

    const translation = await prisma.articleTranslation.findUnique({
        where: { id: translationId },
        include: { article: true },
    })
    if (!translation) {
        return { success: false, message: "Traduction non trouvée" }
    }
    if (!canEditArticle(translation.article, session.user.id, session.user.role)) {
        return { success: false, message: "Non autorisé" }
    }

    try {
        await prisma.articleTranslation.update({
            where: { id: translationId },
            data: {
                title: data.title,
                slug: slugify(data.title),
                content: JSON.parse(data.content),
                excerpt: data.excerpt,
                metaTitle: data.metaTitle,
                metaDescription: data.metaDescription,
                status: "REVIEWED",
            },
        })
        revalidatePath("/dashboard/articles")
        return { success: true, message: "Traduction mise à jour" }
    } catch (error) {
        console.error(error)
        return { success: false, message: "Erreur lors de la mise à jour" }
    }
}

export async function deleteTranslation(translationId: string) {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, message: "Non authentifié" }
    }

    const translation = await prisma.articleTranslation.findUnique({
        where: { id: translationId },
        include: { article: true },
    })
    if (!translation) {
        return { success: false, message: "Traduction non trouvée" }
    }
    if (!canEditArticle(translation.article, session.user.id, session.user.role)) {
        return { success: false, message: "Non autorisé" }
    }

    try {
        await prisma.articleTranslation.delete({
            where: { id: translationId },
        })
        revalidatePath("/dashboard/articles")
        return { success: true, message: "Traduction supprimée" }
    } catch (error) {
        console.error(error)
        return { success: false, message: "Erreur lors de la suppression" }
    }
}

export async function retranslateArticle(
    articleId: string,
    locales: string[]
) {
    // retranslateArticle = même logique que translateArticle avec upsert
    return translateArticle(articleId, locales)
}
