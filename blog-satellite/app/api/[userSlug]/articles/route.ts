import { NextResponse, NextRequest } from "next/server";
import {prisma} from '@/lib/prisma';

export async function GET(
    req: NextRequest, {params}: {params: Promise<{userSlug: string}>}
) {
    const userSlug = (await params).userSlug
    const locale = req.nextUrl.searchParams.get("locale")?.toUpperCase() || null

    try {
        const user = await prisma.user.findUnique(
        {
            where: {slug: userSlug}
        }
    )

     if(!user) {
        return NextResponse.json({message: "utilisateur non trouvé"}, {status: 404})
     }

     const articles = await prisma.article.findMany({
        where:
        {
            authorId: user.id,
            status: 'PUBLISHED'
        }
     })

     if (locale) {
        const articlesWithTranslations = await Promise.all(
            articles.map(async (article) => {
                const translation = await prisma.articleTranslation.findUnique({
                    where: { articleId_locale: { articleId: article.id, locale } },
                })
                if (translation) {
                    return {
                        ...article,
                        title: translation.title,
                        slug: translation.slug,
                        content: translation.content,
                        excerpt: translation.excerpt ?? article.excerpt,
                        metaTitle: translation.metaTitle ?? article.metaTitle,
                        metaDescription: translation.metaDescription ?? article.metaDescription,
                        locale: translation.locale,
                        translationStatus: translation.status,
                    }
                }
                return { ...article, locale: null, translationStatus: null }
            })
        )
        return NextResponse.json({articles: articlesWithTranslations}, {status: 200})
     }

     return NextResponse.json({articles: articles}, {status: 200})

    } catch (error) {
        console.error(error)
        return NextResponse.json({message: "Erreur serveur"},{status: 500})
    }
}


