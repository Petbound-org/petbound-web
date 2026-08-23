# Petbound 🐾
The adoption website exclusively for animals at risk of euthanasia.

## Purpose

In the U.S., countless adoptable animals face this devastating outcome due to overcrowded shelters. Petbound directly addresses this crisis by providing a focused, up-to-date, and accessible directory of animals needing urgent placement. Our goal is to connect these vulnerable pets with loving homes, saving lives one adoption at a time.

## Tech Stack + Project Architecture

### Frontend 

* **Next.js (App Router):** This is our main framework, providing a fast and clean user interface.
* **TypeScript (TS):** TypeScript is used to ensure a higher level of build quality and to catch simple bugs.

### **Backend + Data Collection**

* **Supabase:** This is our backend. It handles the database (PostgreSQL), provides easy-to-use APIs, and manages user login. It also has edge functions and cron jobs that clean data.
* **Automated Data Pipeline (Python & GitHub Actions):** 
    * **Python with BeautifulSoup4:** We use Python to run a web-scraper that collects data that is then stored in our database.
    * **GitHub Actions:** This allows us to automate our data collection and create a self-sufficient database with up to date and cleaned data.

## Conventions Worth Knowing

Two areas hold non-obvious rules. Read these before changing pet pages or metadata.

### Pet listing lifecycle

A euthanasia date passing does **not** mean the animal died. Shelters routinely push
these dates back: 28% of currently-listed pets carry a date more than 14 days after
they were first seen. The database also has no outcome column, so a pet disappearing
from the source is indistinguishable from one that was euthanized.

`lib/pet-status.ts` therefore gives every listing one of three states:

| State | When | Behaviour |
|---|---|---|
| `live` | deadline is today or later | Countdown and shelter contact shown |
| `unconfirmed` | within `GRACE_PERIOD_DAYS` (7) after | No countdown, outcome stated as unknown, contact still shown |
| `expired` | beyond the grace window | Page still served, pointed at pets that still have time |

Expired pages are deliberately **not** 404'd or noindexed: they carry most of the
site's search traffic. They are excluded from the sitemap once past the grace window.

Never write copy asserting that a pet was saved or euthanized. The data cannot
support either claim.

### Dates and timezones

`euthanasia_date` is a date-only column. Comparing it against wall-clock `Date.now()`
reads a day early through every Pacific evening, which silently corrupted both the
countdown and the "urgent" hub counts.

- For day arithmetic use `daysUntilDeadline` / `daysPastDeadline` (`lib/pet-status.ts`).
- For display use `formatDeadline` (`lib/seo/euthanasia.ts`), which renders in UTC.
- For the "still at risk" cutoff use `todayLocalISO()` (`lib/today.ts`).

Do not reintroduce ad-hoc `new Date(x).getTime() - Date.now()` arithmetic.

### SEO conventions

- **One canonical host**: `www.petbound.org`. `next.config.ts` redirects the apex and
  the `.vercel.app` alias to it permanently. Every absolute URL comes from `BASE_URL`
  (`lib/seo/constants.ts`).
- **Titles** use `%s | Petbound` from the root layout, so page titles stay bare.
- **No em dashes in user-facing copy.** They read as machine-written. Use commas,
  colons, or parentheses. Code comments are exempt.
- **FAQ markup must match the page.** Google treats `FAQPage` JSON-LD whose answers
  are not visible as spam, so both come from the same functions in
  `lib/seo/shelter-summary.ts`. Never write a separate copy for crawlers.
- **Scraped fields are often blank strings, not null.** Guard with
  `value?.trim() || fallback`; `??` alone lets `""` through and produced empty
  `<title>` tags on hundreds of pages.

## 🛠️ Getting Started (Local Development)

To run Petbound on your local machine, follow these steps.

### **Prerequisites**

* **Node.js** (LTS version recommended)
* A package manager like **npm**, **yarn**, **pnpm**, or **bun**.

### **1. Clone the Repository**

```bash
git clone git@github.com:Petbound-org/petbound-web.git
cd petbound
```

### **2. Install Dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### **3. Connect to Supabase**

Create your own supabase project and store your anon key, service role key, and supabase url in a .env file.

For shelter sign-up to work, the `shelters` table must have a `user_id` column (UUID, references `auth.users.id`). Add it with a migration if it does not exist.

**Confirmation emails (user & shelter sign-up):** Supabase sends these. By default, the built-in provider only sends to pre-authorized (team) addresses and has tight rate limits. To have sign-up confirmation emails delivered to any user:

1. In the Supabase Dashboard go to **Authentication → Providers → Email** and ensure **Confirm email** is enabled if you want verification.
2. In **Project Settings → Auth → SMTP Settings** configure a custom SMTP provider (e.g. Resend, SendGrid, AWS SES) so emails are sent reliably to all addresses. See [Supabase: Send emails with custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp).

**Password reset:** The app sends reset links to `https://your-domain/auth/reset-password`. In Supabase Dashboard **Authentication → URL Configuration**, add `https://your-domain/auth/reset-password` (and `http://localhost:3000/auth/reset-password` for local dev) to **Redirect URLs**.

### **4. Run your Server!**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```