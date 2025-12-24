import { motion } from "framer-motion";
import { MapPin, Clock, Coffee, Car } from "lucide-react";
import room4 from "@/assets/room-4.jpg";
import bathroom1 from "@/assets/bathroom-1.jpg";

const features = [
  {
    icon: MapPin,
    title: "In the Heart of Takoradi",
    description: "Minutes from Takoradi Harbour, Central Police Station, shopping centers, and business districts. Everything you need is within reach.",
    image: null,
  },
  {
    icon: Clock,
    title: "Always Here for You",
    description: "Whether you arrive at dawn or midnight, our dedicated reception team is ready to welcome you with warm hospitality.",
    image: room4,
  },
  {
    icon: Coffee,
    title: "Start Your Day Right",
    description: "Enjoy a freshly prepared hot breakfast daily from 6:30 AM to 9:00 AM. Local and continental options available.",
    image: bathroom1,
  },
  {
    icon: Car,
    title: "Park with Confidence",
    description: "Our spacious parking area accommodates vehicles of all sizes—from compact cars to large trucks—completely free of charge.",
    image: null,
  },
];

const WhyEdibec = () => {
  return (
    <section id="about" className="section-padding bg-background">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-gold font-medium tracking-wider uppercase text-sm">
            Why Choose Us
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-navy font-bold mt-3 mb-4">
            The Edibec Experience
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We combine prime location, exceptional service, and genuine hospitality 
            to make your stay in Takoradi truly memorable
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`relative overflow-hidden rounded-2xl ${
                feature.image ? "min-h-[400px]" : "bg-cream p-8"
              }`}
            >
              {feature.image ? (
                <>
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gold/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-gold" />
                      </div>
                    </div>
                    <h3 className="font-serif text-2xl text-cream font-bold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-cream/80 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col justify-center">
                  <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mb-6">
                    <feature.icon className="w-8 h-8 text-gold" />
                  </div>
                  <h3 className="font-serif text-2xl text-navy font-bold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  {feature.title.includes("Heart") && (
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Edibec+Guest+House+Takoradi+Ghana"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-6 text-gold font-medium hover:underline"
                    >
                      View on Google Maps
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyEdibec;
