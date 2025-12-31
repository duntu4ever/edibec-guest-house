import { motion } from "framer-motion";
import { Building2, Clock, Coffee, Car, Snowflake, Shield, Wifi, Sparkles, Shirt } from "lucide-react";

const features = [
  { icon: Building2, label: "Prime Central Location" },
  { icon: Clock, label: "24/7 Service" },
  { icon: Coffee, label: "Hot Breakfast Included" },
  { icon: Car, label: "Spacious Parking" },
  { icon: Snowflake, label: "Fully Air-Conditioned" },
  { icon: Shield, label: "Secure & Safe" },
  { icon: Wifi, label: "Free Wifi" },
  { icon: Sparkles, label: "Housekeeping services" },
  { icon: Shirt, label: "Laundry services" },
];

const Features = () => {
  return (
    <section className="py-6 bg-navy sticky top-0 z-40 border-y border-gold/20">
      <div className="container-custom">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 md:pb-0 md:flex-wrap md:justify-center">
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 bg-navy-light/50 backdrop-blur-sm px-5 py-3 rounded-full border border-gold/20 whitespace-nowrap cursor-default transition-all duration-300 hover:border-gold/40 hover:bg-navy-light/70"
            >
              <feature.icon className="w-5 h-5 text-gold" />
              <span className="text-cream/90 text-sm font-medium">{feature.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
