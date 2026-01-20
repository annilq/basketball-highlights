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
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

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
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [videoUrl, setVideoUrl] = React.useState<string | undefined>();
  const videoUrlRef = React.useRef<HTMLInputElement>(null);
  const detectShotsMutation = useDetectShotsMutation();
  const generateHighlightsMutation = useGenerateHighlightsMutation();
  const generateShotClipMutation = useGenerateShotClipMutation();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedFile) {
      detectShotsMutation.mutate({ file: selectedFile });
    } else {
      const formData = new FormData(e.currentTarget);
      const currentVideoUrl = formData.get("videoUrl") as string;
      setVideoUrl(currentVideoUrl);

      if (currentVideoUrl) {
        detectShotsMutation.mutate({ videoUrl: currentVideoUrl });
      }
    }
  };

  const handleGenerateHighlights = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (selectedFile) {
      generateHighlightsMutation.mutate({ video: selectedFile });
    } else {
      // Get the latest value from the input using ref
      const currentVideoUrl = videoUrlRef.current?.value || videoUrl;
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
    if (selectedFile) {
      generateShotClipMutation.mutate({
        video: selectedFile,
        shot_frame: event.frame,
        duration: 3,
      });
    } else if (videoUrl) {
      generateShotClipMutation.mutate({
        videoUrl,
        shot_frame: event.frame,
        duration: 3,
      });
    }
  };

  // Drag and drop functionality
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0] || null;
    setSelectedFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/*": [] },
    multiple: false,
  });

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
            <div className="space-y-6">
              {/* Video File Upload */}
              <div className="space-y-2">
                <Label htmlFor="videoFile">
                  {t("shotDetection.videoFile")}
                </Label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-input hover:border-primary"
                  }`}
                >
                  <input
                    {...getInputProps()}
                    id="videoFile"
                    name="videoFile"
                    accept="video/*"
                    disabled={isPending}
                    onChange={handleFileChange}
                  />
                  {isDragActive ? (
                    <div className="space-y-4">
                      <Upload className="mx-auto h-12 w-12 text-primary" />
                      <p className="text-lg font-medium">
                        {t("shotDetection.dropVideoHere")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("shotDetection.orDragAndDrop")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="text-lg font-medium">
                        {t("shotDetection.dragVideoHere")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("shotDetection.orClickToUpload")}
                      </p>
                      <Button
                        type="button"
                        disabled={isPending}
                        className="mt-2"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {t("shotDetection.selectVideoFile")}
                      </Button>
                    </div>
                  )}
                </div>
                {selectedFile && (
                  <div className="mt-4 flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Film className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      disabled={isPending}
                    >
                      {t("common.remove")}
                    </Button>
                  </div>
                )}
              </div>

              {/* URL Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="videoUrl">
                    {t("shotDetection.videoUrl")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("shotDetection.orEnterUrl")}
                  </p>
                </div>
                <Input
                  id="videoUrl"
                  name="videoUrl"
                  type="url"
                  placeholder={t("shotDetection.videoUrlPlaceholder")}
                  disabled={isPending || !!selectedFile}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  ref={videoUrlRef}
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  disabled={isPending || (!selectedFile && !videoUrl)}
                  className="flex-1"
                >
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
                  disabled={
                    isPending ||
                    generateHighlightsMutation.isPending ||
                    (!selectedFile && !videoUrl)
                  }
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
