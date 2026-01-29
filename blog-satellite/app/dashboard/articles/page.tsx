import { Button } from "@/components/ui/button"
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { getMyArticles} from "@/actions/articles/action"
import Link from "next/link"

export default async function MyArticle() {

    const articles = await getMyArticles()
    
    return (
        <>
            <div className="flex flex-wrap gap-3">
                {articles.map((article) => (
                    <Card className="relative mx-auto w-full max-w-sm pt-0" key={article.id}>
                        <img
                            src={article.image}
                            alt="Event cover"
                            className="relative z-20 aspect-video w-full object-cover  "
                        />
                        <CardHeader>
                            <CardTitle>{article.title}</CardTitle>
                            <CardDescription>
                                {article.excerpt}
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button className="w-full bg-blue-400 cursor-pointer">Prévisualiser</Button>
                        </CardFooter>
                        <CardFooter>
                            <Link href={`/dashboard/articles/${article.id}/edit/`} className="w-full bg-amber-400 cursor-pointer p-2 rounded-lg text-center text-white">Editer l&apos;article</Link>
                        </CardFooter>
                        <CardFooter>
                            <Button className="w-full bg-red-500 cursor-pointer">Supprimer l&apos;article</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </>


    )
}
