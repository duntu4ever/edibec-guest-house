import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { format, eachDayOfInterval, startOfDay, endOfDay } from "date-fns";
import { Calendar as CalendarIcon, Users, Loader2, CheckCircle, AlertCircle, DollarSign } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const bookingSchema = z.object({
  guest_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number").max(20),
  room_type: z.string().min(1, "Please select a room type"),
  check_in_date: z.date({ required_error: "Check-in date is required" }),
  check_out_date: z.date({ required_error: "Check-out date is required" }),
  guests_count: z.number().min(1).max(4),
  special_requests: z.string().max(500).optional(),
  status: z.string().default("pending"),
  initial_payment: z.number().min(0).optional().default(0),
  final_payment: z.number().min(0).optional().default(0),
}).refine((data) => data.check_out_date > data.check_in_date, {
  message: "Check-out must be after check-in",
  path: ["check_out_date"],
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface AdminBookingFormProps {
  onSuccess?: () => void;
}

const TOTAL_ROOMS = 4;

const AdminBookingForm = ({ onSuccess }: AdminBookingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guest_name: "",
      email: "",
      phone: "",
      room_type: "",
      guests_count: 1,
      special_requests: "",
      status: "pending",
        initial_payment: 0,
        final_payment: 0,
    },
  });

  const checkInDate = form.watch("check_in_date");
  const checkOutDate = form.watch("check_out_date");
  const roomType = form.watch("room_type");

  // Fetch existing bookings for availability check
  const { data: existingBookings } = useQuery({
    queryKey: ["bookings-availability-check"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("check_in_date, check_out_date, status")
        .in("status", ["pending", "confirmed"]);

      if (error) throw error;
      return data || [];
    },
  });

  // Calculate room rate and total amount
  const roomRate = useMemo(() => {
    if (roomType === "standard-room-only") return 250;
    if (roomType === "standard-with-breakfast") return 280;
    return 0;
  }, [roomType]);

  const totalAmount = useMemo(() => {
    if (!checkInDate || !checkOutDate || !roomRate) return 0;
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return nights * roomRate;
  }, [checkInDate, checkOutDate, roomRate]);

  const initialPayment = form.watch("initial_payment") || 0;
  const finalPayment = form.watch("final_payment") || 0;
  const totalPaid = initialPayment + finalPayment;
  const balanceDue = Math.max(0, totalAmount - totalPaid);

  // Check room availability
  useEffect(() => {
    if (!checkInDate || !checkOutDate || !existingBookings) {
      setAvailabilityError(null);
      return;
    }

    const days = eachDayOfInterval({ start: checkInDate, end: checkOutDate });
    const activeBookings = existingBookings.filter(
      (b: any) => b.status === "confirmed" || b.status === "pending"
    );

    const maxBooked = Math.max(
      ...days.map((day) => {
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);
        const overlapping = activeBookings.filter((booking: any) => {
          const checkIn = startOfDay(new Date(booking.check_in_date));
          const checkOut = endOfDay(new Date(booking.check_out_date));
          return (checkIn <= dayEnd && checkOut >= dayStart);
        });
        return overlapping.length;
      })
    );

    if (maxBooked >= TOTAL_ROOMS) {
      setAvailabilityError(
        `No rooms available for selected dates. ${maxBooked} of ${TOTAL_ROOMS} rooms are already booked.`
      );
    } else {
      setAvailabilityError(null);
    }
  }, [checkInDate, checkOutDate, existingBookings]);

  // Update total amount when dates or room type changes
  useEffect(() => {
    if (totalAmount > 0) {
      form.setValue("initial_payment", form.getValues("initial_payment") || 0);
      form.setValue("final_payment", form.getValues("final_payment") || 0);
    }
  }, [totalAmount, form]);

  const onSubmit = async (data: BookingFormData) => {
    if (availabilityError) {
      toast.error(availabilityError);
      return;
    }

    setIsSubmitting(true);
    try {
      const nights = Math.ceil(
        (data.check_out_date.getTime() - data.check_in_date.getTime()) / (1000 * 60 * 60 * 24)
      );
      const calculatedTotal = nights * roomRate;

      const totalPaid = (data.initial_payment || 0) + (data.final_payment || 0);
      const balanceDue = Math.max(0, calculatedTotal - totalPaid);
      const payment_status = balanceDue === 0 ? "fully_paid" : totalPaid === 0 ? "unpaid" : "partially_paid";

      const { error } = await supabase.from("bookings").insert({
        guest_name: data.guest_name,
        email: data.email,
        phone: data.phone,
        room_type: data.room_type,
        check_in_date: format(data.check_in_date, "yyyy-MM-dd"),
        check_out_date: format(data.check_out_date, "yyyy-MM-dd"),
        guests_count: data.guests_count,
        special_requests: data.special_requests || null,
        status: data.status,
        room_rate: roomRate,
        total_amount: calculatedTotal,
        initial_payment: data.initial_payment || 0,
        final_payment: data.final_payment || 0,
        total_paid: totalPaid,
        balance_due: balanceDue,
        payment_status,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Booking created successfully!");
      form.reset();
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.message || "Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto bg-card p-10 rounded-2xl shadow-md border border-border/50 text-center"
      >
        <CheckCircle className="w-16 h-16 text-sage mx-auto mb-4" />
        <h3 className="font-serif text-2xl md:text-3xl text-navy font-bold mb-4">
          Booking Created Successfully!
        </h3>
        <p className="text-muted-foreground mb-6">
          The booking has been added to the system and will appear in the bookings list.
        </p>
        <Button
          onClick={() => {
            setIsSuccess(false);
            if (onSuccess) onSuccess();
          }}
          className="bg-gold text-navy hover:bg-gold-light"
        >
          View All Bookings
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="mb-6">
        <h2 className="font-serif text-2xl md:text-3xl text-navy font-bold mb-2">
          Create New <span className="text-gold">Booking</span>
        </h2>
        <p className="text-muted-foreground">
          Add a new booking for walk-in customers or phone reservations
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-card p-6 md:p-10 rounded-2xl shadow-md border border-border/50 space-y-6"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="guest_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-navy font-medium">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      className="border-border focus:ring-gold"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-navy font-medium">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      className="border-border focus:ring-gold"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-navy font-medium">Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+233 XXX XXX XXX"
                      className="border-border focus:ring-gold"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="room_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-navy font-medium">Room Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-border">
                        <SelectValue placeholder="Select a room" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="standard-room-only">
                        Standard Double - Room Only (₵250/night)
                      </SelectItem>
                      <SelectItem value="standard-with-breakfast">
                        Standard Double - With Breakfast (₵280/night)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="check_in_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-navy font-medium">Check-in Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal border-border",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="check_out_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-navy font-medium">Check-out Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal border-border",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          form.getValues("check_in_date") &&
                          date <= form.getValues("check_in_date")
                        }
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guests_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-navy font-medium">Number of Guests</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(parseInt(val))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="border-border">
                        <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Guests" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 Guest</SelectItem>
                      <SelectItem value="2">2 Guests</SelectItem>
                      <SelectItem value="3">3 Guests</SelectItem>
                      <SelectItem value="4">4 Guests</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-navy font-medium">Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-border">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Room Availability Warning */}
          {availabilityError && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Room Availability Issue</p>
                <p className="text-sm text-destructive/80 mt-1">{availabilityError}</p>
              </div>
            </div>
          )}

          {/* Payment Information Section */}
          {(roomType && checkInDate && checkOutDate) && (
            <div className="bg-cream-dark p-6 rounded-xl border border-border/50 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-gold" />
                <h3 className="font-serif text-xl text-navy font-semibold">Payment Information</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Room Rate (per night)</p>
                  <p className="text-lg font-semibold text-navy">₵{roomRate.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Number of Nights</p>
                  <p className="text-lg font-semibold text-navy">
                    {checkInDate && checkOutDate
                      ? Math.ceil(
                          (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
                        )
                      : 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-lg font-semibold text-navy">₵{totalAmount.toFixed(2)}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <FormField
                  control={form.control}
                  name="initial_payment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-navy font-medium">
                        Initial Payment (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max={totalAmount}
                          step="0.01"
                          placeholder="0.00"
                          className="border-border focus:ring-gold"
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            field.onChange(value);
                          }}
                          value={field.value || 0}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter the initial deposit amount if paid at booking time
                      </p>
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4">
                <FormField
                  control={form.control}
                  name="final_payment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-navy font-medium">
                        Final Payment (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max={totalAmount}
                          step="0.01"
                          placeholder="0.00"
                          className="border-border focus:ring-gold"
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            field.onChange(value);
                          }}
                          value={field.value || 0}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter the final payment amount when the remaining balance is paid
                      </p>
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-card p-4 rounded-lg border border-border/50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Paid:</span>
                  <span className="font-semibold text-navy">₵{totalPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Balance Due:</span>
                  <span
                    className={cn(
                      "font-semibold",
                      balanceDue === 0 ? "text-sage" : balanceDue > 0 ? "text-gold-dark" : "text-navy"
                    )}
                  >
                    ₵{balanceDue.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-sm font-medium text-navy">Payment Status:</span>
                  <span
                    className={cn(
                      "text-xs font-semibold px-2 py-1 rounded",
                      totalPaid === 0
                        ? "bg-destructive/20 text-destructive"
                        : balanceDue === 0
                        ? "bg-sage/20 text-sage"
                        : "bg-gold/20 text-gold-dark"
                    )}
                  >
                    {totalPaid === 0
                      ? "Unpaid"
                      : balanceDue === 0
                      ? "Fully Paid"
                      : "Partially Paid"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="special_requests"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-navy font-medium">
                  Special Requests (Optional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any special requirements or requests..."
                    className="border-border resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gold text-navy hover:bg-gold-light font-semibold py-6 text-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating Booking...
              </>
            ) : (
              "Create Booking"
            )}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
};

export default AdminBookingForm;

