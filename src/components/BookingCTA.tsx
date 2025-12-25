import { motion } from "framer-motion";
import { Phone, Check } from "lucide-react";

const BookingCTA = () => {

  return (
    <section className="py-20 bg-navy relative overflow-hidden">
      {/* Decorative Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gold rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-cream font-bold mb-4">
            Ready to Experience True{" "}
            <span className="text-gold">Ghanaian Hospitality?</span>
          </h2>
          <p className="text-cream/70 text-lg mb-8">
            Book your stay today and discover why travelers choose Edibec Guest House
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
            <a
              href="#booking"
              className="btn-gold text-lg"
            >
              Book Your Stay
            </a>
            <a
              href="tel:+233503385978"
              className="btn-outline-light flex items-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Call: 0503 385 978
            </a>
          </div>

          {/* Trust Elements */}
          <div className="flex flex-wrap justify-center gap-6 text-cream/70 text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-gold" />
              <span>Instant Confirmation</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-gold" />
              <span>Best Rate Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-gold" />
              <span>Flexible Booking</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BookingCTA;
