// src/components/PrivacySettings.tsx - FIXED TYPESCRIPT TYPES
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Lock, Globe, Link2, Loader2 } from 'lucide-react';
import { Image } from '../types';

// ✅ Define the privacy type
type PrivacyType = 'public' | 'unlisted' | 'private';

interface PrivacySettingsProps {
  image?: Image;
  onPrivacyUpdate?: (imageId: string, newPrivacy: PrivacyType) => void; // ✅ Use proper type
  compact?: boolean;
  value?: PrivacyType;
  onChange?: (value: PrivacyType) => void;
}

const PrivacySettings: React.FC<PrivacySettingsProps> = ({ 
  image, 
  onPrivacyUpdate, 
  compact = false,
  value,
  onChange
}) => {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);
  
  // ✅ Support both controlled and uncontrolled modes
  const isControlled = value !== undefined && onChange !== undefined;
  const [internalPrivacy, setInternalPrivacy] = useState<PrivacyType>(
    (image?.privacy as PrivacyType) || 'public'
  );
  
  const currentPrivacy = isControlled ? value : internalPrivacy;

  const privacyOptions: { value: PrivacyType; label: string; icon: any; description: string; color: string; }[] = [
    {
      value: 'public',
      label: 'Public',
      icon: Globe,
      description: 'Visible to everyone',
      color: 'bg-green-100 text-green-800'
    },
    {
      value: 'unlisted',
      label: 'Unlisted', 
      icon: Link2,
      description: 'Only accessible via direct link',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      value: 'private',
      label: 'Private',
      icon: Lock,
      description: 'Only visible to you',
      color: 'bg-red-100 text-red-800'
    }
  ];

  // ✅ Type the parameter properly
  const updatePrivacy = async (newPrivacy: PrivacyType) => {
    if (isControlled) {
      onChange(newPrivacy);
      return;
    }
    if (!user || !image || user.id !== image.uploaded_by) {
      alert('You can only change privacy settings for your own images');
      return;
    }

    setUpdating(true);
    
    try {
      const { error } = await supabase
        .from('images')
        .update({ 
          privacy: newPrivacy,
          updated_at: new Date().toISOString()
        })
        .eq('id', image.id)
        .eq('uploaded_by', user.id);

      if (error) throw error;

      setInternalPrivacy(newPrivacy);
      
      if (onPrivacyUpdate) {
        onPrivacyUpdate(image.id, newPrivacy);
      }

      console.log('✅ Privacy updated:', image.id, '→', newPrivacy);
      
    } catch (error) {
      console.error('❌ Privacy update failed:', error);
      alert('Failed to update privacy settings');
    } finally {
      setUpdating(false);
    }
  };

  const getCurrentOption = () => {
    return privacyOptions.find(option => option.value === currentPrivacy) || privacyOptions[0];
  };

  // Compact badge display for image grid
  if (compact) {
    const option = getCurrentOption();
    const Icon = option.icon;
    
    return (
      <Badge className={`${option.color} text-xs flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {option.label}
      </Badge>
    );
  }

  // Full privacy settings control for modal
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Privacy Setting
      </label>
      
      <Select 
        value={currentPrivacy} 
        onValueChange={updatePrivacy} // ✅ Now properly typed
        disabled={updating || (!isControlled && (!user || !image || user.id !== image.uploaded_by))}
      >
        <SelectTrigger className="w-full">
          <SelectValue>
            <div className="flex items-center gap-2">
              {updating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                React.createElement(getCurrentOption().icon, { className: "h-4 w-4" })
              )}
              <span>{getCurrentOption().label}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent>
          {privacyOptions.map((option) => {
            const Icon = option.icon;
            return (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      {!isControlled && (!user || !image || user.id !== image.uploaded_by) ? (
        <p className="text-xs text-gray-500">
          Only the image owner can change privacy settings
        </p>
      ) : null}
    </div>
  );
};

export default PrivacySettings;
