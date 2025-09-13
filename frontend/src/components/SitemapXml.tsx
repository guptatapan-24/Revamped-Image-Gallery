// src/components/SitemapXml.tsx
import React, { useEffect } from 'react';

const SitemapXml: React.FC = () => {
  useEffect(() => {
    // Fetch the actual sitemap.xml file and display it
    fetch('/sitemap.xml')
      .then(response => response.text())
      .then(xml => {
        // Set proper XML content type and replace the page
        document.open();
        document.write(xml);
        document.close();
        document.contentType = 'application/xml';
      });
  }, []);

  return null; // This component doesn't render anything
};

export default SitemapXml;
