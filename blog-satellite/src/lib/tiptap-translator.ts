import { translateTexts } from "@/lib/deepl"

interface TranslatableEntry {
    path: string
    text: string
}

/**
 * Parcours récursif de l'arbre TipTap pour extraire les textes traduisibles.
 * Chaque entrée contient un chemin JSON (ex: "content.0.content.1.text") et le texte.
 */
export function extractTranslatableText(
    node: any,
    currentPath: string = ""
): TranslatableEntry[] {
    const entries: TranslatableEntry[] = []

    if (!node || typeof node !== "object") return entries

    // Noeud texte standard
    if (node.type === "text" && typeof node.text === "string" && node.text.trim()) {
        entries.push({ path: `${currentPath}.text`, text: node.text })
        return entries
    }

    // customImage → traduire alt
    if (node.type === "customImage" && node.attrs?.alt) {
        entries.push({ path: `${currentPath}.attrs.alt`, text: node.attrs.alt })
        return entries
    }

    // ctaButton → traduire text (garder href)
    if (node.type === "ctaButton" && node.attrs?.text) {
        entries.push({ path: `${currentPath}.attrs.text`, text: node.attrs.text })
        return entries
    }

    // imageGallery → traduire chaque image.alt
    if (node.type === "imageGallery" && Array.isArray(node.attrs?.images)) {
        node.attrs.images.forEach((img: any, i: number) => {
            if (img.alt) {
                entries.push({
                    path: `${currentPath}.attrs.images.${i}.alt`,
                    text: img.alt,
                })
            }
        })
        return entries
    }

    // Parcours récursif des enfants
    if (Array.isArray(node.content)) {
        node.content.forEach((child: any, i: number) => {
            entries.push(
                ...extractTranslatableText(child, `${currentPath}.content.${i}`)
            )
        })
    }

    return entries
}

/**
 * Clone le JSON TipTap et réinjecte les textes traduits aux chemins correspondants.
 */
export function applyTranslations(
    node: any,
    translationsMap: Map<string, string>
): any {
    const clone = JSON.parse(JSON.stringify(node))

    for (const [path, translatedText] of translationsMap) {
        setNestedValue(clone, path, translatedText)
    }

    return clone
}

function setNestedValue(obj: any, path: string, value: string): void {
    // Retirer le point initial si présent
    const cleanPath = path.startsWith(".") ? path.slice(1) : path
    const keys = cleanPath.split(".")
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]
        const index = Number(key)
        current = Number.isNaN(index) ? current[key] : current[index]
        if (current === undefined || current === null) return
    }

    const lastKey = keys[keys.length - 1]
    const lastIndex = Number(lastKey)
    if (Number.isNaN(lastIndex)) {
        current[lastKey] = value
    } else {
        current[lastIndex] = value
    }
}

/**
 * Orchestre la traduction complète d'un contenu TipTap :
 * extraction → batch DeepL → réinjection
 */
export async function translateTiptapContent(
    content: any,
    targetLocale: string
): Promise<any> {
    const entries = extractTranslatableText(content)

    if (entries.length === 0) return JSON.parse(JSON.stringify(content))

    const textsToTranslate = entries.map((e) => e.text)
    const translatedTexts = await translateTexts(textsToTranslate, targetLocale)

    const translationsMap = new Map<string, string>()
    entries.forEach((entry, i) => {
        translationsMap.set(entry.path, translatedTexts[i])
    })

    return applyTranslations(content, translationsMap)
}
