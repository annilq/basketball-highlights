import { ShotDetectionResult } from "@/components/shotDetection/shotResult";
import { useI18n } from "@/lib/i18n";

import { useGetShotQuery } from "@/lib/queries/shot-detection";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Separator,
  Skeleton,
} from "@repo/ui";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";

export const Route = createFileRoute("/(app)/shotdetectiondetail/$shotId")({
  component: ShotDetectionDetailPage,
});

function LoadingState() {
  return (
    <div className="container mx-auto py-4">
      <div className="mb-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </div>

      <Card className="mb-4">
        <CardHeader>
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/2 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="aspect-video w-full rounded-lg mb-6" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-4">
            {[...Array(3)].map((_, i) => (
              // eslint-disable-next-line @eslint-react/no-array-index-key
              <div key={i} className="text-center">
                <Skeleton className="h-6 w-6 mx-auto mb-2" />
                <Skeleton className="h-4 w-2/3 mx-auto" />
                <Skeleton className="h-8 w-1/2 mx-auto mt-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/2 mt-1" />
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                // eslint-disable-next-line @eslint-react/no-array-index-key
                key={i}
                className="flex items-center justify-between rounded-md bg-muted p-3"
              >
                <div>
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/3 mt-1" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorState({ error }: { error: Error }) {
  const { t } = useI18n();
  return (
    <div className="container mx-auto py-4">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="mb-4 h-16 w-16 text-destructive" />
        <h2 className="text-xl font-semibold mb-2">{t("common.error")}</h2>
        <p className="text-muted-foreground max-w-md mb-4">
          {error?.message || t("common.somethingWentWrong")}
        </p>
        <Button onClick={() => (window.location.href = "/(app)/my-shots")}>
          {t("common.backToMyShots")}
        </Button>
      </div>
    </div>
  );
}

function ShotDetectionDetailPage() {
  const { shotId } = Route.useParams();
  const { t } = useI18n();

  const { data: shotData, isLoading, isError, error } = useGetShotQuery(shotId);

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !shotData) {
    return <ErrorState error={error as Error} />;
  }

  return (
    <div className="container mx-auto py-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">
          {t("shotDetection.shotDetails")}
        </h1>
        <p className="text-muted-foreground">
          {t("shotDetection.detectedOn")}{" "}
          {new Date(shotData.createdAt).toLocaleDateString()}
        </p>
      </div>
      <ShotDetectionResult data={shotData} />
    </div>
  );
}
