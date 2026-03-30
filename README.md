# 🤖 Amkyaw AI Power Platform

A powerful AI chat platform built with Next.js, featuring multi-AI routing with Groq and HuggingFace integration.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3-cyan)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🗣️ AI Chat
- Natural conversations with Llama 3.3 70B
- Smart intent detection
- Myanmar language support (မြန်မာစာ)

### 💻 Code Assistant
- Write code in Python, JavaScript, TypeScript, and more
- Debug and fix errors
- Code explanations

### 🌐 Translation
- English ↔ Burmese translation
- Automatic language detection

### 🖼️ Image Generation
- Create images with FLUX.1 AI (HuggingFace)
- Just describe what you want to see

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Framer Motion
- **AI:** Groq API (Llama 3.3 70B)
- **Image:** HuggingFace (FLUX.1 Schnell)
- **Database:** Neon PostgreSQL

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/amkyawdev/amkyaw-ai.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

## 🔧 Environment Variables

```env
# Groq API (required)
GROQ_API_KEY=your_groq_api_key

# HuggingFace API (optional - for image generation)
HUGGINGFACE_API_KEY=your_huggingface_api_key

# Neon Database (optional)
NEON_DATABASE_URL=your_neon_database_url
NEON_AUTH_URL=your_neon_auth_url
NEON_AUTH_JWKS_URL=your_neon_auth_jwks_url
```

## 📱 Pages

| Page | Description |
|------|-------------|
| `/` | Landing page |
| `/chat` | AI chat interface |
| `/docs` | Documentation |
| `/about` | About page |
| `/settings` | Settings |
| `/login` | Login page |
| `/register` | Register page |
| `/reset-password` | Reset password |

## 🎯 Intent Detection

The system automatically detects user intent:

| Intent | Keywords | API |
|--------|----------|-----|
| Chat | hi, hello, hey | Groq |
| Code | code, python, javascript | Groq |
| Translate | translate, ဘာသာပြန် | Groq |
| Image | generate image, draw, picture | HuggingFace |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📧 Contact

- Email: amk.kyaw92@gmail.com
- GitHub: https://github.com/amkyawdev/amkyaw-ai

## 📄 License

MIT License - feel free to use this project for any purpose.

---

Made with ❤️ in Myanmar
