import { useI18n } from "@/lib/i18n";
import type { ShotEvent } from "@/lib/queries/shot-detection";
import { Button } from "@repo/ui";
import { Download } from "lucide-react";

interface ShotEventProps {
  event: ShotEvent;
  onGenerateClip?: (event: ShotEvent) => void;
}

export function ShotEventComponent({ event, onGenerateClip }: ShotEventProps) {
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
