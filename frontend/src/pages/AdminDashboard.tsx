// src/pages/AdminDashboard.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/card";
import { Alert } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../hooks/useAuth";
import { 
  Users, Settings, Image, Shield, Activity, 
  BarChart3, FileText, Palette 
} from "lucide-react";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { label: "Total Users", value: "1,234", change: "+12%" },
    { label: "Total Images", value: "5,678", change: "+8%" },
    { label: "Storage Used", value: "2.4 GB", change: "+15%" },
    { label: "Active Sessions", value: "89", change: "-5%" },
  ];

  const quickActions = [
    { 
      title: "User Management", 
      description: "Manage user roles and permissions", 
      icon: Users,
      href: "/admin/users",
      color: "bg-blue-500"
    },
    { 
      title: "Site Settings", 
      description: "Configure global application settings", 
      icon: Settings,
      href: "/admin/settings",
      color: "bg-green-500"
    },
    { 
      title: "Content Moderation", 
      description: "Review and moderate uploaded content", 
      icon: Shield,
      href: "/admin/moderation",
      color: "bg-orange-500"
    },
    { 
      title: "Analytics", 
      description: "View site performance and usage stats", 
      icon: BarChart3,
      href: "/admin/analytics",
      color: "bg-purple-500"
    },
    { 
      title: "Theme Editor", 
      description: "Customize site appearance and branding", 
      icon: Palette,
      href: "/palette-editor",
      color: "bg-pink-500"
    },
    { 
      title: "System Logs", 
      description: "Monitor system activity and errors", 
      icon: Activity,
      href: "/admin/logs",
      color: "bg-red-500"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || user?.email}
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Shield className="h-3 w-3 mr-1" />
          Admin Access
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <Badge 
                  variant={stat.change.startsWith('+') ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {stat.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
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
          <CardTitle>Recent System Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "User registered", user: "john.doe@email.com", time: "2 minutes ago" },
              { action: "Image uploaded", user: "jane.smith@email.com", time: "5 minutes ago" },
              { action: "Comment reported", user: "system", time: "10 minutes ago" },
              { action: "Settings updated", user: "admin@example.com", time: "1 hour ago" },
            ].map((activity, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.user}</p>
                </div>
                <span className="text-sm text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
