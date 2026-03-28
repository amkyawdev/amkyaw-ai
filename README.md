# Amkyaw AI Power Platform 🚀

An AI-powered chat platform built with Next.js 14, using Gemini 1.5 Flash for AI responses and Neon Database for data persistence. Features a modern glassmorphism UI with dark mode by default.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=for-the-badge&logo=tailwind-css)
![Neon](https://img.shields.io/badge/Neon-PostgreSQL-0E83CF?style=for-the-badge&logo=postgresql)

## ✨ Features

- 💬 **Smart Chat Interface** - Powered by Gemini 1.5 Flash AI with real-time responses
- 🔐 **Secure Authentication** - Neon Auth integration with JWT token verification
- 🎨 **Modern UI Design** - Glassmorphism effects with dark mode by default
- 📱 **Fully Responsive** - Works seamlessly on mobile, tablet, and desktop
- ⚡ **Fast Performance** - Built on Next.js 14 App Router for optimal speed
- 💾 **Chat History** - Persistent storage with Neon PostgreSQL and Drizzle ORM
- 🔄 **Smooth Animations** - Framer Motion for polished user experience

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.4 |
| **Styling** | Tailwind CSS 3.4 |
| **UI Components** | Custom components with class-variance-authority |
| **Animation** | Framer Motion 11 |
| **Icons** | Lucide React |
| **AI** | Google Gemini 1.5 Flash |
| **Database** | Neon (PostgreSQL) |
| **ORM** | Drizzle ORM |

## 📋 Prerequisites

Before you begin, ensure you have the following:

- **Node.js** 18.x or later ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Neon Database** account ([Sign up](https://neon.tech/))
- **Google Gemini API** key ([Get key](https://aistudio.google.com/app/apikey))

## 🚦 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd amkyaw-ai-power
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database Connection (from Neon Dashboard)
DATABASE_URL=postgresql://neondb_owner:your_password@ep-xxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

# Google Gemini API Key
GEMINI_API_KEY=AIzaSy...

# Neon Auth Configuration
NEON_AUTH_URL=https://ep-xxx.neonauth.us-east-1.aws.neon.tech/neondb/auth
NEON_AUTH_JWKS_URL=https://ep-xxx.neonauth.us-east-1.aws.neon.tech/neondb/auth/.well-known/jwks.json
```

### 4. Initialize Database

Push the schema to your Neon database:

```bash
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

The app will be available at **[http://localhost:3000](http://localhost:3000)**

## 📁 Project Structure

```
amkyaw-ai-power/
├── .env                    # Environment variables (DO NOT commit)
├── .gitignore              # Git ignore patterns
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── drizzle.config.ts       # Drizzle ORM configuration
│
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx      # Root layout with dark mode
│   │   ├── page.tsx        # Landing page (hero section)
│   │   ├── globals.css     # Global styles + glassmorphism
│   │   ├── dashboard/      # User dashboard (chat interface)
│   │   │   └── page.tsx   # Chat UI with sidebar
│   │   └── api/            # API Routes
│   │       ├── chat/      # Gemini AI chat endpoint
│   │       │   └── route.ts
│   │       └── auth/       # Neon Auth endpoints
│   │           └── route.ts
│   │
│   ├── components/         # React components
│   │   └── ui/            # Base UI components
│   │       ├── button.tsx  # Button with variants
│   │       └── input.tsx   # Input component
│   │
│   ├── lib/               # Core utilities
│   │   ├── db.ts          # Neon database connection
│   │   ├── gemini.ts      # Gemini AI configuration
│   │   ├── schema.ts      # Drizzle database schema
│   │   └── utils.ts       # Helper functions (cn, formatDate)
│   │
│   └── types/             # TypeScript definitions
│       └── index.ts       # Type interfaces
│
├── public/                # Static assets
│   └── assets/           # Images, icons, 3D models
│
└── README.md              # Project documentation
```

## 🔌 API Reference

### POST /api/chat

Send a message to Gemini AI and save to database.

**Request:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, how are you?"}'
```

**Response:**
```json
{
  "response": "Hello! I'm doing well, thank you for asking...",
  "chatId": 1,
  "messageId": 2
}
```

### GET /api/auth

Verify authentication token.

**Headers:**
```
Authorization: Bearer <your-token>
```

### POST /api/auth

Sign in/sign out actions.

**Request:**
```json
{
  "action": "signin" | "signout"
}
```

## 🗄️ Database Schema

The project uses **Drizzle ORM** with the following tables:

### `chats` - Chat Sessions
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| user_id | text | User identifier |
| title | text | Chat title (first 50 chars) |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

### `messages` - Chat Messages
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| chat_id | serial | Foreign key to chats |
| role | text | 'user' or 'assistant' |
| content | text | Message content |
| created_at | timestamp | Creation time |

### `users` - User Information
| Column | Type | Description |
|--------|------|-------------|
| id | text | Primary key |
| email | text | User email |
| name | text | User name |
| created_at | timestamp | Creation time |
| is_active | boolean | Account status |

## 🎨 Design System

### Color Palette (Dark Mode)

```css
--background: 222.2 84% 4.9%    /* Deep dark blue */
--foreground: 210 40% 98%       /* White text */
--primary: 217.2 91.2% 59.8%    /* Purple accent */
--secondary: 217.2 32.6% 17.5%  /* Dark gray */
--muted: 217.2 32.6% 17.5%      /* Muted gray */
--accent: 217.2 91.2% 59.8%     /* Purple accent */
--border: 217.2 32.6% 17.5%     /* Border color */
```

### Glassmorphism Classes

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
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:push` | Push schema to database |

## 🔒 Security Notes

- **Never commit** `.env` file or API keys to version control
- The `.gitignore` file excludes sensitive files
- Always use **HTTPS** in production
- Validate and sanitize all user inputs
- Follow the principle of least privilege

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using Next.js, Gemini AI, and Neon Database