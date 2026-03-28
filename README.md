# Amkyaw AI Power Platform 🚀

A modern AI-powered chat platform built with Next.js 14, featuring Gemini AI models, glassmorphism UI, and full user authentication.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=for-the-badge&logo=tailwind-css)
![Vercel](https://img.shields.io/badge/Vercel-black?style=for-the-badge&logo=vercel)

## ✨ Features

- **💬 AI Chat Interface** - Powered by Gemini 1.5 Flash/Pro/Flash-8B with smart responses
- **🔐 User Authentication** - Login/signup system with localStorage persistence
- **📝 Markdown Support** - Rich text rendering with syntax highlighting for code
- **🎨 Modern UI** - Glassmorphism effects with dark mode by default
- **📱 Fully Responsive** - Works on mobile, tablet, and desktop
- **💾 Chat History** - Persistent storage with localStorage (Web-based)
- **🔄 Export/Import** - Save and load your conversations
- **⚡ Fast Performance** - Built on Next.js 14 App Router
- **📖 Documentation** - Built-in docs page with API reference

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.4 |
| **Styling** | Tailwind CSS 3.4 |
| **State** | Zustand with persist |
| **Animation** | Framer Motion 11 |
| **Icons** | Lucide React |
| **AI** | Google Gemini 1.5 Flash/Pro/Flash-8B |
| **Rendering** | React Markdown |

## 📱 Pages

| Route | Description |
|------|-------------|
| `/` | Landing page with hero section |
| `/chat` | AI chat interface with sidebar |
| `/login` | Login/signup page |
| `/history` | Chat history with search |
| `/settings` | User preferences & data management |
| `/profile` | User profile & stats |
| `/docs` | API documentation |

## 🚦 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/amkyawdev/amkyaw-ai.git
cd amkyaw-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Google Gemini API Key (Required)
GEMINI_API_KEY=AIzaSy...

# Optional: Database (for future versions)
DATABASE_URL=postgresql://...
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at **[http://localhost:3000](http://localhost:3000)**

## 📁 Project Structure

```
amkyaw-ai/
├── .env                    # Environment variables
├── .gitignore              # Git ignore patterns
├── package.json            # Dependencies
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Landing page
│   │   ├── globals.css  # Global styles
│   │   ├── chat/        # Chat page
│   │   ├── login/       # Login page
│   │   ├── history/     # History page
│   │   ├── settings/   # Settings page
│   │   ├── profile/    # Profile page
│   │   ├── docs/       # Documentation
│   │   └── api/        # API routes
│   │       └── chat/    # Chat API
│   │
│   ├── components/       # React components
│   │   ├── layout/     # Layout components
│   │   │   └── Navbar.tsx
│   │   ├── chat/       # Chat components
│   │   │   └── MarkdownMessage.tsx
│   │   └── ui/        # UI components
│   │
│   ├── stores/          # Zustand stores
│   │   ├── chatStore.ts    # Chat state
│   │   └── authStore.ts   # Auth state
│   │
│   └── lib/            # Utilities
│       ├── ai/          # AI module
│       ├── gemini.ts    # Gemini config
│       └── utils.ts     # Helpers
│
└── public/             # Static assets
```

## 🔌 API Reference

### POST /api/chat

Send a message to Gemini AI.

**Request:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello!", "model": "flash8b"}'
```

**Response:**
```json
{
  "response": "Hello! How can I help you?",
  "model": "gemini-1.5-flash-8b",
  "usage": {
    "promptTokens": 10,
    "completionTokens": 20,
    "totalTokens": 30
  }
}
```

### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `prompt` | string | Your message (required) |
| `model` | string | Model: `flash`, `pro`, `flash8b` |
| `temperature` | number | Creativity (0-1, default: 0.9) |

## 🎨 Design System

### Color Palette (Dark Mode)

```css
--background: 222.2 84% 4.9%    /* Deep dark */
--foreground: 210 40% 98%       /* White */
--primary: 263.4 70% 50.8%      /* Purple */
--secondary: 217.2 32.6% 17.5%  /* Dark gray */
--accent: 263.4 70% 50.8%      /* Purple accent */
--muted: 217.2 32.6% 17.5%     /* Muted gray */
--border: 217.2 32.6% 17.5%   /* Border */
```

### Glassmorphism

```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 🔒 Security Notes

- **Never commit** `.env` file or API keys
- `.gitignore` excludes sensitive files
- Always use **HTTPS** in production
- Validate and sanitize user inputs

## 🌐 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add `GEMINI_API_KEY` in Environment Variables
4. Deploy!

### Environment Variables on Vercel

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Your Google Gemini API key |

## 🤝 Contributing

Feel free to submit a Pull Request!

## 📄 License

MIT License

---

Built with ❤️ using Next.js, Gemini AI, and Tailwind CSS