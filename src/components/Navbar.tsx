import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import Logo from "./Logo";

const navLinks = [
  { label: "Rooms", href: "#rooms" },
  { label: "About", href: "#about" },
  { label: "Gallery", href: "#gallery" },
  { label: "Location", href: "#location" },
  { label: "Guidelines", href: "#rules" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const whatsappLink = "https://wa.me/233553157354?text=Hello, I'd like to book a room at Edibec Guest House";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-navy/95 backdrop-blur-md shadow-lg py-2 sm:py-3"
            : "bg-transparent py-3 sm:py-4 md:py-5"
        }`}
      >
        <div className="container-custom flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="#" className="relative z-10 flex-shrink-0">
            <Logo variant="light" />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 flex-1 justify-center">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-cream/80 hover:text-gold transition-colors text-sm font-medium whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4 flex-shrink-0">
            <a
              href="tel:+233553157354"
              className="flex items-center gap-2 text-cream/80 hover:text-gold transition-colors whitespace-nowrap"
            >
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">0553 157 354</span>
            </a>
            <a
              href="#booking"
              className="bg-gold text-navy font-semibold px-4 xl:px-5 py-2 xl:py-2.5 rounded-lg hover:shadow-gold transition-all text-sm whitespace-nowrap"
            >
              Book Now
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden relative z-10 text-cream p-2"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-cream/98 backdrop-blur-lg" />
            <div className="relative h-full flex flex-col items-center justify-center gap-8 pt-20">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-black text-2xl font-serif font-semibold hover:text-gold transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col gap-4 mt-8"
              >
                <a
                  href="tel:+233553157354"
                  className="flex items-center justify-center gap-2 text-black hover:text-gold transition-colors"
                >
                  <Phone className="w-5 h-5 text-black" />
                  <span>0553 157 354</span>
                </a>
                <a
                  href="#booking"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-gold text-navy font-semibold px-8 py-3 rounded-lg text-center"
                >
                  Book Now
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
