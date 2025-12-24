import { useState } from "react";
import { motion } from "framer-motion";
import { Snowflake, Tv, Refrigerator, Bed, Users, ShowerHead } from "lucide-react";
import room1 from "@/assets/room-1.jpg";
import room2 from "@/assets/room-2.jpg";
import room3 from "@/assets/room-3.jpg";

const amenities = [
  { icon: Snowflake, label: "Air Conditioning & Fan" },
  { icon: Tv, label: "Smart Television" },
  { icon: Refrigerator, label: "Private Mini Fridge" },
  { icon: Bed, label: "Comfortable Double Bed" },
  { icon: ShowerHead, label: "Private En-suite Bathroom" },
];

const RoomCard = () => {
  const [activeTab, setActiveTab] = useState<"room" | "breakfast">("room");
  const whatsappLink = "https://wa.me/233553157354?text=Hello, I'd like to check availability for a Standard Double Room at Edibec Guest House";

  const images = [room1, room2, room3];
  const [currentImage, setCurrentImage] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-card rounded-2xl overflow-hidden shadow-large border border-border/50 max-w-4xl mx-auto"
    >
      <div className="grid md:grid-cols-2">
        {/* Image Section */}
        <div className="relative h-72 md:h-full min-h-[320px]">
          <img
            src={images[currentImage]}
            alt="Standard Double Room at Edibec Guest House"
            className="w-full h-full object-cover"
          />
          
          {/* Image Navigation */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImage(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentImage === idx ? "bg-gold w-6" : "bg-cream/50 hover:bg-cream"
                }`}
              />
            ))}
          </div>

          {/* Occupancy Badge */}
          <div className="absolute top-4 left-4 bg-navy/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
            <Users className="w-4 h-4 text-gold" />
            <span className="text-cream text-sm font-medium">Up to 2 Guests</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-8">
          <h3 className="font-serif text-2xl text-foreground font-bold mb-2">
            Standard Double Room
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            Comfortable and well-appointed room perfect for couples or solo travelers
          </p>

          {/* Pricing Tabs */}
          <div className="bg-muted rounded-xl p-1 flex mb-6">
            <button
              onClick={() => setActiveTab("room")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === "room"
                  ? "bg-card shadow-soft text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Room Only
            </button>
            <button
              onClick={() => setActiveTab("breakfast")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === "breakfast"
                  ? "bg-card shadow-soft text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              With Breakfast
            </button>
          </div>

          {/* Price Display */}
          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-4xl font-bold text-navy">
                ₵{activeTab === "room" ? "250" : "280"}
              </span>
              <span className="text-muted-foreground">/night</span>
            </div>
            {activeTab === "breakfast" && (
              <p className="text-sm text-sage mt-1">Includes hot breakfast (6:30 AM - 9:00 AM)</p>
            )}
          </div>

          {/* Amenities Grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {amenities.map((amenity) => (
              <div key={amenity.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <amenity.icon className="w-4 h-4 text-gold" />
                <span>{amenity.label}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold w-full flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Check Availability
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default RoomCard;
