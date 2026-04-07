<div align="center">

# <img src="https://api.iconify.design/mdi:feather.svg?color=%234f46e5" width="36" align="center" /> InkVerse

### *Where Code Meets Poetry*

A production-grade social content platform for developers, poets, and creators to share code snippets, poetry, shayri, quotes, and more - all in one beautifully crafted space.

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-inkverse.murtuja.in-4f46e5?style=for-the-badge)](https://inkverse.murtuja.in)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.1-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

<br/>


<p>
  <a href="https://inkverse.murtuja.in"><b>Live Site</b></a> &nbsp;&nbsp;•&nbsp;&nbsp;
  <a href="#--features"><b>Features</b></a> &nbsp;&nbsp;•&nbsp;&nbsp;
  <a href="#--tech-stack"><b>Tech Stack</b></a> &nbsp;&nbsp;•&nbsp;&nbsp;
  <a href="#--getting-started"><b>Setup Guide</b></a> &nbsp;&nbsp;•&nbsp;&nbsp;
  <a href="#--architecture"><b>Architecture</b></a>
</p>

</div>

---

## <img src="https://api.iconify.design/mdi:account-badge.svg?color=%233b82f6" width="28" align="center" /> About the Developer

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
        Hi! I'm <strong>Murtuja</strong>, a passionate full-stack developer who loves building premium, production-grade web applications. InkVerse is my flagship project - a social platform that bridges the worlds of programming and creative writing.
      </p>
      <p>
        I designed and built every aspect of this platform from scratch, including the backend API architecture, the real-time notification system, the 3-layer content moderation engine, and the pixel-perfect dark-themed UI. My goal was to prove that indie developers can build polished SaaS products that rival established platforms.
      </p>
      <br/>
      <p>
        <a href="https://www.murtuja.in"><img src="https://img.shields.io/badge/Portfolio-murtuja.in-2563EB?style=flat&logo=globe&logoColor=white" alt="Portfolio" /></a>
        <a href="https://github.com/imurtuja"><img src="https://img.shields.io/badge/GitHub-imurtuja-181717?style=flat&logo=github&logoColor=white" alt="GitHub" /></a>
        <a href="https://twitter.com/imurtuja"><img src="https://img.shields.io/badge/Twitter-imurtuja-1DA1F2?style=flat&logo=twitter&logoColor=white" alt="Twitter" /></a>
      </p>
    </td>
  </tr>
</table>

---

## <img src="https://api.iconify.design/mdi:star-four-points.svg?color=%23eab308" width="28" align="center" /> Features

InkVerse is not a toy project - it's a fully functional, production-deployed platform with **30+ API endpoints**, **8 database models**, **automated content moderation**, and professional-grade infrastructure. Here's what's inside:

### <img src="https://api.iconify.design/mdi:pencil-outline.svg?color=%238b5cf6" width="24" align="center" /> Content Creation & Sharing

| Feature | Description |
|:---|:---|
| **7 Content Categories** | `Code` · `Poetry` · `Shayri` · `Quote` · `Song` · `Note` · `General` - each with a unique badge, icon, and styling |
| **Rich Markdown Editor** | Full `react-markdown` support with GFM tables, headings, bold, italic, lists, links, and images |
| **Syntax-Highlighted Code** | Code blocks rendered with `rehype-highlight` and a custom `CodeBlock` component with copy-to-clipboard |
| **Poetry Preservation** | Line breaks and indentation are fully preserved - your verses read exactly as you wrote them |
| **Post Tagging** | Tag-based organization with clickable `#hashtags` that deep-link into search results |
| **Image Attachments** | Upload and display images within posts |

### <img src="https://api.iconify.design/mdi:animation-play-outline.svg?color=%23ef4444" width="24" align="center" /> Social Feed System

| Feature | Description |
|:---|:---|
| **Infinite Scroll Feed** | `IntersectionObserver`-powered lazy loading with automatic pagination |
| **Category Filtering** | Horizontally scrollable pill-based filter bar with drag-to-scroll and edge-fade masks |
| **Like System** | Optimistic UI updates with instant feedback; server reconciliation on failure |
| **Commenting** | Threaded comment section under each post with real-time count updates |
| **Share Modal** | One-tap sharing to X (Twitter), WhatsApp, Facebook, Email, or copy a short link |
| **Post Reporting** | Users can flag content as Spam, Abuse, or Other - reports are tracked and reviewed |
| **Content Clamping** | Long posts are truncated with a "Show more / Show less" toggle |

### <img src="https://api.iconify.design/mdi:account-group.svg?color=%2310b981" width="24" align="center" /> User Profiles & Social Graph

| Feature | Description |
|:---|:---|
| **Dynamic Profile Pages** | Gradient banner, avatar, bio, join date, and post/follower/following counts |
| **Follow / Unfollow** | Full bidirectional follow system with optimistic UI |
| **Edit Profile Modal** | In-place editing of name, bio, and avatar - overlay modal from the profile page |
| **User Posts Grid** | All posts by a user listed below their profile header |

### <img src="https://api.iconify.design/mdi:lock-check.svg?color=%2314b8a6" width="24" align="center" /> Authentication & Security

| Feature | Description |
|:---|:---|
| **Multi-Provider Auth** | `NextAuth v5` with Google OAuth, GitHub OAuth, and credential-based login |
| **Email Verification** | OTP-based email verification with custom-branded SendGrid templates |
| **Password Reset** | Secure, time-limited (5 min) password reset flow with single-use tokens |
| **Welcome Emails** | Automated onboarding emails sent to every new user |
| **Encrypted Passwords** | `bcryptjs` hashing for credential-based accounts |
| **Role Protection** | Mongoose model hooks prevent `role` escalation via any API - admin role can only be set directly in the database |

<div align="center">
  <img src="docs/screenshots/login.png" alt="InkVerse Login Page" width="100%" style="border-radius: 12px; border: 1px solid #1e293b;" />
  <br/>
  <sub>OAuth + Credential login with Google & GitHub integration</sub>
</div>

<br/>

### <img src="https://api.iconify.design/mdi:bell-ringing.svg?color=%23f59e0b" width="24" align="center" /> Real-Time Notifications

| Feature | Description |
|:---|:---|
| **Notification Types** | `Like` · `Comment` · `Follow` · `Mention` - each with unique icons and color-coded badges |
| **Unread Tracking** | Badge count in the navbar with Zustand-powered global state sync |
| **Mark All as Read** | One-tap batch read operation |
| **Contextual Deep Links** | Each notification links to the relevant post or user profile |

### <img src="https://api.iconify.design/mdi:shield-check.svg?color=%233b82f6" width="24" align="center" /> Admin Dashboard & Moderation

| Feature | Description |
|:---|:---|
| **Analytics Overview** | Metric cards for Total Users, Daily Posts, Total Posts, Active Bans, and Pending Flags |
| **Engagement Charts** | `Recharts`-powered `LineChart` (Posts & Signups trends) and `BarChart` (Moderation Load) |
| **High-Risk Users Panel** | Table of users with elevated risk scores - color-coded threat severity |
| **User Management** | Admin routes for viewing, searching, banning, and resetting passwords for users |
| **Post Management** | Admin routes for reviewing, hiding, and removing flagged content |
| **Appeal System** | Banned users can submit appeals; admins can review and resolve them |
| **Report Management** | Track all user-submitted and auto-generated reports with severity levels |

### <img src="https://api.iconify.design/mdi:robot-outline.svg?color=%23ef4444" width="24" align="center" /> 3-Layer Automated Content Moderation

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

### <img src="https://api.iconify.design/mdi:magnify.svg?color=%238b5cf6" width="24" align="center" /> Search & Discovery

| Feature | Description |
|:---|:---|
| **Full-Text Search** | MongoDB text indexes across posts (content + tags) and users (name + username) |
| **Debounced Real-Time Search** | 300ms debounce with URL sync - search-as-you-type with no page reloads |
| **Filter by Type** | Toggle between `All` · `Posts` · `Users` results |
| **Tag Search** | Click any `#tag` in the feed to instantly search for related posts |

### <img src="https://api.iconify.design/mdi:palette.svg?color=%23f59e0b" width="24" align="center" /> UI / UX Design System

| Feature | Description |
|:---|:---|
| **Dark Mode First** | Full dark/light theme with `next-themes` - HSL-based CSS variable system |
| **Glass Morphism** | Frosted-glass cards and navigation with `backdrop-blur-xl` |
| **Framer Motion** | Animated page transitions, fade-up entrances, and staggered list reveals |
| **Responsive Mobile Nav** | Bottom tab navigation on mobile with contextual active states |
| **Skeleton Loading** | Every page has pixel-perfect skeleton loading states - no layout shift |
| **Custom Fonts** | `Inter` (body), `Playfair Display` (serifs), `JetBrains Mono` (code) via `next/font` |
| **Dual-Layer Avatar System** | Avatar preloading with fallback initials to eliminate image pop-in |
| **Toast Notifications** | `react-hot-toast` with theme-aware branded toasts |

### <img src="https://api.iconify.design/mdi:file-document-multiple.svg?color=%2364748b" width="24" align="center" /> Additional Pages

- **About** - Platform description with the "Syntax & Soul" and "Rhythmic Verses" philosophy cards
- **Contact** - Reach out to the developer
- **Privacy Policy** - Platform privacy terms
- **Terms of Service** - User agreement
- **Banned Page** - Custom page for banned users with ban reason and appeal link

### <img src="https://api.iconify.design/mdi:rocket-launch.svg?color=%2310b981" width="24" align="center" /> SEO & Performance

- **Dynamic `robots.js`** and **`sitemap.js`** for search engine indexing
- **Open Graph & Twitter Cards** with custom OG images
- **Optimized metadata** - Per-page `title`, `description`, and `keywords`
- **Dynamic favicon** generated via `icon.js`
- **Service Worker** (`sw.js`) for caching and offline resilience

---

## <img src="https://api.iconify.design/mdi:code-braces.svg?color=%236366f1" width="28" align="center" /> Tech Stack

<table>
  <tr>
    <td align="center" width="110">
      <img src="https://skillicons.dev/icons?i=nextjs" width="48" height="48" alt="Next.js" />
      <br/><sub><b>Next.js 16</b></sub>
    </td>
    <td align="center" width="110">
      <img src="https://skillicons.dev/icons?i=react" width="48" height="48" alt="React" />
      <br/><sub><b>React 19</b></sub>
    </td>
    <td align="center" width="110">
      <img src="https://skillicons.dev/icons?i=tailwind" width="48" height="48" alt="Tailwind" />
      <br/><sub><b>Tailwind v4</b></sub>
    </td>
    <td align="center" width="110">
      <img src="https://skillicons.dev/icons?i=mongodb" width="48" height="48" alt="MongoDB" />
      <br/><sub><b>MongoDB</b></sub>
    </td>
  </tr>
</table>

### Full Dependency Breakdown

| Icon | Category | Technology | Purpose |
|:---:|:---|:---|:---|
| <img src="https://skillicons.dev/icons?i=nextjs" width="20" /> | **Framework** | Next.js 16.2.1 | Server/client rendering, API routes, file-based routing |
| <img src="https://skillicons.dev/icons?i=react" width="20" /> | **UI Library** | React 19.2.4 | Component architecture, hooks, server components |
| <img src="https://skillicons.dev/icons?i=mongodb" width="20" /> | **Database** | Mongoose 9.3 | Document database with schema validation and indexes |
| <img src="https://skillicons.dev/icons?i=tailwind" width="20" /> | **Styling** | Tailwind CSS v4 | Utility-first CSS with dark mode and custom design tokens |
| <img src="https://skillicons.dev/icons?i=framer" width="20" /> | **Animations** | Framer Motion | Page transitions, staggered reveals, micro-interactions |
| <img src="https://api.iconify.design/mdi:shield-key.svg" width="20" /> | **Auth** | NextAuth v5 (Beta) | Google/GitHub OAuth + Credentials provider, JWT sessions |
| <img src="https://api.iconify.design/mdi:state-machine.svg" width="20" /> | **State** | Zustand 5.0 | Global state (notification count, user preferences) |
| <img src="https://api.iconify.design/mdi:form-textbox.svg" width="20" /> | **Forms** | React Hook Form | High-performance forms with Zod schema validation |
| <img src="https://api.iconify.design/mdi:markdown.svg" width="20" /> | **Markdown** | react-markdown | Content rendering with remark-gfm and rehype-highlight |

---

## <img src="https://api.iconify.design/mdi:family-tree.svg?color=%23ec4899" width="28" align="center" /> Architecture

```text
inkverse/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.js                 # Root layout (fonts, providers, metadata)
│   │   ├── page.js                   # Landing page
│   │   ├── globals.css               # Global styles & design tokens
│   │   ├── feed/                     # Social feed with infinite scroll
│   │   ├── post/[id]/                # Post detail + comments
│   │   ├── profile/[username]/       # User profile pages
│   │   ├── search/                   # Full-text search (posts + users)
│   │   ├── notifications/            # Real-time notification center
│   │   │
│   │   ├── login/, signup/           # Auth flows + OTP verify
│   │   ├── about/, contact/          # Information pages
│   │   │
│   │   ├── admin/                    # Admin dashboard
│   │   │   ├── page.jsx              # Analytics overview (charts + metrics)
│   │   │   └── users/, posts/        # Management routes
│   │   │
│   │   └── api/                      # RESTful API
│   │       ├── auth/                 # NextAuth handlers
│   │       ├── posts/, users/        # CRUD operations
│   │       ├── notifications/        # Notification system
│   │       └── admin/                # Protected admin endpoints
│   │
│   ├── components/                   # Reusable React components
│   ├── models/                       # Mongoose schemas
│   ├── lib/                          # Core utilities, mail config, db connect
│   └── store/                        # Zustand stores
│
├── public/                           # Static assets
└── package.json
```

---

## <img src="https://api.iconify.design/mdi:database.svg?color=%2310b981" width="28" align="center" /> Database Models

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

## <img src="https://api.iconify.design/mdi:rocket-launch.svg?color=%23ef4444" width="28" align="center" /> Getting Started

### Prerequisites

- **Node.js** ≥ 18.17.0
- **MongoDB** instance
- **SendGrid** account (for transactional emails)

### 1. Clone the Repository

```bash
git clone https://github.com/imurtuja/InkVerse.git
cd InkVerse
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env.local` file in the project root:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=your_nextauth_secret

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Email
SENDGRID_API_KEY=your_sendgrid_api_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see InkVerse running locally.

---

## <img src="https://api.iconify.design/mdi:cloud-upload.svg?color=%233b82f6" width="28" align="center" /> Deployment

InkVerse is deployed and live at **[inkverse.murtuja.in](https://inkverse.murtuja.in)**

The recommended deployment platform is [Vercel](https://vercel.com). Simply import the repository, configure the environment variables, and let Vercel handle the complete Next.js build process.

---

## <img src="https://api.iconify.design/mdi:hand-heart.svg?color=%2310b981" width="28" align="center" /> Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/imurtuja/InkVerse/issues).

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m "feat: add amazing feature"`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## <img src="https://api.iconify.design/mdi:email-fast.svg?color=%238b5cf6" width="28" align="center" /> Contact

**Murtuja** - Full-Stack Developer

<p>
  <a href="https://www.murtuja.in"><img src="https://img.shields.io/badge/Portfolio-murtuja.in-2563EB?style=for-the-badge&logo=globe&logoColor=white" alt="Portfolio" /></a>
  <a href="mailto:murtuja.dev@gmail.com"><img src="https://img.shields.io/badge/Email-murtuja.dev@gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email" /></a>
  <a href="https://twitter.com/imurtuja"><img src="https://img.shields.io/badge/Twitter-imurtuja-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" alt="LinkedIn" /></a>
  <a href="https://github.com/imurtuja"><img src="https://img.shields.io/badge/GitHub-imurtuja-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" /></a>
</p>

---

## <img src="https://api.iconify.design/mdi:file-document.svg?color=%2364748b" width="28" align="center" /> License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

**<img src="https://api.iconify.design/mdi:star.svg?color=%23eab308" width="16" /> If you found InkVerse useful or inspiring, please consider starring the repo!**

<br/>

Made with 🤍 by [Murtuja](https://www.murtuja.in)

<sub>© 2026 InkVerse Platform. All rights reserved.</sub>

</div>
