import { Clock3, Tag } from "lucide-react";
import { BlogPost } from "@/app/types/blogPost";
import { formatDate } from "./formatDate";

export default function PostCard({ post }: { post: BlogPost }) {
  return (
    <a
      href={post.href}
      className="group overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-card-soft transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(24,27,49,0.14)]"
    >
      <div className="relative">
        <img
          src={post.cover}
          alt={post.title}
          className="h-48 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-zinc-900 shadow-sm">
          <Tag className="h-3.5 w-3.5 text-primary-500" />
          {post.category}
        </div>
      </div>

      <div className="p-6">
        <div className="text-lg font-semibold leading-snug text-zinc-900 transition group-hover:text-primary-700">
          {post.title}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">{post.excerpt}</p>

        <div className="mt-5 flex items-center gap-3 text-xs text-zinc-500">
          <span>{formatDate(post.date)}</span>
          <span className="h-1 w-1 rounded-full bg-zinc-300" />
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            {post.readTime}
          </span>
          <span className="h-1 w-1 rounded-full bg-zinc-300" />
          <span>By {post.author}</span>
        </div>
      </div>
    </a>
  );
}
