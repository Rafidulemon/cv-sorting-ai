export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  category: "Product" | "Hiring" | "AI" | "Guides" | "Company";
  date: string;
  readTime: string;
  author: string;
  cover: string;
  href: string;
  featured?: boolean;
};