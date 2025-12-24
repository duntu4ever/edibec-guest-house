import { motion } from "framer-motion";
import RoomCard from "./RoomCard";

const Rooms = () => {
  return (
    <section id="rooms" className="section-padding bg-cream">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-gold font-medium tracking-wider uppercase text-sm">
            Accommodations
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-navy font-bold mt-3 mb-4">
            Rooms & Rates
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience comfort and convenience in our thoughtfully designed rooms, 
            complete with modern amenities and warm Ghanaian hospitality
          </p>
        </motion.div>

        {/* Room Card */}
        <RoomCard />
      </div>
    </section>
  );
};

export default Rooms;
