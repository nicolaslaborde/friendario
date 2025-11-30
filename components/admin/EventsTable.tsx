'use client'

import AdminTable from "@/components/admin/AdminTable"
import { formatDate } from "@/lib/utils"

interface EventsTableProps {
    events: any[]
    total: number
    page: number
    totalPages: number
}

export default function EventsTable({ events, total, page, totalPages }: EventsTableProps) {
    const columns = [
        {
            header: "Événement",
            cell: (event: any) => (
                <div>
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">
                        {event.location || "Lieu non défini"}
                    </p>
                </div>
            ),
        },
        {
            header: "Créateur",
            cell: (event: any) => (
                <div>
                    <p className="text-sm text-gray-900">{event.creator.name}</p>
                    <p className="text-xs text-gray-500">{event.creator.email}</p>
                </div>
            ),
        },
        {
            header: "Date",
            cell: (event: any) => (
                <span className="text-sm text-gray-600">
                    {formatDate(event.startDate)}
                </span>
            ),
        },
        {
            header: "Contenu",
            cell: (event: any) => (
                <div className="flex gap-3 text-xs text-gray-500">
                    <span>👥 {event._count.participants}</span>
                    <span>📸 {event._count.media}</span>
                </div>
            ),
        },
    ]

    return (
        <AdminTable
            columns={columns}
            data={events}
            total={total}
            page={page}
            totalPages={totalPages}
        />
    )
}
