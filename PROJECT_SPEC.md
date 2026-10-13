# PROJECT_SPEC.md

You are building a PROTOTYPE called UniverLife. The goal is a working demo in
one day, not production quality. Read supabase/schema.sql first (it is the
source of truth), then save this whole message as PROJECT_SPEC.md and follow it.

## Product
Platform for university students in Uzbekistan: scholarships, international
programs, events with QR check-in, sport/science clubs, news, activity points
and a leaderboard. UI language: Uzbek (Latin script).

## Stack (do not change)
Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui.
Supabase (Postgres, Auth, RLS) via @supabase/supabase-js and @supabase/ssr.
Deploy on Vercel. No other backend, no ORM, no extra frameworks.

## Architecture
- Browser -> Next.js -> Supabase (Auth + Postgres + RLS). No custom API server.
- Tables: profiles, opportunities (type: scholarship | international),
  events, groups (type: sport | science), news, applications,
  event_registrations (has qr_token), group_members, points_log.
  View: leaderboard. Function: check_in(p_token).
- Points are awarded ONLY by the check_in() SQL function via supabase.rpc.
  The app never inserts into points_log.
- Leaderboard is read from the leaderboard view, never stored separately.
- Auth: user types HEMIS login like "name.surname"; map it to
  "name.surname@univerlife.demo" for Supabase email/password auth. All of this
  logic lives only in lib/auth so it can be replaced with real HEMIS later.
- Only NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are used.

## MUST DO
1. All content (scholarships, programs, events, clubs, news) comes from
   Supabase. Only UI labels, category names and nav items may live in code.
2. Every data page has loading, empty and error states (friendly Uzbek text).
3. Guard /admin routes on the SERVER (profiles.role = "admin", else redirect).
   Hiding buttons in the UI is not security.
4. RESPONSIVE, works on BOTH mobile and desktop:
   - Mobile (<768px): single column, bottom nav (Bosh, Stipendiya, Tadbir,
     Media, Profil), top bar with search icon + logout.
   - Desktop (>=768px): NO bottom nav. Use a left sidebar (or top nav) with the
     same items, content in a centered container max-w-5xl, card grids with
     2-3 columns.
   - No horizontal scroll at 360px, 768px, 1280px widths. Use min-h-dvh, not
     100vh. Touch targets at least 44px. Images with fixed aspect ratio and
     object-cover. Forms and tables must not overflow on mobile (tables become
     stacked cards on small screens).
   - Test mentally at those 3 widths before finishing each stage.
5. Design: dark navy #151230, indigo #3D3BDF, coral #FF6B57, light bg #F3F4FA,
   rounded cards, clean modern look.
6. Deadline display: countdown, red if under 7 days, "Muddat o'tgan" if past.
7. Work in small stages. At the end of each stage STOP and give me a short
   manual test checklist. Do not start the next stage until I say "davom et".
8. Before any terminal command, explain in one line what it does. Tell me each
   npm package name before installing it.

## MUST NOT DO
- Do NOT hardcode content arrays in components (no const scholarships = [...]).
- Do NOT change supabase/schema.sql or RLS policies without asking me.
- Do NOT use or ask for the service_role key. .env.local must be git-ignored.
- Do NOT install anything globally. No docker, no sudo, no Supabase CLI.
- Do NOT scrape websites or call external APIs for data. Not in this prototype.
- Do NOT add features outside this spec (no live stream, no schedule, no
  blogs, no multi-language, no Telegram, no real HEMIS integration).
- Do NOT write "production-ready" code with tests, CI, Docker. Prototype only:
  simple and readable beats clever.
- Do NOT put fake statistics (like "1240 viewers") anywhere in the UI.
- Do NOT write seed data with fixed dates. Use relative dates only.

## Routes
/login, /register, / (home), /opportunities (?type=scholarship|international),
/opportunities/[id], /events, /events/[id], /groups, /groups/[id],
/media, /media/[id], /profile, /leaderboard,
/admin, /admin/opportunities, /admin/events, /admin/groups, /admin/news,
/admin/applications, /admin/checkin

## Stages
Stage 1 - Foundation: scaffold the project in the current empty folder, set
up Tailwind + shadcn/ui, Supabase clients and middleware (redirect
unauthenticated users to /login, except /login and /register). Build /login
and /register (full name, HEMIS login, university, faculty, group, password;
on register: signUp then insert profile with role "student"). Build the
responsive app shell (bottom nav on mobile, sidebar on desktop). Create
.env.example. STOP.

Stage 2 - Read-only pages: Home (greeting with name/university/faculty/group,
total points, leaderboard rank, counts of open scholarships/upcoming
events/sport clubs/international programs, search box using ilike across
opportunities, events, groups), /opportunities with type filter and deadline
countdown + detail page (requirements, contact), /events with category chips +
detail, /groups with sport/science tabs + detail, /media list + article
detail. Also write supabase/seed.sql: realistic demo content in Uzbek, relative
dates only (current_date + interval '10 days'), INSERT only into
opportunities, events, groups, news. No DELETE/DROP/TRUNCATE. Mark demo items
honestly (e.g. a small "Demo" badge or note on the home page). I will review
and run the seed myself. STOP.

Stage 3 - Student actions: "Ariza topshirish" (applications insert, show
status if already applied), event registration with QR code (qrcode.react,
encodes qr_token, cancel allowed while not checked in), group join/leave,
/profile (info, my applications, my events with QR, my clubs, total points),
/leaderboard (top 20, highlight current user). Friendly Uzbek messages for
duplicate-action errors. STOP.

Stage 4 - Admin: one reusable CRUD component (list + create/edit form + delete
+ publish toggle) used for opportunities, events, groups, news.
/admin/applications (approve/reject). /admin/checkin: camera QR scanner
(html5-qrcode) plus a manual token input fallback; on scan call
supabase.rpc("check_in", { p_token }) and show awarded points or the error.
"Admin" link in Profile only for admins. STOP.

Stage 5 - Polish: PWA manifest + icons, responsive pass on every page at
360/768/1280px, lint + type-check and fix errors. Then list the env variables
I must add on Vercel (deploy via GitHub import, no CLI) and a final smoke-test
checklist. STOP.

## DESIGN SYSTEM (follow exactly, do not invent your own look)
Brand: "Samarqand". Warm, clean, calm. Pattern is decoration only.
Colors (put in tailwind config as tokens, never hardcode hex in components):
  ink #0A3D3A (main dark), teal #0B8A7E (accent), saffron #F2B01E (highlight,
  use sparingly: active nav, one CTA per screen, points number),
  mist #EEF6F3 (page background), white #FFFFFF (cards),
  muted-text #2F5B57, danger-soft #FFE4DF with text #B3321F (deadline < 7 days).
Fonts via next/font/google: Unbounded (headings, numbers, wordmark; weights
  500/700) and Onest (body, labels; weights 400/500/600/700).
Shape: cards rounded-2xl, white on mist, no heavy shadows. Buttons rounded-full.
Logo: /public/logo.svg (use as is, do not redraw). Wordmark next to it:
  "Univer" in ink + "Life" in teal, Unbounded 700.
Layout rules:
  - Home has ONE main block: dark ink card with points (saffron, large) and a
    saffron "#N reyting" pill. Below it max 3 stat rows, then "Muddati yaqin"
    card with a saffron border. No more than that above the fold.
  - Icons: lucide-react only, stroke 1.8, used only in nav and category chips.
  - Mobile: floating rounded-full bottom nav in ink; active item = saffron pill
    with ink icon. Desktop (>=768px): top bar in ink with logo, nav links
    (active = saffron pill), avatar on the right. No bottom nav on desktop.
  - A faint outlined 8-point star decoration is allowed on the ink hero card only.
Keep screens compact and uncluttered: fewer elements, more whitespace.
update profiles set role = 'admin' where hemis_login = 'sening.loginging';
