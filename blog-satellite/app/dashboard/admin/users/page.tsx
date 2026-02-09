import { getUsers } from "@/actions/users/action"
import Link from "next/link"
import { UserPlus, Mail, Shield, Users } from "lucide-react"
import DeleteUserButton from "@/components/ui/DeleteUserButton"

export default async function UsersPage() {

    const data = await getUsers()

    if (!Array.isArray(data)) {
        return <p>Erreur lors du chargement des utilisateurs</p>
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
                        <p className="text-sm text-gray-500 mt-1">{data.length} membre{data.length > 1 ? "s" : ""} sur la plateforme</p>
                    </div>
                    <Link
                        href="/dashboard/admin/users/new"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    >
                        <UserPlus className="h-4 w-4" />
                        Nouvel utilisateur
                    </Link>
                </div>

                {/* Liste */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    {data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <Users className="h-10 w-10 mb-3" />
                            <p className="text-sm">Aucun utilisateur pour le moment</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {data.map((user) => (
                                <div key={user.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        {/* Avatar initiale */}
                                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
                                            {user.name?.charAt(0).toUpperCase() || "?"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* Badge rôle */}
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                            user.role === "ADMIN"
                                                ? "bg-purple-100 text-purple-700"
                                                : "bg-sky-100 text-sky-700"
                                        }`}>
                                            <Shield className="h-3 w-3" />
                                            {user.role === "ADMIN" ? "Admin" : "Client"}
                                        </span>

                                        <DeleteUserButton userId={user.id} userName={user.name || "cet utilisateur"} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
