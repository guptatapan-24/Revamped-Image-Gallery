# 📸 Revamped Image Gallery

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://revamped-image-gallery.vercel.app)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

A modern, professional image gallery platform built for **CloneFest 2025** — transforming the classic PHP image gallery into a cutting-edge React application with AI generation, real-time analytics, and advanced media management.

---

## 🌟 Live Demo
🔗 Production: [revamped-image-gallery.vercel.app](https://revamped-image-gallery.vercel.app)

---

## 📋 Table of Contents
- ✨ Features
- 🚀 Tech Stack
- ⚡ Quick Start
- 🔧 Installation
- 📁 Project Structure
- 🎯 Core Features
- 🎨 Bonus Features
- 🚀 Deployment
- 🏆 CloneFest 2025
- 🤝 Contributing

---

## ✨ Features

### 🎯 Core Functionality
✅ Universal Upload & Display — JPEG, PNG, WEBP, AVIF with automatic thumbnails  
✅ Content Management — Albums, collections, metadata with privacy controls (public/unlisted/private)  
✅ User & Rights Management — Admin/Editor/Visitor roles with permissions  
✅ Advanced Search & Filters — Keyword, album, date, metadata filters  
✅ Responsive & Accessible — Mobile-first, WCAG compliant  

### 🎨 Gallery Features
✅ Professional Lightbox — Keyboard controls, captions, zoom/pan  
✅ Real-time Analytics — View counts, engagement metrics, user tracking  
✅ Batch Operations — Bulk upload, delete, metadata editing, album management  
✅ Social Features — Comments, likes, sharing with spam protection  
✅ Advanced Downloads — Watermark integration, signed URLs, bulk download  

### 🚀 Bonus Features
✅ AI Image Generation — Stable Diffusion integration with prompt engineering  
✅ Custom Color Palettes — Full theming with live preview + WCAG checking  
✅ EXIF Data Extraction — Complete metadata display & search  

---

## 🚀 Tech Stack

**Frontend**  
- React 18 + TypeScript  
- Vite  
- Tailwind CSS + Shadcn/ui  
- React Hooks + Context  
- React Router v6  

**Backend & Database**  
- Supabase (PostgreSQL + REST API)  
- Supabase Auth  
- Supabase Storage + CDN  
- Supabase Subscriptions  

**AI & External Services**  
- Stable Diffusion API  
- Sharp + Canvas API  
- Vercel Edge Network  

---

## ⚡ Quick Start

**Prerequisites**  
- Node.js 18+  
- npm/yarn/pnpm  
- Supabase account  

1. **Clone Repository**
```bash
git clone https://github.com/guptatapan-24/Revamped-Image-Gallery.git
cd Revamped-Image-Gallery
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Setup** — create `.env`
```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_AI_API_KEY=your-stable-diffusion-api-key
```

4. **Database Setup** — run in Supabase SQL editor
```sql
CREATE TABLE images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  size_bytes BIGINT,
  privacy TEXT DEFAULT 'public' CHECK (privacy IN ('public', 'unlisted', 'private')),
  album TEXT,
  tags TEXT[],
  author TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  exif_data JSONB
);

CREATE OR REPLACE FUNCTION increment_image_view(p_image_id UUID)
RETURNS TABLE(new_view_count INTEGER) AS $$
BEGIN
  UPDATE images 
  SET view_count = COALESCE(view_count, 0) + 1 
  WHERE id = p_image_id;
  
  RETURN QUERY 
  SELECT COALESCE(view_count, 0)::INTEGER 
  FROM images 
  WHERE id = p_image_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public images viewable by everyone" ON images
  FOR SELECT USING (privacy = 'public');

CREATE POLICY "Users can upload images" ON images
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
```

5. **Run Development Server**
```bash
npm run dev
```
Visit: [http://localhost:5173](http://localhost:5173)

---

## 🔧 Installation

**Manual**
```bash
git clone https://github.com/guptatapan-24/Revamped-Image-Gallery.git
cd Revamped-Image-Gallery
npm install
cp .env.example .env
npm run dev
```

**Docker**
```bash
docker build -t revamped-gallery .
docker run -p 5173:5173 --env-file .env revamped-gallery
```

---

## 📁 Project Structure
```
Revamped-Image-Gallery/
├── public/                 
├── src/
│   ├── components/        
│   │   ├── ui/           
│   │   ├── Gallery.tsx   
│   │   ├── Lightbox.tsx  
│   │   ├── Sidebar.tsx   
│   │   └── AIGeneration/ 
│   ├── hooks/            
│   │   ├── useAuth.tsx   
│   │   ├── useImageViews.tsx 
│   │   └── useSupabase.tsx   
│   ├── lib/              
│   │   ├── supabase.ts   
│   │   └── utils.ts      
│   ├── pages/            
│   │   ├── Index.tsx     
│   │   ├── Profile.tsx   
│   │   ├── Upload.tsx    
│   │   └── PaletteEditor.tsx 
│   ├── types/            
│   └── utils/            
├── docs/                 
└── README.md
```

---

## 🎯 Core Features
- Multi-format uploads (JPEG, PNG, WEBP, AVIF)  
- Drag & drop batch upload with progress  
- Auto thumbnail generation + EXIF extraction  
- Privacy controls (public, unlisted, private)  
- Custom albums & collections  
- Real-time analytics (views, likes, downloads)  
- Advanced search & filters  

---

## 🎨 Bonus Features
- **AI Image Generation** with Stable Diffusion  
- **Advanced Controls** (seed, steps, CFG, sampler)  
- **NSFW Detection** + moderation  
- **Theme Editor** with WCAG compliance & per-user themes  
- **Professional Analytics** (load times, behavior tracking)  

---

## 🚀 Deployment

**Vercel (recommended)**
```bash
vercel --prod
```
Add environment variables in Vercel dashboard:  
- VITE_SUPABASE_URL  
- VITE_SUPABASE_ANON_KEY  
- VITE_SUPABASE_SERVICE_ROLE_KEY  

Push → auto-deploy with previews for PRs.  

**Manual**
```bash
npm run build
npm run preview
```

---

## 🏆 CloneFest 2025
- ✅ Core requirements: complete  
- ✅ Bonus A: AI Image Generation  
- ✅ Bonus B: Color Palette System  
- 🔄 Bonus C: Vector Search (in progress)  

**Highlights**
- Modern React + TS architecture  
- Real-time analytics with PostgreSQL RPC  
- AI integration with safety features  
- Advanced theming + accessibility  

---

## 🤝 Contributing
1. Fork repo  
2. `git checkout -b feature/amazing-feature`  
3. `npm install`  
4. Make changes + test  
5. `git commit -m 'Add amazing feature'`  
6. `git push origin feature/amazing-feature`  
7. Open PR  

**Standards**
- TypeScript strict  
- ESLint (Airbnb)  
- Prettier auto-formatting  
- Conventional commits  

**Contributors**
- Tapan Gupta — Lead Developer  
- Kathan1010 — Contributor  
- lovable-dev[bot] — Automation  

---

## 📄 License
MIT License — see LICENSE file  

---

## 🔗 Links
🌐 [Live Demo](https://revamped-image-gallery.vercel.app)  
📚 Documentation: `/docs`  
🐛 [Issues](https://github.com/guptatapan-24/Revamped-Image-Gallery/issues)  
💬 Discussions: GitHub Discussions  

---

Built with ❤️ for CloneFest 2025 — transforming classic web apps into modern, scalable platforms.
