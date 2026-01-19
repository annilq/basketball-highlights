import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
  Switch,
} from "@repo/ui";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, Palette, Shield, User } from "lucide-react";

export const Route = createFileRoute("/(app)/settings")({
  component: Settings,
});

function Settings() {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("common.settings")}</h2>
        <p className="text-muted-foreground">
          {t("common.settingsManagement")}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>{t("common.profile")}</CardTitle>
            </div>
            <CardDescription>{t("common.updateProfile")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t("common.name")}</Label>
              <Input id="name" placeholder={t("common.enterYourName")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{t("common.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("common.enterYourEmail")}
              />
            </div>
            <Button>{t("common.save")}</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>{t("common.notifications")}</CardTitle>
            </div>
            <CardDescription>
              {t("common.configureNotifications")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">
                  {t("common.emailNotifications")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("common.receiveNotificationsViaEmail")}
                </p>
              </div>
              <Switch id="email-notifications" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">
                  {t("common.pushNotifications")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("common.receivePushNotificationsInBrowser")}
                </p>
              </div>
              <Switch id="push-notifications" />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>{t("common.security")}</CardTitle>
            </div>
            <CardDescription>
              {t("common.manageSecurityPreferences")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button variant="outline">{t("common.changePassword")}</Button>
            </div>
            <div className="space-y-2">
              <Button variant="outline">
                {t("common.enableTwoFactorAuth")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <CardTitle>{t("common.appearance")}</CardTitle>
            </div>
            <CardDescription>{t("common.customizeAppearance")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">{t("common.darkMode")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("common.toggleDarkMode")}
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="language">{t("common.language")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("common.selectLanguage")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={locale === "en" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLocale("en")}
                >
                  {t("common.english")}
                </Button>
                <Button
                  variant={locale === "zh" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLocale("zh")}
                >
                  {t("common.chinese")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
