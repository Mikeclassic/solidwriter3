# SolidWriter - Enterprise AI Writing SaaS

![SolidWriter Logo](./docs/logo.png)

SolidWriter is a production-ready SaaS application that uses advanced AI to learn and mimic your unique writing style, generating long-form content that sounds authentically yours. Built with Next.js 14, featuring voice profile engine, SEO optimization, and real-time streaming content generation.

## 🚀 Features

### Core Features
- **Voice Profile Engine**: Upload writing samples and train AI to mimic your style
- **Long-Form Content Generation**: Create comprehensive articles and blog posts
- **Real-Time Streaming**: Watch content generate live with Server-Sent Events
- **SEO Optimization**: Built-in SEO scoring and keyword density analysis
- **Project Management**: Organize content by projects with metadata tracking
- **Export Functionality**: Export content in multiple formats (Markdown, HTML, PDF)

### Technical Features
- **Serverless Architecture**: Optimized for Vercel deployment
- **Vector Database**: pgvector integration for voice similarity matching
- **Background Jobs**: BullMQ for handling long-running generation tasks
- **Real-time Updates**: Live generation progress and status updates
- **Dark Theme UI**: Professional interface with Deep Slate (#0F172A) and Electric Indigo (#6366F1)

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - App Router, Server Components, SSR
- **TypeScript** - Type safety throughout the application
- **Tailwind CSS** - Utility-first CSS framework with custom theme
- **Zustand** - State management for application context
- **Tiptap** - Rich text editor for content manipulation

### Backend & Database
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Primary database with pgvector extension
- **NextAuth.js v5** - Authentication with OAuth providers
- **BullMQ** - Job queue for background processing
- **Redis** - Caching and job queue management

### AI & APIs
- **OpenRouter** - AI model access via unified API
- **Kimi (moonshotai/kimi-k2-thinking)** - Primary LLM for content generation
- **Xenova Transformers** - Embedding generation for voice profiles
- **Server-Sent Events** - Real-time streaming responses

## 📦 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL database with pgvector extension
- Redis instance (optional for job queue)
- OpenRouter API key

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/solidwriter.git
   cd solidwriter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your environment variables (see [Environment Setup](./ENVIRONMENT_SETUP.md))

4. **Database setup**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗 Project Structure

```
solidwriter/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── generate/      # Content generation APIs
│   │   └── voice-profiles/# Voice profile management
│   ├── auth/              # Auth pages
│   ├── dashboard/         # Protected dashboard pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── providers.tsx      # Session provider wrapper
│   ├── ui/                # UI components
│   └── editor/            # Rich text editor components
├── lib/                   # Core utilities
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Database singleton
│   ├── store.ts           # Zustand state management
│   ├── kimi-client.ts     # OpenRouter/Kimi integration
│   ├── voice-profile.ts   # Voice profile engine
│   ├── seo-scoring.ts     # SEO analysis utilities
│   └── queue.ts           # BullMQ job queue
├── prisma/                # Database schema and migrations
│   └── schema.prisma      # Prisma schema
├── public/                # Static assets
└── docs/                  # Documentation
```

## 🔧 Configuration

### Required Environment Variables

See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed configuration instructions.

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
OPENROUTER_API_KEY=sk-or-v1-...
```

### Optional Authentication Providers

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npx vercel
   ```

2. **Configure environment variables** in Vercel dashboard

3. **Database setup**
   - Use Vercel Postgres or external provider
   - Enable pgvector extension
   - Run migrations: `npm run db:push`

4. **Deploy**
   ```bash
   npx vercel --prod
   ```

### Database Migration

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# View database (optional)
npm run db:studio
```

## 🎯 Usage

### Creating Voice Profiles

1. Navigate to Voice Profiles section
2. Upload 3-5 writing samples (minimum 100 words each)
3. Name your profile and add description
4. AI analyzes your writing style and creates embeddings

### Generating Content

1. Create a new project or use existing
2. Set generation parameters:
   - Topic and target audience
   - Voice profile selection
   - SEO keywords
   - Target length and tone
3. Generate with real-time streaming
4. Review and edit generated content
5. Export in desired format

### SEO Optimization

- Built-in Solid Score (0-100) rating
- Keyword density analysis
- Readability scoring
- Reading time estimation
- Content recommendations

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests (if configured)
npm run test
```

## 📊 Architecture Overview

### Voice Profile Engine
- Uses Xenova Transformers for embeddings
- pgvector for similarity matching
- Cosine similarity for style comparison
- Support for multiple voice profiles per user

### Generation Pipeline
1. User submits generation request
2. System creates generation job
3. Voice profile samples retrieved
4. Kimi AI generates content with style injection
5. SEO analysis performed
6. Results stored and returned

### State Management
- Zustand for client-side state
- Context object for generation parameters
- Real-time updates via Server-Sent Events
- Persistence in PostgreSQL database

## 🔒 Security

- NextAuth.js for secure authentication
- Environment variable protection
- Input validation and sanitization
- Rate limiting on API endpoints
- SQL injection prevention via Prisma

## 📈 Performance

- Server-side rendering for SEO
- Optimized bundle splitting
- Database query optimization
- Connection pooling
- Background job processing
- Streaming responses for large content

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- [Documentation](./docs/)
- [Environment Setup](./ENVIRONMENT_SETUP.md)
- [Issues](https://github.com/yourusername/solidwriter/issues)
- [Discussions](https://github.com/yourusername/solidwriter/discussions)

## 🎉 Acknowledgments

- **OpenRouter** for AI model access
- **Kimi AI** for powerful language model
- **Vercel** for deployment platform
- **Prisma** for database management
- **Tailwind CSS** for styling framework

---

Built with ❤️ for content creators who want AI to write like they do.
