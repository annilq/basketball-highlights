import { useI18n } from "@/lib/i18n";
import type { ShotEvent } from "@/lib/queries/shot-detection";
import {
  useGenerateShotClipMutation,
  useGetShotQuery,
} from "@/lib/queries/shot-detection";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Skeleton,
} from "@repo/ui";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Film,
  TrendingUp,
} from "lucide-react";
import React from "react";

export const Route = createFileRoute("/(app)/shotdetectiondetail/$shotId")({
  component: ShotDetectionDetailPage,
});

interface DetectionStatsProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
}

function DetectionStats({ label, value, icon: Icon }: DetectionStatsProps) {
  const { t } = useI18n();
  return (
    <div className="text-center">
      <Icon className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{t(label)}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

interface ShotEventProps {
  event: ShotEvent;
  videoUrl?: string;
  onGenerateClip?: (event: ShotEvent) => void;
}

function ShotEvent({ event, onGenerateClip }: ShotEventProps) {
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-between rounded-md bg-muted p-3">
      <div>
        <p className="font-medium">
          {t("shotDetection.shot")} {event.attempts}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("shotDetection.frame")}: {event.frame}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Button size="sm" onClick={() => onGenerateClip?.(event)}>
          <Download className="h-3 w-3 mr-1" />
          {t("shotDetection.generateClip")}
        </Button>
        <div
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            event.is_make
              ? "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400"
              : "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive"
          }`}
        >
          {event.is_make ? t("shotDetection.make") : t("shotDetection.miss")}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/2 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="aspect-video w-full rounded-lg mb-6" />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
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
    <div className="container mx-auto py-8">
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
  const { t } = useI18n();
  const { shotId } = Route.useParams();

  const { data: shotData, isLoading, isError, error } = useGetShotQuery(shotId);
  const generateShotClipMutation = useGenerateShotClipMutation();

  const handleGenerateClip = async (event: ShotEvent) => {
    if (!shotData?.videoUrl) {
      return;
    }

    generateShotClipMutation.mutate({
      videoUrl: shotData.videoUrl,
      shot_frame: event.frame,
      duration: 3,
    });
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !shotData) {
    return <ErrorState error={error as Error} />;
  }

  const shootingPercentage = parseFloat(shotData.shootingPercentage);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {t("shotDetection.shotDetails")}
        </h1>
        <p className="text-muted-foreground">
          {t("shotDetection.detectedOn")}{" "}
          {new Date(shotData.createdAt).toLocaleDateString()}
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-5 w-5" />
            {shotData.videoName}
          </CardTitle>
          <CardDescription>{t("shotDetection.originalVideo")}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Video Player */}
          <div className="mb-6">
            <video
              src={shotData.videoUrl}
              className="w-full rounded-lg shadow-md"
              controls
            />
          </div>

          {/* Detection Results */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <DetectionStats
              label="shotDetection.totalAttempts"
              value={shotData.attempts}
              icon={Film}
            />
            <DetectionStats
              label="shotDetection.successfulMakes"
              value={shotData.makes}
              icon={CheckCircle2}
            />
            <DetectionStats
              label="shotDetection.shootingPercentage"
              value={`${shootingPercentage.toFixed(1)}%`}
              icon={TrendingUp}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {t("shotDetection.shotEventsTimeline")}
          </CardTitle>
          <CardDescription>
            {t("shotDetection.timelineDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <div className="space-y-2">
            {shotData.shot_events.map((event) => (
              <ShotEvent
                key={`${event.frame}-${event.attempts}`}
                event={event}
                videoUrl={shotData.videoUrl}
                onGenerateClip={handleGenerateClip}
              />
            ))}
          </div>

          {shotData.shot_events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">
                {t("shotDetection.noShotsDetected")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("shotDetection.noShotsMessage")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
