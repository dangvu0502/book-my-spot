import type { TimeSlot } from "@shared/schema";
import { Moon, Sun } from "lucide-react";
import { TimeSlotButton } from "./TimeSlotButton";

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedDate: Date;
  onSlotSelect: (slot: TimeSlot) => void;
  onCancelClick: (slot: TimeSlot) => void;
  onBookingDetailsClick?: (slot: TimeSlot) => void;
}

interface TimeSlotSection {
  title: string;
  icon: React.ReactNode;
  timeRange: string;
  slots: TimeSlot[];
}

export function TimeSlotGrid({ slots, selectedDate, onSlotSelect, onCancelClick, onBookingDetailsClick }: TimeSlotGridProps) {
  // Helper function to categorize slots by time of day
  const categorizeSlots = (slots: TimeSlot[]) => {
    const morning = slots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      return hour >= 7 && hour < 12;
    });

    const afternoon = slots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      return hour >= 12 && hour < 17;
    });

    const evening = slots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      return hour >= 17;
    });

    return { morning, afternoon, evening };
  };

  const { morning, afternoon, evening } = categorizeSlots(slots);

  const sections: TimeSlotSection[] = [
    {
      title: "Morning",
      icon: <Sun className="h-4 w-4 text-warning mr-2" />,
      timeRange: "7:00 AM - 12:00 PM",
      slots: morning
    },
    {
      title: "Afternoon",
      icon: <Sun className="h-4 w-4 text-warning mr-2" />,
      timeRange: "12:00 PM - 5:00 PM",
      slots: afternoon
    },
    {
      title: "Evening",
      icon: <Moon className="h-4 w-4 text-primary mr-2" />,
      timeRange: "5:00 PM - 7:00 PM",
      slots: evening
    }
  ];

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        section.slots.length > 0 && (
          <div key={section.title}>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
              {section.icon}
              {section.title} ({section.timeRange})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {section.slots.map((slot) => (
                <TimeSlotButton
                  key={slot.slotId}
                  slot={slot}
                  selectedDate={selectedDate}
                  onSlotSelect={onSlotSelect}
                  onCancelClick={onCancelClick}
                  onBookingDetailsClick={onBookingDetailsClick}
                />
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
}