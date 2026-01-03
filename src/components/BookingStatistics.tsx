import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XCircle,
  TrendingUp,
  Users,
  DollarSign,
  AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Booking = {
  id: string;
  status: string;
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  created_at: string;
  total_amount?: number;
  total_paid?: number;
  balance_due?: number;
  payment_status?: string;
};

const BookingStatistics = () => {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["bookings-statistics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Booking[];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = {
    total: bookings?.length || 0,
    pending: bookings?.filter((b) => b.status === "pending").length || 0,
    confirmed: bookings?.filter((b) => b.status === "confirmed").length || 0,
    cancelled: bookings?.filter((b) => b.status === "cancelled").length || 0,
    totalGuests: bookings?.reduce((sum, b) => sum + b.guests_count, 0) || 0,
    totalRevenue: bookings?.reduce((sum, b) => sum + (b.total_paid || 0), 0) || 0,
    outstandingBalance: bookings?.reduce((sum, b) => sum + (b.balance_due || 0), 0) || 0,
    unpaidBookings: bookings?.filter((b) => b.payment_status === "unpaid" && b.status !== "cancelled").length || 0,
    partiallyPaidBookings: bookings?.filter((b) => b.payment_status === "partially_paid").length || 0,
  };

  // Calculate upcoming bookings (check-in within next 30 days)
  const upcomingBookings = bookings?.filter((booking) => {
    const checkIn = new Date(booking.check_in_date);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    return checkIn >= today && checkIn <= thirtyDaysFromNow && booking.status === "confirmed";
  }).length || 0;

  // Calculate this month's bookings
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const thisMonthBookings = bookings?.filter((booking) => {
    const created = new Date(booking.created_at);
    return created >= thisMonth && booking.status !== "cancelled";
  }).length || 0;

  const statCards = [
    {
      label: "Total Bookings",
      value: stats.total,
      icon: BookOpen,
      color: "text-navy",
      bgColor: "bg-navy/10",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-gold-dark",
      bgColor: "bg-gold/10",
    },
    {
      label: "Confirmed",
      value: stats.confirmed,
      icon: CheckCircle2,
      color: "text-sage",
      bgColor: "bg-sage/10",
    },
    {
      label: "Cancelled",
      value: stats.cancelled,
      icon: XCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      label: "Total Revenue",
      value: `₵${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-sage",
      bgColor: "bg-sage/10",
      isCurrency: true,
    },
    {
      label: "Outstanding Balance",
      value: `₵${stats.outstandingBalance.toFixed(2)}`,
      icon: AlertCircle,
      color: "text-gold-dark",
      bgColor: "bg-gold/10",
      isCurrency: true,
    },
    {
      label: "Unpaid Bookings",
      value: stats.unpaidBookings,
      icon: AlertCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      label: "Partially Paid",
      value: stats.partiallyPaidBookings,
      icon: Clock,
      color: "text-gold-dark",
      bgColor: "bg-gold/10",
    },
    {
      label: "Total Guests",
      value: stats.totalGuests,
      icon: Users,
      color: "text-navy",
      bgColor: "bg-navy/10",
    },
    {
      label: "Upcoming (30 days)",
      value: upcomingBookings,
      icon: Calendar,
      color: "text-sage",
      bgColor: "bg-sage/10",
    },
    {
      label: "This Month",
      value: thisMonthBookings,
      icon: TrendingUp,
      color: "text-gold",
      bgColor: "bg-gold/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className={`font-bold text-navy ${stat.isCurrency ? "text-xl" : "text-3xl"}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default BookingStatistics;

