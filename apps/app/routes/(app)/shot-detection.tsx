import { ShotDetectionResult } from "@/components/shotDetection/shotResult";
import { useI18n } from "@/lib/i18n";
import { useDetectShotsMutation } from "@/lib/queries/shot-detection";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
} from "@repo/ui";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Film, TrendingUp, Upload } from "lucide-react";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export const Route = createFileRoute("/(app)/shot-detection")({
  component: ShotDetectionPage,
});

function ShotDetectionPage() {
  const { t } = useI18n();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [videoUrl, setVideoUrl] = React.useState<string | undefined>();
  const videoUrlRef = React.useRef<HTMLInputElement>(null);
  const detectShotsMutation = useDetectShotsMutation();

  // Upload video to Hono API and return URL
  const uploadVideo = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("video", file);

    const response = await fetch("/api/shot-detection/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload video");
    }

    const data = await response.json();
    return data.videoUrl;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let finalVideoUrl: string | undefined;

    if (selectedFile) {
      try {
        // First upload file to get URL
        const uploadedUrl = await uploadVideo(selectedFile);
        finalVideoUrl = uploadedUrl;
        setVideoUrl(uploadedUrl);
      } catch (error) {
        console.error("Error uploading video:", error);
        return;
      }
    } else {
      const formData = new FormData(e.currentTarget);
      const currentVideoUrl = formData.get("videoUrl") as string;
      finalVideoUrl = currentVideoUrl;
      setVideoUrl(currentVideoUrl);
    }

    if (finalVideoUrl) {
      detectShotsMutation.mutate({ videoUrl: finalVideoUrl });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
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

  return (
    <div className="container mx-auto py-4">
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
              </div>
            </div>
          </form>

          {isError && (
            <div className="mt-4 flex items-start gap-3 rounded-lg bg-destructive/10 p-4 text-destructive dark:bg-destructive/20">
              <AlertCircle className="h-5 w-5 shrink-0" />
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

      {data && <ShotDetectionResult data={data} />}
    </div>
  );
}
