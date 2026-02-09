import { cn } from "@/lib/utils";

type IconName =
  | "food" | "travel" | "shopping" | "bills" | "entertainment" | "health"
  | "clothing" | "accessories" | "general" | "money" | "chart-up" | "bank"
  | "credit-card" | "clipboard" | "savings" | "investing" | "budgeting"
  | "shield" | "bitcoin" | "government" | "building" | "news" | "learn"
  | "insights" | "pay" | "satellite";

interface CategoryIconProps {
  name: IconName;
  size?: number;
  className?: string;
}

const iconPaths: Record<IconName, { paths: string; viewBox?: string; gradient: [string, string] }> = {
  food: {
    paths: "M12 2c-.6 0-1 .4-1 1v4c0 1.1-.9 2-2 2H8v12c0 .6.4 1 1 1h6c.6 0 1-.4 1-1V9h-1c-1.1 0-2-.9-2-2V3c0-.6-.4-1-1-1zM8 3c0-.6-.4-1-1-1s-1 .4-1 1v5H5c-.6 0-1 .4-1 1v1c0 1.7 1.3 3 3 3v8c0 .6.4 1 1 1s1-.4 1-1v-8c1.7 0 3-1.3 3-3V9c0-.6-.4-1-1-1H8V3z",
    gradient: ["hsl(38 92% 50%)", "hsl(25 85% 45%)"],
  },
  travel: {
    paths: "M18.9 6a1 1 0 0 0-.8-.4h-1.4L13.4 2.3a1 1 0 0 0-1.4 0L8.7 5.6H7.3c-.3 0-.6.2-.8.4L4 9.5c-.2.3-.2.7 0 1l2.5 3.5v5.5c0 .8.7 1.5 1.5 1.5h8c.8 0 1.5-.7 1.5-1.5V14l2.5-3.5c.2-.3.2-.7 0-1L18.9 6zM12 4.4l2 2H10l2-2zM16 19H8v-4h8v4zm1.3-8.5L15 13.5H9l-2.3-3L8.4 8h7.2l1.7 2.5z",
    gradient: ["hsl(200 80% 50%)", "hsl(210 70% 42%)"],
  },
  shopping: {
    paths: "M6 2l-2 6v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-2-6H6zm0 2h12l1.3 4H4.7L6 4zm-2 6h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9zm5 2a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2H9z",
    gradient: ["hsl(280 60% 55%)", "hsl(290 50% 45%)"],
  },
  bills: {
    paths: "M7 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H7zm0 2h10v16H7V4zm2 2v2h6V6H9zm0 4v2h6v-2H9zm0 4v2h4v-2H9z",
    gradient: ["hsl(145 55% 42%)", "hsl(160 50% 38%)"],
  },
  entertainment: {
    paths: "M20 3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h5.5l-1.3 2.5H7v1.5h10v-1.5h-1.2L14.5 17H20a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm-1 12H5V5h14v10zM10 7.5v5l4-2.5-4-2.5z",
    gradient: ["hsl(340 70% 50%)", "hsl(350 60% 42%)"],
  },
  health: {
    paths: "M12 2C8.7 2 6 4.7 6 8c0 4.5 6 11 6 11s6-6.5 6-11c0-3.3-2.7-6-6-6zm0 2c2.2 0 4 1.8 4 4 0 2.8-3 7.2-4 8.7C11 15.2 8 10.8 8 8c0-2.2 1.8-4 4-4zm-1 2v2H9v2h2v2h2v-2h2V8h-2V6h-2z",
    gradient: ["hsl(0 65% 50%)", "hsl(350 60% 42%)"],
  },
  clothing: {
    paths: "M12 2L8 5H4v4l2 2v9h12v-9l2-2V5h-4L12 2zm0 2.5L14.5 7H16v1.5L14 10.5v8.5H10V10.5L8 8.5V7h1.5L12 4.5z",
    gradient: ["hsl(220 65% 55%)", "hsl(230 55% 45%)"],
  },
  accessories: {
    paths: "M12 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 1a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm-1 2h2v3h2v2h-3V7h-1zM4 11H2v2h2v-2zm18 0h-2v2h2v-2zm-11 7H9v2h2v-2zm4 0h-2v2h2v-2z",
    gradient: ["hsl(42 80% 50%)", "hsl(38 75% 42%)"],
  },
  general: {
    paths: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm-1 3v2H9v2h2v6h2V11h2V9h-2V7h-2z",
    gradient: ["hsl(145 65% 46%)", "hsl(160 55% 40%)"],
  },
  money: {
    paths: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 2c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8 3.6-8 8-8zm-1 3v1.3C9.8 8.6 9 9.4 9 10.5c0 1.4 1.2 2 2.5 2.4 1 .3 1.5.6 1.5 1.1s-.7 1-1.5 1c-.9 0-1.5-.5-1.7-1H8c.2 1.4 1.2 2.4 3 2.7V18h2v-1.3c1.2-.3 2-1.2 2-2.4 0-1.6-1.3-2.2-2.7-2.6-.9-.3-1.3-.5-1.3-1s.6-.9 1.5-.9c.7 0 1.3.4 1.5.9h1.8c-.2-1.3-1.2-2.2-2.8-2.5V7h-2z",
    gradient: ["hsl(145 65% 46%)", "hsl(155 60% 40%)"],
  },
  "chart-up": {
    paths: "M3.5 18.5l6-6 4 4 7.5-8.5M14 7h7v7",
    gradient: ["hsl(145 65% 46%)", "hsl(120 55% 42%)"],
  },
  bank: {
    paths: "M12 2L3 7v2h18V7L12 2zm0 2.3L17.5 7h-11L12 4.3zM5 11v6h2v-6H5zm4 0v6h2v-6H9zm4 0v6h2v-6h-2zm4 0v6h2v-6h-2zM3 19v2h18v-2H3z",
    gradient: ["hsl(152 60% 42%)", "hsl(160 55% 36%)"],
  },
  "credit-card": {
    paths: "M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM4 6h16v2H4V6zm0 4h16v8H4v-8zm2 2v2h4v-2H6zm6 0v2h2v-2h-2z",
    gradient: ["hsl(38 92% 50%)", "hsl(42 85% 42%)"],
  },
  clipboard: {
    paths: "M16 3H8a1 1 0 0 0-1 1v1H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2V4a1 1 0 0 0-1-1zm-7 2h6v2H9V5zM5 7h2v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7h2v13H5V7zm3 4v2h8v-2H8zm0 4v2h5v-2H8z",
    gradient: ["hsl(280 60% 55%)", "hsl(275 50% 45%)"],
  },
  savings: {
    gradient: ["hsl(145 65% 46%)", "hsl(155 60% 38%)"],
    paths: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 2c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8 3.6-8 8-8zm-1 4v4.6l-3.3 2 1 1.7L12 14V8h-2z",
  },
  investing: {
    gradient: ["hsl(145 65% 46%)", "hsl(120 55% 42%)"],
    paths: "M3 20h18v2H3v-2zm2-2h2V9H5v9zm4 0h2V4H9v14zm4 0h2v-6h-2v6zm4 0h2v-3h-2v3z",
  },
  budgeting: {
    gradient: ["hsl(200 70% 50%)", "hsl(210 60% 42%)"],
    paths: "M3 3v18h18V3H3zm2 2h14v14H5V5zm2 3v2h10V8H7zm0 4v2h7v-2H7zm0 4v2h10v-2H7z",
  },
  shield: {
    gradient: ["hsl(200 70% 50%)", "hsl(215 65% 42%)"],
    paths: "M12 2L4 5v6c0 5.5 3.4 10.7 8 12 4.6-1.3 8-6.5 8-12V5l-8-3zm0 2.2l6 2.2v4.8c0 4.5-2.8 8.7-6 9.8-3.2-1.1-6-5.3-6-9.8V6.4l6-2.2zm-1 5.8v4h2v-4h-2zm0 5v2h2v-2h-2z",
  },
  bitcoin: {
    gradient: ["hsl(38 92% 50%)", "hsl(30 85% 42%)"],
    paths: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 2c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8 3.6-8 8-8zm-1 3v1h-1v2h1v4h-1v2h1v1h2v-1h1c1.1 0 2-.9 2-2 0-.7-.4-1.4-1-1.7.3-.4.5-.8.5-1.3 0-1.1-.9-2-2-2h-1V7h-2zm1 3h1c.6 0 1 .4 1 1s-.4 1-1 1h-1v-2zm0 4h1c.6 0 1 .4 1 1s-.4 1-1 1h-1v-2z",
  },
  government: {
    gradient: ["hsl(220 50% 50%)", "hsl(230 45% 42%)"],
    paths: "M12 2L2 7h2v2h16V7h2L12 2zm0 2.3L17.5 7h-11L12 4.3zM4 11h2v7H4v-7zm4 0h2v7H8v-7zm4 0h2v7h-2v-7zm4 0h2v7h-2v-7zM2 20h20v2H2v-2z",
  },
  building: {
    gradient: ["hsl(180 50% 42%)", "hsl(190 45% 36%)"],
    paths: "M5 2v20h6v-4h2v4h6V2H5zm2 2h10v16h-2v-4H9v4H7V4zm2 2v2h2V6H9zm4 0v2h2V6h-2zM9 10v2h2v-2H9zm4 0v2h2v-2h-2zM9 14v2h2v-2H9zm4 0v2h2v-2h-2z",
  },
  news: {
    gradient: ["hsl(200 70% 50%)", "hsl(210 60% 42%)"],
    paths: "M20 3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM4 5h16v14H4V5zm2 2v4h5V7H6zm7 0v2h5V7h-5zm0 3v2h5v-2h-5zM6 13v2h12v-2H6zm0 3v2h8v-2H6z",
  },
  learn: {
    gradient: ["hsl(245 58% 51%)", "hsl(255 50% 42%)"],
    paths: "M12 3L1 9l4 2.2v6L12 21l7-3.8v-6L21 9l-9-6zm0 2.3L18 9l-6 3.7L6 9l6-3.7zM7 11.5l5 3 5-3v4.3L12 18.8 7 15.8v-4.3z",
  },
  insights: {
    gradient: ["hsl(200 70% 50%)", "hsl(210 60% 42%)"],
    paths: "M3 20h18v2H3v-2zm2-2h2v-5H5v5zm4 0h2V8H9v10zm4 0h2v-7h-2v7zm4 0h2V5h-2v13z",
  },
  pay: {
    gradient: ["hsl(145 65% 46%)", "hsl(160 55% 40%)"],
    paths: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 2c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8 3.6-8 8-8zm-1 4v2H9v2h2v4h2v-4h2v-2h-2V8h-2z",
  },
  satellite: {
    gradient: ["hsl(0 65% 50%)", "hsl(10 60% 42%)"],
    paths: "M6 12c0-3.3 2.7-6 6-6V4c-4.4 0-8 3.6-8 8h2zm2 0c0-2.2 1.8-4 4-4V6c-3.3 0-6 2.7-6 6h2zm6-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm4 2c0 3.3-2.7 6-6 6v2c4.4 0 8-3.6 8-8h-2zm-2 0c0 2.2-1.8 4-4 4v2c3.3 0 6-2.7 6-6h-2z",
  },
};

// Map emoji strings to icon names for backward compat
const emojiToIcon: Record<string, IconName> = {
  "🍔": "food", "🍕": "food", "☕": "food",
  "🚗": "travel", "🚕": "travel",
  "🛍️": "shopping", "🛒": "shopping",
  "📱": "bills",
  "🎬": "entertainment",
  "💊": "health",
  "👕": "clothing",
  "⌚": "accessories",
  "💰": "money", "💸": "money",
  "📈": "chart-up",
  "🏦": "bank",
  "💳": "credit-card",
  "📋": "clipboard",
  "📊": "insights",
  "🛡️": "shield",
  "₿": "bitcoin",
  "🏛️": "government",
  "🏗️": "building",
  "📰": "news",
  "📚": "learn",
  "📡": "satellite",
};

export function resolveIconName(emojiOrName: string): IconName {
  return emojiToIcon[emojiOrName] || (emojiOrName as IconName) || "general";
}

export function CategoryIcon({ name, size = 20, className }: CategoryIconProps) {
  const icon = iconPaths[name] || iconPaths.general;
  const id = `ci-${name}-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={icon.viewBox || "0 0 24 24"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={icon.gradient[0]} />
          <stop offset="100%" stopColor={icon.gradient[1]} />
        </linearGradient>
      </defs>
      <path d={icon.paths} fill={`url(#${id})`} />
    </svg>
  );
}

// Convenience: render icon from an emoji string
export function EmojiIcon({ emoji, size = 20, className }: { emoji: string; size?: number; className?: string }) {
  const name = resolveIconName(emoji);
  return <CategoryIcon name={name} size={size} className={className} />;
}
