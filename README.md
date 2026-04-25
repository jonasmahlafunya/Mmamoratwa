# MWAU – Mamoratwa Wa Afrika
## Web Application – Frontend Prototype

---

## Project Structure

```
mwau/
├── index.html                  ← Public home page
├── schema.sql                  ← MySQL database schema (backend-ready)
├── css/
│   └── main.css                ← Full design system & shared styles
├── js/
│   └── main.js                 ← Auth, modals, tabs, mock data, utilities
└── pages/
    ├── about.html              ← About Us
    ├── services.html           ← Services & Packages (plan comparison)
    ├── community.html          ← Community projects & gallery
    ├── feedback.html           ← Compliments & Complaints form
    ├── privacy.html            ← Privacy Policy (POPIA-compliant)
    ├── login.html              ← Member + Admin login (tabbed)
    ├── register.html           ← 5-step member registration
    ├── member-dashboard.html   ← Member portal
    └── admin-dashboard.html    ← Admin portal
```

---

## Demo Credentials

| Role   | Email                  | Password    |
|--------|------------------------|-------------|
| Member | member@mwau.co.za      | member123   |
| Admin  | admin@mwau.co.za       | admin123    |

---

## Pages & Features

### Public Pages
| Page | Description |
|------|-------------|
| Home | Hero, plan overview, testimonials, quote form, branches |
| About Us | Story, values, team, branches |
| Services & Packages | Full plan details, feature comparison table, additional services |
| Community | Projects, gallery, partnership CTA |
| Feedback | Compliments/complaints/enquiry form with star rating |
| Privacy Policy | POPIA-compliant privacy policy |

### Member Portal (`/pages/member-dashboard.html`)
- **Dashboard** – Cover banner, stats (dependants, premium, claims, join year), recent claims, dependants preview
- **My Plan** – Full plan detail with features and cover amount
- **Dependants** – Table of all covered dependants with plan limits shown
- **Claims** – Claim history with progress bar, file new claim modal
- **My Profile** – Personal details view
- **New Claim Modal** – Full form: deceased info, banking details for payout, 4 document upload fields, notes

### Admin Portal (`/pages/admin-dashboard.html`)
- **Dashboard** – Stats, plan distribution chart, recent activity, pending registrations, claims requiring attention
- **All Members** – Searchable, filterable table; click View for full profile modal with tabs (Personal / Dependants / Claims / Plan)
- **Pending Approvals** – Dedicated view for approve/reject workflow
- **All Claims** – Filterable by status; Review modal with tabs (Overview / Banking / Documents / Timeline); update status (Submitted → Under Review → Approved → Paid Out / Rejected)
- **Reports** – Membership summary, premium revenue, claims summary, export buttons (backend-ready)
- **Settings** – Per-plan dependant limits (editable), plan pricing, general toggles (email notifications, waiting period enforcement, etc.)

### Registration (`/pages/register.html`)
- 5-step wizard: Choose Plan → Personal Info → Dependants → Payment → Review & Submit
- Plan pre-selected via URL param (`?plan=prestige`)
- Payment: EFT (bank details + proof upload) or Card (mock form)
- Dependant type limits enforced per plan

---

## Authentication
- Auth is localStorage-based (mock) — replace with server-side sessions/JWT when connecting backend
- `Auth.login()`, `Auth.logout()`, `Auth.getSession()`, `Auth.requireAuth(role)` in `js/main.js`
- Portal pages call `Auth.requireAuth()` on load and redirect if unauthenticated

---

## Design System
- **Colours:** Maroon (`#6B0F1A`), Gold (`#C9A84C`), Cream (`#F9F5EE`)
- **Fonts:** Cormorant Garamond (display) + Jost (body) — loaded from Google Fonts
- **Pattern:** CSS-generated African diagonal crosshatch overlay (no external image needed)
- **Placeholders:** All `[ image ]` comments mark where real photos should be dropped in

---

## Connecting to Backend (MySQL)

1. **Import schema:** `mysql -u root -p mwau < schema.sql`
2. **Replace mock data** in `js/main.js` (`MWAU_DATA`) with API calls
3. **Replace `Auth` methods** with real session/JWT endpoints
4. **Wire file uploads** — `claim_documents` and `payments` tables are ready
5. **Settings** — `system_settings` table stores all admin-configurable values

### Suggested API endpoints:
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/members/register
GET    /api/members/:id
PATCH  /api/members/:id/status
GET    /api/members/:id/dependants
POST   /api/members/:id/dependants
GET    /api/claims
POST   /api/claims
GET    /api/claims/:id
PATCH  /api/claims/:id/status
POST   /api/claims/:id/documents
GET    /api/reports/summary
GET    /api/settings
PATCH  /api/settings
POST   /api/feedback
```

---

## Assets To Replace
Search the HTML files for `[ Replace with … ]` comments:
- `index.html` — Hero image, comfort/family scene image
- `about.html` — Company/team photo
- `community.html` — Project photos × 4, gallery photos × 6
- `pages/register.html` — No images needed
- Navbar & sidebar logo icons use CSS initials ("M") — replace with actual SVG/PNG logo

---

## Browser Support
Tested design targets: Chrome 100+, Firefox 100+, Safari 15+, Edge 100+
No build tools required — pure HTML/CSS/JS.
