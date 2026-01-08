import { ArrowRight, Clock3 } from "lucide-react";
import { BlogPost } from "@/app/types/blogPost";
import { formatDate } from "./formatDate";

export default function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <a
      href={post.href}
      className="group relative overflow-hidden rounded-4xl bg-[#0f1a35] text-white shadow-[0_25px_70px_rgba(0,0,0,0.2)]"
    >
      <div className="absolute inset-0 opacity-50">
        <img src={post.cover} alt={post.title} className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(24,10,42,0.9),rgba(24,10,42,0.55))]" />
      <div className="absolute inset-0 bg-[radial-gradient(800px_320px_at_20%_0%,rgba(216,8,128,0.3),transparent)]" />

      <div className="relative p-10 md:p-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white/90 ring-1 ring-white/15">
          Featured • {post.category}
        </div>

        <h2 className="mt-6 max-w-3xl text-3xl md:text-4xl font-extrabold leading-tight">
          {post.title}
        </h2>

        <p className="mt-4 max-w-2xl text-white/75 leading-relaxed">{post.excerpt}</p>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/80">
          <span>{formatDate(post.date)}</span>
          <span className="h-1 w-1 rounded-full bg-white/40" />
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-4 w-4" />
            {post.readTime}
          </span>
          <span className="h-1 w-1 rounded-full bg-white/40" />
          <span>By {post.author}</span>
        </div>

        <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(216,8,128,0.25)] transition group-hover:translate-y-[-1px] group-hover:bg-primary-400">
          Read article <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </a>
  );
}
