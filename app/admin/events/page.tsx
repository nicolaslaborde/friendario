import { getEvents } from "@/lib/admin/actions"
import ResetEventsButton from "@/components/admin/ResetEventsButton"
import EventsTable from "@/components/admin/EventsTable"

export default async function AdminEventsPage({
    searchParams,
}: {
    searchParams: { q?: string; page?: string }
}) {
    const page = Number(searchParams.page) || 1
    const query = searchParams.q || ""
    const { events, total, pages } = await getEvents(query, page)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Événements</h1>
                <ResetEventsButton />
            </div>

            <EventsTable
                events={events}
                total={total}
                page={page}
                totalPages={pages}
            />
        </div>
    )
}
