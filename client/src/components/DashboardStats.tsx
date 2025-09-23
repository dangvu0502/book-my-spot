import { Calendar, Clock, TrendingUp, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useMetrics } from "@/hooks/useAppointments";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardStats() {
  const { data, isLoading } = useMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metrics = data?.metrics;
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today's Appointments</p>
              <p className="text-2xl font-bold text-foreground" data-testid="text-today-appointments">
                {metrics.todayAppointments}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
          </div>
          <p className="text-sm text-success mt-2">
            <TrendingUp className="h-4 w-4 inline mr-1" />
            Active bookings
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Available Slots</p>
              <p className="text-2xl font-bold text-foreground" data-testid="text-available-slots">
                {metrics.availableSlots}
              </p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-success" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Out of {metrics.totalSlots} total slots
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold text-foreground" data-testid="text-weekly-appointments">
                {metrics.weeklyAppointments}
              </p>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-warning" />
            </div>
          </div>
          <p className="text-sm text-success mt-2">
            <TrendingUp className="h-4 w-4 inline mr-1" />
            Weekly total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Cancellations</p>
              <p className="text-2xl font-bold text-foreground" data-testid="text-cancellations">
                {metrics.cancellations}
              </p>
            </div>
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {metrics.cancellationRate}% cancellation rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
