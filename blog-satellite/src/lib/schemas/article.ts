import {z} from "zod"

export const createArticleSchema = z.object({
    title: z.string().min(3, "Le titre contient minimum 3 caractèes"),
    content: z.string().refine(
        (val) => {
            if(!val || val.trim() === '') return false
            try {
                const parsed = JSON.parse(val)
                return true
            } catch (error) {
                return false
            }
        },
        {message: "Le contenue de l'article est requis"}
    ),
    excerpt: z.string().optional(),
    metaDescription: z.string().max(160, "La méta-description contient au maximum 160 carctères").nullish(),
    image: z.string().optional().nullish(),
    authorIdFromForm: z.string().nullish()
})