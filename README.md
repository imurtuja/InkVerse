<div align="center">

# 🪶 InkVerse

### *Where Code Meets Poetry*

A production-grade social content platform for developers, poets, and creators to share code snippets, poetry, shayri, quotes, and more — all in one beautifully crafted space.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-inkverse.murtuja.in-4f46e5?style=for-the-badge)](https://inkverse.murtuja.in)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.1-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

<br/>

<img src="docs/screenshots/hero.png" alt="InkVerse Landing Page" width="100%" style="border-radius: 12px; border: 1px solid #1e293b;" />

<br/>

<p>
  <a href="https://inkverse.murtuja.in">View Live Site</a> •
  <a href="#-features">Features</a> •
  <a href="#%EF%B8%8F-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Setup Guide</a> •
  <a href="#-architecture">Architecture</a>
</p>

</div>

---

## 👨‍💻 About the Developer

<table>
  <tr>
    <td width="140" align="center">
      <img src="https://github.com/imurtuja.png" width="100" height="100" style="border-radius: 50%;" alt="Murtuja" />
      <br/>
      <strong>Murtuja</strong>
      <br/>
      <sub>Full-Stack Developer</sub>
    </td>
    <td>
      <p>
        Hi! I'm <strong>Murtuja</strong>, a passionate full-stack developer who loves building premium, production-grade web applications. InkVerse is my flagship project — a social platform that bridges the worlds of programming and creative writing.
      </p>
      <p>
        I designed and built every aspect of this platform from scratch, including the backend API architecture, the real-time notification system, the 3-layer content moderation engine, and the pixel-perfect dark-themed UI. My goal was to prove that indie developers can build polished SaaS products that rival established platforms.
      </p>
      <p>
        <a href="https://www.murtuja.in">🌐 Portfolio</a> •
        <a href="https://github.com/imurtuja">💻 GitHub</a> •
        <a href="https://twitter.com/imurtuja">🐦 Twitter/X</a>
      </p>
    </td>
  </tr>
</table>

---

## ✨ Features

InkVerse is not a toy project — it's a fully functional, production-deployed platform with **30+ API endpoints**, **8 database models**, **automated content moderation**, and professional-grade infrastructure. Here's what's inside:

### 📝 Content Creation & Sharing

| Feature | Description |
|:---|:---|
| **7 Content Categories** | `Code` · `Poetry` · `Shayri` · `Quote` · `Song` · `Note` · `General` — each with a unique badge, icon, and styling |
| **Rich Markdown Editor** | Full `react-markdown` support with GFM tables, headings, bold, italic, lists, links, and images |
| **Syntax-Highlighted Code** | Code blocks rendered with `rehype-highlight` and a custom `CodeBlock` component with copy-to-clipboard |
| **Poetry Preservation** | Line breaks and indentation are fully preserved — your verses read exactly as you wrote them |
| **Post Tagging** | Tag-based organization with clickable `#hashtags` that deep-link into search results |
| **Image Attachments** | Upload and display images within posts |

### 🏠 Social Feed System

| Feature | Description |
|:---|:---|
| **Infinite Scroll Feed** | `IntersectionObserver`-powered lazy loading with automatic pagination |
| **Category Filtering** | Horizontally scrollable pill-based filter bar with drag-to-scroll and edge-fade masks |
| **Like System** | Optimistic UI updates with instant feedback; server reconciliation on failure |
| **Commenting** | Threaded comment section under each post with real-time count updates |
| **Share Modal** | One-tap sharing to X (Twitter), WhatsApp, Facebook, Email, or copy a short link |
| **Post Reporting** | Users can flag content as Spam, Abuse, or Other — reports are tracked and reviewed |
| **Content Clamping** | Long posts are truncated with a "Show more / Show less" toggle |

### 👤 User Profiles & Social Graph

| Feature | Description |
|:---|:---|
| **Dynamic Profile Pages** | Gradient banner, avatar, bio, join date, and post/follower/following counts |
| **Follow / Unfollow** | Full bidirectional follow system with optimistic UI |
| **Edit Profile Modal** | In-place editing of name, bio, and avatar — overlay modal from the profile page |
| **User Posts Grid** | All posts by a user listed below their profile header |

### 🔐 Authentication & Security

| Feature | Description |
|:---|:---|
| **Multi-Provider Auth** | `NextAuth v5` with Google OAuth, GitHub OAuth, and credential-based login |
| **Email Verification** | OTP-based email verification with custom-branded SendGrid templates |
| **Password Reset** | Secure, time-limited (5 min) password reset flow with single-use tokens |
| **Welcome Emails** | Automated onboarding emails sent to every new user |
| **Encrypted Passwords** | `bcryptjs` hashing for credential-based accounts |
| **Role Protection** | Mongoose model hooks prevent `role` escalation via any API — admin role can only be set directly in the database |

<div align="center">
  <img src="docs/screenshots/login.png" alt="InkVerse Login Page" width="100%" style="border-radius: 12px; border: 1px solid #1e293b;" />
  <br/>
  <sub>OAuth + Credential login with Google & GitHub integration</sub>
</div>

<br/>

### 🔔 Real-Time Notifications

| Feature | Description |
|:---|:---|
| **Notification Types** | `Like` · `Comment` · `Follow` · `Mention` — each with unique icons and color-coded badges |
| **Unread Tracking** | Badge count in the navbar with Zustand-powered global state sync |
| **Mark All as Read** | One-tap batch read operation |
| **Contextual Deep Links** | Each notification links to the relevant post or user profile |

### 🛡️ Admin Dashboard & Moderation

| Feature | Description |
|:---|:---|
| **Analytics Overview** | Metric cards for Total Users, Daily Posts, Total Posts, Active Bans, and Pending Flags |
| **Engagement Charts** | `Recharts`-powered `LineChart` (Posts & Signups trends) and `BarChart` (Moderation Load) |
| **High-Risk Users Panel** | Table of users with elevated risk scores — color-coded threat severity |
| **User Management** | Admin routes for viewing, searching, banning, and resetting passwords for users |
| **Post Management** | Admin routes for reviewing, hiding, and removing flagged content |
| **Appeal System** | Banned users can submit appeals; admins can review and resolve them |
| **Report Management** | Track all user-submitted and auto-generated reports with severity levels |

### 🤖 3-Layer Automated Content Moderation

InkVerse features a custom-built moderation engine that evaluates every new post through multiple detection layers:

```
┌─────────────────────────────────────────────────────┐
│  LAYER 1: String Analysis                           │
│  ├── Bad word / toxic language detection             │
│  ├── Excessive URL / link spam detection             │
│  └── Repeated character spam detection               │
│                                                     │
│  LAYER 2: Behavioral Analysis                       │
│  ├── Rapid posting detection (5+ posts / 10 min)    │
│  ├── Duplicate content detection (within 24 hours)  │
│  └── Historical risk score escalation               │
│                                                     │
│  LAYER 3: Verdict Scoring                           │
│  ├── Score < 5  → Clean (post goes live)            │
│  ├── Score 5-7  → Flagged (visible, under review)   │
│  └── Score 8+   → Hidden (auto-hidden, auto-report) │
└─────────────────────────────────────────────────────┘
```

Posts that score ≥ 5 are automatically flagged, an auto-report is generated, and the author's cumulative `riskScore` is incremented. High-severity content is instantly hidden from the feed.

### 🔍 Search & Discovery

| Feature | Description |
|:---|:---|
| **Full-Text Search** | MongoDB text indexes across posts (content + tags) and users (name + username) |
| **Debounced Real-Time Search** | 300ms debounce with URL sync — search-as-you-type with no page reloads |
| **Filter by Type** | Toggle between `All` · `Posts` · `Users` results |
| **Tag Search** | Click any `#tag` in the feed to instantly search for related posts |

### 🎨 UI / UX Design System

| Feature | Description |
|:---|:---|
| **Dark Mode First** | Full dark/light theme with `next-themes` — HSL-based CSS variable system |
| **Glass Morphism** | Frosted-glass cards and navigation with `backdrop-blur-xl` |
| **Framer Motion** | Animated page transitions, fade-up entrances, and staggered list reveals |
| **Responsive Mobile Nav** | Bottom tab navigation on mobile with contextual active states |
| **Skeleton Loading** | Every page has pixel-perfect skeleton loading states — no layout shift |
| **Custom Fonts** | `Inter` (body), `Playfair Display` (serifs), `JetBrains Mono` (code) via `next/font` |
| **Dual-Layer Avatar System** | Avatar preloading with fallback initials to eliminate image pop-in |
| **Toast Notifications** | `react-hot-toast` with theme-aware branded toasts |

### 📄 Additional Pages

- **About** — Platform description with the "Syntax & Soul" and "Rhythmic Verses" philosophy cards
- **Contact** — Reach out to the developer
- **Privacy Policy** — Platform privacy terms
- **Terms of Service** — User agreement
- **Banned Page** — Custom page for banned users with ban reason and appeal link

### 🔧 SEO & Performance

- **Dynamic `robots.js`** and **`sitemap.js`** for search engine indexing
- **Open Graph & Twitter Cards** with custom OG images
- **Optimized metadata** — Per-page `title`, `description`, and `keywords`
- **Dynamic favicon** generated via `icon.js`
- **Service Worker** (`sw.js`) for caching and offline resilience

---

## 🛠️ Tech Stack

<table>
  <tr>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=nextjs" width="48" height="48" alt="Next.js" />
      <br/><sub><b>Next.js 16</b></sub>
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=react" width="48" height="48" alt="React" />
      <br/><sub><b>React 19</b></sub>
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=mongodb" width="48" height="48" alt="MongoDB" />
      <br/><sub><b>MongoDB</b></sub>
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=tailwind" width="48" height="48" alt="Tailwind" />
      <br/><sub><b>Tailwind v4</b></sub>
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=nodejs" width="48" height="48" alt="Node.js" />
      <br/><sub><b>Node.js</b></sub>
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=vercel" width="48" height="48" alt="Vercel" />
      <br/><sub><b>Vercel</b></sub>
    </td>
  </tr>
</table>

### Full Dependency Breakdown

| Category | Technology | Purpose |
|:---|:---|:---|
| **Framework** | Next.js 16.2.1 (App Router) | Server/client rendering, API routes, file-based routing |
| **UI Library** | React 19.2.4 | Component architecture, hooks, server components |
| **Database** | MongoDB + Mongoose 9.3 | Document database with schema validation and indexes |
| **Styling** | Tailwind CSS v4 | Utility-first CSS with dark mode and custom design tokens |
| **Animations** | Framer Motion 12.38 | Page transitions, staggered reveals, micro-interactions |
| **Auth** | NextAuth v5 (Beta) | Google/GitHub OAuth + Credentials provider, JWT sessions |
| **State** | Zustand 5.0 | Global state (notification count, user preferences) |
| **Forms** | React Hook Form 7.72 + Zod 4.3 | High-performance forms with schema-based validation |
| **Markdown** | react-markdown + remark-gfm + rehype-highlight | Content rendering with code syntax highlighting |
| **Charts** | Recharts 3.8 | Admin dashboard analytics visualization |
| **Icons** | Lucide React 1.7 | 1000+ consistent SVG icons |
| **Email** | SendGrid + Nodemailer | Transactional emails (OTP, Welcome, Password Reset) |
| **Security** | bcryptjs 3.0 | Password hashing |
| **Theming** | next-themes 0.4 | Dark/light mode with system preference detection |
| **Toasts** | react-hot-toast 2.6 | User notifications and feedback |
| **Utilities** | clsx, tailwind-merge, date-fns | Conditional classes, date formatting, class merging |

---

## 🏗️ Architecture

```
inkverse/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.js                 # Root layout (fonts, providers, metadata)
│   │   ├── page.js                   # Landing page
│   │   ├── globals.css               # Global styles & design tokens
│   │   ├── icon.js                   # Dynamic favicon generator
│   │   ├── robots.js                 # SEO robots configuration
│   │   ├── sitemap.js                # Dynamic sitemap generator
│   │   │
│   │   ├── feed/                     # Social feed with infinite scroll
│   │   ├── post/[id]/                # Post detail + comments
│   │   ├── profile/[username]/       # User profile pages
│   │   ├── search/                   # Full-text search (posts + users)
│   │   ├── notifications/            # Real-time notification center
│   │   │
│   │   ├── login/                    # OAuth + credential login
│   │   ├── signup/                   # Registration with email verification
│   │   ├── verify/                   # OTP verification flow
│   │   ├── reset-password/           # Secure password reset
│   │   ├── banned/                   # Banned user screen + appeal
│   │   │
│   │   ├── about/                    # About the platform
│   │   ├── contact/                  # Contact form
│   │   ├── privacy/                  # Privacy policy
│   │   ├── terms/                    # Terms of service
│   │   │
│   │   ├── admin/                    # Admin dashboard
│   │   │   ├── page.jsx              # Analytics overview (charts + metrics)
│   │   │   ├── users/                # User management (ban, reset)
│   │   │   ├── posts/                # Content management
│   │   │   ├── reports/              # Report review queue
│   │   │   ├── appeals/              # Ban appeal review
│   │   │   └── moderation/           # Moderation tools
│   │   │
│   │   └── api/                      # RESTful API
│   │       ├── auth/                 # NextAuth handlers
│   │       ├── posts/                # CRUD + like + pagination
│   │       ├── users/                # Profile + follow/unfollow
│   │       ├── search/               # Full-text search endpoint
│   │       ├── notifications/        # Notification CRUD + mark-read
│   │       ├── report/               # User report submission
│   │       ├── appeal/               # Ban appeal submission
│   │       └── admin/                # Protected admin endpoints
│   │           ├── analytics/        # Dashboard metrics
│   │           ├── users/            # Admin user operations
│   │           ├── posts/            # Admin post operations
│   │           ├── reports/          # Report management
│   │           ├── appeals/          # Appeal management
│   │           ├── stats/            # Platform statistics
│   │           └── reset-password/   # Admin password reset
│   │
│   ├── components/
│   │   ├── layout/                   # Navbar, MobileNav, ConditionalNav, NotificationsDropdown
│   │   ├── posts/                    # PostCard, PostEditor, CommentSection
│   │   ├── profile/                  # EditProfileModal
│   │   ├── admin/                    # AdminLayoutClient (sidebar nav)
│   │   ├── providers/                # AuthProvider, ThemeProvider
│   │   └── ui/                       # Button, Modal, UserAvatar, CodeBlock, FancyButton
│   │
│   ├── models/                       # Mongoose schemas
│   │   ├── User.js                   # name, username, email, password, bio, role, riskScore, ban fields
│   │   ├── Post.js                   # author, title, content, category, tags, likes, images, status
│   │   ├── Comment.js                # author, post, content, timestamps
│   │   ├── Notification.js           # sender, receiver, type, post, read status
│   │   ├── Report.js                 # reporter, itemType, itemId, reason, severity, isAuto
│   │   ├── Appeal.js                 # user, reason, status
│   │   ├── PendingUser.js            # Pre-verification user data with OTP
│   │   └── PasswordReset.js          # Time-limited reset tokens
│   │
│   ├── lib/
│   │   ├── auth.js                   # NextAuth config (providers, callbacks, JWT)
│   │   ├── db.js                     # MongoDB connection singleton
│   │   ├── mail.js                   # SendGrid email templates (OTP, Welcome, Reset)
│   │   ├── moderationService.js      # 3-layer auto-moderation engine
│   │   ├── require-admin.js          # Admin route protection middleware
│   │   ├── utils.js                  # cn(), formatDate(), helper functions
│   │   └── defaultAvatarBase64.js    # Fallback avatar as base64
│   │
│   └── store/
│       └── useStore.js               # Zustand global state (unread notifications)
│
├── public/
│   └── sw.js                         # Service worker for caching
├── package.json
├── next.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.17.0
- **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **SendGrid** account (for transactional emails)
- [Optional] Google & GitHub OAuth credentials

### 1. Clone the Repository

```bash
git clone https://github.com/imurtuja/InkVerse.git
cd InkVerse
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# ── Database ──────────────────────────────────────
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/inkverse

# ── NextAuth ──────────────────────────────────────
NEXTAUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=your-random-secret-key

# ── Google OAuth ──────────────────────────────────
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ── GitHub OAuth ──────────────────────────────────
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# ── SendGrid Email ────────────────────────────────
SENDGRID_API_KEY=your-sendgrid-api-key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see InkVerse running locally.

### 5. Build for Production

```bash
npm run build
npm start
```

---

## 📊 Database Models

| Model | Fields | Purpose |
|:---|:---|:---|
| **User** | name, username, email, password, image, bio, role, isBanned, banReason, banExpiresAt, riskScore, followers, following, provider | User accounts with social graph and moderation data |
| **Post** | author, title, content, category, lang, tags, likes, images, commentsCount, status, autoFlagged | Content with 7 categories and moderation status |
| **Comment** | author, post, content | Threaded comments linked to posts |
| **Notification** | sender, receiver, type, post, read | Real-time notification tracking |
| **Report** | reporter, itemType, itemId, reason, severity, status, isAuto | User and auto-generated content reports |
| **Appeal** | user, reason, status | Ban appeal requests |
| **PendingUser** | Pre-verification registration data | Temporary storage during email verification |
| **PasswordReset** | email, token, expiry | Time-limited password reset tokens |

---

## 🌐 Deployment

InkVerse is deployed and live at **[inkverse.murtuja.in](https://inkverse.murtuja.in)**

The recommended deployment platform is [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import the repository into Vercel
3. Add all environment variables from `.env.local` to Vercel's Settings → Environment Variables
4. Deploy — Vercel auto-detects Next.js and configures the build

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/imurtuja/InkVerse/issues).

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m "feat: add amazing feature"`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 📬 Contact

**Murtuja** — Full-Stack Developer

- 🌐 Website: [murtuja.in](https://www.murtuja.in)
- 📧 Email: [inkverse.murtuja@gmail.com](mailto:inkverse.murtuja@gmail.com)
- 🐦 Twitter: [@imurtuja](https://twitter.com/imurtuja)
- 💻 GitHub: [@imurtuja](https://github.com/imurtuja)

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

**⭐ If you found InkVerse useful or inspiring, please consider starring the repo!**

<br/>

Made with 🤍 by [Murtuja](https://www.murtuja.in)

<sub>© 2026 InkVerse Platform. All rights reserved.</sub>

</div>
