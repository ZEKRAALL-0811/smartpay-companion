import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { articles, learnTopics } from "@/data/mockData";
import { articleContent, learnContent } from "@/data/articleContent";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArticleDetail } from "@/components/ArticleDetail";
import { Bookmark, Clock, RefreshCw, ExternalLink } from "lucide-react";

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

type DetailView =
  | { type: "article"; id: number }
  | { type: "learn"; id: number }
  | null;

export function HubScreen() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("All");
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [detailView, setDetailView] = useState<DetailView>(null);

  const { data: liveNews, isLoading: newsLoading, isFetching, refetch } = useQuery({
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
    staleTime: 0,
  });

  const staticFiltered = filter === "All" ? articles : articles.filter((a) => a.category === filter);
  const featured = articles.find((a) => a.featured);

  const toggleBookmark = (id: number) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Detail view rendering
  if (detailView) {
    if (detailView.type === "article") {
      const article = articles.find((a) => a.id === detailView.id);
      const content = articleContent[detailView.id];
      if (article && content) {
        return (
          <AnimatePresence mode="wait">
            <ArticleDetail
              key={`article-${detailView.id}`}
              title={article.title}
              emoji={article.image}
              category={article.category}
              readTime={article.readTime}
              sections={content.sections}
              onBack={() => setDetailView(null)}
            />
          </AnimatePresence>
        );
      }
    }
    if (detailView.type === "learn") {
      const topic = learnTopics.find((t) => t.id === detailView.id);
      const content = learnContent[detailView.id];
      if (topic && content) {
        return (
          <AnimatePresence mode="wait">
            <ArticleDetail
              key={`learn-${detailView.id}`}
              title={topic.title}
              emoji={topic.emoji}
              category="Learn"
              readTime="5 min"
              sections={content.sections}
              onBack={() => setDetailView(null)}
            />
          </AnimatePresence>
        );
      }
    }
  }

  return (
    <motion.div className="space-y-5 px-4 pb-24 pt-6" variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Finance Hub 📰</h1>
        <button onClick={() => refetch()} disabled={isFetching} className="flex items-center gap-1 text-xs text-primary font-medium disabled:opacity-50">
          <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </motion.div>

      {/* Live Finance News */}
      {liveNews && liveNews.length > 0 && (
        <motion.div variants={fadeUp}>
          <h2 className="mb-3 font-display text-lg font-semibold text-foreground">📡 Live Finance News</h2>
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

      {/* Filters */}
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
          <Card
            className="overflow-hidden border-0 shadow-lg cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => setDetailView({ type: "article", id: featured.id })}
          >
            <div className="gradient-primary p-6">
              <span className="text-4xl">{featured.image}</span>
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
          <Card
            key={article.id}
            className="transition-all hover:shadow-md cursor-pointer active:scale-[0.98]"
            onClick={() => setDetailView({ type: "article", id: article.id })}
          >
            <CardContent className="flex items-start gap-3 p-4">
              <span className="text-3xl shrink-0">{article.image}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground leading-tight">{article.title}</p>
                <div className="mt-1.5 flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">{article.category}</span>
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{article.readTime}</span>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleBookmark(article.id); }}
                className="shrink-0 p-1"
              >
                <Bookmark className={`h-5 w-5 transition-colors ${bookmarks.has(article.id) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
              </button>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Learn Section */}
      <motion.div variants={fadeUp}>
        <h2 className="mb-3 font-display text-lg font-semibold text-foreground">📚 Learn</h2>
        <div className="space-y-3">
          {learnTopics.map((topic) => (
            <Card
              key={topic.id}
              className="border-0 shadow-sm transition-all hover:shadow-md cursor-pointer active:scale-[0.98]"
              onClick={() => setDetailView({ type: "learn", id: topic.id })}
            >
              <CardContent className="flex items-start gap-3 p-4">
                <span className="text-2xl shrink-0">{topic.emoji}</span>
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
