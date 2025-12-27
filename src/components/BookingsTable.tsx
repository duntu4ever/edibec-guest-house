import { useState } from "react";
import { format } from "date-fns";
import { Search, Filter, RefreshCw, Eye, BookOpen, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

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

const BookingsTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

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
      refetch();
    } catch (error: any) {
      console.error("Error updating booking:", error);
      toast.error(error.message || "Failed to update booking status");
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
                  <TableHead className="text-navy font-semibold">Status</TableHead>
                  <TableHead className="text-navy font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking, index) => (
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
                            <ScrollArea className="max-h-[500px] pr-4">
                              <div className="space-y-4">
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
                ))}
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

