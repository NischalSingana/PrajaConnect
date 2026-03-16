# 🇮🇳 PrajaConnect

**PrajaConnect** is a state-of-the-art civic accountability platform designed to bridge the gap between citizens and municipal authorities. By leveraging advanced AI and real-time geolocation, PrajaConnect transforms how urban issues are reported, tracked, and resolved.

![PrajaConnect Logo](public/logo.png)

## 🚀 Key Features

### 🧠 Issue Intelligence (Dual-LLM)
Our reporting engine is powered by a high-availability AI gateway:
- **Primary**: Llama-3 (via Groq) for ultra-low latency analysis.
- **Failover**: Gemini 1.5 Flash (via Google AI) to ensure 100% uptime.
- **Automated Routing**: AI automatically categorizes reports into **Infrastructure**, **Sanitation**, **Safety**, or **General** and assigns priority levels.

### 📍 Precision Reporting
- **Native Camera Capture**: Built-in support for real-time photo proof (Rear/Environment camera optimization).
- **Reverse Geocoding**: Automatically identifies human-readable addresses from GPS coordinates using OpenStreetMap.
- **Verified Presence**: Prevents fraudulent reporting by ensuring metadata is captured on-site.

### 🏙️ Metropolitan Scale
- **Live Statistics**: Displays real-time scale (85k+ Citizens, 150k+ Reports) dynamically synchronized with the platform's database.
- **SLA Tracking**: Every report is bound by a strict Service Level Agreement (SLA) with a 36-hour resolution benchmark.

### 📊 Public & Private Dashboards
- **Community Pulse**: A masonry-style public feed for transparency and upvoting.
- **Citizen Dashboard**: Personal tracking of reputation scores, badges, and activity timelines.
- **Analytics Engine**: Heatmaps and resolution trends for ward-level insights.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, GSAP, Lucide React.
- **Backend**: Node.js, Express, Groq SDK, Google Generative AI SDK (@google/generative-ai).
- **Database**: Drizzle ORM + Neon (Serverless PostgreSQL).
- **Auth**: Clerk (Enterprise-grade identity management).

## 📦 Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/PrajaConnect.git
   cd PrajaConnect
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="your-neon-url"
   GROQ_API_KEY="your-groq-key"
   GEMINI_API_KEY="your-gemini-key"
   CLERK_PUBLISHABLE_KEY="your-clerk-pk"
   CLERK_SECRET_KEY="your-clerk-sk"
   ```

4. **Run in development**:
   ```bash
   npm run dev
   ```

## 📜 Contributing
We believe in community-driven change. Feel free to open issues or submit pull requests to help improve civic engagement in our cities.

---
*Built with ❤️ for a better tomorrow.*
