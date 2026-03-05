import { NextResponse, NextRequest } from "next/server";
import {prisma} from '@/lib/prisma';

export async function GET(
    req: NextRequest, {params}: {params: Promise<{userSlug: string, articleSlug: string}>}
) {
    const userSlug = (await params).userSlug
    const articleSlug = (await params).articleSlug
    const locale = req.nextUrl.searchParams.get("locale")?.toUpperCase() || null

    try {
        const user = await prisma.user.findUnique({
            where: {slug: userSlug}
        })
        if(!user){
            return NextResponse.json({message: "Utilisateur introuvable"}, {status: 404})
        }

        // Helper : recuperer toutes les traductions dispo pour un article
        async function getAvailableTranslations(articleId: string) {
            const translations = await prisma.articleTranslation.findMany({
                where: { articleId },
                select: { locale: true, slug: true },
                orderBy: { locale: "asc" },
            })
            return translations.map(t => ({ locale: t.locale, slug: t.slug }))
        }

        // Si locale demandée, chercher d'abord par slug traduit
        if (locale) {
            const translation = await prisma.articleTranslation.findFirst({
                where: {
                    locale,
                    slug: articleSlug,
                    article: { authorId: user.id, status: "PUBLISHED" },
                },
                include: { article: true },
            })

            if (translation) {
                const availableTranslations = await getAvailableTranslations(translation.articleId)
                return NextResponse.json({
                    article: {
                        ...translation.article,
                        title: translation.title,
                        slug: translation.slug,
                        content: translation.content,
                        excerpt: translation.excerpt ?? translation.article.excerpt,
                        metaTitle: translation.metaTitle || translation.title,
                        metaDescription: translation.metaDescription || translation.excerpt || translation.article.metaDescription,
                        locale: translation.locale,
                        translationStatus: translation.status,
                        originalSlug: translation.article.slug,
                        availableTranslations,
                    },
                }, {status: 200})
            }
        }

        // Fallback : chercher par slug original
        const article = await prisma.article.findFirst({
            where: {
                authorId: user.id,
                slug: articleSlug,
                status: 'PUBLISHED'
            },
        })

        if(!article){
            return NextResponse.json({message: "Article introuvable"}, {status: 404})
        }

        const availableTranslations = await getAvailableTranslations(article.id)

        // Si locale demandée, chercher la traduction pour cet article
        if (locale) {
            const t = await prisma.articleTranslation.findUnique({
                where: { articleId_locale: { articleId: article.id, locale } },
            })
            if (t) {
                return NextResponse.json({
                    article: {
                        ...article,
                        title: t.title,
                        slug: t.slug,
                        content: t.content,
                        excerpt: t.excerpt ?? article.excerpt,
                        metaTitle: t.metaTitle || t.title,
                        metaDescription: t.metaDescription || t.excerpt || article.metaDescription,
                        locale: t.locale,
                        translationStatus: t.status,
                        originalSlug: article.slug,
                        availableTranslations,
                    },
                }, {status: 200})
            }
        }

        return NextResponse.json({
            article: {
                ...article,
                locale: null,
                translationStatus: null,
                originalSlug: article.slug,
                availableTranslations,
            },
        }, {status: 200})
    } catch (error) {
        console.error(error)
        return NextResponse.json({message: "Erreur serveur"}, {status: 500})
    }
}