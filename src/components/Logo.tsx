import { motion } from "framer-motion";

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
}

const Logo = ({ variant = "dark", className = "" }: LogoProps) => {
  const textColor = variant === "light" ? "text-cream" : "text-navy";
  const accentColor = variant === "light" ? "text-gold-light" : "text-gold";

  return (
    <motion.div 
      className={`flex items-center gap-2 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo Icon - Stylized House/Key */}
      <div className={`relative ${accentColor}`}>
        <svg 
          width="40" 
          height="40" 
          viewBox="0 0 40 40" 
          fill="none" 
          className="transition-transform duration-300 hover:scale-105"
        >
          {/* House outline */}
          <path 
            d="M20 4L4 16V36H36V16L20 4Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            fill="none"
          />
          {/* Key hole circle */}
          <circle 
            cx="20" 
            cy="22" 
            r="4" 
            stroke="currentColor" 
            strokeWidth="2" 
            fill="none"
          />
          {/* Key stem */}
          <line 
            x1="20" 
            y1="26" 
            x2="20" 
            y2="32" 
            stroke="currentColor" 
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Text */}
      <div className="flex flex-col">
        <span className={`font-serif text-2xl font-bold tracking-wider ${textColor}`}>
          EDIBEC
        </span>
        <span className={`text-[10px] tracking-[0.3em] uppercase ${textColor} opacity-70`}>
          Guest House
        </span>
      </div>
    </motion.div>
  );
};

export default Logo;
