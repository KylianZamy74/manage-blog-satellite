import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { getMyArticles } from "@/actions/articles/action"

export default async function MyArticle() {

    const articles = await getMyArticles()

    return (
        <>
            {articles.map((article) => (

                <Card className="relative mx-auto w-full max-w-sm pt-0" key={article.id}>
                    <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
                    <img
                        src={article.image}
                        alt="Event cover"
                        className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
                    />
                    <CardHeader>
                        <CardTitle>{article.title}</CardTitle>
                        <CardDescription>
                            {article.excerpt}
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button className="w-full bg-blue-400">Prévisualiser</Button>

                    </CardFooter>
                    <CardFooter>
                        <Button className="w-full bg-amber-400">Editer l&apos;article</Button>
                    </CardFooter>
                    <CardFooter><Button className="w-full bg-red-500">Supprimer l&apos;article</Button></CardFooter>

                </Card>
            ))}
        </>


    )
}
