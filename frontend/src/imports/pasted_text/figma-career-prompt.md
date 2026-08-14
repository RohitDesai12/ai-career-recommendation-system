Here's a detailed Figma prompt you can paste directly:

---

**🎨 Figma Design Prompt — AI Career Recommendation Platform**

---

**Project Name:** CareerCompass AI — BTech Career Guidance Platform

**Design Style:**
Dark theme, futuristic but clean. Think deep navy/dark slate backgrounds (#07080F, #0E0F1A) with electric blue (#4F8EF7) as the primary accent, coral/orange (#F7934F) as secondary accent, and mint green (#4FF7B0) for success states. Typography: bold display font (Clash Display or Syne) for headings, clean sans-serif (Cabinet Grotesk or DM Sans) for body. Glassmorphism cards with subtle blur, grid line backgrounds, animated gradient blobs.

---

**Pages to Design:**

**1. Landing Page / Hero**
- Full-screen hero with animated particle/grid background
- Large headline: "Discover Your Perfect Career Path" with gradient text
- Subheading: "AI-powered guidance for every BTech student — from CSE to Civil"
- Two CTA buttons: "Get Career Match" (filled, blue) and "See How It Works" (outlined)
- Below hero: floating feature cards showing — AI Recommendation, Resume Analyzer, Career Chatbot, Skill Gap Analyzer, Dashboard
- Social proof bar: "Trusted by 10,000+ BTech students | 15 Branches | 95+ Career Paths"
- Navbar: Logo left, links center (Features, How It Works, About), Login + Get Started right

**2. Multi-Step Career Assessment Form**
- Progress bar at top showing 5 steps with step labels
- Step 1 — Academic Background: Branch dropdown (grouped by category), dynamic Specialization dropdown, Year, CGPA range
- Step 2 — Skills: Branch-adaptive skill chips (multi-select tags), projects count, certifications
- Step 3 — Priorities: Two drag-and-drop ranking lists side by side — "Interest Areas" and "Career Values"
- Step 4 — Work Style: Visual card selectors for work preference, environment, remote preference
- Step 5 — Goals: Icon cards for post-BTech goal, salary expectation, soft skills
- Design: One card per step, smooth slide animation between steps, accent line at top of card

**3. Career Result / Recommendation Page**
- Top: Large animated icon + "Your Career Match" label
- Primary recommendation card: huge career title with gradient text, confidence percentage bar, top skill needed, best sector
- Below: 3 alternative career path cards in a row
- Right panel: Skill roadmap — what to learn next (timeline style)
- Bottom: Action buttons — "Analyze My Resume", "Talk to Career Mentor", "View Skill Gap"

**4. Resume Analyzer Page**
- Left panel: Drag-and-drop PDF upload zone with dashed border, upload icon, "Drop your resume here or browse"
- Right panel: Analysis results after upload —
  - ATS Score (circular progress ring, e.g. 72%)
  - Keyword Match section (green matched / red missing keywords as chips)
  - Sections Detected (checklist: Contact, Summary, Skills, Experience, Education)
  - Improvement Suggestions (numbered list with priority badges: High / Medium / Low)
- Top: Job role input field — "Analyzing for which role?" so keywords are role-specific

**5. AI Chatbot — Career Mentor**
- Split screen layout
- Left sidebar: Chat history list, "New Chat" button, previous sessions by date
- Main area: Chat interface with message bubbles (user right, AI left with avatar icon)
- AI messages: slightly different background (glass card style), with source tag "Based on your profile"
- Bottom input bar: text field + send button + attach resume icon + voice icon
- Suggested questions as chips above the input: "What skills should I learn?", "Is my CGPA enough?", "Best companies for ECE VLSI?"
- Top bar: "Career Mentor" title + student profile chip showing branch + specialization

**6. Skill Gap Analyzer**
- Top: Current Role (auto-filled from recommendation) vs Target Role (dropdown to change)
- Center: Horizontal skill comparison bars — each skill shows current level vs required level
- Color coding: Green = sufficient, Yellow = needs improvement, Red = missing entirely
- Below comparison: Learning Resources section — course cards (Coursera, Udemy, YouTube) for each gap skill
- Right panel: "Gap Score" — overall readiness percentage with a radial chart
- Timeline estimate: "At current pace, you can close this gap in ~3 months"

**7. Student Dashboard**
- Top: Welcome banner "Good morning, Rahul 👋" with branch + year chip
- Stats row: 4 cards — Career Match Score, Resume Score, Skills Assessed, Chatbot Sessions
- Main content left: Career Journey timeline (Assessment → Skill Building → Resume → Placement)
- Main content right: Recommended Next Actions list (e.g. "Complete Python certification", "Update resume skills section")
- Bottom: Trending careers in your branch (horizontal scroll cards)
- Sidebar navigation: Home, Career Test, Resume, Skill Gap, Chatbot, Settings

---

**Additional Features to Add to Platform:**

- 🏆 **Leaderboard / Peer Comparison** — see how your skill score compares to other students in your branch
- 📅 **Placement Calendar** — upcoming company visits, deadlines, test dates with reminders
- 🎓 **College-Specific Insights** — average package, top recruiters, branch-wise placement stats for your college
- 📚 **Learning Path Generator** — auto-generate a 3/6/12 month roadmap based on your target career
- 🔔 **Job / Internship Alerts** — notify when companies matching your profile open applications
- 📊 **Progress Tracker** — weekly check-ins to update skills and see growth over time
- 🤝 **Alumni Connect** — connect with alumni working in your target career field
- 📝 **Mock Interview Prep** — AI generates role-specific interview questions based on your profile

---

**Component Library to Design:**
- Navigation bar (desktop + mobile)
- Step progress bar
- Branch → Specialization dropdown pair
- Skill chip (default / selected / disabled states)
- Career result card (primary + alternate)
- Confidence percentage bar
- Drag-and-drop ranking list item
- Chat bubble (user + AI variants)
- Skill gap bar (3 states)
- Dashboard stat card
- Resume score ring

---

**Color Tokens:**
```
Background:     #07080F
Surface-1:      #0E0F1A
Surface-2:      #161728
Border:         #2C2E4A
Primary:        #4F8EF7
Secondary:      #F7934F
Success:        #4FF7B0
Danger:         #F74F8E
Text Primary:   #EEEEF8
Text Muted:     #6B6D99
```

**Typography Scale:**
```
Display XL:   Clash Display 56px Bold    — Hero headline
Display L:    Clash Display 40px Bold    — Page titles
Heading:      Clash Display 24px SemiBold — Section titles
Body:         Cabinet Grotesk 15px Regular
Caption:      Cabinet Grotesk 12px Medium — Labels, tags
```

---

Copy this entire prompt into Figma AI, or share it with your UI designer. Want me to also generate a sitemap diagram or user flow chart for this platform?