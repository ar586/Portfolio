# Sahayak: The College Syllabus Assistant 🎓

Sahayak ("Helper/Assistant" in Sanskrit) is an open-source, community-driven platform developed by Aryan Anand, designed to demystify college semantics. It acts as an academic encyclopedia, providing students with structured breakdowns of their courses, critical study strategies, and curated study materials, turning overwhelming syllabi into actionable roadmaps.


## Features 🚀

- **📚 Curated Academics:** Browse a vast archive of subjects with beautifully formatted, encyclopedic deep-dives into difficulty, scoring potential, and exact time investments needed.
- **🔍 On-The-Fly Search:** Instantly filter and search for courses by name, branch, core topics, or IDs with an elegant real-time engine.
- **📑 Unit-by-Unit Breakdowns:** Granular visibility into the postulates of each unit and its relative reward-to-effort ratios. 
- **🎓 Strategic Blueprints:** Find specific battle-tested modes of study tailored to Mid-Semester crunches, End-Semester marathons, or 1-day rapid reviews, complete with Previous Year Question Paper (PYQ) attachments.
- **📝 Community Contributions:** A streamlined "Contribute" wizard allowing upperclassmen and scholars to append their knowledge regarding courses they've survived. 
- **🛡️ Admin Archiving:** Built-in dashboard and moderation capabilities to review, edit, or publish incoming syllabus contributions.
- **🖨️ Archival Export:** Distraction-free, watermarked "Export to PDF" using native browser print optimizations for offline study sessions.

## Architecture & Tech Stack

Sahayak uses a decoupled, modern stack with a uniquely styled vintage "Bento" aesthetic:

### Frontend
- **Framework:** Next.js (React 19) App Router
- **Styling:** Tailwind CSS v4 (Custom Academic Green/Gold/Parchment palette)
- **Icons:** Lucide React
- **Typography:** Custom serif (Newsreader/Playfair/Georgia) and stark sans-serif contrasts.

### Backend
- **Framework:** FastAPI (Python)
- **Database Operations:** Asynchronous Motor (`motor-asyncio`)
- **Database Layer:** MongoDB
- **Authentication:** JWT (JSON Web Tokens) with Argon2 Password Hashing
- **Validation:** Pydantic

## License 📜

This project is licensed under the MIT License - see the LICENSE file for details. `Scientia potentia est.`
