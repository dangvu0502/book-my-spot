import { Header } from "@/components/Header";
import { ModalProvider } from "@/components/Modal";
import { TimeSelector } from "@/components/TimeSelector";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { addDays, startOfToday } from "date-fns";
import { useState } from "react";

export default function AppointmentBooking() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [month, setMonth] = useState(new Date());
  const today = startOfToday();


  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="lg:w-auto flex flex-col gap-4 items-center lg:items-start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  setMonth(date);
                }
              }}
              disabled={(date) => date < today}
              month={month}
              onMonthChange={setMonth}
              className="border rounded-lg"
            />

            <div className="flex flex-col gap-2 w-full max-w-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedDate(today);
                  setMonth(today);
                }}
                className="w-full"
              >
                Today
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const prevDay = addDays(selectedDate, -1);
                    setSelectedDate(prevDay);
                    setMonth(prevDay);
                  }}
                  className="w-full"
                  disabled={selectedDate <= today}
                >
                  Previous Day
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const nextDay = addDays(selectedDate, 1);
                    setSelectedDate(nextDay);
                    setMonth(nextDay);
                  }}
                  className="w-full"
                >
                  Next Day
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const preDay = addDays(selectedDate, -7);
                    const prevWeek = preDay < today ? today : preDay;
                    setSelectedDate(prevWeek);
                    setMonth(prevWeek);
                  }}
                  className="w-full"
                >
                  Previous Week
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const nextWeek = addDays(selectedDate, 7);
                    setSelectedDate(nextWeek);
                    setMonth(nextWeek);
                  }}
                  className="w-full"
                >
                  Next Week
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <TimeSelector
              selectedDate={selectedDate}
            />
          </div>
        </div>
      </main>

      <ModalProvider />
    </div>
  );
}
