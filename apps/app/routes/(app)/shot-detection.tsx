import type {
  ShotDetectionResult,
  ShotEvent,
} from "@/lib/queries/shot-detection";
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
}

function ShotEvent({ event }: ShotEventProps) {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted p-3">
      <div>
        <p className="font-medium">Shot {event.attempts}</p>
        <p className="text-sm text-muted-foreground">Frame: {event.frame}</p>
      </div>
      <div
        className={`rounded-full px-3 py-1 text-sm font-medium ${
          event.is_make
            ? "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400"
            : "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive"
        }`}
      >
        {event.is_make ? "Make" : "Miss"}
      </div>
    </div>
  );
}

function ShotDetectionPage() {
  const [isFileUpload, setIsFileUpload] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const detectShotsMutation = useDetectShotsMutation();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isFileUpload) {
      if (selectedFile) {
        detectShotsMutation.mutate({ file: selectedFile });
      }
    } else {
      const formData = new FormData(e.currentTarget);
      const videoUrl = formData.get("videoUrl") as string;

      if (videoUrl) {
        detectShotsMutation.mutate({ videoUrl });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const { data, status, error } = detectShotsMutation;
  const isPending = status === "pending";
  const isError = status === "error";
  const shotData = data as ShotDetectionResult | undefined;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Basketball Shot Detection</h1>
        <p className="text-muted-foreground">
          Upload basketball game footage and let AI detect shots, makes, and
          shooting statistics.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-5 w-5" />
            Upload Video
          </CardTitle>
          <CardDescription>
            Provide a URL to a basketball game video or upload a file for shot
            detection analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Upload method switch */}
              <div className="flex items-center justify-between space-x-4">
                <div>
                  <Label htmlFor="uploadMethod">Use File Upload</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between URL input and file upload
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
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input
                    id="videoUrl"
                    name="videoUrl"
                    type="url"
                    placeholder="https://example.com/basketball-game.mp4"
                    disabled={isPending}
                    required
                  />
                </div>
              ) : (
                /* File Upload */
                <div className="space-y-2">
                  <Label htmlFor="videoFile">Video File</Label>
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

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4 animate-spin" />
                    Detecting Shots...
                  </>
                ) : (
                  <>
                    <Film className="mr-2 h-4 w-4" />
                    Detect Shots
                  </>
                )}
              </Button>
            </div>
          </form>

          {isError && (
            <div className="mt-4 flex items-start gap-3 rounded-lg bg-destructive/10 p-4 text-destructive dark:bg-destructive/20">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">Detection Failed</p>
                <p className="text-sm">
                  {error?.message ||
                    "Failed to detect shots. Please try again later."}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isPending && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Video</CardTitle>
            <CardDescription>
              Analyzing basketball footage to detect shots and statistics
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
                Detection Results
              </CardTitle>
              <CardDescription>
                Shot analysis statistics from the uploaded video
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <DetectionStats
                  label="Total Attempts"
                  value={shotData.total_attempts}
                  icon={Film}
                />
                <DetectionStats
                  label="Successful Makes"
                  value={shotData.total_makes}
                  icon={CheckCircle2}
                />
                <DetectionStats
                  label="Shooting %"
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
                Shot Events Timeline
              </CardTitle>
              <CardDescription>
                Detailed breakdown of each detected shot with frame information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Separator className="mb-4" />
              <div className="space-y-2">
                {shotData.shot_events.map((event) => (
                  <ShotEvent
                    key={`${event.frame}-${event.attempts}`}
                    event={event}
                  />
                ))}
              </div>

              {shotData.shot_events.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-medium">No shots detected</p>
                  <p className="text-sm text-muted-foreground">
                    The video analysis did not detect any shot events. Try with
                    a different video.
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
