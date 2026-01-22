import {
  Activity,
  FileText,
  Film,
  Home,
  Settings,
  Users,
  Video,
} from "lucide-react";

export const sidebarItems = [
  { icon: Home, labelKey: "common.dashboard", to: "/" },
  { icon: Activity, labelKey: "common.analytics", to: "/analytics" },
  { icon: Users, labelKey: "common.users", to: "/users" },
  { icon: FileText, labelKey: "common.reports", to: "/reports" },
  { icon: Film, labelKey: "common.myShots", to: "/my-shots" },
  { icon: Video, labelKey: "common.shotDetection", to: "/shot-detection" },
  { icon: Settings, labelKey: "common.settings", to: "/settings" },
];
