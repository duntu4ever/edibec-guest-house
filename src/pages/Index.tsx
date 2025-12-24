import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Rooms from "@/components/Rooms";
import WhyEdibec from "@/components/WhyEdibec";
import Gallery from "@/components/Gallery";
import GuestReviews from "@/components/GuestReviews";
import BookingForm from "@/components/BookingForm";
import Location from "@/components/Location";
import HouseRules from "@/components/HouseRules";
import BookingCTA from "@/components/BookingCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Edibec Guest House | Comfortable Accommodation in Takoradi, Ghana</title>
        <meta
          name="description"
          content="Experience comfort, 24/7 hospitality, and a prime central location at Edibec Guest House in Takoradi, Ghana. Book your stay today - rooms from ₵250/night."
        />
        <meta
          name="keywords"
          content="Takoradi hotel, Takoradi guest house, accommodation Ghana, Edibec Guest House, budget hotel Takoradi, Western Region Ghana hotels"
        />
        <meta property="og:title" content="Edibec Guest House | Your Home Away From Home in Takoradi" />
        <meta
          property="og:description"
          content="Comfortable accommodation with 24/7 reception, free parking, and hot breakfast included. Located in the heart of Takoradi."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://edibecguesthouse.com" />
      </Helmet>

      <main className="overflow-hidden">
        <Navbar />
        <Hero />
        <Features />
        <Rooms />
        <WhyEdibec />
        <Gallery />
        <GuestReviews />
        <BookingForm />
        <Location />
        <HouseRules />
        <BookingCTA />
        <Footer />
      </main>
    </>
  );
};

export default Index;
