import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, FileText, TrendingUp, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/(app)/")({
  component: Dashboard,
});

function Dashboard() {
  const { t } = useI18n();

  const stats = [
    {
      title: t("common.totalUsers"),
      value: "1,234",
      change: "+12%",
      icon: Users,
    },
    {
      title: t("common.activeSessions"),
      value: "89",
      change: "+5%",
      icon: Activity,
    },
    {
      title: t("common.reportsGenerated"),
      value: "456",
      change: "+23%",
      icon: FileText,
    },
    {
      title: t("common.growthRate"),
      value: "18.2%",
      change: "+2.1%",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("common.dashboard")}</h2>
        <p className="text-muted-foreground">
          {t("common.welcomeBack")} {t("common.overview")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span>{" "}
                {t("common.fromLastMonth")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("common.recentActivity")}</CardTitle>
            <CardDescription>{t("common.latestEvents")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm">{t("common.userAction")}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("common.hoursAgo", { count: i })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("common.quickActions")}</CardTitle>
            <CardDescription>{t("common.commonTasks")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="p-4 text-left border rounded-lg hover:bg-accent transition-colors"
              >
                <FileText className="h-5 w-5 mb-2" />
                <p className="text-sm font-medium">
                  {t("common.generateReport")}
                </p>
              </button>
              <button
                type="button"
                className="p-4 text-left border rounded-lg hover:bg-accent transition-colors"
              >
                <Users className="h-5 w-5 mb-2" />
                <p className="text-sm font-medium">{t("common.manageUsers")}</p>
              </button>
              <button
                type="button"
                className="p-4 text-left border rounded-lg hover:bg-accent transition-colors"
              >
                <Activity className="h-5 w-5 mb-2" />
                <p className="text-sm font-medium">
                  {t("common.viewAnalytics")}
                </p>
              </button>
              <button
                type="button"
                className="p-4 text-left border rounded-lg hover:bg-accent transition-colors"
              >
                <TrendingUp className="h-5 w-5 mb-2" />
                <p className="text-sm font-medium">{t("common.exportData")}</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
