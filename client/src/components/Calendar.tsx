import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, generateCalendarDays, isDateSelectable, formatDisplayDate } from "@/lib/dateUtils";
import { addMonths, subMonths, format, isSameMonth, isToday } from "date-fns";

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function Calendar({ selectedDate, onDateSelect }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const calendarDays = generateCalendarDays(currentMonth);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(direction === 'prev' ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1));
  };

  const handleDateClick = (date: Date) => {
    if (isDateSelectable(date)) {
      onDateSelect(date);
    }
  };

  const getDateButtonClass = (date: Date) => {
    const baseClass = "w-10 h-10 text-sm rounded-md transition-colors";
    
    if (!isSameMonth(date, currentMonth)) {
      return `${baseClass} text-muted-foreground/50 hover:bg-muted`;
    }
    
    if (!isDateSelectable(date)) {
      return `${baseClass} text-muted-foreground cursor-not-allowed`;
    }
    
    if (formatDate(date) === formatDate(selectedDate)) {
      return `${baseClass} bg-primary text-primary-foreground font-semibold`;
    }
    
    if (isToday(date)) {
      return `${baseClass} bg-accent text-accent-foreground font-medium`;
    }
    
    return `${baseClass} text-foreground hover:bg-muted`;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div>
          <CardTitle className="text-lg">Select Date</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a date to view available time slots
          </p>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('prev')}
            data-testid="button-prev-month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold text-foreground" data-testid="text-current-month">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('next')}
            data-testid="button-next-month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Calendar Grid */}
        <div className="calendar-grid mb-4">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
          
          {/* Calendar Days */}
          {calendarDays.map((date) => (
            <Button
              key={date.toISOString()}
              variant="ghost"
              className={getDateButtonClass(date)}
              onClick={() => handleDateClick(date)}
              disabled={!isDateSelectable(date)}
              data-testid={`button-date-${formatDate(date)}`}
            >
              {format(date, 'd')}
            </Button>
          ))}
        </div>
        
        {/* Legend */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded"></div>
            <span className="text-muted-foreground">Selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded"></div>
            <span className="text-muted-foreground">Available slots</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-destructive rounded"></div>
            <span className="text-muted-foreground">Fully booked</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 space-y-3">
          <h4 className="font-semibold text-foreground">Quick Actions</h4>
          <div className="space-y-2">
            <Button
              className="w-full"
              size="sm"
              data-testid="button-book-next-available"
            >
              ⚡ Book Next Available
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              size="sm"
              data-testid="button-view-bookings"
            >
              🔍 View My Bookings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
