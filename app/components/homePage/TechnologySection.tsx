import React from "react";
import { MessageCircle, Lightbulb, Rocket } from "lucide-react";

const TechCard = ({
  icon,
  title,
  description,
  highlighted = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlighted?: boolean;
}) => {
  return (
    <div
      className={`flex flex-col items-center text-center max-w-sm rounded-xl
        ${highlighted ? "border border-zinc-200 bg-white shadow-lg p-10" : "p-10"}`}
    >
      {/* Icon */}
      <div
        className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full
        ${highlighted ? "border border-pink-200 bg-pink-50" : "border border-blue-100 bg-blue-50"}`}
      >
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-zinc-900">
        {title}
      </h3>

      {/* Description */}
      <p className="mt-3 text-zinc-600 leading-relaxed">
        {description}
      </p>

      {/* CTA */}
      <a
        href="#"
        className="mt-6 inline-flex items-center justify-center
                   rounded-lg border border-blue-500 px-6 py-2
                   text-sm font-medium text-blue-600
                   hover:bg-blue-50 transition"
      >
        Learn More
      </a>
    </div>
  );
};

const TechnologySection = () => {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Top label */}
        <div className="flex justify-center mb-16">
          <span className="rounded-md bg-blue-50 px-6 py-2 text-sm font-semibold tracking-widest text-blue-600">
            LEARN MORE ABOUT OUR TECHNOLOGY
          </span>
        </div>

        {/* Cards */}
        <div className="grid gap-16 md:grid-cols-3 items-start">
          <TechCard
            icon={<MessageCircle className="h-10 w-10 text-blue-500" />}
            title="AI-Powered Analysis"
            description="Leverage sophisticated AI to screen resumes quickly and accurately."
          />

          <TechCard
            highlighted
            icon={<Lightbulb className="h-10 w-10 text-pink-500" />}
            title="Customizable Criteria"
            description="Tailor the screening process to match your specific job requirements."
          />

          <TechCard
            icon={<Rocket className="h-10 w-10 text-violet-500" />}
            title="Detailed Reporting"
            description="Receive detailed reports on candidate matches and screening outcomes."
          />
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;
