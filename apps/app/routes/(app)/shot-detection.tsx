import { useI18n } from "@/lib/i18n";
import type {
  ShotDetectionResult,
  ShotEvent,
} from "@/lib/queries/shot-detection";
import {
  useDetectShotsMutation,
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
  Input,
  Label,
  Separator,
  Skeleton,
  Switch,
} from "@repo/ui";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Film,
  TrendingUp,
  Upload,
} from "lucide-react";
import React from "react";

export const Route = createFileRoute("/(app)/shot-detection")({
  component: ShotDetectionPage,
});

interface DetectionStatsProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
}

function DetectionStats({ label, value, icon: Icon }: DetectionStatsProps) {
  return (
    <div className="text-center">
      <Icon className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

interface ShotEventProps {
  event: ShotEvent;
  videoUrl?: string;
  selectedFile?: File | null;
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

function ShotDetectionPage() {
  const { t } = useI18n();
  const [isFileUpload, setIsFileUpload] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [videoUrl, setVideoUrl] = React.useState<string | undefined>();
  const videoUrlRef = React.useRef<HTMLInputElement>(null);
  const detectShotsMutation = useDetectShotsMutation();
  const generateHighlightsMutation = useGenerateHighlightsMutation();
  const generateShotClipMutation = useGenerateShotClipMutation();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let currentVideoUrl: string | undefined;
    if (isFileUpload) {
      if (selectedFile) {
        detectShotsMutation.mutate({ file: selectedFile });
      }
    } else {
      const formData = new FormData(e.currentTarget);
      currentVideoUrl = formData.get("videoUrl") as string;
      setVideoUrl(currentVideoUrl);

      if (currentVideoUrl) {
        detectShotsMutation.mutate({ videoUrl: currentVideoUrl });
      }
    }
  };

  const handleGenerateHighlights = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    let currentVideoUrl: string | undefined;
    if (isFileUpload) {
      if (selectedFile) {
        generateHighlightsMutation.mutate({ video: selectedFile });
      }
    } else {
      // Get the latest value from the input using ref
      currentVideoUrl = videoUrlRef.current?.value || videoUrl;
      setVideoUrl(currentVideoUrl);

      if (currentVideoUrl && currentVideoUrl.trim() !== "") {
        generateHighlightsMutation.mutate({ videoUrl: currentVideoUrl });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleGenerateClip = (event: ShotEvent) => {
    if (isFileUpload) {
      if (selectedFile) {
        generateShotClipMutation.mutate({
          video: selectedFile,
          shot_frame: event.frame,
          duration: 3,
        });
      }
    } else if (videoUrl) {
      generateShotClipMutation.mutate({
        videoUrl,
        shot_frame: event.frame,
        duration: 3,
      });
    }
  };

  const { data, status, error } = detectShotsMutation;
  const isPending = status === "pending";
  const isError = status === "error";
  const shotData = data as ShotDetectionResult | undefined;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("shotDetection.title")}</h1>
        <p className="text-muted-foreground">{t("shotDetection.subtitle")}</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-5 w-5" />
            {t("shotDetection.uploadVideo")}
          </CardTitle>
          <CardDescription>
            {t("shotDetection.uploadVideoDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Upload method switch */}
              <div className="flex items-center justify-between space-x-4">
                <div>
                  <Label htmlFor="uploadMethod">
                    {t("shotDetection.useFileUpload")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("shotDetection.toggleUploadMethod")}
                  </p>
                </div>
                <Switch
                  id="uploadMethod"
                  checked={isFileUpload}
                  onCheckedChange={setIsFileUpload}
                  disabled={isPending}
                />
              </div>

              {/* URL Input */}
              {!isFileUpload ? (
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">
                    {t("shotDetection.videoUrl")}
                  </Label>
                  <Input
                    id="videoUrl"
                    name="videoUrl"
                    type="url"
                    placeholder="https://example.com/basketball-game.mp4"
                    disabled={isPending}
                    required
                    onChange={(e) => setVideoUrl(e.target.value)}
                    ref={videoUrlRef}
                  />
                </div>
              ) : (
                /* File Upload */
                <div className="space-y-2">
                  <Label htmlFor="videoFile">
                    {t("shotDetection.videoFile")}
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id="videoFile"
                      name="videoFile"
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      disabled={isPending}
                      required
                      className="flex-1"
                    />
                  </div>
                  {selectedFile && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Upload className="h-4 w-4" />
                      <span>
                        {selectedFile.name} (
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-2">
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending ? (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4 animate-spin" />
                      {t("shotDetection.detectingShots")}
                    </>
                  ) : (
                    <>
                      <Film className="mr-2 h-4 w-4" />
                      {t("common.shotDetection")}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  disabled={isPending || generateHighlightsMutation.isPending}
                  className="flex-1"
                  onClick={handleGenerateHighlights}
                >
                  {generateHighlightsMutation.isPending ? (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4 animate-spin" />
                      {t("shotDetection.generatingHighlights")}
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      {t("shotDetection.generateHighlights")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>

          {isError && (
            <div className="mt-4 flex items-start gap-3 rounded-lg bg-destructive/10 p-4 text-destructive dark:bg-destructive/20">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">
                  {t("shotDetection.detectionFailed")}
                </p>
                <p className="text-sm">
                  {error?.message || t("shotDetection.failedMessage")}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isPending && (
        <Card>
          <CardHeader>
            <CardTitle>{t("shotDetection.processingVideo")}</CardTitle>
            <CardDescription>
              {t("shotDetection.processingDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="h-32 w-full" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {shotData && (
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
                  value={shotData.total_attempts}
                  icon={Film}
                />
                <DetectionStats
                  label={t("shotDetection.successfulMakes")}
                  value={shotData.total_makes}
                  icon={CheckCircle2}
                />
                <DetectionStats
                  label={t("shotDetection.shootingPercentage")}
                  value={`${shotData.shooting_percentage}%`}
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
                    videoUrl={videoUrl}
                    selectedFile={selectedFile}
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
        </>
      )}
    </div>
  );
}
