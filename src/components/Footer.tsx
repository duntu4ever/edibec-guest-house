import { motion } from "framer-motion";
import { Phone, MapPin } from "lucide-react";
import Logo from "./Logo";

const quickLinks = [
  { label: "Rooms & Rates", href: "#rooms" },
  { label: "Location", href: "#location" },
  { label: "House Rules", href: "#rules" },
  { label: "Gallery", href: "#gallery" },
];

const emergencyServices = [
  { label: "Police", number: "191" },
  { label: "Fire Service", number: "192" },
  { label: "Ambulance", number: "193" },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy text-cream">
      <div className="container-custom py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Column 1 - Logo & Contact */}
          <div className="lg:col-span-1">
            <Logo variant="light" className="mb-6" />
            <div className="space-y-4">
              <a
                href="tel:+233553157354"
                className="flex items-center gap-3 text-cream/70 hover:text-gold transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>0553 157 354</span>
              </a>
              <a
                href="tel:+233503385978"
                className="flex items-center gap-3 text-cream/70 hover:text-gold transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>0503 385 978</span>
              </a>
              <div className="flex items-start gap-3 text-cream/70">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span className="text-sm">
                  Behind Main GCB,<br />
                  Opposite SSNIT House,<br />
                  Takoradi, Ghana
                </span>
              </div>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-cream/70 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Emergency Services */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6">Emergency Services</h4>
            <ul className="space-y-3">
              {emergencyServices.map((service) => (
                <li key={service.label}>
                  <a
                    href={`tel:${service.number}`}
                    className="flex items-center justify-between text-cream/70 hover:text-gold transition-colors group"
                  >
                    <span>{service.label}</span>
                    <span className="font-mono bg-navy-light/50 px-3 py-1 rounded group-hover:bg-gold group-hover:text-navy transition-all">
                      {service.number}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Book Now CTA */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6">Book Now</h4>
            <p className="text-cream/70 text-sm mb-6">
              Ready to experience comfortable accommodation in the heart of Takoradi?
            </p>
            <a
              href="#booking"
              className="inline-block bg-gold text-navy font-semibold px-6 py-3 rounded-lg hover:shadow-gold transition-all"
            >
              Book Your Stay
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-cream/10">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-cream/50 text-sm">
              © {currentYear} Edibec Guest House. All rights reserved. 
              Designed & Developed by <a href="https://www.linkedin.com/in/jduntu/" target="_blank" rel="noopener noreferrer" className="text-cream hover:text-gold transition-colors">James Duntu</a> 
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
