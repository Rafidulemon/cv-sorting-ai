
type Testimonial = {
  quote: string;
  name: string;
  company: string;
  avatar: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "carriX helps us instantly score every resume better than any human ever could. This has radically improved our hiring pipeline.",
    name: "Alden De Rosario",
    company: "CustomGPT.ai",
    avatar: "https://i.pravatar.cc/100?img=12",
  },
  {
    quote:
      "The automatic scoring has cut down our screening time by over 60%.",
    name: "Matt Karp",
    company: "PxBot",
    avatar: "https://i.pravatar.cc/100?img=32",
  },
  {
    quote:
      "We needed AI to fight AI, and carriX gives us just that. The accuracy of the candidate scores is unparalleled.",
    name: "Lucinda Linde",
    company: "Ironside Group",
    avatar: "https://i.pravatar.cc/100?img=47",
  },
];

const TestimonialCard = ({
  testimonial,
  active = false,
}: {
  testimonial: Testimonial;
  active?: boolean;
}) => {
  return (
    <div
      className={`rounded-3xl bg-white p-10 text-center transition-all duration-300
        ${
          active
            ? "opacity-100 shadow-[0_30px_80px_rgba(0,0,0,0.18)] scale-100"
            : "opacity-30 blur-[0.5px] scale-95"
        }`}
    >
      <p className="text-lg leading-relaxed text-zinc-900">
        “{testimonial.quote}”
      </p>

      <div className="mt-8 flex items-center justify-center gap-4">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="h-12 w-12 rounded-full object-cover"
        />
        <div className="text-left">
          <div className="font-semibold text-zinc-900">
            {testimonial.name}
          </div>
          <div className="text-sm text-zinc-500">
            {testimonial.company}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TestimonialsSection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Heading */}
        <h2 className="text-center text-4xl font-extrabold text-zinc-900">
          Our Customers Love Us!
        </h2>

        {/* Cards */}
        <div className="relative mt-16 grid grid-cols-1 gap-10 md:grid-cols-3 items-center">
          <TestimonialCard testimonial={testimonials[0]} />
          <TestimonialCard testimonial={testimonials[1]} active />
          <TestimonialCard testimonial={testimonials[2]} />
        </div>

        {/* Dots */}
        <div className="mt-12 flex justify-center gap-3">
          <span className="h-3 w-3 rounded-full bg-violet-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-violet-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-violet-300" />
        </div>
      </div>
    </section>
  );
}
