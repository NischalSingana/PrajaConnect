<div align="center">
  <img src="https://transparenttextures.com/patterns/cubes.png" width="100%" height="20" alt="pattern"/>
  <h1>🇮🇳 PrajaConnect</h1>
  <p><strong>Next-Generation Civic Accountability & Intelligence Platform</strong></p>
  <p>Empowering communities through transparent, AI-driven urban governance and swift infrastructure resolution.</p>
  
  [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=1c1c1e)](https://react.dev/)
  [![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.0-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
  [![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
</div>

<br />

**PrajaConnect** is a state-of-the-art civic management platform built to bridge the gap between citizens, moderators, and political leaders. By leveraging dual-LLM neural categorizations, real-time geolocation, and a glassmorphic dashboard ecosystem, PrajaConnect transforms how municipal issues are reported, mapped, and rapidly resolved.

---

## 🔥 Core Features

### 🧠 Advanced AI Routing (Dual-LLM Interface)
Our reporting engine utilizes a high-availability AI gateway to dynamically categorize issues across 18 unique infrastructure domains:
- **Primary Intelligence**: *Llama-3.3-70B* (via Groq) for high-speed pattern extraction and contextual priority signatures.
- **Failover Safenet**: *Gemini 1.5 Flash* (via Google AI) ensures zero downtime in civic analysis.
- **Automated Triage**: Automatically categorizes visual/textual data into fields like `Infrastructure`, `Animal Control`, `Pollution`, `City Planning` alongside confidence percentages.

### 📍 Precision Hardware Integration
- **Live Visual Proof**: Deeply integrated Cloudflare R2 bucket implementation for immutable photographic evidence.
- **Micro-Mapping**: Lat/Lng reverse-geocoding to convert physical locations to actionable civic zones.

### 🎭 Role-Based Command Centers
- **Citizen Dashboard**: Personal metrics tracking, community reputation scores, and live feed of local petitions.
- **Politician Command Portal**: A stunning, data-heavy overview of constituency sentiment, clearance rate metrics, and intelligent response broadcasting. Includes glassmorphic charts and SLA override capabilities.
- **Administrative Control**: Advanced system settings for overriding endpoints, clearing cache, or migrating database architectures.

### 📈 Real-Time Metropolitan Analytics
- **Dynamic Recharts Data**: Resolution line charts, area charting for trending data, and real-time active engagement metrics plotted directly against local municipal parameters.
- **Sentiment Analytics**: Platform measures upvotes, response speeds, and cross-party escalations to provide live "Approval/Sentiment" scoring for local districts.

---

## 🛠️ Architecture Stack

### Frontend (Client Interface)
- **Framework**: `React 19` + `TypeScript`
- **Build Tool**: `Vite`
- **Styling**: `Tailwind CSS 3` with deep custom tokens.
- **Animation**: `Framer Motion` (Staggered DOM reveals, presence states, glassmorphic glows).
- **Visualization**: `Recharts` for interactive dashboards.

### Backend (API & Governance)
- **Framework**: `Java Spring Boot (Spring Web, Spring Security)`
- **Database**: `Serverless PostgreSQL` via **Neon DB**.
- **ORM**: `Hibernate / JPA`
- **Storage Node**: `Cloudflare R2` (AWS S3-compatible SDK for Java).
- **Authentication**: `Clerk` JWT OAuth validation.

---

## 📦 Local Deployment

### 1. Repository Setup
```bash
git clone https://github.com/your-username/PrajaConnect.git
cd PrajaConnect
```

### 2. Environment Configuration
Create a `.env` file in the root directory. You will need keys for Neon PostgreSQL, Clerk, Cloudflare R2, and AI Endpoints.
```env
# Database
DATABASE_URL="postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require"

# Auth
CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Cloudflare R2 Storage
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="prajaconnect"
R2_PUBLIC_URL="https://pub-..."

# AI Neural Nets
GROQ_API_KEY="gsk_..."
GEMINI_API_KEY="AIza..."
```

### 3. Run the Development Server
This single script concurrently handles compiling the frontend via Vite and booting the Spring Boot Maven server.
```bash
npm run dev-server
# OR if node modules aren't installed:
npm install && npm run dev-server
```

> **Note**: Ensure you have `Java 17+` and `Maven` installed on your machine. The frontend runs on `localhost:5173` and automatically proxies API requests to the Java environment running on `localhost:3000`.

---

## 📸 Interface Preview
*(PrajaConnect utilizes a heavy dark-theme with aggressive micro-interactions. Below are some UI benchmarks you'll find after deploying).*
- Staggered HUD loader sequences during AI Analysis parsing.
- 3D-tilt glass cards inside the Politician/Constituency Command Portal.
- Smooth radial gradients powering the dynamic `MainLayout.tsx` structure.

---
<div align="center">
  <i>Engineered for the citizens, by the future.</i>
</div>
