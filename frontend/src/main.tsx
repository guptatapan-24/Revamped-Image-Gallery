// src/main.tsx  – single, authoritative entry file
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider, useAuth } from "./hooks/useAuth";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";

/* layout */
import Header from "./components/Header";
import { Sidebar } from "./components/Sidebar";

/* public pages */
import Index from "./pages/Index";
import Gallery from "./pages/Gallery";          // ← fixed gallery with live views
import VectorSearch from "./pages/VectorSearch";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

/* protected user pages */
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import ProfileSettings from "./pages/ProfileSettings";
import UploadImage from "./pages/UploadImage";

/* creative tools (protected) */
import GenerateImage from "./pages/GenerateImage";
import PaletteEditorPage from "./pages/PaletteEditor";

/* role-based pages */
import AdminDashboard from "./pages/AdminDashboard";
import EditorDashboard from "./pages/EditorDashboard";

/* misc */
import AuthCallback from "./pages/AuthCallback";
import SitemapXml from "./components/SitemapXml";    // you referenced this in App.tsx

import "./index.css";

/* ─── helpers ─── */
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
      <p className="mt-4 text-muted-foreground">Loading…</p>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredRole?: string;
}> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

/* ─── main layout ─── */
function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAlbum, setSelectedAlbum] = useState("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className="flex pt-16">
        <Sidebar
          isOpen={sidebarOpen}
          selectedAlbum={selectedAlbum}
          selectedTag={selectedTag ?? undefined}
          onAlbumSelect={(id) => {
            setSelectedAlbum(id);
            setSelectedTag(null);
          }}
          onTagSelect={(t) => {
            setSelectedTag(t);
            setSelectedAlbum("all");
          }}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          <Routes>
            {/* public */}
            <Route
              index
              element={
                <Index
                  selectedAlbum={selectedAlbum}
                  selectedTag={selectedTag}
                  searchTerm={searchTerm}
                />
              }
            />
            <Route path="gallery" element={<Gallery />} />
            <Route path="search" element={<VectorSearch />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route
              path="signup"
              element={<Navigate to="/register" replace />}
            />
            <Route path="auth/callback" element={<AuthCallback />} />
            <Route path="sitemap.xml" element={<SitemapXml />} />

            {/* protected (generic user) */}
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile/:username"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile/edit"
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="upload"
              element={
                <ProtectedRoute>
                  <UploadImage />
                </ProtectedRoute>
              }
            />

            {/* creative tools */}
            <Route
              path="generate"
              element={
                <ProtectedRoute>
                  <GenerateImage />
                </ProtectedRoute>
              }
            />
            <Route
              path="palette"
              element={
                <ProtectedRoute>
                  <PaletteEditorPage />
                </ProtectedRoute>
              }
            />

            {/* role-based */}
            <Route
              path="editor"
              element={
                <ProtectedRoute requiredRole="editor">
                  <EditorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>

      <Toaster />
      <Sonner />
    </div>
  );
}

/* ─── mount ─── */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <Layout />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
    </React.StrictMode>
);
