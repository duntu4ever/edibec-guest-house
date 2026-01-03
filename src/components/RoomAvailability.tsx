import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Calendar, Home, AlertCircle, CheckCircle2 } from "lucide-react";
import { format, eachDayOfInterval, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TOTAL_ROOMS = 4;

type Booking = {
  id: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
  guest_name: string;
};

type DayAvailability = {
  date: Date;
  booked: number;
  available: number;
  isFullyBooked: boolean;
  bookings: Booking[];
};

const RoomAvailability = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"today" | "calendar" | "range">("today");

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["bookings-availability"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, check_in_date, check_out_date, status, guest_name")
        .in("status", ["pending", "confirmed"])
        .order("check_in_date", { ascending: true });

      if (error) throw error;
      return (data || []) as Booking[];
    },
  });

  // Calculate availability for a date range
  const calculateAvailability = (startDate: Date, endDate: Date): DayAvailability[] => {
    if (!bookings) return [];

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const activeBookings = bookings.filter(
      (b) => b.status === "confirmed" || b.status === "pending"
    );

    return days.map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);

      const overlappingBookings = activeBookings.filter((booking) => {
        const checkIn = startOfDay(new Date(booking.check_in_date));
        const checkOut = endOfDay(new Date(booking.check_out_date));
        return (
          (checkIn <= dayEnd && checkOut >= dayStart) ||
          (checkIn <= dayStart && checkOut >= dayEnd)
        );
      });

      const booked = overlappingBookings.length;
      const available = Math.max(0, TOTAL_ROOMS - booked);
      const isFullyBooked = booked >= TOTAL_ROOMS;

      return {
        date: day,
        booked,
        available,
        isFullyBooked,
        bookings: overlappingBookings,
      };
    });
  };

  // Get today's availability
  const todayAvailability = useMemo(() => {
    const today = new Date();
    const availability = calculateAvailability(today, today);
    return availability[0] || {
      date: today,
      booked: 0,
      available: TOTAL_ROOMS,
      isFullyBooked: false,
      bookings: [],
    };
  }, [bookings]);

  // Get next 30 days availability
  const next30Days = useMemo(() => {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 30);
    return calculateAvailability(today, endDate);
  }, [bookings]);

  // Get selected date availability
  const selectedDateAvailability = useMemo(() => {
    const availability = calculateAvailability(selectedDate, selectedDate);
    return availability[0] || {
      date: selectedDate,
      booked: 0,
      available: TOTAL_ROOMS,
      isFullyBooked: false,
      bookings: [],
    };
  }, [selectedDate, bookings]);

  // Calendar date modifiers
  const dateModifiers = useMemo(() => {
    const modifiers: Record<string, Date[]> = {
      fullyBooked: [],
      partiallyBooked: [],
      available: [],
    };

    next30Days.forEach((day) => {
      if (day.isFullyBooked) {
        modifiers.fullyBooked.push(day.date);
      } else if (day.booked > 0) {
        modifiers.partiallyBooked.push(day.date);
      } else {
        modifiers.available.push(day.date);
      }
    });

    return modifiers;
  }, [next30Days]);

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today's Availability - Quick View */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-navy">
            <Home className="w-5 h-5 text-gold" />
            Room Availability Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Rooms Booked</p>
                  <p className="text-3xl font-bold text-navy">{todayAvailability.booked}</p>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <p className="text-sm text-muted-foreground">Rooms Available</p>
                  <p className="text-3xl font-bold text-sage">{todayAvailability.available}</p>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Rooms</p>
                  <p className="text-3xl font-bold text-navy">{TOTAL_ROOMS}</p>
                </div>
              </div>
              {todayAvailability.isFullyBooked && (
                <Badge className="bg-destructive/20 text-destructive border-destructive/30 mt-2">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Fully Booked - No rooms available
                </Badge>
              )}
              {todayAvailability.available > 0 && todayAvailability.available < TOTAL_ROOMS && (
                <Badge className="bg-gold/20 text-gold-dark border-gold/30 mt-2">
                  {todayAvailability.available} room{todayAvailability.available !== 1 ? "s" : ""}{" "}
                  available
                </Badge>
              )}
              {todayAvailability.available === TOTAL_ROOMS && (
                <Badge className="bg-sage/20 text-sage border-sage/30 mt-2">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  All rooms available
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-navy">
            <Calendar className="w-5 h-5 text-gold" />
            Availability Calendar (Next 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date < new Date()}
                modifiers={dateModifiers}
                modifiersClassNames={{
                  fullyBooked: "bg-destructive/20 text-destructive font-semibold",
                  partiallyBooked: "bg-gold/20 text-gold-dark font-medium",
                  available: "bg-sage/10 text-sage",
                }}
                className="rounded-md border"
              />
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-sage/10 border border-sage/30 rounded" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gold/20 border border-gold/30 rounded" />
                  <span>Partially Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-destructive/20 border border-destructive/30 rounded" />
                  <span>Fully Booked</span>
                </div>
              </div>
            </div>

            {/* Selected Date Details */}
            <div className="lg:w-80 space-y-4">
              <div className="bg-cream-dark p-4 rounded-lg">
                <h3 className="font-semibold text-navy mb-3">
                  {format(selectedDate, "EEEE, MMMM dd, yyyy")}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Rooms Booked:</span>
                    <span className="font-semibold text-navy">{selectedDateAvailability.booked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Rooms Available:</span>
                    <span className="font-semibold text-sage">{selectedDateAvailability.available}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge
                      className={
                        selectedDateAvailability.isFullyBooked
                          ? "bg-destructive/20 text-destructive border-destructive/30"
                          : selectedDateAvailability.available === TOTAL_ROOMS
                          ? "bg-sage/20 text-sage border-sage/30"
                          : "bg-gold/20 text-gold-dark border-gold/30"
                      }
                    >
                      {selectedDateAvailability.isFullyBooked
                        ? "Fully Booked"
                        : selectedDateAvailability.available === TOTAL_ROOMS
                        ? "All Available"
                        : "Partially Booked"}
                    </Badge>
                  </div>
                </div>

                {selectedDateAvailability.bookings.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm font-medium text-navy mb-2">Bookings on this date:</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {selectedDateAvailability.bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="text-xs bg-card p-2 rounded border border-border/50"
                        >
                          <p className="font-medium text-navy">{booking.guest_name}</p>
                          <p className="text-muted-foreground">
                            {format(new Date(booking.check_in_date), "MMM dd")} -{" "}
                            {format(new Date(booking.check_out_date), "MMM dd")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomAvailability;

