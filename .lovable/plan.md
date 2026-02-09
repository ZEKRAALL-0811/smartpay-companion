

# SmartPay Tracker — Implementation Plan

## Overview
A mobile-first financial management app with 5 main tabs, focused on storytelling over raw numbers, with a friendly and engaging UI. All data will be mock/static (no backend needed).

---

## Design System
- **Color palette**: Soft gradients — primary indigo/purple accent, green for safe, amber for warning, red for over-budget
- **Typography**: Clean sans-serif, large friendly headings, smaller muted subtexts
- **Cards**: Rounded corners with subtle shadows, light background tints per category
- **Emojis & icons**: Used throughout to soften the financial tone
- **Animations**: Fade-in on mount, animated counters, smooth tab transitions, confetti on payment success

---

## Screen 1: Home Dashboard 🏠
The hero screen — first impression matters most.

- **Greeting header**: "Good morning, Zaheer ☀️" with avatar
- **Today's spend card**: Large animated counter (₹0 → ₹840) with a subtle gradient background
- **Mini spend snapshot**: 3 category pills (🍔 Food, 🚗 Travel, 🛍️ Shopping) with small amounts
- **Smart alert card**: Contextual nudge — "You're close to your food budget this week" with a progress bar
- **Recent transactions list**: 3-4 items with icons, merchant name, amount, and time
- **Quick actions row**: Pay, Scan, Request buttons

## Screen 2: Pay Screen 💸
Familiar payment flow with satisfying feedback.

- **QR scan placeholder**: Camera-style frame with "Scan to Pay" overlay
- **Pay to contact**: Search bar + recent contacts as circular avatars
- **Amount input**: Large number pad style input with currency symbol
- **Category selector**: Horizontal scrollable chips (Food, Travel, Shopping, Bills, etc.)
- **Pay button**: Large, prominent with ripple effect
- **Success state**: Full-screen checkmark animation with confetti, amount, and recipient shown
- **Receipt view**: Clean card with transaction details and a "Done" button

## Screen 3: Insights 📊
Visual-first spending analysis.

- **Time filter tabs**: Today / This Week / This Month with smooth underline indicator
- **Donut chart**: Category breakdown with color coding and center total
- **Category breakdown list**: Each row shows icon, name, amount, percentage, and trend arrow (↑18%)
- **Budget progress bars**: Per-category bars color-coded (green/yellow/red)
- **Spending trend**: Simple line/bar chart showing daily spend for the selected period
- **Skeleton loaders**: Shown briefly on tab switch for premium feel

## Screen 4: AI Coach 🤖
The "wow factor" — feels interactive and alive.

- **Chat-style interface**: Message bubbles from the AI coach with typing indicator animation
- **Personalized tips**: "You spent 18% more on food this week. Try cooking at home twice more!" with emoji
- **Quick prompt chips**: "How am I doing?", "Save more tips", "Weekly summary"
- **Animated coach avatar**: Subtle floating/breathing animation
- **Insight cards inline**: Mini charts or stats embedded within chat messages
- **Input field**: Users can type questions (responses are pre-scripted mock data)

## Screen 5: Finance Hub 📰
Educational content and financial news.

- **Featured article card**: Large hero card with image placeholder, title, and read time
- **News feed**: Scrollable list of financial news cards with thumbnails
- **Learn section**: Horizontal carousel of educational topic cards ("Budgeting 101", "Investing Basics")
- **Category filter chips**: All, Savings, Investing, Budgeting, News
- **Bookmark icon**: On each card for saving articles

---

## Bottom Navigation
- 5 tabs: Home, Pay, Insights, Coach, Hub
- Active tab highlighted with filled icon + label
- Subtle scale animation on tap
- Fixed at bottom, always visible

## Micro-interactions & Polish
- Animated number counters on dashboard
- Card fade-in with staggered delays
- Smooth page transitions between tabs
- Skeleton loading states
- Confetti animation on payment success
- Typing indicator dots for AI Coach
- Progress bar animations
- Hover/press states on all interactive elements

