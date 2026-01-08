import React from "react";
import { CheckCircle, Laptop, Check, Briefcase } from "lucide-react";

const FeatureCard = ({
  icon,
  title,
  description,
  showButton = true,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  showButton?: boolean;
}) => {
  return (
    <div className="flex flex-col items-center text-center max-w-sm">
      {/* Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-blue-100 bg-blue-50">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-zinc-900">{title}</h3>

      {/* Description */}
      <p className="mt-3 text-zinc-600 leading-relaxed">
        {description}
      </p>

      {/* CTA */}
      {showButton && (
        <a
          href="#"
          className="mt-6 inline-flex items-center justify-center
                     rounded-lg border border-blue-500 px-6 py-2
                     text-sm font-medium text-blue-600
                     hover:bg-blue-50 transition"
        >
          Learn More
        </a>
      )}
    </div>
  );
};

const FeaturesSection = () => {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        {/* Heading */}
        <h2 className="text-center text-3xl md:text-4xl font-bold text-zinc-900">
          Effortlessly Identify Top Talent
        </h2>

        {/* Bullet points */}
        <div className="mt-6 flex flex-col items-center gap-3 text-zinc-600">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-500" />
            <span>Upload Job Description and list of candidate CVs</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-500" />
            <span>View and download the sorted list of best candidates</span>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px w-full bg-zinc-200" />

        {/* FEATURES label */}
        <div className="flex justify-center">
          <span className="rounded-md bg-blue-50 px-6 py-2 text-sm font-semibold tracking-widest text-blue-600">
            FEATURES
          </span>
        </div>

        {/* Cards */}
        <div className="mt-16 grid gap-14 md:grid-cols-3">
          <FeatureCard
            icon={<Laptop className="h-10 w-10 text-blue-500" />}
            title="Automate Screening"
            description="Reduce manual resume reviews with our AI-driven solution, increasing efficiency."
          />

          <FeatureCard
            icon={<Check className="h-10 w-10 text-pink-500" />}
            title="Improve Accuracy"
            description="Identify the best candidates with precision using advanced machine learning algorithms, and minimize discrimination."
          />

          <FeatureCard
            icon={<Briefcase className="h-10 w-10 text-violet-500" />}
            title="Save Time"
            description="Accelerate your recruitment cycle, allowing your team to concentrate on strategic tasks."
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
