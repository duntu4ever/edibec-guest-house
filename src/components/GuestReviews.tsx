import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Kwame Mensah",
    location: "Accra, Ghana",
    rating: 5,
    text: "Excellent service and very clean rooms. The staff was incredibly welcoming and the breakfast was delicious. Perfect location for business trips to Takoradi.",
    date: "November 2025",
  },
  {
    id: 2,
    name: "Sarah Koomson",
    location: "Tarkwa, Ghana",
    rating: 5,
    text: "My home away from home! The 24/7 reception was a lifesaver when my flight was delayed. Comfortable beds, great AC, and the location is unbeatable.",
    date: "October 2024",
  },
  {
    id: 3,
    name: "Kofi Asante",
    location: "Kumasi, Ghana",
    rating: 5,
    text: "Best value for money in Takoradi. Clean, secure parking, and the staff treats you like family. I always stay here when visiting the Western Region.",
    date: "October 2024",
  },
  {
    id: 4,
    name: "Jeffery Ansah",
    location: "Takoradi, Ghana",
    rating: 4,
    text: "Very pleasant stay. The room was spotless and the breakfast included was a nice touch. Great location near the harbor for our work project.",
    date: "September 2025",
  },
];

const GuestReviews = () => {
  return (
    <section id="reviews" className="py-20 bg-cream">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-gold font-medium tracking-wider uppercase text-sm">
            Testimonials
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-navy font-bold mt-2">
            What Our <span className="text-gold">Guests Say</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Don't just take our word for it — hear from travelers who've experienced our hospitality
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-shadow duration-300 relative"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-gold/20" />
              
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < review.rating
                        ? "text-gold fill-gold"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>

              <p className="text-foreground/80 leading-relaxed mb-6 relative z-10">
                "{review.text}"
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-navy">{review.name}</p>
                  <p className="text-sm text-muted-foreground">{review.location}</p>
                </div>
                <span className="text-sm text-muted-foreground">{review.date}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-10"
        >
          <div className="inline-flex items-center gap-2 bg-navy/5 px-6 py-3 rounded-full">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-gold fill-gold" />
              ))}
            </div>
            <span className="text-navy font-medium">4.9 out of 5 based on guest reviews</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GuestReviews;
