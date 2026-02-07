import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testArticleAssignment() {
    console.log('=== Test d\'assignation d\'articles ===\n')

    const users = await prisma.user.findMany({
        include: {
            articles: {
                select: { id: true, title: true, status: true }
            }
        }
    })

    if (users.length === 0) {
        console.log('Aucun utilisateur trouvé. Crée d\'abord des utilisateurs.')
        return
    }

    console.log('Utilisateurs et leurs articles :\n')

    for (const user of users) {
        console.log(`👤 ${user.name || 'Sans nom'} (${user.email})`)
        console.log(`   Role: ${user.role}`)
        console.log(`   ID: ${user.id}`)

        if (user.articles.length === 0) {
            console.log('   📄 Aucun article assigné')
        } else {
            console.log(`   📄 ${user.articles.length} article(s) :`)
            for (const article of user.articles) {
                console.log(`      - "${article.title}" [${article.status}]`)
            }
        }
        console.log('')
    }

    const admins = users.filter(u => u.role === 'ADMIN')
    const clients = users.filter(u => u.role === 'CLIENT')

    console.log('=== Résumé ===')
    console.log(`Admins: ${admins.length}`)
    console.log(`Clients: ${clients.length}`)

    for (const admin of admins) {
        const adminArticleIds = new Set(admin.articles.map(a => a.id))
        for (const client of clients) {
            for (const article of client.articles) {
                if (adminArticleIds.has(article.id)) {
                    console.log(`⚠️  PROBLÈME: L'article "${article.title}" est assigné à la fois à l'admin et au client`)
                }
            }
        }
    }

    console.log('\n✅ Test terminé')
}

testArticleAssignment()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
