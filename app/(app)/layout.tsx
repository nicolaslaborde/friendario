import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import { Home, Calendar, Plus, Bell, User } from "lucide-react"
import Link from "next/link"

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
            {/* Top Navigation */}
            <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/timeline" className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Friendoria
                            </h1>
                        </Link>

                        <div className="flex items-center gap-4">
                            <Link
                                href="/events/create"
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="hidden sm:inline">Nouvel événement</span>
                            </Link>

                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                                <Bell className="w-6 h-6 text-gray-600" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>

                            <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <User className="w-6 h-6 text-gray-600" />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    )
}
