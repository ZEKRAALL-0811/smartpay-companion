import { useState } from "react";
import { motion } from "framer-motion";
import { CategoryIcon } from "@/components/CategoryIcon";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { articles, learnTopics } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, Clock, RefreshCw, ExternalLink } from "lucide-react";
import { EmojiIcon } from "@/components/CategoryIcon";

const filterOptions = ["All", "Markets", "Savings", "Crypto", "Tax Tips", "Investing", "Budgeting", "Personal Finance"];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category?: string;
}

export function HubScreen() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("All");
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());

  // Fetch live finance news from edge function
  const { data: liveNews, isLoading: newsLoading, refetch } = useQuery({
    queryKey: ["finance-news"],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/finance-news`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      });
      if (!resp.ok) return [];
      const data = await resp.json();
      return (data.articles || []) as NewsArticle[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // auto-refresh every 10 min
  });

  // Fallback to static articles
  const staticFiltered = filter === "All" ? articles : articles.filter((a) => a.category === filter);
  const featured = articles.find((a) => a.featured);

  const toggleBookmark = (id: number) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <motion.div className="space-y-5 px-4 pb-24 pt-6" variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CategoryIcon name="news" size={24} />
          <h1 className="font-display text-2xl font-bold text-foreground">Finance Hub</h1>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-1 text-xs text-primary font-medium">
          <RefreshCw className={`h-3 w-3 ${newsLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </motion.div>

      {/* Live Finance News */}
      {liveNews && liveNews.length > 0 && (
        <motion.div variants={fadeUp}>
          <h2 className="mb-3 font-display text-lg font-semibold text-foreground flex items-center gap-2"><CategoryIcon name="satellite" size={20} /> Live Finance News</h2>
          <div className="space-y-3">
            {liveNews.slice(0, 8).map((article, i) => (
              <Card key={i} className="transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="block">
                    <p className="text-sm font-semibold text-foreground leading-tight">{article.title}</p>
                    {article.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{article.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">{article.source}</span>
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{new Date(article.publishedAt).toLocaleDateString()}</span>
                      <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                    </div>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {newsLoading && (
        <motion.div variants={fadeUp} className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </motion.div>
      )}

      {/* Filters for static articles */}
      <motion.div variants={fadeUp} className="flex gap-2 overflow-x-auto pb-1 scrollbar-themed">
        {filterOptions.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-all ${
              filter === f ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </motion.div>

      {/* Featured */}
      {filter === "All" && featured && (
        <motion.div variants={fadeUp}>
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="gradient-primary p-6">
              <EmojiIcon emoji={featured.image} size={40} />
              <h2 className="mt-3 font-display text-lg font-bold text-primary-foreground">{featured.title}</h2>
              <div className="mt-2 flex items-center gap-3 text-xs text-primary-foreground/70">
                <span>{featured.category}</span>
                <span>•</span>
                <span>{featured.readTime} read</span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Static Articles */}
      <motion.div variants={fadeUp} className="space-y-3">
        {staticFiltered.filter((a) => !a.featured).map((article) => (
          <Card key={article.id} className="transition-all hover:shadow-md">
            <CardContent className="flex items-start gap-3 p-4">
              <EmojiIcon emoji={article.image} size={28} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground leading-tight">{article.title}</p>
                <div className="mt-1.5 flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">{article.category}</span>
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{article.readTime}</span>
                </div>
              </div>
              <button onClick={() => toggleBookmark(article.id)} className="shrink-0 p-1">
                <Bookmark className={`h-5 w-5 transition-colors ${bookmarks.has(article.id) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
              </button>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Learn Section */}
      <motion.div variants={fadeUp}>
        <h2 className="mb-3 font-display text-lg font-semibold text-foreground flex items-center gap-2"><CategoryIcon name="learn" size={20} /> Learn</h2>
        <div className="space-y-3">
          {learnTopics.map((topic) => (
            <Card key={topic.id} className="border-0 shadow-sm transition-all hover:shadow-md">
              <CardContent className="flex items-start gap-3 p-4">
                <EmojiIcon emoji={topic.emoji} size={24} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{topic.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{topic.subtitle}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
