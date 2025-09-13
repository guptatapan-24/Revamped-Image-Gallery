// src/types/palette.ts - PALETTE TYPE DEFINITIONS
export interface ColorPalette {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  colors: {
    // Primary colors
    primary: string;
    primaryHover: string;
    primaryActive: string;
    secondary: string;
    secondaryHover: string;
    
    // Background colors
    background: string;
    cardBackground: string;
    headerBackground: string;
    overlayBackground: string;
    
    // Text colors
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textInverse: string;
    
    // UI elements
    border: string;
    borderHover: string;
    link: string;
    linkHover: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // Gallery specific
    imageBackground: string;
    lightboxOverlay: string;
    badgeBackground: string;
    highlightColor: string;
  };
}

export interface ContrastCheck {
  ratio: number;
  level: 'AA' | 'AAA' | 'FAIL';
  readable: boolean;
}
