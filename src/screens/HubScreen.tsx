import { useState } from "react";
import { motion } from "framer-motion";
import { articles, learnTopics } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Bookmark } from "lucide-react";

const filterOptions = ["All", "Savings", "Investing", "Budgeting", "News"];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function HubScreen() {
  const [filter, setFilter] = useState("All");
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());

  const filtered = filter === "All" ? articles : articles.filter((a) => a.category === filter);
  const featured = articles.find((a) => a.featured);

  const toggleBookmark = (id: number) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <motion.div
      className="space-y-5 px-4 pb-24 pt-6"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.h1 variants={fadeUp} className="font-display text-2xl font-bold text-foreground">
        Finance Hub 📰
      </motion.h1>

      {/* Featured */}
      {featured && (
        <motion.div variants={fadeUp}>
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="gradient-primary p-6">
              <span className="text-4xl">{featured.image}</span>
              <h2 className="mt-3 font-display text-lg font-bold text-primary-foreground">
                {featured.title}
              </h2>
              <div className="mt-2 flex items-center gap-3 text-xs text-primary-foreground/70">
                <span>{featured.category}</span>
                <span>•</span>
                <span>{featured.readTime} read</span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Learn Section */}
      <motion.div variants={fadeUp}>
        <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Learn</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {learnTopics.map((topic) => (
            <Card
              key={topic.id}
              className="min-w-[130px] shrink-0 border-0 shadow-sm cursor-pointer transition-all hover:shadow-md active:scale-95"
            >
              <CardContent className="flex flex-col items-center gap-2 p-4">
                <span className="text-2xl">{topic.emoji}</span>
                <span className="text-xs font-medium text-foreground text-center">{topic.title}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex gap-2 overflow-x-auto pb-1">
        {filterOptions.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-all ${
              filter === f
                ? "gradient-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </motion.div>

      {/* News Feed */}
      <motion.div variants={fadeUp} className="space-y-3">
        {filtered
          .filter((a) => !a.featured)
          .map((article) => (
            <Card key={article.id} className="transition-all hover:shadow-md">
              <CardContent className="flex items-start gap-3 p-4">
                <span className="text-3xl shrink-0">{article.image}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground leading-tight">{article.title}</p>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{article.category}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleBookmark(article.id)}
                  className="shrink-0 p-1"
                >
                  <Bookmark
                    className={`h-4 w-4 transition-colors ${
                      bookmarks.has(article.id) ? "fill-primary text-primary" : "text-muted-foreground"
                    }`}
                  />
                </button>
              </CardContent>
            </Card>
          ))}
      </motion.div>
    </motion.div>
  );
}
