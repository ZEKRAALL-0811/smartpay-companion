export const user = {
  name: "Zaheer",
  avatar: "Z",
};

export const todaySpend = 840;

export const categorySnapshot = [
  { emoji: "🍔", label: "Food", amount: 380 },
  { emoji: "🚗", label: "Travel", amount: 260 },
  { emoji: "🛍️", label: "Shopping", amount: 200 },
];

export const smartAlert = {
  message: "You're close to your food budget this week",
  progress: 78,
  category: "Food",
};

export const recentTransactions = [
  { id: 1, icon: "🍕", merchant: "Domino's Pizza", amount: -249, time: "2:30 PM", category: "Food" },
  { id: 2, icon: "🚕", merchant: "Uber Ride", amount: -180, time: "11:15 AM", category: "Travel" },
  { id: 3, icon: "☕", merchant: "Starbucks", amount: -131, time: "9:00 AM", category: "Food" },
  { id: 4, icon: "🛒", merchant: "Amazon", amount: -280, time: "Yesterday", category: "Shopping" },
];

export const contacts = [
  { id: 1, name: "Priya", avatar: "P", color: "hsl(245 58% 51%)" },
  { id: 2, name: "Arjun", avatar: "A", color: "hsl(152 60% 42%)" },
  { id: 3, name: "Neha", avatar: "N", color: "hsl(38 92% 50%)" },
  { id: 4, name: "Rahul", avatar: "R", color: "hsl(0 72% 51%)" },
  { id: 5, name: "Meera", avatar: "M", color: "hsl(280 60% 55%)" },
];

export const categories = [
  { emoji: "🍔", label: "Food" },
  { emoji: "🚗", label: "Travel" },
  { emoji: "🛍️", label: "Shopping" },
  { emoji: "📱", label: "Bills" },
  { emoji: "🎬", label: "Entertainment" },
  { emoji: "💊", label: "Health" },
];

export const insightData = {
  today: {
    total: 840,
    categories: [
      { name: "Food", amount: 380, percent: 45, trend: 18, color: "hsl(38 92% 50%)" },
      { name: "Travel", amount: 260, percent: 31, trend: -5, color: "hsl(245 58% 51%)" },
      { name: "Shopping", amount: 200, percent: 24, trend: 12, color: "hsl(280 60% 55%)" },
    ],
    daily: [
      { day: "Mon", amount: 620 },
      { day: "Tue", amount: 450 },
      { day: "Wed", amount: 780 },
      { day: "Thu", amount: 340 },
      { day: "Fri", amount: 920 },
      { day: "Sat", amount: 550 },
      { day: "Sun", amount: 840 },
    ],
  },
  week: {
    total: 4500,
    categories: [
      { name: "Food", amount: 1800, percent: 40, trend: 18, color: "hsl(38 92% 50%)" },
      { name: "Travel", amount: 1200, percent: 27, trend: -5, color: "hsl(245 58% 51%)" },
      { name: "Shopping", amount: 900, percent: 20, trend: 12, color: "hsl(280 60% 55%)" },
      { name: "Bills", amount: 600, percent: 13, trend: 0, color: "hsl(152 60% 42%)" },
    ],
    daily: [
      { day: "Mon", amount: 620 },
      { day: "Tue", amount: 450 },
      { day: "Wed", amount: 780 },
      { day: "Thu", amount: 340 },
      { day: "Fri", amount: 920 },
      { day: "Sat", amount: 550 },
      { day: "Sun", amount: 840 },
    ],
  },
  month: {
    total: 18200,
    categories: [
      { name: "Food", amount: 7280, percent: 40, trend: 8, color: "hsl(38 92% 50%)" },
      { name: "Travel", amount: 4550, percent: 25, trend: -3, color: "hsl(245 58% 51%)" },
      { name: "Shopping", amount: 3640, percent: 20, trend: 15, color: "hsl(280 60% 55%)" },
      { name: "Bills", amount: 1820, percent: 10, trend: 0, color: "hsl(152 60% 42%)" },
      { name: "Entertainment", amount: 910, percent: 5, trend: 22, color: "hsl(0 72% 51%)" },
    ],
    daily: [
      { day: "W1", amount: 4200 },
      { day: "W2", amount: 5100 },
      { day: "W3", amount: 4400 },
      { day: "W4", amount: 4500 },
    ],
  },
};

export const budgets = [
  { category: "Food", spent: 7280, limit: 8000, emoji: "🍔" },
  { category: "Travel", spent: 4550, limit: 5000, emoji: "🚗" },
  { category: "Shopping", spent: 3640, limit: 3000, emoji: "🛍️" },
  { category: "Bills", spent: 1820, limit: 4000, emoji: "📱" },
];

export const coachMessages = [
  {
    id: 1,
    type: "bot" as const,
    text: "Hey Zaheer! 👋 I've been looking at your spending this week. Here's what I found:",
  },
  {
    id: 2,
    type: "bot" as const,
    text: "You spent 18% more on food this week compared to last week. 🍔 Try cooking at home twice more — that could save you around ₹400!",
  },
  {
    id: 3,
    type: "bot" as const,
    text: "Great news though — your travel spending is down 5%! 🎉 Keep it up!",
    hasChart: true,
  },
];

export const quickPrompts = [
  "How am I doing? 📊",
  "Save more tips 💡",
  "Weekly summary 📋",
  "Budget check ✅",
];

export const coachResponses: Record<string, string> = {
  "How am I doing? 📊": "You're doing pretty well, Zaheer! 🌟 Your overall spending is within budget for 3 out of 4 categories. Shopping is slightly over — try a no-spend weekend to balance it out!",
  "Save more tips 💡": "Here are 3 quick wins: 1️⃣ Pack lunch twice a week (saves ~₹600/month), 2️⃣ Use public transport on short trips (saves ~₹300/month), 3️⃣ Set up auto-transfer of ₹500 to savings on payday!",
  "Weekly summary 📋": "This week you spent ₹4,500 total. Food was your biggest category at ₹1,800 (40%). You had 12 transactions, with the largest being ₹1,200 for electronics. Your daily average was ₹643.",
  "Budget check ✅": "📊 Budget Status:\n✅ Food: ₹7,280 / ₹8,000 (91%)\n✅ Travel: ₹4,550 / ₹5,000 (91%)\n🔴 Shopping: ₹3,640 / ₹3,000 (121%)\n✅ Bills: ₹1,820 / ₹4,000 (46%)",
};

export const articles = [
  {
    id: 1,
    title: "5 Smart Ways to Save Money Without Sacrificing Fun",
    category: "Savings",
    readTime: "4 min",
    featured: true,
    image: "💰",
  },
  {
    id: 2,
    title: "Beginner's Guide to Mutual Funds in India",
    category: "Investing",
    readTime: "6 min",
    featured: false,
    image: "📈",
  },
  {
    id: 3,
    title: "The 50/30/20 Budgeting Rule Explained",
    category: "Budgeting",
    readTime: "3 min",
    featured: false,
    image: "📊",
  },
  {
    id: 4,
    title: "RBI Keeps Rates Steady: What It Means for You",
    category: "News",
    readTime: "2 min",
    featured: false,
    image: "🏦",
  },
  {
    id: 5,
    title: "Emergency Fund: How Much Do You Really Need?",
    category: "Savings",
    readTime: "5 min",
    featured: false,
    image: "🛡️",
  },
];

export const learnTopics = [
  { id: 1, title: "Budgeting 101", emoji: "📝", color: "hsl(245 58% 51%)" },
  { id: 2, title: "Investing Basics", emoji: "📈", color: "hsl(152 60% 42%)" },
  { id: 3, title: "Tax Saving Tips", emoji: "🧾", color: "hsl(38 92% 50%)" },
  { id: 4, title: "Credit Score", emoji: "💳", color: "hsl(280 60% 55%)" },
];
