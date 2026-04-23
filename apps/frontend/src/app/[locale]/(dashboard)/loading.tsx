import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
    return (
        <div className="space-y-6 p-4">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Stats cards skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-xl border bg-card">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                ))}
            </div>

            {/* Table skeleton */}
            <div className="rounded-xl border bg-card overflow-hidden">
                <div className="p-4 border-b">
                    <Skeleton className="h-6 w-32" />
                </div>
                <div className="divide-y">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="p-4 flex items-center gap-4">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-20 ml-auto" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
