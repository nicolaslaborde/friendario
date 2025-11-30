import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Users, Calendar, LogOut, Home } from "lucide-react"

const ADMIN_EMAILS = ["nicolas.laborde@example.com"]

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
        redirect("/")
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Friendoria Admin
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-colors"
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Dashboard</span>
                    </Link>
                    <Link
                        href="/admin/users"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-colors"
                    >
                        <Users className="w-5 h-5" />
                        <span>Utilisateurs</span>
                    </Link>
                    <Link
                        href="/admin/events"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-colors"
                    >
                        <Calendar className="w-5 h-5" />
                        <span>Événements</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-200 space-y-2">
                    <Link
                        href="/timeline"
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        <span>Retour au site</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    )
}
