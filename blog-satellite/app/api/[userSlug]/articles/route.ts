import { NextResponse, NextRequest } from "next/server";
import {prisma} from '@/lib/prisma';

export async function GET(
    req: NextRequest, {params}: {params: Promise<{userSlug: string}>}
) {
    const userSlug = (await params).userSlug
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

     return NextResponse.json({articles: articles}, {status: 200})

    } catch (error) {
        console.error(error)
        return NextResponse.json({message: "Erreur serveur"},{status: 500})
    }
}


