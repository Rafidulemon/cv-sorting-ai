export type FAQ = {
  id: string;
  category: "Getting Started" | "Pricing" | "Security" | "Product" | "Integrations";
  question: string;
  answer: string;
};