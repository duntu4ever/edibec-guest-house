import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Clock, CreditCard, Shield, Volume2 } from "lucide-react";

const rules = [
  {
    id: "check-in-out",
    icon: Clock,
    title: "Check-In & Check-Out",
    content: [
      "Check-out time: 12:00 Noon",
      "Late check-out may incur an additional night charge",
      "Early check-in available upon request (subject to availability)",
    ],
  },
  {
    id: "payment",
    icon: CreditCard,
    title: "Payment Policy",
    content: [
      "All bills to be settled upon arrival or in advance",
      "We accept cash and mobile money payments",
      "Personal cheques are not accepted",
    ],
  },
  {
    id: "security",
    icon: Shield,
    title: "Security & Safety",
    content: [
      "Keys must be returned to reception when leaving the premises",
      "Rooms are strictly for registered guests only",
      "Visitors must be received in the lobby area",
      "No smoking inside the rooms",
      "Pets are not permitted",
    ],
  },
  {
    id: "comfort",
    icon: Volume2,
    title: "Guest Comfort",
    content: [
      "Quiet hours: 10:00 PM – 6:00 AM",
      "Please respect other guests' peace and privacy",
      "Room service available during operating hours",
    ],
  },
];

const HouseRules = () => {
  return (
    <section id="rules" className="section-padding bg-cream">
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
            For Your Comfort
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-navy font-bold mt-3 mb-4">
            House Guidelines
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            To ensure a pleasant stay for all our guests, we kindly ask that you observe these guidelines
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {rules.map((rule) => (
              <AccordionItem
                key={rule.id}
                value={rule.id}
                className="bg-card rounded-xl border border-border/50 px-6 overflow-hidden"
              >
                <AccordionTrigger className="hover:no-underline py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
                      <rule.icon className="w-5 h-5 text-gold" />
                    </div>
                    <span className="font-serif text-lg text-foreground font-semibold text-left">
                      {rule.title}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-5">
                  <ul className="space-y-2 pl-14">
                    {rule.content.map((item, index) => (
                      <li
                        key={index}
                        className="text-muted-foreground flex items-start gap-2"
                      >
                        <span className="text-gold mt-1.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default HouseRules;
