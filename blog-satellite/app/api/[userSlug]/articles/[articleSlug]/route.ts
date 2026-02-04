import { NextResponse, NextRequest } from "next/server";
import {prisma} from '@/lib/prisma';

export async function GET(
    req: NextRequest, {params}: {params: Promise<{userSlug: string, articleSlug: string}>}
) {
    const userSlug = (await params).userSlug 
    const articleSlug = (await params).articleSlug

    try {
        const user = await prisma.user.findUnique({
            where: {slug: userSlug}
        })
        if(!user){
            return NextResponse.json({message: "Utilisateur introuvable"}, {status: 404})
        }

        const article = await prisma.article.findFirst({
            where: {
                authorId: user.id,
                slug: articleSlug,
                status: 'PUBLISHED'
            }
        })

        if(!article){
            return NextResponse.json({message: "Article introuvable"}, {status: 404})
        }

        return NextResponse.json({article}, {status: 200})
    } catch (error) {
        console.error(error)
        return NextResponse.json({message: "Erreur serveur"}, {status: 500})
    }
}