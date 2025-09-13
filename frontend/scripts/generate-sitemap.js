// scripts/generate-sitemap.js - FIXED FOR ES MODULES
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { writeFileSync } from 'fs';

// Define your gallery routes
const links = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/gallery', changefreq: 'daily', priority: 0.9 },
  { url: '/search', changefreq: 'weekly', priority: 0.8 },
  { url: '/upload', changefreq: 'monthly', priority: 0.7 },
  { url: '/palette', changefreq: 'monthly', priority: 0.6 },
  { url: '/profile', changefreq: 'monthly', priority: 0.6 },
  { url: '/login', changefreq: 'yearly', priority: 0.3 },
  { url: '/register', changefreq: 'yearly', priority: 0.3 },
  { url: '/editor', changefreq: 'monthly', priority: 0.5 },
  { url: '/admin', changefreq: 'monthly', priority: 0.5 },
];

async function generateSitemap() {
  try {
    const stream = new SitemapStream({ 
      hostname: 'https://your-gallery-domain.com' // Replace with your domain
    });

    const xml = await streamToPromise(Readable.from(links).pipe(stream));
    
    // Write to public directory
    writeFileSync('./public/sitemap.xml', xml.toString());
    
    console.log('✅ Sitemap generated successfully!');
    console.log(`📄 Generated ${links.length} URLs`);
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
  }
}

generateSitemap();
