import { getUsers } from "@/lib/admin/actions"
import UsersTable from "@/components/admin/UsersTable"

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: { q?: string; page?: string }
}) {
    const page = Number(searchParams.page) || 1
    const query = searchParams.q || ""
    const { users, total, pages } = await getUsers(query, page)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
            </div>

            <UsersTable
                users={users}
                total={total}
                page={page}
                totalPages={pages}
            />
        </div>
    )
}
