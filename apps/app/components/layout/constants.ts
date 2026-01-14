import { Activity, FileText, Home, Settings, Users, Video } from "lucide-react";

export const sidebarItems = [
  { icon: Home, label: "Dashboard", to: "/" },
  { icon: Activity, label: "Analytics", to: "/analytics" },
  { icon: Users, label: "Users", to: "/users" },
  { icon: FileText, label: "Reports", to: "/reports" },
  { icon: Video, label: "Shot Detection", to: "/shot-detection" },
  { icon: Settings, label: "Settings", to: "/settings" },
];
