# 🤖 Amkyaw AI Power Platform

A powerful AI chat platform built with Next.js, featuring multi-AI routing with Groq and HuggingFace integration, plus public community chat.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🗣️ AI Chat
- Natural conversations with Llama 3.3 70B
- Smart intent detection
- Myanmar language support (မြန်မာစာ)

### 💻 Code Assistant
- Write code in Python, JavaScript, TypeScript, and more
- Debug and fix errors

### 🌐 Translation
- English ↔ Burmese translation
- Automatic language detection

### 🖼️ Image Generation
- Create images with FLUX.1 AI (HuggingFace)

### 👥 Public Chat
- Group discussions
- Create new chat groups
- Real-time messaging

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Framer Motion
- **AI:** Groq API (Llama 3.3 70B)
- **Image:** HuggingFace (FLUX.1 Schnell)
- **Database:** Neon PostgreSQL

## 📦 Installation

```bash
git clone https://github.com/amkyawdev/amkyaw-ai.git
cd amkyaw-ai
npm install
npm run dev
```

## 🔧 Environment Variables

```env
GROQ_API_KEY=your_groq_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key
NEON_DATABASE_URL=your_neon_database_url
```

## 📱 Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page |
| AI Chat | `/chat` | Chat with AI |
| Public Chat | `/public-chat` | Group discussions |
| Docs | `/docs` | Documentation |
| About | `/about` | About page |
| Settings | `/settings` | User settings |
| Profile | `/profile` | User profile |
| Login | `/login` | Sign in |
| Register | `/register` | Sign up |
| Reset | `/reset-password` | Reset password |

## 🗄️ Database Schema

```sql
-- Users
CREATE TABLE users (id SERIAL PRIMARY KEY, username VARCHAR(50), email VARCHAR(100), password_hash TEXT, created_at TIMESTAMP);

-- Chat Groups
CREATE TABLE chat_groups (id SERIAL PRIMARY KEY, name VARCHAR(100), description TEXT, created_by INT REFERENCES users(id));

-- Messages
CREATE TABLE messages (id SERIAL PRIMARY KEY, group_id INT REFERENCES chat_groups(id), user_id INT REFERENCES users(id), content TEXT, created_at TIMESTAMP);
```

## 🎯 Intent Detection

| Intent | Keywords | API |
|--------|----------|-----|
| Chat | hi, hello, hey | Groq |
| Code | code, python, javascript | Groq |
| Translate | translate, ဘာသာပြန် | Groq |
| Image | generate image, draw, picture | HuggingFace |

## 📧 Contact

- Email: amk.kyaw92@gmail.com
- GitHub: https://github.com/amkyawdev/amkyaw-ai

---

Made with ❤️ in Myanmar
