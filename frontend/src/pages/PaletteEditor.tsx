// src/pages/PaletteEditor.tsx - FIXED FOR YOUR CSS SYSTEM
import React, { useState, useEffect, useCallback } from 'react';
import { ChromePicker, CirclePicker } from 'react-color';
import chroma from 'chroma-js';
import { 
  Save, Download, Upload, Eye, EyeOff, Palette, 
  RefreshCw, RotateCcw 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Convert hex to HSL format that matches your CSS
const hexToHsl = (hex: string) => {
  try {
    const color = chroma(hex);
    const hsl = color.hsl();
    const h = Math.round(hsl[0]) || 0;
    const s = Math.round(hsl[1] * 100);
    const l = Math.round(hsl[2] * 100);
    return `${h} ${s}% ${l}%`;
  } catch {
    return '220 85% 50%'; // fallback
  }
};

// Convert HSL string back to hex
const hslToHex = (hslString: string) => {
  try {
    const [h, s, l] = hslString.split(' ').map(v => parseFloat(v));
    return chroma.hsl(h, s/100, l/100).hex();
  } catch {
    return '#3b82f6'; // fallback
  }
};

// Default palette matching your CSS variables
const DEFAULT_PALETTE = {
  id: 'default',
  name: 'Default Gallery Theme',
  createdAt: new Date().toISOString(),
  colors: {
    // Main colors (HSL format to match your CSS)
    primary: '220 85% 50%',           // Your --primary
    primaryForeground: '0 0% 98%',    // Your --primary-foreground
    secondary: '220 10% 92%',         // Your --secondary
    secondaryForeground: '220 15% 8%', // Your --secondary-foreground
    background: '220 15% 97%',        // Your --background
    foreground: '220 15% 8%',         // Your --foreground
    card: '0 0% 100%',               // Your --card
    cardForeground: '220 15% 8%',     // Your --card-foreground
    border: '220 10% 88%',           // Your --border
    muted: '220 10% 95%',            // Your --muted
    mutedForeground: '220 5% 45%',   // Your --muted-foreground
    accent: '270 75% 60%',           // Your --accent
    accentForeground: '0 0% 98%',    // Your --accent-foreground
    destructive: '0 84% 60%',        // Your --destructive
    destructiveForeground: '0 0% 98%', // Your --destructive-foreground
    
    // Custom theme colors (hex format for your --color-* variables)
    colorPrimary: '#3b82f6',
    colorBackground: '#ffffff',
    colorCardBackground: '#f8fafc',
    colorTextPrimary: '#0f172a',
    colorBorder: '#e2e8f0',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
  }
};

const COLOR_CATEGORIES = {
  'Primary': ['primary', 'primaryForeground', 'secondary', 'secondaryForeground'],
  'Background': ['background', 'foreground', 'card', 'cardForeground'],
  'UI Elements': ['border', 'muted', 'mutedForeground', 'accent', 'accentForeground'],
  'Status': ['destructive', 'destructiveForeground'],
  'Theme Colors': ['colorPrimary', 'colorBackground', 'colorCardBackground', 'colorTextPrimary', 'colorBorder'],
  'Theme Status': ['colorSuccess', 'colorWarning', 'colorError']
};

const PaletteEditor: React.FC = () => {
  const [currentPalette, setCurrentPalette] = useState(DEFAULT_PALETTE);
  const [savedPalettes, setSavedPalettes] = useState<typeof DEFAULT_PALETTE[]>([]);
  const [selectedColorKey, setSelectedColorKey] = useState<keyof typeof DEFAULT_PALETTE.colors>('primary');
  const [showPreview, setShowPreview] = useState(false);
  const [paletteName, setPaletteName] = useState('My Custom Theme');
  const [debugInfo, setDebugInfo] = useState('');

  // Load saved palettes on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gallery-color-palettes');
      if (saved) {
        const palettes = JSON.parse(saved);
        setSavedPalettes(Array.isArray(palettes) ? palettes : []);
      }
    } catch (error) {
      console.error('❌ Error loading palettes:', error);
    }
  }, []);

  // Apply palette to CSS variables with correct format
  const applyPalette = useCallback((palette: typeof DEFAULT_PALETTE) => {
    const root = document.documentElement;
    let appliedCount = 0;
    
    try {
      Object.entries(palette.colors).forEach(([key, value]) => {
        if (key.startsWith('color')) {
          // For --color-* variables, use hex values directly
          const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
          root.style.setProperty(cssVarName, value);
          appliedCount++;
        } else {
          // For standard variables, use HSL format
          const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
          root.style.setProperty(cssVarName, value);
          appliedCount++;
        }
      });

      console.log(`✅ Applied ${appliedCount} CSS variables`);
      setDebugInfo(`Applied ${appliedCount} CSS variables successfully`);
      
      // Force a style recalculation
      document.body.classList.add('updating-theme');
      requestAnimationFrame(() => {
        document.body.classList.remove('updating-theme');
      });
      
    } catch (error) {
      console.error('❌ Error applying palette:', error);
      setDebugInfo(`Error applying palette: ${error}`);
    }
  }, []);

  // Get display color for color picker (convert HSL to hex if needed)
  const getDisplayColor = (key: keyof typeof DEFAULT_PALETTE.colors) => {
    const value = currentPalette.colors[key];
    if (key.startsWith('color')) {
      return value; // Already hex
    } else {
      return hslToHex(value); // Convert HSL to hex for display
    }
  };

  // Update color with proper format conversion
  const updateColor = (colorKey: keyof typeof DEFAULT_PALETTE.colors, newColor: string) => {
    console.log(`🎨 Updating ${colorKey} to ${newColor}`);
    
    // Convert hex to appropriate format
    const convertedColor = colorKey.startsWith('color') ? newColor : hexToHsl(newColor);
    
    setCurrentPalette(prev => {
      const newPalette = {
        ...prev,
        colors: {
          ...prev.colors,
          [colorKey]: convertedColor
        }
      };
      
      // Apply immediately if preview is active
      if (showPreview) {
        setTimeout(() => applyPalette(newPalette), 50);
      }
      
      return newPalette;
    });
  };

  // Save palette
  const savePalette = () => {
    try {
      const newPalette = {
        ...currentPalette,
        id: Date.now().toString(),
        name: paletteName || 'Untitled Palette',
        createdAt: new Date().toISOString()
      };

      const updatedPalettes = [...savedPalettes, newPalette];
      localStorage.setItem('gallery-color-palettes', JSON.stringify(updatedPalettes));
      setSavedPalettes(updatedPalettes);
      
      setDebugInfo(`Saved palette "${newPalette.name}" successfully!`);
      alert(`✅ Palette "${newPalette.name}" saved successfully!`);
    } catch (error) {
      console.error('❌ Error saving palette:', error);
      alert('❌ Error saving palette. Please try again.');
    }
  };

  // Load palette
  const loadPalette = (palette: typeof DEFAULT_PALETTE) => {
    try {
      setCurrentPalette(palette);
      setPaletteName(palette.name);
      
      if (showPreview) {
        setTimeout(() => applyPalette(palette), 100);
      }
      
      setDebugInfo(`Loaded palette "${palette.name}" successfully!`);
      alert(`✅ Palette "${palette.name}" loaded successfully!`);
    } catch (error) {
      console.error('❌ Error loading palette:', error);
      alert('❌ Error loading palette. Please try again.');
    }
  };

  // Toggle live preview
  const togglePreview = () => {
    if (showPreview) {
      console.log('🔄 Disabling live preview');
      applyPalette(DEFAULT_PALETTE);
      setShowPreview(false);
      setDebugInfo('Live preview disabled - reset to default colors');
    } else {
      console.log('🔄 Enabling live preview');
      applyPalette(currentPalette);
      setShowPreview(true);
      setDebugInfo('Live preview enabled - applying current colors');
    }
  };

  // Export palette
  const exportPalette = () => {
    try {
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
      
      setDebugInfo(`Exported palette "${currentPalette.name}"`);
    } catch (error) {
      console.error('❌ Export error:', error);
      alert('❌ Error exporting palette');
    }
  };

  // Import palette
  const importPalette = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setCurrentPalette(imported);
        setPaletteName(imported.name);
        alert(`✅ Palette "${imported.name}" imported successfully!`);
      } catch (error) {
        alert('❌ Error importing palette. Please check the file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Reset to default
  const resetPalette = () => {
    setCurrentPalette(DEFAULT_PALETTE);
    setPaletteName('Default Gallery Theme');
    if (showPreview) {
      applyPalette(DEFAULT_PALETTE);
    }
    setDebugInfo('Reset to default palette');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Palette className="h-10 w-10 text-primary" />
                Color Palette Editor
              </h1>
              <p className="text-muted-foreground mt-2">
                Customize your gallery's colors with live preview
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={togglePreview}
                variant={showPreview ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                {showPreview ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {showPreview ? 'Preview ON' : 'Enable Preview'}
              </Button>
              
              <Button onClick={resetPalette} variant="ghost">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Debug Info */}
          {debugInfo && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-lg mb-4">
              🔧 {debugInfo}
            </div>
          )}

          {/* Preview Status */}
          {showPreview && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg mb-4">
              ✅ <strong>Live Preview Active:</strong> Your theme changes are being applied!
            </div>
          )}

          {/* Palette Name */}
          <div className="flex items-center gap-4 mb-4">
            <Label htmlFor="palette-name" className="font-semibold">Palette Name:</Label>
            <Input
              id="palette-name"
              value={paletteName}
              onChange={(e) => setPaletteName(e.target.value)}
              className="max-w-sm"
              placeholder="My Custom Theme"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button onClick={savePalette} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Palette ({savedPalettes.length} saved)
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
              <Tabs defaultValue="Primary">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                  {Object.keys(COLOR_CATEGORIES).map(category => (
                    <TabsTrigger key={category} value={category} className="text-xs">
                      {category.split(' ')[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(COLOR_CATEGORIES).map(([category, colors]) => (
                  <TabsContent key={category} value={category} className="space-y-4">
                    <h3 className="font-semibold text-lg">{category}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {colors.map(colorKey => (
                        <div key={colorKey} className="space-y-2">
                          <Label className="flex items-center justify-between">
                            <span className="capitalize font-medium">
                              {colorKey.replace(/([A-Z])/g, ' $1').replace('color ', '').trim()}
                            </span>
                            <span className="text-xs font-mono text-muted-foreground">
                              {currentPalette.colors[colorKey as keyof typeof currentPalette.colors]}
                            </span>
                          </Label>
                          
                          <div className="flex items-center gap-2">
                            <button
                              className={`w-12 h-8 rounded border-2 cursor-pointer transition-all ${
                                selectedColorKey === colorKey 
                                  ? 'border-primary ring-2 ring-primary/20' 
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                              style={{ 
                                backgroundColor: getDisplayColor(colorKey as keyof typeof currentPalette.colors)
                              }}
                              onClick={() => setSelectedColorKey(colorKey as keyof typeof currentPalette.colors)}
                              title={`Edit ${colorKey} color`}
                            />
                            
                            <Input
                              value={currentPalette.colors[colorKey as keyof typeof currentPalette.colors]}
                              onChange={(e) => updateColor(colorKey as keyof typeof currentPalette.colors, e.target.value)}
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

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Color Picker */}
            <Card>
              <CardHeader>
                <CardTitle className="capitalize flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: getDisplayColor(selectedColorKey) }}
                  />
                  {selectedColorKey.replace(/([A-Z])/g, ' $1').replace('color ', '').trim()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChromePicker
                  color={getDisplayColor(selectedColorKey)}
                  onChange={(color) => updateColor(selectedColorKey, color.hex)}
                  disableAlpha
                />
              </CardContent>
            </Card>

            {/* Quick Colors */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Colors</CardTitle>
              </CardHeader>
              <CardContent>
                <CirclePicker
                  color={getDisplayColor(selectedColorKey)}
                  onChange={(color) => updateColor(selectedColorKey, color.hex)}
                  colors={[
                    '#f43f5e', '#e11d48', '#be123c',
                    '#3b82f6', '#2563eb', '#1d4ed8',
                    '#10b981', '#059669', '#047857',
                    '#f59e0b', '#d97706', '#b45309',
                    '#8b5cf6', '#7c3aed', '#6d28d9',
                    '#6b7280', '#4b5563', '#374151'
                  ]}
                />
              </CardContent>
            </Card>

            {/* Saved Palettes */}
            <Card>
              <CardHeader>
                <CardTitle>Saved Palettes ({savedPalettes.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {savedPalettes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No saved palettes yet. Save your first palette above!
                    </p>
                  ) : (
                    savedPalettes.map(palette => (
                      <div key={palette.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                        <div className="flex-1">
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
