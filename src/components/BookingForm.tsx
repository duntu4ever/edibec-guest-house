import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Users, Loader2, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
}).refine((data) => data.check_out_date > data.check_in_date, {
  message: "Check-out must be after check-in",
  path: ["check_out_date"],
});

type BookingFormData = z.infer<typeof bookingSchema>;

const BookingForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guest_name: "",
      email: "",
      phone: "",
      room_type: "",
      guests_count: 1,
      special_requests: "",
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      const bookingData = {
        guest_name: data.guest_name,
        email: data.email,
        phone: data.phone,
        room_type: data.room_type,
        check_in_date: format(data.check_in_date, "yyyy-MM-dd"),
        check_out_date: format(data.check_out_date, "yyyy-MM-dd"),
        guests_count: data.guests_count,
        special_requests: data.special_requests || null,
      };

      const { error } = await supabase.from("bookings").insert(bookingData);

      if (error) throw error;

      // Send email notification
      try {
        await supabase.functions.invoke("send-booking-notification", {
          body: bookingData,
        });
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
        // Don't fail the booking if email fails
      }

      setIsSuccess(true);
      toast.success("Booking request submitted! We'll contact you shortly.");
      form.reset();
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to submit booking. Please try again or call us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <section id="booking" className="py-20 bg-cream-dark">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center bg-card p-10 rounded-2xl shadow-md"
          >
            <CheckCircle className="w-16 h-16 text-sage mx-auto mb-4" />
            <h3 className="font-serif text-2xl md:text-3xl text-navy font-bold mb-4">
              Booking Request Received!
            </h3>
            <p className="text-muted-foreground mb-6">
              Thank you for choosing Edibec Guest House. We've received your booking request 
              and will contact you within 24 hours to confirm availability.
            </p>
            <Button
              onClick={() => setIsSuccess(false)}
              className="bg-gold text-navy hover:bg-gold-light"
            >
              Make Another Booking
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="py-20 bg-cream-dark">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-gold font-medium tracking-wider uppercase text-sm">
            Reservations
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-navy font-bold mt-2">
            Book Your <span className="text-gold">Stay</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Fill out the form below and we'll get back to you within 24 hours to confirm your reservation
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
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
                            disabled={(date) => date < new Date()}
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
                              date < new Date() ||
                              (form.getValues("check_in_date") &&
                                date <= form.getValues("check_in_date"))
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
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                    Submitting...
                  </>
                ) : (
                  "Submit Booking Request"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Prefer to speak with us directly?{" "}
                <a
                  href="https://wa.me/233553157354?text=Hello, I'd like to book a room at Edibec Guest House"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:underline font-medium"
                >
                  Chat on WhatsApp
                </a>{" "}
                or call{" "}
                <a href="tel:+233553157354" className="text-gold hover:underline font-medium">
                  0553 157 354
                </a>
              </p>
            </form>
          </Form>
        </motion.div>
      </div>
    </section>
  );
};

export default BookingForm;
