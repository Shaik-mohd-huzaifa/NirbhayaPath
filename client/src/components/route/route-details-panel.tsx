import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, MapPin, Navigation, X } from "lucide-react";

type RouteDetailsPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  startLocation?: string;
  endLocation?: string;
  transportMode?: string;
  duration?: number;
  distance?: number;
  safetyScore?: number;
};

export function RouteDetailsPanel({
  isOpen,
  onClose,
  startLocation,
  endLocation,
  transportMode,
  duration,
  distance,
  safetyScore
}: RouteDetailsPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-0 h-auto w-[300px] bg-background/95 backdrop-blur shadow-2xl z-50 border-r animate-in slide-in-from-left">
      <Card className="h-full overflow-auto border-0 rounded-none">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Route Details</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">From</label>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-primary" />
                  <span className="font-medium">{startLocation}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">To</label>
                <div className="flex items-start gap-2">
                  <Navigation className="h-4 w-4 mt-1 text-primary" />
                  <span className="font-medium">{endLocation}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Transport Mode</label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium capitalize">{transportMode?.replace('-', ' ')}</span>
                </div>
              </div>

              {duration && (
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Duration</label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-medium">{Math.round(duration / 60)} minutes</span>
                  </div>
                </div>
              )}

              {distance && (
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Distance</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium">{(distance / 1000).toFixed(1)} km</span>
                  </div>
                </div>
              )}

              {safetyScore && (
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Safety Score</label>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: safetyScore > 80 ? '#10B981' : safetyScore > 60 ? '#F59E0B' : '#EF4444' }} />
                    <span className="font-medium">{safetyScore}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
