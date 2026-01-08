import { WaveDivider } from "@/app/functions/WaveDivider";
import Button from "@/app/components/buttons/Button";
const HomeHero = () => {
  return (
    <section id="home-hero" className="relative overflow-hidden bg-hero-base">
      <div className="absolute inset-0 bg-hero-overlay" />

      <div className="relative mx-auto max-w-6xl px-6 pt-40 pb-20 text-center">
        <h1 className="mx-auto max-w-4xl text-white font-extrabold tracking-tight leading-tight text-4xl md:text-6xl">
          Hire Smarter and Faster with carriX
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-white/75 text-base md:text-lg">
          Automatically screen resumes, rank candidates, and build shortlists in
          minutes with next-generation AI hiring technology.
        </p>

        <div className="mt-10">
          <Button href="/auth/signup" variant="hero">
            Start for Free
          </Button>
        </div>
      </div>

      {/* Wave */}
      <WaveDivider />
    </section>
  );
};

export default HomeHero;
