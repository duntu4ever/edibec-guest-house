import { motion } from "framer-motion";
import { MapPin, Star, Car, Phone } from "lucide-react";
import Logo from "./Logo";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${heroBg})`,
          transform: 'scale(1.1)'
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy/90 via-navy/70 to-navy/90" />
      
      {/* Content */}
      <div className="relative z-10 container-custom text-center px-4">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <Logo variant="light" />
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-cream font-bold leading-tight mb-6 max-w-5xl mx-auto"
        >
          Your Peaceful Home Away From Home in{" "}
          <span className="text-gold">Takoradi</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-cream/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light"
        >
          Experience comfort, 24/7 hospitality, and a prime location at Edibec Guest House
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <a
            href="#booking"
            className="btn-gold flex items-center gap-2 text-lg"
          >
            Book Your Stay Now
          </a>
          <a
            href="tel:+233553157354"
            className="btn-outline-light flex items-center gap-2"
          >
            <Phone className="w-5 h-5" />
            Call Us: 0553 157 354
          </a>
        </motion.div>

        {/* Floating Info Bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="glass-card bg-navy-light/40 p-4 md:p-6 inline-flex flex-wrap gap-6 md:gap-10 justify-center items-center"
        >
          <div className="flex items-center gap-2 text-cream/90">
            <MapPin className="w-5 h-5 text-gold" />
            <span className="text-sm">Behind Old Commercial Bank</span>
          </div>
          <div className="flex items-center gap-2 text-cream/90">
            <Star className="w-5 h-5 text-gold" />
            <span className="text-sm">24/7 Reception</span>
          </div>
          <div className="flex items-center gap-2 text-cream/90">
            <Car className="w-5 h-5 text-gold" />
            <span className="text-sm">Free Secure Parking</span>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-cream/30 rounded-full flex justify-center pt-2"
        >
          <div className="w-1 h-3 bg-gold rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
