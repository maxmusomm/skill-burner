import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4 border-b pb-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="ml-auto flex gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      {/* Message Bubbles Skeleton */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Incoming message */}
        <div className="flex items-start gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-64 rounded-lg" />
          </div>
        </div>
        {/* Outgoing message */}
        <div className="flex justify-end">
          <Skeleton className="h-10 w-56 rounded-lg" />
        </div>
        {/* Incoming message */}
        <div className="flex items-start gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-72 rounded-lg" />
          </div>
        </div>
        {/* Outgoing message */}
        <div className="flex justify-end">
          <Skeleton className="h-10 w-48 rounded-lg" />
        </div>
        {/* Incoming message */}
        <div className="flex items-start gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-60 rounded-lg" />
          </div>
        </div>
      </div>
      {/* Input Area Skeleton */}
      <div className="flex items-center gap-2 border-t pt-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-20 rounded-lg" />
      </div>
    </div>
  );
}
