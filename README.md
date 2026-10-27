# CampusConnect — DDU student hub

An independent, mobile-friendly student-help prototype for Deen Dayal Upadhyaya Gorakhpur University students. It is **not an official university service**. Demo notices and resources are clearly labeled. Confirm dates, notices, results, and eligibility with an official source.

## What works

- Search academic resources and open curated links. Recognized official domains and other external links are labeled separately.
- Students can submit questions, save a private reference code, track the status and answer, and send feedback. No automatic email or response-time guarantee is provided.
- A protected `/admin` dashboard lets an administrator add, edit or delete notices, resources, links, FAQs and events; change welcome/banner text; turn demo examples on or off; answer questions; and manage feedback.
- Student submissions and editable site content are stored in PostgreSQL using Drizzle ORM. Demo notices and resources are UI-only.

## Configure locally

1. Install Node.js 20+ and PostgreSQL, then run `npm install`.
2. Copy `.env.example` to `.env`. Set `DATABASE_URL` to your PostgreSQL connection string. For Neon, use its pooled URL for `DATABASE_URL` and its direct (unpooled) URL for `DATABASE_DIRECT_URL`. Set a strong unique `ADMIN_PASSWORD` of at least 12 characters and a different random `ADMIN_SESSION_SECRET` of at least 32 characters. You can generate a secret with `openssl rand -base64 48`. Never commit or share these values.
3. Run `node scripts/migrate.mjs` to apply the versioned migrations, then `npm run dev`. Visit `http://localhost:3000`; visit `/admin` to sign in. Without both admin variables, admin login is disabled rather than using a default password.

## Update your website without code

1. Open `/admin` (or **Manage content** in the student hub) and sign in with the server-configured `ADMIN_PASSWORD`.
2. Choose **Notices**, **Resources**, **Links**, **Events**, or **FAQs**. Fill in the form and select **Add**. Use the pencil icon to edit an item or the trash icon to delete it. Changes are saved in the database; refresh the student hub to see them.
3. In **Links**, use a secure `https://` URL and choose an optional quick-access card. Known university/government domains are labeled official; other destinations are labeled external and should be verified. Notices and events require an approved official source and a real date.
4. In **Homepage**, update the welcome and banner text, and turn demo examples on or off. **Questions** lets you answer, update status or delete submissions; **Feedback** shows student suggestions. Major new features and layout changes can still be added later in the code.

## Deploy with free resources

A visual step-by-step guide is available at `/setup`. The workspace preview is temporary; it is not a permanent public deployment. A free production link requires accounts with the providers below.

1. Export the project and push it to a GitHub repository. The included `.gitignore` excludes real environment files and build output. Never commit passwords or database URLs. Include `drizzle/`, `scripts/`, and `vercel.json`.
2. Create a Neon Free PostgreSQL project. From **Connect**, copy both the pooled URL and the direct (unpooled) URL. Neon currently offers a free plan, but usage limits and terms may change; idle compute can sleep and the first request can be slower.
3. Import the GitHub repository into Vercel. If eligible, choose the free Hobby plan (personal, non-commercial use only). Add these **server-side environment variables** before deploying:
   - `DATABASE_URL`: Neon pooled URL.
   - `DATABASE_DIRECT_URL`: Neon direct URL for migrations.
   - `ADMIN_PASSWORD`: a strong unique password of at least 12 characters for the admin panel.
   - `ADMIN_SESSION_SECRET`: a different random secret of at least 32 characters.
4. Deploy. The included `vercel.json` runs the versioned database migrations automatically, then builds the app. The initial migration can also be applied to an existing database whose tables already match this schema; back up and review any existing database first. Copy the project's production `*.vercel.app` domain from Vercel and visit it with `/admin` to manage content. Verify `/api/health`, question submission/tracking and admin sign-in over HTTPS.
5. Environment-variable changes require a redeploy. For preview branches, use a separate database and preview environment variables so tests cannot modify production data. Generate a new Drizzle migration when changing the schema; review and back up before deploying it.
6. No provider can guarantee free hosting or a domain forever. Free-tier quotas can interrupt service, policies can change, and custom domains usually cost money. Monitor usage and keep regular database and GitHub backups. See [Vercel Hobby](https://vercel.com/docs/plans/hobby) and [Neon pricing](https://neon.com/pricing) for current terms.

## Test the workflow

1. Search the labeled demo resources, open an official link, and submit a question. Save the reference code displayed after submission.
2. Sign in at `/admin`, update the question status, add an answer and save. Enter the code in **Track your question** to verify the status and answer. Submit feedback and check the Feedback tab.
3. Add a notice with a real publication date and verified official source, and add a resource with a valid HTTPS URL. Check the homepage; edit and delete them from the admin dashboard. When no items are published, labeled examples or an empty state appear according to the Homepage setting.
4. Run `npx next typegen`, `npm exec tsc -- --noEmit`, and `npm run build` before deployment.

## Security and responsible operation

Admin sessions are signed, HTTP-only, SameSite cookies; the session secret and password stay on the server. Public forms have length validation, random tracking codes and a simple per-instance rate guard. A reference code grants access to its response, so treat it as private; do not submit passwords, identity numbers or sensitive information. Optional contact information and feedback are visible to administrators. This prototype has a single shared admin password, no email delivery, no moderation queue and no shared distributed rate limiting. Before public scale, add individual administrator accounts and role-based access, a shared rate limiter/abuse protection, audit logs, retention/deletion policies, backups, accessibility testing and a privacy notice appropriate to your organization. Keep dependencies updated.

## Architecture

`src/app/api` contains public and protected route handlers, `src/db/schema.ts` defines the tables, `drizzle/` holds versioned migrations, `src/components` holds the interface, and `src/lib` contains validation, auth, demo data and rate-limit helpers. Official links and provider policies can change, so re-verify before publishing.
