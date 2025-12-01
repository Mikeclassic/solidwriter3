# SolidWriter Environment Variables

## Required Environment Variables for Vercel Deployment

### Core Database & Authentication
```
DATABASE_URL=postgresql://username:password@host:port/database
```
- Your PostgreSQL connection string
- Must be a production-ready PostgreSQL database
- For Vercel: Use Vercel Postgres or external provider (Supabase, Neon, etc.)

```
NEXTAUTH_SECRET=your-secret-key-here
```
- Generate with: `openssl rand -base64 32`
- Used to encrypt session tokens
- Critical for authentication security

```
NEXTAUTH_URL=https://your-app.vercel.app
```
- Your production URL
- For development: `http://localhost:3000`

### AI Integration
```
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key
```
- Your OpenRouter API key
- Get from: https://openrouter.ai/keys
- Required for Kimi AI model access

### External Authentication Providers (Optional)
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```
- For Google OAuth sign-in
- Get from Google Cloud Console

```
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```
- For GitHub OAuth sign-in
- Get from GitHub Developer Settings

### Job Queue & Caching
```
REDIS_URL=redis://username:password@host:port
```
- Redis connection for BullMQ job queue
- For Vercel: Use Upstash Redis or external provider
- Optional for basic functionality, required for background jobs

## Development Environment Setup

1. **Clone and Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

3. **Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Fill in all required variables
   - Never commit `.env.local` to version control

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Production Deployment Checklist

### Database Setup
- [ ] PostgreSQL database with pgvector extension enabled
- [ ] Database migrations applied
- [ ] Connection pooling configured

### Environment Configuration
- [ ] All required environment variables set in Vercel
- [ ] Production URLs configured
- [ ] API keys tested

### Redis Setup (if using job queue)
- [ ] Redis instance configured
- [ ] Connection tested
- [ ] Job queue worker deployed

### Domain & SSL
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Redirects configured

### Monitoring
- [ ] Error tracking configured
- [ ] Performance monitoring setup
- [ ] Database connection monitoring
