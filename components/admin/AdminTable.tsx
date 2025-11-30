'use client'

import { useState, useEffect } from "react"
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"


interface Column<T> {
    header: string
    accessorKey?: keyof T
    cell?: (item: T) => React.ReactNode
}

interface AdminTableProps<T> {
    columns: Column<T>[]
    data: T[]
    total: number
    page: number
    totalPages: number
    isLoading?: boolean
}

export default function AdminTable<T extends { id: string }>({
    columns,
    data,
    total,
    page,
    totalPages,
    isLoading = false,
}: AdminTableProps<T>) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [search, setSearch] = useState(searchParams.get("q") || "")

    // Simple debounce implementation
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams)
            if (search) {
                params.set("q", search)
            } else {
                params.delete("q")
            }
            params.set("page", "1") // Reset to page 1 on search
            router.push(`${pathname}?${params.toString()}`)
        }, 500)

        return () => clearTimeout(timer)
    }, [search, router, pathname, searchParams])

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams)
        params.set("page", newPage.toString())
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    />
                </div>
                <div className="text-sm text-gray-500">
                    Total: <span className="font-semibold text-gray-900">{total}</span>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50/50">
                        <tr>
                            {columns.map((col, i) => (
                                <th
                                    key={i}
                                    className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center">
                                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                                    Aucun résultat trouvé
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    {columns.map((col, i) => (
                                        <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {col.cell ? col.cell(item) : (item[col.accessorKey!] as React.ReactNode)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="p-2 text-gray-500 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">
                    Page {page} sur {totalPages || 1}
                </span>
                <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="p-2 text-gray-500 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}
