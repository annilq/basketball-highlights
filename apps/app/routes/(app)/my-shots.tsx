import { useI18n } from "@/lib/i18n";
import type { ShotDetectionRecord } from "@/lib/queries/shot-detection";
import { useMyShotsQuery } from "@/lib/queries/shot-detection";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@repo/ui";
import { createFileRoute } from "@tanstack/react-router";
import { Film } from "lucide-react";

export const Route = createFileRoute("/(app)/my-shots")({
  component: MyShotsPage,
});

interface ShotCardProps {
  shot: ShotDetectionRecord;
}

function ShotCard({ shot }: ShotCardProps) {
  const { t } = useI18n();
  const shootingPercentage = parseFloat(shot.shootingPercentage);

  return (
    <Card className="h-full overflow-hidden transition-all hover:shadow-lg cursor-pointer">
      <div className="relative aspect-video bg-muted">
        <video
          src={shot.videoUrl}
          className="w-full h-full object-cover"
          poster={`${shot.videoUrl}#t=0.1`}
          muted
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-end">
          <div className="p-4 text-white">
            <h3 className="font-semibold truncate">{shot.videoName}</h3>
            <p className="text-sm opacity-90">
              {new Date(shot.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      <CardHeader>
        <CardTitle className="text-xl">
          {t("shotDetection.shotDetails")}
        </CardTitle>
        <CardDescription>
          {t("shotDetection.detectedOn")}{" "}
          {new Date(shot.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t("shotDetection.totalAttempts")}
            </p>
            <p className="text-2xl font-bold">{shot.attempts}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t("shotDetection.successfulMakes")}
            </p>
            <p className="text-2xl font-bold">{shot.makes}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t("shotDetection.shootingPercentage")}
            </p>
            <p className="text-2xl font-bold">
              {shootingPercentage.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <a
          href={`/shotdetectiondetail/${shot.id}`}
          className="w-full text-center py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          {t("common.viewDetails")}
        </a>
      </CardFooter>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <Card className="h-full overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            // eslint-disable-next-line @eslint-react/no-array-index-key
            <div key={i} className="text-center">
              <Skeleton className="h-4 w-2/3 mx-auto" />
              <Skeleton className="h-8 w-1/2 mx-auto mt-1" />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

function MyShotsPage() {
  const { t } = useI18n();
  const { data: myShots, isLoading, isError, error } = useMyShotsQuery();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("common.myShots")}</h1>
        <p className="text-muted-foreground">
          {t("shotDetection.myShotsSubtitle")}
        </p>
      </div>

      {isError && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive dark:bg-destructive/20">
          <p className="font-semibold">{t("common.error")}</p>
          <p className="text-sm">
            {error?.message || t("common.somethingWentWrong")}
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            // eslint-disable-next-line @eslint-react/no-array-index-key
            <LoadingSkeleton key={i} />
          ))}
        </div>
      ) : myShots && myShots.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {myShots.map((shot) => (
            <ShotCard key={shot.id} shot={shot} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Film className="mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">
            {t("shotDetection.noShotsFound")}
          </h2>
          <p className="text-muted-foreground max-w-md">
            {t("shotDetection.noShotsDescription")}
          </p>
        </div>
      )}
    </div>
  );
}
