import { useEffect, useRef, useState } from 'react';
import { HERE_MAPS_CONFIG } from '@/config/maps';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";

type RouteMapProps = {
  startLocation?: { lat: number; lng: number };
  endLocation?: { lat: number; lng: number };
  transportMode?: string;
  onRouteFound?: (route: any) => void;
  routeInfo?: {
    polyline?: string;
    distance?: number;
    duration?: number;
    instructions?: Array<{
      instruction: string;
      distance: number;
      duration: number;
    }>;
  };
};

export function RouteMap({ startLocation, endLocation, transportMode = 'driving-car', onRouteFound, routeInfo }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<H.Map | null>(null);
  const routeLine = useRef<H.map.Polyline | null>(null);
  const markers = useRef<H.map.Marker[]>([]);
  const { toast } = useToast();
  const [showCompanionRequest, setShowCompanionRequest] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    try {
      const apiKey = window.H?.API_KEY || HERE_MAPS_CONFIG.apiKey;
      if (!apiKey) {
        throw new Error('HERE Maps API key is missing');
      }

      // Initialize the platform
      const platform = new H.service.Platform({ apikey: apiKey });
      const defaultLayers = platform.createDefaultLayers();

      // Initialize the map with default center (e.g., Delhi)
      const defaultCenter = { lat: 28.6139, lng: 77.2090 };
      const center = startLocation || defaultCenter;

      // Initialize the map
      mapInstance.current = new H.Map(
        mapRef.current,
        defaultLayers.vector.normal.map,
        {
          zoom: 12,
          center: center
        }
      );

      // Add map events
      const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(mapInstance.current));
      H.ui.UI.createDefault(mapInstance.current, defaultLayers);

      // Clear existing markers and route
      if (routeLine.current) {
        mapInstance.current?.removeObject(routeLine.current);
      }
      markers.current.forEach(marker => {
        mapInstance.current?.removeObject(marker);
      });
      markers.current = [];

      // Add markers for start and end points if they exist
      if (startLocation) {
        const startMarker = new H.map.Marker(
          { lat: startLocation.lat, lng: startLocation.lng },
          {
            icon: new H.map.Icon(
              `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#EF4444"/>
                <circle cx="12" cy="12" r="4" fill="white"/>
              </svg>`,
              { size: { w: 24, h: 24 } }
            )
          }
        );
        mapInstance.current.addObject(startMarker);
        markers.current.push(startMarker);
      }

      if (endLocation) {
        const endMarker = new H.map.Marker(
          { lat: endLocation.lat, lng: endLocation.lng },
          {
            icon: new H.map.Icon(
              `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#10B981"/>
                <circle cx="12" cy="12" r="4" fill="white"/>
              </svg>`,
              { size: { w: 24, h: 24 } }
            )
          }
        );
        mapInstance.current.addObject(endMarker);
        markers.current.push(endMarker);
      }

      // If routeInfo is provided, display the route
      if (routeInfo?.polyline) {
        const lineString = H.geo.LineString.fromFlexiblePolyline(routeInfo.polyline);
        const polyline = new H.map.Polyline(lineString, {
          style: {
            lineWidth: 4,
            strokeColor: '#3B82F6'
          }
        });
        mapInstance.current.addObject(polyline);
        routeLine.current = polyline;

        // Fit the map view to show the entire route
        const bounds = polyline.getBoundingBox();
        mapInstance.current.getViewModel().setLookAtData({
          bounds: bounds,
          zoom: 12
        });

        // Show companion request button
        setShowCompanionRequest(true);
      }

      return () => {
        if (mapInstance.current) {
          mapInstance.current.dispose();
          mapInstance.current = null;
        }
      };
    } catch (error) {
      console.error('Map initialization error:', error);
      toast({
        title: "Error initializing map",
        description: error instanceof Error ? error.message : "Failed to initialize the map",
        variant: "destructive",
      });
    }
  }, [startLocation, endLocation, transportMode, routeInfo, toast]);

  const handleRequestCompanion = async () => {
    try {
      const res = await apiRequest("POST", "/api/companion-requests", {
        startLocation,
        endLocation,
        transportMode,
        routeInfo
      });
      
      if (res.ok) {
        toast({
          title: "Request sent",
          description: "Your companion request has been sent. We'll notify you when someone accepts.",
        });
      }
    } catch (error) {
      toast({
        title: "Error requesting companion",
        description: error instanceof Error ? error.message : "Failed to send request",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative h-full">
      <div ref={mapRef} className="w-full h-[calc(100vh-4rem)] rounded-lg overflow-hidden shadow-lg" />
      {showCompanionRequest && routeInfo && (
        <Card className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Route Found</h3>
                <div className="text-sm text-muted-foreground mt-1">
                  <div>Distance: {((routeInfo.distance ?? 0) / 1000).toFixed(2)} km</div>
                  <div>Duration: {Math.round((routeInfo.duration ?? 0) / 60)} minutes</div>
                  {routeInfo.instructions && (
                    <div className="mt-2">
                      <h4 className="font-medium">Directions:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        {routeInfo.instructions.map((instruction, index) => (
                          <li key={index} className="text-xs">
                            {instruction.instruction} ({Math.round(instruction.distance)}m)
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={handleRequestCompanion}>
                Request Companion
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}