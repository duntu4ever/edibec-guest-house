import { motion } from "framer-motion";
import { MapPin, Building, Landmark, Copy, Check, Navigation } from "lucide-react";
import { useState } from "react";

const landmarks = [
  { icon: Building, label: "Opposite SSNIT House" },
  { icon: Landmark, label: "Behind Old Commercial Bank" },
  { icon: MapPin, label: "Near Central Police Station" },
];

const Location = () => {
  const [copied, setCopied] = useState(false);
  const address = "Edibec Guest House, Behind Old Commercial Bank, Opposite SSNIT House, Takoradi, Ghana";

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="location" className="section-padding bg-background">
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
            Find Us
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-navy font-bold mt-3 mb-4">
            Location & Directions
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left - Address Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="font-serif text-2xl text-navy font-bold mb-6">
              Easy to Find
            </h3>

            {/* Address Card */}
            <div className="bg-cream rounded-xl p-6 mb-6 relative group">
              <p className="text-foreground font-medium mb-1">Edibec Guest House</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Behind Old Commercial Bank<br />
                Opposite SSNIT House<br />
                Takoradi, Ghana
              </p>
              <button
                onClick={copyAddress}
                className="absolute top-4 right-4 p-2 bg-background rounded-lg hover:bg-muted transition-colors"
                aria-label="Copy address"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-sage" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>

            {/* Landmarks */}
            <div className="space-y-3 mb-8">
              {landmarks.map((landmark) => (
                <div
                  key={landmark.label}
                  className="flex items-center gap-3 text-muted-foreground"
                >
                  <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
                    <landmark.icon className="w-5 h-5 text-gold" />
                  </div>
                  <span>{landmark.label}</span>
                </div>
              ))}
            </div>

            {/* Get Directions Button */}
            <a
              href="https://www.google.com/maps/search/?api=1&query=Edibec+Guest+House+Takoradi+Ghana"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold inline-flex items-center gap-2"
            >
              <Navigation className="w-5 h-5" />
              Get Directions
            </a>
          </motion.div>

          {/* Right - Map */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl overflow-hidden shadow-large h-[400px] lg:h-full min-h-[400px]"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.3!2d-1.7557!3d4.8967!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sTakoradi%2C%20Ghana!5e0!3m2!1sen!2sus!4v1700000000000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Edibec Guest House Location"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Location;
