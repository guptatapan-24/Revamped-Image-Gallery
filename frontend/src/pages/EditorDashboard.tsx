// src/pages/EditorDashboard.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../hooks/useAuth";
import { 
  Image, MessageCircle, Upload, Edit, 
  FolderOpen, Tags, Eye, Plus 
} from "lucide-react";

const EditorDashboard: React.FC = () => {
  const { user } = useAuth();

  const editorStats = [
    { label: "My Images", value: "234", icon: Image },
    { label: "Pending Reviews", value: "12", icon: MessageCircle },
    { label: "Total Views", value: "45.2K", icon: Eye },
    { label: "Albums Created", value: "18", icon: FolderOpen },
  ];

  const quickActions = [
    {
      title: "Upload Images",
      description: "Add new images to the gallery",
      icon: Upload,
      href: "/upload",
      color: "bg-blue-500"
    },
    {
      title: "Manage Gallery",
      description: "Edit and organize your image collection",
      icon: FolderOpen,
      href: "/editor/gallery",
      color: "bg-green-500"
    },
    {
      title: "Review Comments",
      description: "Moderate comments on your images",
      icon: MessageCircle,
      href: "/editor/comments",
      color: "bg-orange-500"
    },
    {
      title: "Generate Image",
      description: "Create new images with AI",
      icon: Plus,
      href: "/generate-image",
      color: "bg-purple-500"
    },
    {
      title: "Tag Management",
      description: "Organize images with tags and categories",
      icon: Tags,
      href: "/editor/tags",
      color: "bg-pink-500"
    },
    {
      title: "Image Editor",
      description: "Edit image metadata and settings",
      icon: Edit,
      href: "/editor/edit",
      color: "bg-indigo-500"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Editor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || user?.email}
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Edit className="h-3 w-3 mr-1" />
          Editor Access
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {editorStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{action.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {action.description}
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={action.href}>
                          Open
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Your Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "Uploaded 'Sunset Landscape'", time: "2 hours ago", status: "Published" },
              { action: "Edited 'Mountain View' metadata", time: "1 day ago", status: "Updated" },
              { action: "Approved 3 comments", time: "2 days ago", status: "Moderated" },
              { action: "Created 'Winter Collection' album", time: "3 days ago", status: "Created" },
            ].map((activity, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditorDashboard;
