import { useState } from "react";
import { format } from "date-fns";
import { Search, Filter, RefreshCw, Eye, BookOpen, Download, DollarSign, Edit } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

type Booking = {
  id: string;
  guest_name: string;
  email: string;
  phone: string;
  room_type: string;
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  special_requests: string | null;
  status: string;
  created_at: string;
  room_rate?: number;
  total_amount?: number;
  initial_payment?: number;
  final_payment?: number;
  total_paid?: number;
  balance_due?: number;
  payment_status?: string;
};

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "bg-sage/20 text-sage border-sage/30";
    case "pending":
      return "bg-gold/20 text-gold-dark border-gold/30";
    case "cancelled":
      return "bg-destructive/20 text-destructive border-destructive/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getRoomTypeLabel = (roomType: string) => {
  switch (roomType) {
    case "standard-room-only":
      return "Standard Double - Room Only";
    case "standard-with-breakfast":
      return "Standard Double - With Breakfast";
    default:
      return roomType;
  }
};

const getPaymentStatusBadge = (status?: string) => {
  switch (status) {
    case "fully_paid":
      return "bg-sage/20 text-sage border-sage/30";
    case "partially_paid":
      return "bg-gold/20 text-gold-dark border-gold/30";
    case "unpaid":
      return "bg-destructive/20 text-destructive border-destructive/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const paymentFormSchema = z.object({
  initial_payment: z.number().min(0),
  final_payment: z.number().min(0),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

const PaymentEditForm = ({
  booking,
  onSave,
  onCancel,
}: {
  booking: Booking;
  onSave: (data: PaymentFormData) => void;
  onCancel: () => void;
}) => {
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      initial_payment: booking.initial_payment || 0,
      final_payment: booking.final_payment || 0,
    },
  });

  const initialPayment = form.watch("initial_payment") || 0;
  const finalPayment = form.watch("final_payment") || 0;
  const totalPaid = initialPayment + finalPayment;
  const balanceDue = Math.max(0, (booking.total_amount || 0) - totalPaid);

  const onSubmit = (data: PaymentFormData) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="initial_payment"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-navy">Initial Payment</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max={booking.total_amount}
                  step="0.01"
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
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="final_payment"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-navy">Final Payment</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max={booking.total_amount}
                  step="0.01"
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
            </FormItem>
          )}
        />
        <div className="bg-card p-3 rounded border border-border/50 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Paid:</span>
            <span className="font-semibold text-navy">₵{totalPaid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Balance Due:</span>
            <span
              className={cn(
                "font-semibold",
                balanceDue === 0 ? "text-sage" : balanceDue > 0 ? "text-gold-dark" : "text-navy"
              )}
            >
              ₵{balanceDue.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" className="flex-1 bg-gold text-navy hover:bg-gold-light">
            Save Payment
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

const BookingsTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingPayment, setEditingPayment] = useState<string | null>(null);

  const { data: bookings, isLoading, error, refetch } = useQuery({
    queryKey: ["bookings", statusFilter],
    queryFn: async () => {
      let query = supabase.from("bookings").select("*").order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        // If RLS policy prevents reading, show helpful message
        if (error.code === "PGRST301" || error.message.includes("permission")) {
          throw new Error(
            "Permission denied. Please update your Supabase RLS policy to allow admin access to read bookings."
          );
        }
        throw error;
      }

      return data as Booking[];
    },
  });

  const filteredBookings = bookings?.filter((booking) => {
    const query = searchQuery.toLowerCase();
    return (
      booking.guest_name.toLowerCase().includes(query) ||
      booking.email.toLowerCase().includes(query) ||
      booking.phone.includes(query) ||
      booking.room_type.toLowerCase().includes(query)
    );
  });

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", bookingId);

      if (error) throw error;

      toast.success("Booking status updated successfully");
      await refetch();
      
      // Refresh selected booking to show updated data
      if (selectedBooking?.id === bookingId) {
        const updated = bookings?.find(b => b.id === bookingId);
        if (updated) setSelectedBooking(updated);
      }
    } catch (error: any) {
      console.error("Error updating booking:", error);
      toast.error(error.message || "Failed to update booking status");
    }
  };

  const updatePayment = async (bookingId: string, data: PaymentFormData) => {
    try {
      const totalPaid = (data.initial_payment || 0) + (data.final_payment || 0);
      const { data: existing } = await supabase.from("bookings").select("total_amount").eq("id", bookingId).single();
      const totalAmount = existing?.total_amount || 0;
      const balanceDue = Math.max(0, totalAmount - totalPaid);
      const payment_status = balanceDue === 0 ? "fully_paid" : totalPaid === 0 ? "unpaid" : "partially_paid";

      const { error } = await supabase
        .from("bookings")
        .update({
          initial_payment: data.initial_payment,
          final_payment: data.final_payment,
          total_paid: totalPaid,
          balance_due: balanceDue,
          payment_status,
        } as any)
        .eq("id", bookingId);

      if (error) throw error;

      toast.success("Payment updated successfully");
      setEditingPayment(null);
      
      // Refetch and update selected booking immediately
      const { data: refreshedBookings } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();
      
      if (refreshedBookings && selectedBooking?.id === bookingId) {
        setSelectedBooking(refreshedBookings as Booking);
      }
      
      await refetch();
    } catch (error: any) {
      console.error("Error updating payment:", error);
      toast.error(error.message || "Failed to update payment");
    }
  };

  const exportToCSV = () => {
    if (!bookings || bookings.length === 0) {
      toast.error("No bookings to export");
      return;
    }

    const dataToExport = filteredBookings || bookings;

    // CSV headers
    const headers = [
      "ID",
      "Guest Name",
      "Email",
      "Phone",
      "Room Type",
      "Check-in Date",
      "Check-out Date",
      "Guests",
      "Status",
      "Special Requests",
      "Created At",
    ];

    // CSV rows
    const rows = dataToExport.map((booking) => [
      booking.id,
      booking.guest_name,
      booking.email,
      booking.phone,
      getRoomTypeLabel(booking.room_type),
      format(new Date(booking.check_in_date), "yyyy-MM-dd"),
      format(new Date(booking.check_out_date), "yyyy-MM-dd"),
      booking.guests_count.toString(),
      booking.status,
      booking.special_requests || "",
      format(new Date(booking.created_at), "yyyy-MM-dd HH:mm:ss"),
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `bookings-export-${format(new Date(), "yyyy-MM-dd-HHmmss")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Bookings exported successfully!");
  };

  if (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to load bookings";
    const isPermissionError = 
      errorMessage.includes("permission") || 
      errorMessage.includes("PGRST301") ||
      errorMessage.includes("Row Level Security");

    return (
      <div className="bg-card p-8 rounded-xl shadow-md border border-border/50 text-center">
        <p className="text-destructive mb-4 font-medium">{errorMessage}</p>
        {isPermissionError && (
          <div className="text-sm text-muted-foreground mb-4 space-y-2">
            <p className="font-semibold text-foreground">RLS Policy Issue Detected</p>
            <p>To fix this, you need to run the migration file:</p>
            <code className="block bg-muted p-2 rounded mt-2 text-xs">
              supabase/migrations/20251225000000_update_rls_policies.sql
            </code>
            <p className="mt-2">Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-left max-w-md mx-auto mt-2">
              <li>Go to your Supabase Dashboard</li>
              <li>Navigate to SQL Editor</li>
              <li>Copy and paste the migration SQL</li>
              <li>Run the query</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        )}
        <Button onClick={() => refetch()} variant="outline" className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card p-6 rounded-xl shadow-md border border-border/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, email, phone, or room type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-border focus:ring-gold"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px] border-border">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-border"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="border-border bg-gold/10 hover:bg-gold/20 text-gold border-gold/30"
            disabled={!bookings || bookings.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl shadow-md border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-gold mx-auto mb-4" />
            <p className="text-muted-foreground">Loading bookings...</p>
          </div>
        ) : filteredBookings && filteredBookings.length > 0 ? (
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-cream-dark/50">
                  <TableHead className="text-navy font-semibold">Guest Name</TableHead>
                  <TableHead className="text-navy font-semibold">Contact</TableHead>
                  <TableHead className="text-navy font-semibold">Room Type</TableHead>
                  <TableHead className="text-navy font-semibold">Check-in</TableHead>
                  <TableHead className="text-navy font-semibold">Check-out</TableHead>
                  <TableHead className="text-navy font-semibold">Guests</TableHead>
                  <TableHead className="text-navy font-semibold">Payment</TableHead>
                  <TableHead className="text-navy font-semibold">Status</TableHead>
                  <TableHead className="text-navy font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking, index) => {
                    const rowTotalPaid = booking.total_paid ?? ((booking.initial_payment || 0) + (booking.final_payment || 0));
                    const rowBalance = booking.balance_due ?? Math.max(0, (booking.total_amount || 0) - rowTotalPaid);
                    return (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TableCell className="font-medium text-navy">
                      {booking.guest_name}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-foreground">{booking.email}</div>
                        <div className="text-muted-foreground">{booking.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {getRoomTypeLabel(booking.room_type)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(booking.check_in_date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(booking.check_out_date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-sm">{booking.guests_count}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="text-muted-foreground">Paid: </span>
                          <span className="font-semibold text-navy">
                            ₵{rowTotalPaid.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs">
                          <span className="text-muted-foreground">Balance: </span>
                          <span className="font-semibold text-navy">
                            ₵{rowBalance.toFixed(2)}
                          </span>
                        </div>
                        <Badge
                          className={cn(
                            "text-xs",
                            getPaymentStatusBadge(booking.payment_status)
                          )}
                        >
                          {booking.payment_status === "fully_paid"
                            ? "Fully Paid"
                            : booking.payment_status === "partially_paid"
                            ? "Partially Paid"
                            : "Unpaid"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={booking.status}
                        onValueChange={(value) => updateBookingStatus(booking.id, value)}
                      >
                        <SelectTrigger className={`w-[120px] h-7 text-xs border ${getStatusBadgeVariant(booking.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedBooking(booking)}
                            className="text-gold hover:text-gold-dark hover:bg-gold/10"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="font-serif text-2xl text-navy">
                              Booking Details
                            </DialogTitle>
                            <DialogDescription>
                              View complete booking information
                            </DialogDescription>
                          </DialogHeader>
                          {selectedBooking && (
                            <ScrollArea className="max-h-[600px] pr-4">
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Guest Name</p>
                                    <p className="font-medium text-navy">{selectedBooking.guest_name}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                                    <p className="font-medium text-navy">{selectedBooking.email}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Phone</p>
                                    <p className="font-medium text-navy">{selectedBooking.phone}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                                    <Badge className={getStatusBadgeVariant(selectedBooking.status)}>
                                      {selectedBooking.status}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Room Type</p>
                                    <p className="font-medium text-navy">
                                      {getRoomTypeLabel(selectedBooking.room_type)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Number of Guests</p>
                                    <p className="font-medium text-navy">{selectedBooking.guests_count}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Check-in Date</p>
                                    <p className="font-medium text-navy">
                                      {format(new Date(selectedBooking.check_in_date), "MMMM dd, yyyy")}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Check-out Date</p>
                                    <p className="font-medium text-navy">
                                      {format(new Date(selectedBooking.check_out_date), "MMMM dd, yyyy")}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Booking Date</p>
                                    <p className="font-medium text-navy">
                                      {format(new Date(selectedBooking.created_at), "MMMM dd, yyyy 'at' h:mm a")}
                                    </p>
                                  </div>
                                </div>

                                {/* Payment Information Section */}
                                <div className="bg-cream-dark p-4 rounded-lg border border-border/50">
                                  <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-navy flex items-center gap-2">
                                      <DollarSign className="w-4 h-4 text-gold" />
                                      Payment Information
                                    </h3>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setEditingPayment(selectedBooking.id)}
                                      className="text-xs"
                                    >
                                      <Edit className="w-3 h-3 mr-1" />
                                      Edit Payment
                                    </Button>
                                  </div>

                                  {editingPayment === selectedBooking.id ? (
                                    <PaymentEditForm
                                      booking={selectedBooking}
                                      onSave={(data) => {
                                        updatePayment(selectedBooking.id, data);
                                      }}
                                      onCancel={() => setEditingPayment(null)}
                                    />
                                  ) : (
                                    (() => {
                                      const selTotalPaid = selectedBooking.total_paid ?? ((selectedBooking.initial_payment || 0) + (selectedBooking.final_payment || 0));
                                      const selBalance = selectedBooking.balance_due ?? Math.max(0, (selectedBooking.total_amount || 0) - selTotalPaid);
                                      return (
                                        <div className="space-y-3">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm text-muted-foreground mb-1">Room Rate</p>
                                          <p className="font-semibold text-navy">
                                            ₵{(selectedBooking.room_rate || 0).toFixed(2)}/night
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                                          <p className="font-semibold text-navy">
                                            ₵{(selectedBooking.total_amount || 0).toFixed(2)}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="border-t border-border pt-3 space-y-2">
                                        <div className="flex justify-between">
                                          <span className="text-sm text-muted-foreground">Initial Payment:</span>
                                          <span className="font-medium text-navy">
                                            ₵{(selectedBooking.initial_payment || 0).toFixed(2)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm text-muted-foreground">Final Payment:</span>
                                          <span className="font-medium text-navy">
                                            ₵{(selectedBooking.final_payment || 0).toFixed(2)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-border">
                                          <span className="text-sm font-medium text-navy">Total Paid:</span>
                                              <span className="font-semibold text-navy">
                                                ₵{selTotalPaid.toFixed(2)}
                                              </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm font-medium text-navy">Balance Due:</span>
                                          <span
                                            className={cn(
                                              "font-semibold",
                                                  selBalance === 0
                                                    ? "text-sage"
                                                    : "text-gold-dark"
                                            )}
                                          >
                                                ₵{selBalance.toFixed(2)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-border">
                                          <span className="text-sm font-medium text-navy">Payment Status:</span>
                                              <Badge className={getPaymentStatusBadge(selectedBooking.payment_status)}>
                                                {selectedBooking.payment_status === "fully_paid"
                                                  ? "✅ Fully Paid"
                                                  : selectedBooking.payment_status === "partially_paid"
                                                  ? "🟡 Partially Paid"
                                                  : "🔴 Unpaid"}
                                              </Badge>
                                        </div>
                                      </div>
                                        </div>
                                      );
                                    })()
                                  )}
                                </div>

                                {selectedBooking.special_requests && (
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Special Requests</p>
                                    <p className="font-medium text-navy bg-cream-dark p-3 rounded-lg">
                                      {selectedBooking.special_requests}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <div className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground font-medium mb-2">No bookings found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "Try adjusting your search criteria" : "Bookings will appear here once submitted"}
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredBookings && filteredBookings.length > 0 && (
        <div className="bg-card p-4 rounded-xl shadow-md border border-border/50">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-navy">{filteredBookings.length}</span>{" "}
            {filteredBookings.length === 1 ? "booking" : "bookings"}
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingsTable;

