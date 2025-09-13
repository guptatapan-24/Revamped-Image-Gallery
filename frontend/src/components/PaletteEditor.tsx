// src/components/PaletteEditor.tsx - COMPLETE PALETTE EDITOR
import React, { useState, useEffect, useCallback } from 'react';
import { ChromePicker, CirclePicker } from 'react-color';
import chroma from 'chroma-js';
import { 
  Save, Download, Upload, Eye, EyeOff, Palette, 
  AlertTriangle, CheckCircle, RefreshCw 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ColorPalette, ContrastCheck } from '../types/palette';

const DEFAULT_PALETTE: ColorPalette = {
  id: 'default',
  name: 'Default Theme',
  description: 'Original gallery theme',
  createdAt: new Date().toISOString(),
  colors: {
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    primaryActive: '#1d4ed8',
    secondary: '#64748b',
    secondaryHover: '#475569',
    background: '#ffffff',
    cardBackground: '#f8fafc',
    headerBackground: '#ffffff',
    overlayBackground: 'rgba(0, 0, 0, 0.8)',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    textInverse: '#ffffff',
    border: '#e2e8f0',
    borderHover: '#cbd5e1',
    link: '#3b82f6',
    linkHover: '#2563eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
    imageBackground: '#f1f5f9',
    lightboxOverlay: 'rgba(0, 0, 0, 0.9)',
    badgeBackground: '#e2e8f0',
    highlightColor: '#fbbf24'
  }
};

const PaletteEditor: React.FC = () => {
  const [currentPalette, setCurrentPalette] = useState<ColorPalette>(DEFAULT_PALETTE);
  const [savedPalettes, setSavedPalettes] = useState<ColorPalette[]>([]);
  const [selectedColorKey, setSelectedColorKey] = useState<keyof ColorPalette['colors']>('primary');
  const [showPreview, setShowPreview] = useState(false);
  const [paletteName, setPaletteName] = useState('My Custom Theme');
  const [contrastWarnings, setContrastWarnings] = useState<Record<string, ContrastCheck>>({});

  // Load saved palettes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gallery-palettes');
    if (saved) {
      try {
        setSavedPalettes(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading palettes:', error);
      }
    }
  }, []);

  // Check contrast ratios for accessibility
  const checkContrast = useCallback((foreground: string, background: string): ContrastCheck => {
    try {
      const ratio = chroma.contrast(foreground, background);
      const level = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'FAIL';
      return {
        ratio: Math.round(ratio * 100) / 100,
        level,
        readable: ratio >= 4.5
      };
    } catch {
      return { ratio: 0, level: 'FAIL', readable: false };
    }
  }, []);

  // Update contrast warnings when colors change
  useEffect(() => {
    const warnings: Record<string, ContrastCheck> = {};
    const { colors } = currentPalette;

    // Check important contrast pairs
    warnings.primaryText = checkContrast(colors.textInverse, colors.primary);
    warnings.backgroundText = checkContrast(colors.textPrimary, colors.background);
    warnings.cardText = checkContrast(colors.textPrimary, colors.cardBackground);
    warnings.headerText = checkContrast(colors.textPrimary, colors.headerBackground);

    setContrastWarnings(warnings);
  }, [currentPalette.colors, checkContrast]);

  // Apply palette to CSS variables
  const applyPalette = useCallback((palette: ColorPalette) => {
    const root = document.documentElement;
    Object.entries(palette.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    });
  }, []);

  // Update color in current palette
  const updateColor = (colorKey: keyof ColorPalette['colors'], color: string) => {
    setCurrentPalette(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: color
      }
    }));

    if (showPreview) {
      // Apply immediately if preview is active
      document.documentElement.style.setProperty(
        `--color-${colorKey.replace(/([A-Z])/g, '-$1').toLowerCase()}`, 
        color
      );
    }
  };

  // Save current palette
  const savePalette = () => {
    const newPalette: ColorPalette = {
      ...currentPalette,
      id: Date.now().toString(),
      name: paletteName,
      createdAt: new Date().toISOString()
    };

    const updatedPalettes = [...savedPalettes, newPalette];
    setSavedPalettes(updatedPalettes);
    localStorage.setItem('gallery-palettes', JSON.stringify(updatedPalettes));
    
    alert(`✅ Palette "${paletteName}" saved successfully!`);
  };

  // Load saved palette
  const loadPalette = (palette: ColorPalette) => {
    setCurrentPalette(palette);
    setPaletteName(palette.name);
    if (showPreview) {
      applyPalette(palette);
    }
  };

  // Export palette as JSON
  const exportPalette = () => {
    const dataStr = JSON.stringify(currentPalette, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentPalette.name.replace(/\s+/g, '-').toLowerCase()}-palette.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import palette from JSON
  const importPalette = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as ColorPalette;
        setCurrentPalette(imported);
        setPaletteName(imported.name);
        alert(`✅ Palette "${imported.name}" imported successfully!`);
      } catch (error) {
        alert('❌ Error importing palette. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  // Toggle live preview
  const togglePreview = () => {
    if (showPreview) {
      // Reset to default
      applyPalette(DEFAULT_PALETTE);
      setShowPreview(false);
    } else {
      // Apply current palette
      applyPalette(currentPalette);
      setShowPreview(true);
    }
  };

  // Generate random palette
  const generateRandomPalette = () => {
    const baseHue = Math.random() * 360;
    const palette = chroma.scale(['#ffffff', chroma.hsl(baseHue, 0.7, 0.5), '#000000']).colors(10);
    
    setCurrentPalette(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        primary: palette[7],
        primaryHover: chroma(palette[7]).darken(0.5).hex(),
        primaryActive: chroma(palette[7]).darken(1).hex(),
        secondary: palette[5],
        secondaryHover: chroma(palette[5]).darken(0.5).hex(),
        background: palette[1],
        cardBackground: palette[2],
        headerBackground: palette[1],
        link: palette[7],
        linkHover: chroma(palette[7]).darken(0.5).hex(),
        highlightColor: chroma.hsl((baseHue + 60) % 360, 0.8, 0.6).hex(),
      }
    }));
  };

  const colorCategories = {
    'Primary Colors': ['primary', 'primaryHover', 'primaryActive', 'secondary', 'secondaryHover'],
    'Background Colors': ['background', 'cardBackground', 'headerBackground', 'overlayBackground'],
    'Text Colors': ['textPrimary', 'textSecondary', 'textMuted', 'textInverse'],
    'UI Elements': ['border', 'borderHover', 'link', 'linkHover'],
    'Status Colors': ['success', 'warning', 'error', 'info'],
    'Gallery Specific': ['imageBackground', 'lightboxOverlay', 'badgeBackground', 'highlightColor']
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Palette className="h-8 w-8" />
                Color Palette Editor
              </h1>
              <p className="text-muted-foreground">
                Customize your gallery's appearance with live preview
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={togglePreview}
                variant={showPreview ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                {showPreview ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {showPreview ? 'Live Preview ON' : 'Live Preview OFF'}
              </Button>
              
              <Button onClick={generateRandomPalette} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Random
              </Button>
            </div>
          </div>

          {/* Palette Name Input */}
          <div className="flex items-center gap-4 mb-4">
            <Label htmlFor="palette-name">Palette Name:</Label>
            <Input
              id="palette-name"
              value={paletteName}
              onChange={(e) => setPaletteName(e.target.value)}
              className="max-w-sm"
              placeholder="My Custom Theme"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={savePalette} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Palette
            </Button>
            
            <Button onClick={exportPalette} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
            
            <label className="cursor-pointer">
              <Button variant="outline" className="flex items-center gap-2" asChild>
                <span>
                  <Upload className="h-4 w-4" />
                  Import JSON
                </span>
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={importPalette}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Color Categories */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Color Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="Primary Colors">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                  {Object.keys(colorCategories).map(category => (
                    <TabsTrigger key={category} value={category} className="text-xs">
                      {category.split(' ')[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(colorCategories).map(([category, colors]) => (
                  <TabsContent key={category} value={category} className="space-y-4">
                    <h3 className="font-semibold">{category}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {colors.map(colorKey => (
                        <div key={colorKey} className="space-y-2">
                          <Label className="flex items-center justify-between">
                            <span className="capitalize">
                              {colorKey.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="text-xs font-mono">
                              {currentPalette.colors[colorKey as keyof ColorPalette['colors']]}
                            </span>
                          </Label>
                          
                          <div className="flex items-center gap-2">
                            <div
                              className="w-12 h-8 rounded border-2 border-gray-300 cursor-pointer"
                              style={{ 
                                backgroundColor: currentPalette.colors[colorKey as keyof ColorPalette['colors']] 
                              }}
                              onClick={() => setSelectedColorKey(colorKey as keyof ColorPalette['colors'])}
                            />
                            
                            <Input
                              value={currentPalette.colors[colorKey as keyof ColorPalette['colors']]}
                              onChange={(e) => updateColor(colorKey as keyof ColorPalette['colors'], e.target.value)}
                              className="font-mono text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Color Picker & Controls */}
          <div className="space-y-6">
            
            {/* Color Picker */}
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">
                  Editing: {selectedColorKey.replace(/([A-Z])/g, ' $1').trim()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChromePicker
                  color={currentPalette.colors[selectedColorKey]}
                  onChange={(color) => updateColor(selectedColorKey, color.hex)}
                  disableAlpha={selectedColorKey !== 'overlayBackground' && selectedColorKey !== 'lightboxOverlay'}
                />
              </CardContent>
            </Card>

            {/* Accessibility Warnings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Accessibility Check
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(contrastWarnings).map(([key, check]) => (
                  <div key={key} className="flex items-center justify-between p-2 rounded border">
                    <span className="text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="flex items-center gap-2">
                      {check.readable ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-xs font-mono ${check.readable ? 'text-green-600' : 'text-red-600'}`}>
                        {check.ratio}:1 ({check.level})
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Saved Palettes */}
            <Card>
              <CardHeader>
                <CardTitle>Saved Palettes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {savedPalettes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No saved palettes yet</p>
                  ) : (
                    savedPalettes.map(palette => (
                      <div key={palette.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium text-sm">{palette.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(palette.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => loadPalette(palette)}
                        >
                          Load
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaletteEditor;
