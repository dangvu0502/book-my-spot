import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { CheckCircle, Calendar, Clock, Download, Mail, Hash, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SuccessAnimationProps {
  appointmentDetails: {
    date: string;
    time: string;
    name: string;
    email: string;
    confirmationNumber?: string;
    notes?: string;
  };
  onClose: () => void;
  onViewCalendar?: () => void;
}

export function SuccessAnimation({ appointmentDetails, onClose, onViewCalendar }: SuccessAnimationProps) {
  const [copied, setCopied] = useState(false);
  const confirmationNumber = appointmentDetails.confirmationNumber || `APT-${Date.now().toString(36).toUpperCase()}`;

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Shoot confetti from both sides
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']
      });
    }, 250);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="max-w-md w-full p-8 text-center space-y-6 animate-scale-bounce">
        {/* Success Icon */}
        <div className="w-24 h-24 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center animate-scale-bounce">
          <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
        </div>

        {/* Success Message */}
        <div className="space-y-2 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-2xl font-bold text-foreground">
            Appointment Confirmed!
          </h2>
          <p className="text-muted-foreground">
            Your appointment has been successfully booked
          </p>
        </div>

        {/* Confirmation Number */}
        <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-3 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Confirmation Number</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono font-bold">
                {confirmationNumber}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(confirmationNumber);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="h-7 px-2"
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <h3 className="font-semibold text-sm mb-3">Appointment Details</h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Calendar className="w-3 h-3" />
                <span>Date</span>
              </div>
              <span className="font-semibold text-sm">{appointmentDetails.date}</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Clock className="w-3 h-3" />
                <span>Time</span>
              </div>
              <span className="font-semibold text-sm">{appointmentDetails.time}</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <User className="w-3 h-3" />
                <span>Name</span>
              </div>
              <span className="font-semibold text-sm">{appointmentDetails.name}</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Mail className="w-3 h-3" />
                <span>Email</span>
              </div>
              <span className="font-semibold text-sm truncate" title={appointmentDetails.email}>
                {appointmentDetails.email}
              </span>
            </div>
          </div>

          {appointmentDetails.notes && (
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground mb-1">Notes</p>
              <p className="text-sm">{appointmentDetails.notes}</p>
            </div>
          )}
        </div>

        {/* Confirmation Note */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 animate-slide-up" style={{ animationDelay: '600ms' }}>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            A confirmation email has been sent to {appointmentDetails.email}
          </p>
        </div>

        {/* Calendar Export Options */}
        <div className="grid grid-cols-3 gap-2 animate-slide-up" style={{ animationDelay: '700ms' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const event = {
                title: 'Appointment',
                start: `${appointmentDetails.date} ${appointmentDetails.time}`,
                duration: 60,
              };
              const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${encodeURIComponent(event.start)}/${encodeURIComponent(event.start)}`;
              window.open(googleUrl, '_blank');
            }}
            className="text-xs"
          >
            <Calendar className="w-3 h-3 mr-1" />
            Google
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Appointment
DTSTART:${appointmentDetails.date.replace(/-/g, '')}T${appointmentDetails.time.replace(':', '')}00
DURATION:PT1H
END:VEVENT
END:VCALENDAR`;
              const blob = new Blob([icsContent], { type: 'text/calendar' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'appointment.ics';
              a.click();
            }}
            className="text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            .ics
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=Appointment&startdt=${appointmentDetails.date}&enddt=${appointmentDetails.date}`;
              window.open(outlookUrl, '_blank');
            }}
            className="text-xs"
          >
            <Mail className="w-3 h-3 mr-1" />
            Outlook
          </Button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 animate-slide-up" style={{ animationDelay: '900ms' }}>
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Book Another
          </Button>
          <Button
            className="flex-1"
            onClick={onViewCalendar || onClose}
          >
            View My Bookings
          </Button>
        </div>
      </Card>
    </div>
  );
}