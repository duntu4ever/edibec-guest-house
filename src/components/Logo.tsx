import { motion } from "framer-motion";

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
}

const Logo = ({ variant = "dark", className = "" }: LogoProps) => {
  const textColor = variant === "light" ? "text-cream" : "text-navy";

  return (
    <motion.div 
      className={`flex items-center gap-2 sm:gap-3 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo Image - Responsive sizing */}
      <div className="relative flex-shrink-0">
        <img 
          src="/logo.png" 
          alt="Edibec Guest House Logo" 
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 transition-transform duration-300 hover:scale-105 object-contain"
        />
      </div>

      {/* Text - Responsive sizing */}
      <div className="flex flex-col">
        <span className={`font-serif text-lg sm:text-xl md:text-2xl font-bold tracking-wider ${textColor}`}>
          EDIBEC
        </span>
        <span className={`text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.3em] uppercase ${textColor} opacity-70`}>
          Guest House
        </span>
      </div>
    </motion.div>
  );
};

export default Logo;
