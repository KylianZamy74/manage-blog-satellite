import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function GuidePage() {
    return (
        <div className="p-8">
            <div className="max-w-3xl mx-auto">

                {/* Retour */}
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour au dashboard
                </Link>

                {/* Titre */}
                <div className="mb-10">
                    <h1 className="text-2xl font-bold text-gray-900">
                        📝 Guide de rédaction d&apos;article
                    </h1>
                    <p className="text-sm text-gray-500 mt-2">
                        Tout ce qu&apos;il faut savoir pour écrire un article optimisé qui se positionne sur Google.
                        Pas besoin d&apos;être expert SEO, suivez le guide !
                    </p>
                </div>

                {/* Contenu */}
                <article className="space-y-12">

                    {/* ========== SECTION 1 : TITRE ========== */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            🏷️ Le titre de votre article
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            Le titre que vous saisissez dans le gestionnaire est <strong>très important</strong> car il remplit 2 rôles :
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="rounded-xl bg-sky-50 border border-sky-200/60 p-5">
                                <p className="font-medium text-sky-800 mb-1">🔤 C&apos;est votre H1</p>
                                <p className="text-sm text-sky-700">
                                    Le titre principal de la page, celui que Google regarde en premier pour comprendre votre sujet.
                                </p>
                            </div>
                            <div className="rounded-xl bg-violet-50 border border-violet-200/60 p-5">
                                <p className="font-medium text-violet-800 mb-1">🔗 C&apos;est votre URL (slug)</p>
                                <p className="text-sm text-violet-700">
                                    Il génère automatiquement l&apos;adresse de la page. Un titre trop long = une URL illisible.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl bg-gray-50 border border-gray-200 p-5 space-y-3">
                            <p className="font-medium text-gray-800">💡 La règle d&apos;or : 8 à 12 mots maximum</p>
                            <p className="text-sm text-gray-600">
                                Assez long pour cibler un mot-clé précis, assez court pour un slug propre.
                            </p>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                    <span className="shrink-0 mt-0.5 text-green-600">✅</span>
                                    <div>
                                        <code className="bg-green-50 text-green-800 px-2 py-0.5 rounded text-xs">Gestion locative Calais : loyer garanti sans commission</code>
                                        <p className="text-gray-500 mt-0.5">→ slug : <code className="text-xs">gestion-locative-calais-loyer-garanti-sans-commission</code></p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="shrink-0 mt-0.5 text-red-500">❌</span>
                                    <div>
                                        <code className="bg-red-50 text-red-800 px-2 py-0.5 rounded text-xs">Conciergerie Airbnb à Biarritz : comment maximiser vos revenus locatifs sans y passer vos soirées</code>
                                        <p className="text-gray-500 mt-0.5">→ slug beaucoup trop long, Google coupe après ~60 caractères</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <hr className="border-gray-200" />

                    {/* ========== SECTION 2 : HIÉRARCHIE ========== */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            📐 La hiérarchie des titres
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            Google lit votre article comme un <strong>plan structuré</strong>. Chaque niveau de titre a un rôle précis.
                            Pensez-y comme un livre avec ses chapitres et sous-chapitres.
                        </p>

                        <div className="rounded-xl border border-gray-200 overflow-hidden">
                            <div className="bg-sky-50 border-b border-sky-200/60 px-5 py-3">
                                <p className="font-semibold text-sky-800">H1 — Titre de l&apos;article</p>
                                <p className="text-xs text-sky-600 mt-0.5">⚡ Généré automatiquement depuis votre titre. Vous n&apos;avez rien à faire.</p>
                            </div>
                            <div className="px-5 py-3 space-y-2.5">
                                <div className="flex items-start gap-3">
                                    <span className="shrink-0 w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">H2</span>
                                    <div>
                                        <p className="font-medium text-gray-800 text-sm">Sections principales</p>
                                        <p className="text-xs text-gray-500">Les grands chapitres de votre article. Intégrez-y un mot-clé quand c&apos;est naturel.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 pl-8">
                                    <span className="shrink-0 w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold">H3</span>
                                    <div>
                                        <p className="font-medium text-gray-800 text-sm">Sous-sections</p>
                                        <p className="text-xs text-gray-500">Pour détailler un H2 : listes d&apos;avantages, étapes, questions FAQ...</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-amber-50 border border-amber-200/60 p-5">
                            <p className="font-medium text-amber-800">⚠️ Règle importante</p>
                            <p className="text-sm text-amber-700 mt-1">
                                Votre contenu commence directement par un <strong>paragraphe d&apos;introduction</strong> puis des <strong>H2</strong>.
                                Ne réécrivez jamais le H1 dans le corps de l&apos;article, il est déjà affiché automatiquement !
                            </p>
                        </div>
                    </section>

                    <hr className="border-gray-200" />

                    {/* ========== SECTION 3 : META TITLE ========== */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            🔍 Le Meta Title
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            C&apos;est le titre qui apparaît <strong>dans les résultats Google</strong> (le lien bleu cliquable).
                            Ce n&apos;est pas le titre de votre article, c&apos;est sa &quot;vitrine&quot; sur Google.
                        </p>

                        {/* Faux résultat Google */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-1">
                            <p className="text-xs text-green-700">blog.example.com &gt; conciergerie-airbnb-biarritz</p>
                            <p className="text-blue-700 text-base font-medium hover:underline cursor-default">
                                Conciergerie Airbnb Biarritz | Conciergerie du Littoral
                            </p>
                            <p className="text-sm text-gray-600">
                                Confiez votre location courte durée à Biarritz à des experts. Gestion complète, voyageurs triés, revenus optimisés...
                            </p>
                        </div>

                        <div className="rounded-xl bg-gray-50 border border-gray-200 p-5 space-y-2">
                            <p className="font-medium text-gray-800">📏 Maximum 60 caractères</p>
                            <p className="text-sm text-gray-600">
                                Au-delà, Google coupe votre titre avec des &quot;...&quot; et c&apos;est moins attractif.
                                Comptez vos caractères !
                            </p>
                            <div className="space-y-1.5 text-sm mt-3">
                                <div className="flex items-start gap-2">
                                    <span className="shrink-0 text-green-600">✅</span>
                                    <span><code className="bg-green-50 text-green-800 px-2 py-0.5 rounded text-xs">Conciergerie Airbnb Biarritz | Conciergerie du Littoral</code> <span className="text-gray-400">(54 car.)</span></span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="shrink-0 text-red-500">❌</span>
                                    <span><code className="bg-red-50 text-red-800 px-2 py-0.5 rounded text-xs">Conciergerie Airbnb à Biarritz pour la gestion de votre location courte durée sur la côte basque</code> <span className="text-gray-400">(91 car. 💀)</span></span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-sky-50 border border-sky-200/60 p-5">
                            <p className="font-medium text-sky-800">🎯 Astuce</p>
                            <p className="text-sm text-sky-700 mt-1">
                                Mettez votre <strong>mot-clé principal en premier</strong>, puis le nom de la marque ou la ville.
                                Google accorde plus d&apos;importance aux premiers mots.
                            </p>
                        </div>
                    </section>

                    <hr className="border-gray-200" />

                    {/* ========== SECTION 4 : META DESCRIPTION ========== */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            📋 La Meta Description
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            C&apos;est le petit texte gris sous le lien bleu dans Google (visible dans l&apos;aperçu ci-dessus).
                            Il ne change pas votre classement directement, mais il influence le <strong>taux de clic</strong>.
                        </p>

                        <div className="rounded-xl bg-gray-50 border border-gray-200 p-5 space-y-2">
                            <p className="font-medium text-gray-800">📏 Maximum 155 caractères</p>
                            <p className="text-sm text-gray-600">
                                Sinon Google coupe avec &quot;...&quot; en plein milieu de votre phrase.
                            </p>
                            <div className="space-y-1.5 text-sm mt-3">
                                <div className="flex items-start gap-2">
                                    <span className="shrink-0 text-green-600">✅</span>
                                    <span className="text-gray-700">Confiez votre location courte durée à Biarritz à des experts. Gestion complète, voyageurs triés, revenus optimisés.</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="shrink-0 text-red-500">❌</span>
                                    <span className="text-gray-700">Nous sommes une conciergerie basée à Biarritz qui propose des services de gestion locative pour les propriétaires qui souhaitent mettre leur bien en location courte durée sur Airbnb et Booking...</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-sky-50 border border-sky-200/60 p-5">
                            <p className="font-medium text-sky-800">🎯 Astuce</p>
                            <p className="text-sm text-sky-700 mt-1">
                                Écrivez une phrase qui donne <strong>envie de cliquer</strong> : un bénéfice concret + un appel à l&apos;action.
                                Pensez &quot;accroche publicitaire&quot;, pas &quot;résumé Wikipedia&quot;.
                            </p>
                        </div>
                    </section>

                    <hr className="border-gray-200" />

                    {/* ========== SECTION 5 : COURTE DESCRIPTION ========== */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            💬 La courte description
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            C&apos;est le texte affiché sur la <strong>carte de votre article</strong> dans le catalogue du blog.
                            C&apos;est ce que les visiteurs voient avant de décider de cliquer.
                        </p>

                        <div className="rounded-xl bg-gray-50 border border-gray-200 p-5 space-y-2">
                            <p className="font-medium text-gray-800">📏 Maximum 2 lignes (~150 caractères)</p>
                            <p className="text-sm text-gray-600">
                                Si c&apos;est trop long, le texte dépasse de la carte et c&apos;est pas joli.
                                Soyez concis et accrocheur.
                            </p>
                            <div className="flex items-start gap-2 text-sm mt-3">
                                <span className="shrink-0 text-green-600">✅</span>
                                <span className="text-gray-700">Propriétaire à Biarritz ? Découvrez pourquoi déléguer votre location courte durée à une conciergerie locale change tout.</span>
                            </div>
                        </div>
                    </section>

                    <hr className="border-gray-200" />

                    {/* ========== SECTION 6 : STRUCTURE ARTICLE ========== */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            📄 La structure de votre article
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            Un article bien structuré, c&apos;est plus agréable à lire pour vos visiteurs ET mieux compris par Google.
                            Voici le squelette type :
                        </p>

                        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden text-sm">
                            <div className="divide-y divide-gray-100">
                                <div className="px-5 py-3 flex items-center gap-3 bg-sky-50">
                                    <span className="shrink-0 w-6 h-6 rounded bg-sky-200 text-sky-800 flex items-center justify-center text-xs font-bold">H1</span>
                                    <span className="text-gray-800">Titre de l&apos;article <span className="text-gray-400">(automatique)</span></span>
                                </div>
                                <div className="px-5 py-3 flex items-center gap-3">
                                    <span className="shrink-0 w-6 h-6 rounded bg-gray-200 text-gray-600 flex items-center justify-center text-xs">¶</span>
                                    <span className="text-gray-600">Paragraphe d&apos;introduction (2-3 phrases d&apos;accroche)</span>
                                </div>
                                <div className="px-5 py-3 flex items-center gap-3 bg-green-50">
                                    <span className="shrink-0 w-6 h-6 rounded bg-green-200 text-green-800 flex items-center justify-center text-xs">🔘</span>
                                    <span className="text-green-800 font-medium">CTA #1 — Attraper les lecteurs pressés</span>
                                </div>
                                <div className="px-5 py-3 flex items-center gap-3">
                                    <span className="shrink-0 w-6 h-6 rounded bg-indigo-200 text-indigo-800 flex items-center justify-center text-xs font-bold">H2</span>
                                    <span className="text-gray-800">Sections principales (3 à 5 sections)</span>
                                </div>
                                <div className="px-5 py-3 flex items-center gap-3 pl-10">
                                    <span className="shrink-0 w-6 h-6 rounded bg-violet-200 text-violet-800 flex items-center justify-center text-xs font-bold">H3</span>
                                    <span className="text-gray-600">Sous-sections pour détailler chaque H2</span>
                                </div>
                                <div className="px-5 py-3 flex items-center gap-3 bg-green-50">
                                    <span className="shrink-0 w-6 h-6 rounded bg-green-200 text-green-800 flex items-center justify-center text-xs">🔘</span>
                                    <span className="text-green-800 font-medium">CTA #2 — Après la démonstration de valeur</span>
                                </div>
                                <div className="px-5 py-3 flex items-center gap-3">
                                    <span className="shrink-0 w-6 h-6 rounded bg-indigo-200 text-indigo-800 flex items-center justify-center text-xs font-bold">H2</span>
                                    <span className="text-gray-800">Suite des sections...</span>
                                </div>
                                <div className="px-5 py-3 flex items-center gap-3">
                                    <span className="shrink-0 w-6 h-6 rounded bg-indigo-200 text-indigo-800 flex items-center justify-center text-xs font-bold">H2</span>
                                    <span className="text-gray-800">FAQ (4 à 6 questions)</span>
                                </div>
                                <div className="px-5 py-3 flex items-center gap-3 bg-green-50">
                                    <span className="shrink-0 w-6 h-6 rounded bg-green-200 text-green-800 flex items-center justify-center text-xs">🔘</span>
                                    <span className="text-green-800 font-medium">CTA #3 — Convertir les lecteurs convaincus</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-gray-50 border border-gray-200 p-5">
                            <p className="font-medium text-gray-800">📊 Volume recommandé : 2000 à 2250 mots</p>
                            <p className="text-sm text-gray-600 mt-1">
                                C&apos;est le sweet spot pour Google : assez long pour montrer votre expertise, assez court pour ne pas perdre le lecteur.
                                En dessous de 1500 mots, Google considère souvent le contenu comme &quot;léger&quot;.
                            </p>
                        </div>
                    </section>

                    <hr className="border-gray-200" />

                    {/* ========== SECTION 7 : CTA ========== */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            🎯 Les appels à l&apos;action (CTA)
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            Chaque article doit contenir <strong>3 boutons CTA</strong> qui renvoient vers votre <strong>site principal</strong> (votre domaine, pas le blog).
                            Le but : transformer le lecteur en client.
                        </p>

                        <div className="rounded-xl bg-amber-50 border border-amber-200/60 p-5">
                            <p className="font-medium text-amber-800">⚠️ Toujours vers le domaine principal</p>
                            <p className="text-sm text-amber-700 mt-1">
                                Les CTA pointent vers votre site vitrine (ex: <code className="text-xs bg-amber-100 px-1 rounded">https://votre-site.com</code>), jamais vers une autre page du blog ou un lien externe.
                            </p>
                        </div>

                        <div className="rounded-xl bg-gray-50 border border-gray-200 p-5 space-y-3">
                            <p className="font-medium text-gray-800">Exemples de bons CTA :</p>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                    <span className="shrink-0 text-green-600">✅</span>
                                    <span className="text-gray-700">&quot;Demandez votre estimation gratuite de loyer garanti&quot;</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="shrink-0 text-green-600">✅</span>
                                    <span className="text-gray-700">&quot;Découvrez combien votre bien peut vous rapporter&quot;</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="shrink-0 text-red-500">❌</span>
                                    <span className="text-gray-700">&quot;Cliquez ici&quot; (trop vague, aucune valeur)</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="shrink-0 text-red-500">❌</span>
                                    <span className="text-gray-700">&quot;En savoir plus&quot; (pas assez incitatif)</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <hr className="border-gray-200" />

                    {/* ========== SECTION 8 : IMAGES ========== */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            🖼️ Les images
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            Les images rendent votre article plus attractif et aident au référencement.
                            Mais attention, chaque image doit avoir un <strong>texte alternatif</strong> (alt text).
                        </p>

                        <div className="rounded-xl bg-red-50 border border-red-200/60 p-5">
                            <p className="font-medium text-red-800">🚨 Toujours importer depuis votre ordinateur</p>
                            <p className="text-sm text-red-700 mt-1">
                                Utilisez <strong>uniquement le bouton d&apos;import</strong> (icône image dans la barre d&apos;outils) pour ajouter vos images.
                                Ne faites <strong>jamais de copier-coller</strong> d&apos;image directement dans l&apos;éditeur.
                                Le copier-coller peut provoquer des erreurs d&apos;affichage car l&apos;image n&apos;est pas hébergée correctement.
                            </p>
                        </div>

                        <div className="rounded-xl bg-gray-50 border border-gray-200 p-5">
                            <p className="font-medium text-gray-800 mb-2">📊 Quantité : maximum 3 images</p>
                            <p className="text-sm text-gray-600">Minimum recommandé : 2 (une cover + une illustration).</p>
                        </div>

                        {/* Emplacements détaillés */}
                        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden text-sm">
                            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                                <p className="font-medium text-gray-800">📍 Où placer chaque image ?</p>
                            </div>
                            <div className="divide-y divide-gray-100">
                                <div className="px-5 py-4 flex items-start gap-4">
                                    <span className="shrink-0 w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">1</span>
                                    <div>
                                        <p className="font-medium text-gray-800">Image cover</p>
                                        <p className="text-gray-500 mt-0.5">Juste après le paragraphe d&apos;introduction, en haut de l&apos;article.</p>
                                        <p className="text-gray-500 mt-1">🔍 <strong>Suggestion de recherche Unsplash</strong> : une vue d&apos;ensemble en rapport avec votre sujet ou votre ville.</p>
                                        <p className="text-xs text-gray-400 mt-1">Ex : <code className="bg-gray-100 px-1.5 py-0.5 rounded">Biarritz aerial view coastline ocean</code></p>
                                    </div>
                                </div>
                                <div className="px-5 py-4 flex items-start gap-4">
                                    <span className="shrink-0 w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold">2</span>
                                    <div>
                                        <p className="font-medium text-gray-800">Image milieu <span className="text-gray-400 font-normal">(optionnelle)</span></p>
                                        <p className="text-gray-500 mt-0.5">Pour illustrer un comparatif, un schéma, ou une section clé de l&apos;article.</p>
                                        <p className="text-gray-500 mt-1">🔍 <strong>Suggestion de recherche Unsplash</strong> : un visuel qui illustre le coeur de votre sujet.</p>
                                        <p className="text-xs text-gray-400 mt-1">Ex : <code className="bg-gray-100 px-1.5 py-0.5 rounded">luxury apartment interior living room bright</code></p>
                                    </div>
                                </div>
                                <div className="px-5 py-4 flex items-start gap-4">
                                    <span className="shrink-0 w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">3</span>
                                    <div>
                                        <p className="font-medium text-gray-800">Image basse <span className="text-gray-400 font-normal">(optionnelle)</span></p>
                                        <p className="text-gray-500 mt-0.5">Avant le dernier CTA, pour relancer l&apos;attention du lecteur.</p>
                                        <p className="text-gray-500 mt-1">🔍 <strong>Suggestion de recherche Unsplash</strong> : une ambiance locale ou un visuel aspirationnel.</p>
                                        <p className="text-xs text-gray-400 mt-1">Ex : <code className="bg-gray-100 px-1.5 py-0.5 rounded">French basque country village sunset</code></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-sky-50 border border-sky-200/60 p-5">
                            <p className="font-medium text-sky-800">💡 Astuce pour trouver vos images</p>
                            <p className="text-sm text-sky-700 mt-1">
                                Allez sur <strong>Unsplash</strong> ou <strong>Pexels</strong> (images gratuites et libres de droits).
                                Cherchez en <strong>anglais</strong> pour avoir plus de résultats.
                                Téléchargez l&apos;image sur votre ordinateur, puis importez-la via le bouton image de l&apos;éditeur.
                            </p>
                        </div>

                        {/* Alt text */}
                        <div className="rounded-xl bg-gray-50 border border-gray-200 p-5 space-y-3">
                            <p className="font-medium text-gray-800">🏷️ Le texte alternatif (alt text)</p>
                            <p className="text-sm text-gray-600">
                                Quand vous importez une image, l&apos;éditeur vous demande un <strong>texte alternatif</strong>.
                                C&apos;est ce que Google &quot;lit&quot; pour comprendre votre image (et c&apos;est aussi utile pour l&apos;accessibilité).
                            </p>

                            <div className="rounded-lg bg-white border border-gray-200 p-4 space-y-2">
                                <p className="text-sm font-medium text-gray-700">La règle : <strong>décrire ce que montre l&apos;image</strong> en glissant naturellement un mot-clé ou la localisation.</p>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                    <span className="shrink-0 text-green-600">✅</span>
                                    <div>
                                        <code className="bg-green-50 text-green-800 px-2 py-0.5 rounded text-xs">Vue aérienne de la Grande Plage de Biarritz au coucher du soleil</code>
                                        <p className="text-gray-400 text-xs mt-0.5">→ Descriptif + mot-clé &quot;Biarritz&quot; intégré naturellement</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="shrink-0 text-green-600">✅</span>
                                    <div>
                                        <code className="bg-green-50 text-green-800 px-2 py-0.5 rounded text-xs">Salon lumineux d&apos;un appartement en location courte durée</code>
                                        <p className="text-gray-400 text-xs mt-0.5">→ Descriptif + &quot;location courte durée&quot; intégré naturellement</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="shrink-0 text-red-500">❌</span>
                                    <div>
                                        <code className="bg-red-50 text-red-800 px-2 py-0.5 rounded text-xs">image1</code>
                                        <p className="text-gray-400 text-xs mt-0.5">→ Aucune description, Google ne comprend rien</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="shrink-0 text-red-500">❌</span>
                                    <div>
                                        <code className="bg-red-50 text-red-800 px-2 py-0.5 rounded text-xs">conciergerie airbnb biarritz location gestion SEO</code>
                                        <p className="text-gray-400 text-xs mt-0.5">→ Keyword stuffing, Google pénalise ce genre de pratique</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <hr className="border-gray-200" />

                    {/* ========== SECTION 9 : FAQ ========== */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            ❓ La section FAQ
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            Chaque article se termine par une FAQ de <strong>4 à 6 questions</strong>.
                            Ces questions doivent correspondre à ce que les gens tapent vraiment sur Google (&quot;People Also Ask&quot;).
                        </p>

                        <div className="rounded-xl bg-sky-50 border border-sky-200/60 p-5">
                            <p className="font-medium text-sky-800">🎯 Pourquoi c&apos;est important ?</p>
                            <p className="text-sm text-sky-700 mt-1">
                                Google affiche souvent les FAQ directement dans les résultats de recherche (les fameuses questions déroulantes).
                                C&apos;est un boost de visibilité gratuit !
                            </p>
                        </div>

                        <div className="rounded-xl bg-gray-50 border border-gray-200 p-5 space-y-2">
                            <p className="font-medium text-gray-800">Réponses courtes : 3 à 5 lignes max</p>
                            <p className="text-sm text-gray-600">
                                Google veut des réponses directes et concises, pas des pavés.
                                Allez droit au but.
                            </p>
                        </div>
                    </section>

                    <hr className="border-gray-200" />

                    {/* ========== SECTION 10 : PROMPT GEMINI ========== */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            🤖 Prompt type pour Gemini / ChatGPT
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            Vous pouvez utiliser une IA pour vous aider à rédiger. Copiez-collez le prompt ci-dessous en remplaçant les éléments entre crochets par vos informations.
                        </p>

                        <div className="rounded-xl bg-gray-900 text-gray-100 p-6 text-sm leading-relaxed space-y-4 font-mono">
                            <p className="text-green-400 font-semibold">// Copiez ce prompt et collez-le dans Gemini ou ChatGPT :</p>
                            <div className="space-y-3 text-gray-300">
                                <p>Tu es un rédacteur SEO expert. Rédige un article de blog optimisé pour Google en respectant ces règles :</p>
                                <p><strong className="text-white">Sujet :</strong> [Décrivez le sujet de l&apos;article]<br />
                                <strong className="text-white">Mot-clé principal :</strong> [ex: conciergerie Airbnb Biarritz]<br />
                                <strong className="text-white">Ville / zone géographique :</strong> [ex: Biarritz, côte basque]<br />
                                <strong className="text-white">Nom de l&apos;entreprise :</strong> [ex: Conciergerie du Littoral]<br />
                                <strong className="text-white">URL du site principal :</strong> [ex: https://conciergerie-du-littoral.fr]</p>

                                <p><strong className="text-white">Consignes strictes :</strong></p>
                                <p>1. Le titre (H1) doit faire 8 à 12 mots max, optimisé longue traîne, avec le mot-clé principal en premier. Il servira aussi de slug.</p>
                                <p>2. Le contenu commence par un paragraphe d&apos;introduction (pas de H1 dans le corps).</p>
                                <p>3. Utilise des H2 pour les sections principales et des H3 pour les sous-sections. Intègre des mots-clés secondaires dans les H2.</p>
                                <p>4. L&apos;article doit faire entre 2000 et 2250 mots.</p>
                                <p>5. Place 3 CTA (appels à l&apos;action) sous forme de boutons : un après l&apos;intro, un au milieu, un avant la FAQ. Chaque CTA pointe vers l&apos;URL du site principal avec un texte incitatif et varié.</p>
                                <p>6. Place maximum 3 images dans l&apos;article aux emplacements suivants :</p>
                                <p>   - Image cover : juste après le paragraphe d&apos;introduction<br />
                                   - Image milieu (optionnelle) : pour illustrer un comparatif ou une section clé<br />
                                   - Image basse (optionnelle) : avant le dernier CTA</p>
                                <p>   Pour chaque image, fournis :<br />
                                   - Une suggestion de recherche en anglais pour Unsplash/Pexels<br />
                                   - Un texte alternatif (alt text) en français, descriptif et optimisé SEO : décris ce que montre l&apos;image en intégrant naturellement un mot-clé ou la localisation. Pas de keyword stuffing.<br />
                                   - L&apos;emplacement exact dans l&apos;article</p>
                                <p>7. Termine par une FAQ de 4 à 6 questions que les gens tapent vraiment sur Google. Réponses courtes (3-5 lignes).</p>
                                <p>8. N&apos;invente AUCUNE information, AUCUN chiffre, AUCUN témoignage. Les données externes (commissions Airbnb/Booking, stats touristiques, données réglementaires...) doivent être :</p>
                                <p>   - <strong className="text-white">Factuelles</strong> : issues de sources publiques et vérifiables (sites officiels des plateformes, organismes publics, etc.)<br />
                                   - <strong className="text-white">À jour</strong> : une donnée vraie mais obsolète est aussi trompeuse qu&apos;un chiffre inventé. Vérifie que chaque donnée externe correspond aux conditions en vigueur AU MOMENT de la rédaction (ex : les commissions Airbnb changent régulièrement, la réglementation locale évolue)<br />
                                   - <strong className="text-white">Sourcées implicitement</strong> : précise dans le texte d&apos;où vient l&apos;info (ex : &quot;selon le Comité Régional du Tourisme&quot;, &quot;donnée publique Airbnb&quot;)</p>
                                <p>   ⚠️ Exemples interdits : &quot;Un T2 rapporte entre 800 et 1 500 €/mois&quot; (inventé), &quot;commission hôte Airbnb de 3 %&quot; (obsolète depuis fin 2025), faux témoignages ou citations.</p>
                                <p>9. Ton professionnel, accessible, orienté conversion. Pas d&apos;emojis. Pas de tiret long (em dash).</p>
                                <p>10. N&apos;utilise jamais de tiret long &quot;—&quot; ni de tiret moyen &quot;–&quot;. Remplace par une virgule ou un point.</p>

                                <p><strong className="text-white">Fournis aussi :</strong></p>
                                <p>- Un Meta Title (max 60 caractères) avec le mot-clé principal<br />
                                - Une Meta Description (max 155 caractères) incitative<br />
                                - Une courte description (max 150 caractères) pour la carte article du catalogue</p>
                            </div>
                        </div>

                        <div className="rounded-xl bg-green-50 border border-green-200/60 p-5">
                            <p className="font-medium text-green-800">💡 Conseil</p>
                            <p className="text-sm text-green-700 mt-1">
                                Avant de donner ce prompt à l&apos;IA, demandez-lui d&apos;abord d&apos;analyser votre site principal.
                                Donnez-lui l&apos;URL et dites-lui : <em>&quot;Analyse ce site, son ton, ses services, ses arguments de vente. Ensuite je te donnerai un prompt pour rédiger un article.&quot;</em>
                            </p>
                        </div>
                    </section>

                </article>
            </div>
        </div>
    )
}
