import { ShotEventComponent } from "@/components/shotDetection/shotEvents";
import { useI18n } from "@/lib/i18n";
import type {
  ShotDetectionRecord,
  ShotEvent,
} from "@/lib/queries/shot-detection";
import {
  useGenerateHighlightsMutation,
  useGenerateShotClipMutation,
} from "@/lib/queries/shot-detection";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from "@repo/ui";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Film,
  TrendingUp,
} from "lucide-react";
import { DetectionStats } from "./shotStats";

export function ShotDetectionResult({ data }: { data: ShotDetectionRecord }) {
  const { t } = useI18n();

  const generateHighlightsMutation = useGenerateHighlightsMutation();
  const generateShotClipMutation = useGenerateShotClipMutation();

  const handleGenerateClip = async (event: ShotEvent) => {
    if (!data?.videoUrl) {
      return;
    }

    generateShotClipMutation.mutate({
      videoUrl: data.videoUrl,
      shot_frame: event.frame,
      duration: 3,
    });
  };
  const handleGenerateAllClips = async () => {
    if (!data?.videoUrl) {
      return;
    }

    generateHighlightsMutation.mutate({
      videoUrl: data.videoUrl,
    });
  };

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t("shotDetection.detectionResults")}
          </CardTitle>
          <CardDescription>
            {t("shotDetection.resultsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <DetectionStats
              label={t("shotDetection.totalAttempts")}
              value={data.attempts}
              icon={Film}
            />
            <DetectionStats
              label={t("shotDetection.successfulMakes")}
              value={data.makes}
              icon={CheckCircle2}
            />
            <DetectionStats
              label={t("shotDetection.shootingPercentage")}
              value={`${data.shootingPercentage}%`}
              icon={TrendingUp}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            {t("shotDetection.shotEventsTimeline")}
            <Button size="sm" onClick={() => handleGenerateAllClips?.()}>
              <Download className="h-3 w-3 mr-1" />
              {t("shotDetection.generateClip")}
            </Button>
          </CardTitle>
          <CardDescription>
            {t("shotDetection.timelineDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <div className="space-y-2">
            {data.shot_events.map((event) => (
              <ShotEventComponent
                key={`${event.frame}-${event.attempts}`}
                event={event}
                onGenerateClip={handleGenerateClip}
              />
            ))}
          </div>
          {data.shot_events.length === 0 && (
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
    </>
  );
}
