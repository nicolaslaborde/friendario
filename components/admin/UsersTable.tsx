'use client'

import AdminTable from "@/components/admin/AdminTable"
import { formatDateTime } from "@/lib/utils"
import Image from "next/image"

interface UsersTableProps {
    users: any[]
    total: number
    page: number
    totalPages: number
}

export default function UsersTable({ users, total, page, totalPages }: UsersTableProps) {
    const columns = [
        {
            header: "Utilisateur",
            cell: (user: any) => (
                <div className="flex items-center gap-3">
                    {user.image ? (
                        <Image
                            src={user.image}
                            alt={user.name || ""}
                            width={32}
                            height={32}
                            className="rounded-full"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                </div>
            ),
        },
        {
            header: "Statut",
            cell: (user: any) => (
                <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                >
                    {user.status}
                </span>
            ),
        },
        {
            header: "Statistiques",
            cell: (user: any) => (
                <div className="text-xs text-gray-500">
                    <p>{user._count.createdEvents} événements</p>
                    <p>{user._count.participations} participations</p>
                </div>
            ),
        },
        {
            header: "Inscrit le",
            cell: (user: any) => (
                <span className="text-gray-500">{formatDateTime(user.createdAt)}</span>
            ),
        },
    ]

    return (
        <AdminTable
            columns={columns}
            data={users}
            total={total}
            page={page}
            totalPages={totalPages}
        />
    )
}
