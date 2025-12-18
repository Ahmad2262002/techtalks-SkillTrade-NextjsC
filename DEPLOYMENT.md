# Deployment Guide for skill-sync

This project is built with Next.js, Prisma, and Supabase. Follow these steps to deploy to Vercel.

## 1. Prerequisites

Ensure you have a Vercel account and have the Vercel CLI installed or are using the Vercel Dashboard.

## 2. Environment Variables

You must configure the following environment variables in your Vercel Project Settings (Settings -> Environment Variables).

| Variable Name | Description |
|---|---|
| `DATABASE_URL` | The connection string for your PostgreSQL database (Supabase Transaction Pooler URL). |
| `DIRECT_URL` | The direct connection string for your PostgreSQL database (Supabase Session Pooler / Direct URL) - required for migrations. |
| `NEXT_PUBLIC_SUPABASE_URL` | The URL of your Supabase project. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The anonymous public key for your Supabase project. |

**Important:** Do not commit your `.env` file to version control.

## 3. Project Configuration

The project is configured to look for the `postinstall` script to generate the Prisma Client. we have added:
```json
"postinstall": "prisma generate"
```
to `package.json`. This ensures the Prisma Client is generated during the build process on Vercel.

## 4. Deploying

### Option A: Vercel Dashboard (Recommended)
1. Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2. Import the project in Vercel.
3. Configure the **Build Command** as `next build`.
4. Configure the **Install Command** as `npm install`.
5. Add the Environment Variables listed above.
6. Click **Deploy**.

### Option B: Vercel CLI
Run the following command in your terminal:
```bash
vercel
```
Follow the prompts to link your project and deploy.

## 5. Database Migrations
If you need to run migrations against your production database, you can do so from your local machine (ensure `.env` has the correct production connection strings temporarily, or use the flags) or configure a build step.
Typically, you run:
```bash
npx prisma migrate deploy
```
locally against the production database URL before/after deployment, or use a separate CI/CD step.
