export const SUPPORTED_LOCALES = [
    { code: "EN", deeplCode: "EN", name: "Anglais", flag: "🇬🇧" },
    { code: "NL", deeplCode: "NL", name: "Néerlandais", flag: "🇳🇱" },
    { code: "DE", deeplCode: "DE", name: "Allemand", flag: "🇩🇪" },
    { code: "ES", deeplCode: "ES", name: "Espagnol", flag: "🇪🇸" },
    { code: "IT", deeplCode: "IT", name: "Italien", flag: "🇮🇹" },
    { code: "PT", deeplCode: "PT-PT", name: "Portugais", flag: "🇵🇹" },
] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]["code"]

export async function translateTexts(
    texts: string[],
    targetLang: string,
    sourceLang: string = "FR"
): Promise<string[]> {
    const apiKey = process.env.DEEPL_API_KEY
    if (!apiKey) {
        throw new Error("DEEPL_API_KEY non configurée")
    }

    const apiUrl = process.env.DEEPL_API_URL || "https://api-free.deepl.com/v2/translate"

    if (texts.length === 0) return []

    // Filtrer les textes vides et garder la correspondance
    const indexMap: number[] = []
    const nonEmptyTexts: string[] = []
    for (let i = 0; i < texts.length; i++) {
        if (texts[i].trim()) {
            indexMap.push(i)
            nonEmptyTexts.push(texts[i])
        }
    }

    if (nonEmptyTexts.length === 0) return texts

    const deeplLocale = SUPPORTED_LOCALES.find(l => l.code === targetLang)?.deeplCode ?? targetLang

    const body = new URLSearchParams()
    for (const text of nonEmptyTexts) {
        body.append("text", text)
    }
    body.append("target_lang", deeplLocale)
    body.append("source_lang", sourceLang)

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Authorization": `DeepL-Auth-Key ${apiKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erreur DeepL (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    const translations: { text: string }[] = data.translations

    // Reconstituer le tableau avec les textes vides préservés
    const result = [...texts]
    for (let i = 0; i < indexMap.length; i++) {
        result[indexMap[i]] = translations[i].text
    }

    return result
}
