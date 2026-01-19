import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from "@repo/ui";
import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/(app)/about")({
  component: About,
});

function About() {
  const { t } = useI18n();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-6">
          {t("about.title")}
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {t("about.subtitle")}
        </p>
      </div>

      {/* Mission Section */}
      <section className="mb-20">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {t("about.missionTitle")}
            </CardTitle>
            <CardDescription>{t("about.missionDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {t("about.missionContent1")}
            </p>
            <p className="text-muted-foreground">
              {t("about.missionContent2")}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Key Features */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold tracking-tight mb-8 text-center">
          {t("about.whatMakesUsDifferent")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>🎯 {t("about.productionReady")}</CardTitle>
              <CardDescription>
                {t("about.productionReadyDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("about.productionReadyContent")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>⚡ {t("about.edgeFirst")}</CardTitle>
              <CardDescription>
                {t("about.edgeFirstDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("about.edgeFirstContent")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔧 {t("about.developerExperience")}</CardTitle>
              <CardDescription>
                {t("about.developerExperienceDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("about.developerExperienceContent")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🌐 {t("about.fullStack")}</CardTitle>
              <CardDescription>
                {t("about.fullStackDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("about.fullStackContent")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Technology Choices */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold tracking-tight mb-8 text-center">
          {t("about.technologyChoices")}
        </h2>

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4">
                  {t("about.frontendStack")}
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <strong>{t("about.react19")}:</strong>{" "}
                    {t("about.react19Description")}
                  </li>
                  <li>
                    <strong>{t("about.typescript")}:</strong>{" "}
                    {t("about.typescriptDescription")}
                  </li>
                  <li>
                    <strong>{t("about.vite")}:</strong>{" "}
                    {t("about.viteDescription")}
                  </li>
                  <li>
                    <strong>{t("about.tanstackRouter")}:</strong>{" "}
                    {t("about.tanstackRouterDescription")}
                  </li>
                  <li>
                    <strong>{t("about.shadcnUi")}:</strong>{" "}
                    {t("about.shadcnUiDescription")}
                  </li>
                  <li>
                    <strong>{t("about.tailwindCss")}:</strong>{" "}
                    {t("about.tailwindCssDescription")}
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">
                  {t("about.backendStack")}
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <strong>{t("about.bun")}:</strong>{" "}
                    {t("about.bunDescription")}
                  </li>
                  <li>
                    <strong>{t("about.hono")}:</strong>{" "}
                    {t("about.honoDescription")}
                  </li>
                  <li>
                    <strong>{t("about.trpc")}:</strong>{" "}
                    {t("about.trpcDescription")}
                  </li>
                  <li>
                    <strong>{t("about.betterAuth")}:</strong>{" "}
                    {t("about.betterAuthDescription")}
                  </li>
                  <li>
                    <strong>{t("about.cloudflareWorkers")}:</strong>{" "}
                    {t("about.cloudflareWorkersDescription")}
                  </li>
                  <li>
                    <strong>{t("about.websockets")}:</strong>{" "}
                    {t("about.websocketsDescription")}
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Team Section */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold tracking-tight mb-8 text-center">
          {t("about.builtBy")}
        </h2>

        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-6">
              {t("about.builtByDescription")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <a
                  href="https://github.com/kriasoft"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("about.visitGitHub")}
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a
                  href="https://kriasoft.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("about.learnMore")}
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12" />

      {/* CTA Section */}
      <section className="text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          {t("about.readyToStart")}
        </h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
          {t("about.readyToStartDescription")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <a
              href="https://github.com/kriasoft/react-starter-kit"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("about.getStartedNow")}
            </a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a
              href="https://github.com/kriasoft/react-starter-kit/discussions"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("about.joinCommunity")}
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
