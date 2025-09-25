import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TimeSlotSkeleton() {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <Skeleton className="h-6 w-48 skeleton" />
        <Skeleton className="h-4 w-32 skeleton mt-2" />
      </CardHeader>
      <CardContent>
        <div className="time-grid">
          {[...Array(12)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-16 rounded-lg skeleton"
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}