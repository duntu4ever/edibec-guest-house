import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Plus, BookOpen, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminNavbar from "@/components/AdminNavbar";
import BookingsTable from "@/components/BookingsTable";
import AdminBookingForm from "@/components/AdminBookingForm";
import BookingStatistics from "@/components/BookingStatistics";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("bookings");

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Edibec Guest House</title>
        <meta name="description" content="Admin dashboard for managing bookings at Edibec Guest House" />
      </Helmet>

      <div className="min-h-screen bg-cream-dark">
        <AdminNavbar />
        
        <main className="container-custom py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="font-serif text-4xl md:text-5xl text-navy font-bold mb-2">
                  Admin <span className="text-gold">Dashboard</span>
                </h1>
                <p className="text-muted-foreground">
                  Manage bookings and reservations for Edibec Guest House
                </p>
              </div>
              <a href="/">
                <Button
                  variant="outline"
                  className="border-navy text-navy hover:bg-navy hover:text-cream"
                >
                  <Home className="w-4 h-4 mr-2" />
                  View Website
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Statistics */}
          <BookingStatistics />

          {/* Main Content Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6 bg-card border border-border/50">
                <TabsTrigger 
                  value="bookings" 
                  className="data-[state=active]:bg-gold data-[state=active]:text-navy"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  All Bookings
                </TabsTrigger>
                <TabsTrigger 
                  value="new-booking"
                  className="data-[state=active]:bg-gold data-[state=active]:text-navy"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Booking
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="mt-0">
                <BookingsTable />
              </TabsContent>

              <TabsContent value="new-booking" className="mt-0">
                <AdminBookingForm onSuccess={() => setActiveTab("bookings")} />
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;

