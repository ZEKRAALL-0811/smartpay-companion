import { motion } from "framer-motion";
import { ArrowLeft, Clock, Bookmark } from "lucide-react";

interface ArticleSection {
  heading?: string;
  text: string;
}

interface ArticleDetailProps {
  title: string;
  emoji: string;
  category: string;
  readTime: string;
  sections: ArticleSection[];
  onBack: () => void;
}

export function ArticleDetail({ title, emoji, category, readTime, sections, onBack }: ArticleDetailProps) {
  return (
    <motion.div
      className="px-4 pb-24 pt-4"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25 }}
    >
      <button onClick={onBack} className="mb-4 flex items-center gap-2 text-sm font-medium text-primary">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="gradient-primary rounded-2xl p-6 mb-6">
        <span className="text-4xl">{emoji}</span>
        <h1 className="mt-3 font-display text-xl font-bold text-primary-foreground">{title}</h1>
        <div className="mt-2 flex items-center gap-3 text-xs text-primary-foreground/70">
          <span className="rounded-full bg-primary-foreground/20 px-2.5 py-0.5">{category}</span>
          <Clock className="h-3 w-3" />
          <span>{readTime} read</span>
        </div>
      </div>

      <div className="space-y-5">
        {sections.map((section, i) => (
          <div key={i}>
            {section.heading && (
              <h2 className="mb-2 font-display text-base font-semibold text-foreground">{section.heading}</h2>
            )}
            <p className="text-sm leading-relaxed text-muted-foreground">{section.text}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
