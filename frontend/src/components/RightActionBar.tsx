// src/components/RightActionBar.tsx - Fixed Keys
import React, { useState } from "react";
import { 
  Heart, Share2, Download, Bookmark, MessageCircle, Eye,
  Filter, Grid, List, Search, Plus
} from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../hooks/useAuth";

interface RightActionBarProps {
  totalLikes: number;
  totalViews: number;
  totalComments: number;
  viewMode?: 'grid' | 'list';
  onToggleView?: () => void;
  onOpenFilter?: () => void;
  onOpenSearch?: () => void;
  onLike?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  onBookmark?: () => void;
}

export const RightActionBar: React.FC<RightActionBarProps> = ({
  totalLikes, totalViews, totalComments, viewMode = 'grid',
  onToggleView, onOpenFilter, onOpenSearch, onLike, onShare, onDownload, onBookmark
}) => {
  const { isAuthenticated } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const actions = [
    {
      id: 'search', // ✅ Add unique id
      icon: Search,
      label: "Search",
      onClick: onOpenSearch,
      show: true,
      color: "hover:bg-blue-500 hover:text-white",
    },
    {
      id: 'filter', // ✅ Add unique id
      icon: Filter,
      label: "Filter",
      onClick: onOpenFilter,
      show: true,
      color: "hover:bg-purple-500 hover:text-white",
    },
    {
      id: 'view-toggle', // ✅ Add unique id
      icon: viewMode === 'grid' ? List : Grid,
      label: viewMode === 'grid' ? 'List' : 'Grid',
      onClick: onToggleView,
      show: true,
      color: "hover:bg-green-500 hover:text-white",
    },
    {
      id: 'likes', // ✅ Add unique id
      icon: Heart,
      label: formatNumber(totalLikes),
      onClick: onLike,
      show: isAuthenticated,
      color: "hover:bg-red-500 hover:text-white",
      count: totalLikes
    },
    {
      id: 'comments', // ✅ Add unique id
      icon: MessageCircle,
      label: formatNumber(totalComments),
      onClick: () => console.log('Comments'),
      show: isAuthenticated,
      color: "hover:bg-blue-500 hover:text-white",
      count: totalComments
    },
    {
      id: 'views', // ✅ Add unique id
      icon: Eye,
      label: formatNumber(totalViews),
      onClick: () => console.log('Views'),
      show: isAuthenticated,
      color: "hover:bg-indigo-500 hover:text-white",
    },
    {
      id: 'share', // ✅ Add unique id
      icon: Share2,
      label: "Share",
      onClick: onShare,
      show: true,
      color: "hover:bg-cyan-500 hover:text-white",
    },
    {
      id: 'bookmark', // ✅ Add unique id
      icon: Bookmark,
      label: "Save",
      onClick: onBookmark,
      show: isAuthenticated,
      color: "hover:bg-yellow-500 hover:text-white",
    },
    {
      id: 'download', // ✅ Add unique id
      icon: Download,
      label: "Download",
      onClick: onDownload,
      show: isAuthenticated,
      color: "hover:bg-gray-700 hover:text-white",
    }
  ];

  const visibleActions = actions.filter(action => action.show);

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/5 z-20"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Right Action Bar */}
      <div className="fixed right-3 top-1/2 -translate-y-1/2 z-30">
        <div className="flex flex-col items-end space-y-2">
          
          {/* Action Buttons */}
          <div className={`
            flex flex-col items-end space-y-2 transition-all duration-300 ease-out
            ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
          `}>
            {visibleActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div
                  key={action.id} // ✅ Fixed: Use unique id instead of label
                  className={`
                    flex items-center gap-2 transition-all duration-300 ease-out
                    ${isExpanded ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
                  `}
                  style={{ 
                    transitionDelay: isExpanded ? `${index * 50}ms` : '0ms' 
                  }}
                >
                  {/* Label */}
                  <div className="bg-gray-900/90 text-white px-2 py-1 rounded text-xs font-medium shadow-lg">
                    {action.label}
                  </div>
                  
                  {/* Button */}
                  <div className="relative">
                    <Button
                      size="icon"
                      className={`
                        w-10 h-10 rounded-full shadow-lg
                        bg-white/90 hover:scale-105
                        border text-gray-700 transition-all duration-200
                        ${action.color}
                      `}
                      onClick={action.onClick}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                    
                    {/* Badge */}
                    {action.count !== undefined && action.count > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {action.count > 9 ? '9+' : action.count}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Toggle Button */}
          <Button
            size="lg"
            className="w-12 h-12 rounded-full shadow-xl bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Plus className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-45' : 'rotate-0'}`} />
          </Button>
        </div>
      </div>
    </>
  );
};

export default RightActionBar;
