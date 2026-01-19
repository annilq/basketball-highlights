import { useI18n } from "@/lib/i18n";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Download, FileText, Filter } from "lucide-react";

export const Route = createFileRoute("/(app)/reports")({
  component: Reports,
});

function Reports() {
  const { t } = useI18n();
  const reports = [
    {
      id: 1,
      name: "Monthly Sales Report",
      type: "sales",
      date: "2024-01-01",
      status: "Ready",
    },
    {
      id: 2,
      name: "User Activity Report",
      type: "analytics",
      date: "2024-01-15",
      status: "Ready",
    },
    {
      id: 3,
      name: "Financial Summary",
      type: "finance",
      date: "2024-01-20",
      status: "Processing",
    },
    {
      id: 4,
      name: "Performance Metrics",
      type: "performance",
      date: "2024-01-25",
      status: "Ready",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("common.reports")}</h2>
        <p className="text-muted-foreground">{t("common.reportsManagement")}</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("common.filter")}</CardTitle>
          <CardDescription>
            {t("common.filter")} {t("common.reports")} {t("common.by")}{" "}
            {t("common.type")} {t("common.and")} {t("common.date")}{" "}
            {t("common.range")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select>
                <SelectTrigger>
                  <SelectValue
                    placeholder={`${t("common.select")}${t("common.type")}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{`${t("common.all")}`}</SelectItem>
                  <SelectItem value="sales">{t("common.sales")}</SelectItem>
                  <SelectItem value="analytics">
                    {t("common.analytics")}
                  </SelectItem>
                  <SelectItem value="finance">{t("common.finance")}</SelectItem>
                  <SelectItem value="performance">
                    {t("common.performance")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select>
                <SelectTrigger>
                  <SelectValue
                    placeholder={`${t("common.select")} ${t("common.date")} ${t("common.range")}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">{`${t("common.last")} 7 ${t("common.days")}`}</SelectItem>
                  <SelectItem value="30days">{`${t("common.last")} 30 ${t("common.days")}`}</SelectItem>
                  <SelectItem value="90days">{`${t("common.last")} 90 ${t("common.days")}`}</SelectItem>
                  <SelectItem value="year">{`${t("common.this")} ${t("common.year")}`}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="gap-2">
              <Filter className="h-4 w-4" />
              {t("common.apply")} {t("common.filters")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>{t("common.generateReport")}</CardTitle>
          <CardDescription>{t("common.createCustomReport")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-24 flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span>
                {t("common.sales")} {t("common.report")}
              </span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span>
                {t("common.analytics")} {t("common.report")}
              </span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span>
                {t("common.finance")} {t("common.report")}
              </span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span>Custom {t("common.report")}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t("common.recent")} {t("common.reports")}
          </CardTitle>
          <CardDescription>
            {t("common.your")} {t("common.recently")} {t("common.generated")}{" "}
            {t("common.reports")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{t(`common.${report.type}`)}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {report.date}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      report.status === "Ready"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {report.status}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={report.status !== "Ready"}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
