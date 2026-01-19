import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, DollarSign, TrendingUp, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/(app)/analytics")({
  component: Analytics,
});

function Analytics() {
  const { t } = useI18n();

  const metrics = [
    {
      title: t("common.totalRevenue"),
      value: "$45,231.89",
      change: "+20.1%",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: t("common.activeUsers"),
      value: "2,350",
      change: "+180",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: t("common.conversionRate"),
      value: "3.2%",
      change: "+0.5%",
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: t("common.avgSessionDuration"),
      value: "4m 32s",
      change: "+12s",
      icon: Activity,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("common.analytics")}</h2>
        <p className="text-muted-foreground">{t("common.trackPerformance")}</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.change} {t("common.fromLastMonth")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("common.revenueOverview")}</CardTitle>
            <CardDescription>{t("common.monthlyRevenue")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              {/* Placeholder for chart */}
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                <p>{t("common.chartPlaceholder")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("common.userGrowth")}</CardTitle>
            <CardDescription>{t("common.newVsReturning")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              {/* Placeholder for chart */}
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-2" />
                <p>{t("common.chartPlaceholder")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle>{t("common.topPages")}</CardTitle>
          <CardDescription>{t("common.mostVisited")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { page: "/dashboard", views: 12543, percentage: 35 },
              { page: "/products", views: 8932, percentage: 25 },
              { page: "/settings", views: 6421, percentage: 18 },
              { page: "/reports", views: 4532, percentage: 13 },
              { page: "/about", views: 3221, percentage: 9 },
            ].map((item) => (
              <div key={item.page} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{item.page}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.views.toLocaleString()} {t("common.views")}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
