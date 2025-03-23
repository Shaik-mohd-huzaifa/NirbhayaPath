import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/layout/app-shell";
import { RouteMap } from "@/components/map/route-map";
import { RouteSearch } from "@/components/route/route-search";
import { EmergencyButton } from "@/components/safety/emergency-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Route, SaathiRequest } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user } = useAuth();
  const [selectedRoute, setSelectedRoute] = useState<{
    startLocation: { lat: number; lng: number };
    endLocation: { lat: number; lng: number };
  } | undefined>();
  const [transportMode, setTransportMode] = useState("metro");
  const [selectingLocation, setSelectingLocation] = useState<'start' | 'end' | null>(null);

  const { data: routes, isLoading: routesLoading } = useQuery<Route[]>({
    queryKey: ["/api/routes"],
  });

  const { data: saathiRequests, isLoading: saathiLoading } = useQuery<SaathiRequest[]>({
    queryKey: ["/api/saathi/requests"],
  });

  const handleMapClick = (location: { lat: number; lng: number }) => {
    if (selectingLocation === 'start') {
      setSelectedRoute(prev => ({
        startLocation: location,
        endLocation: prev?.endLocation || location,
      }));
      setSelectingLocation(null);
    } else if (selectingLocation === 'end') {
      setSelectedRoute(prev => ({
        startLocation: prev?.startLocation || location,
        endLocation: location,
      }));
      setSelectingLocation(null);
    }
  };

  if (routesLoading || saathiLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AppShell>
      <div className="relative h-[calc(100vh-4rem)]">
        {/* Map Container */}
        <div className="absolute inset-0 z-0">
          <RouteMap 
            routes={routes || []} 
            selectedRoute={selectedRoute}
            transportMode={transportMode}
            onMapClick={selectingLocation ? handleMapClick : undefined}
          />
        </div>

        {/* Search and Controls Overlay */}
        <div className="absolute inset-x-0 top-0 z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent pointer-events-none" />
          <div className="relative container mx-auto px-4 pt-6">
            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 pointer-events-auto">
                <RouteSearch 
                  onRouteSelect={(route) => setSelectedRoute(route)}
                  onTransportModeChange={setTransportMode}
                  onLocationSelect={setSelectingLocation}
                />
              </div>
              <div className="pointer-events-auto">
                <Card className="bg-white/95 backdrop-blur shadow-lg border-0">
                  <CardContent className="p-6">
                    <EmergencyButton contacts={user?.emergencyContacts || []} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Location Selection Message */}
        {selectingLocation && (
          <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-white/95 backdrop-blur px-4 py-2 rounded-full shadow-lg text-sm font-medium">
              Click on the map to select {selectingLocation === 'start' ? 'starting' : 'destination'} point
            </div>
          </div>
        )}

        {/* Saathi Requests Panel */}
        <div className="absolute bottom-6 right-6 w-full max-w-sm pointer-events-auto z-10">
          <Card className="bg-white/95 backdrop-blur shadow-lg border-0">
            <CardHeader>
              <CardTitle>Saathi Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {saathiRequests?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active Saathi requests</p>
              ) : (
                <div className="space-y-2">
                  {saathiRequests?.map((request) => (
                    <div key={request.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Route #{request.routeId}</span>
                        <span className="text-sm capitalize">{request.status}</span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" variant="outline">View Details</Button>
                        {request.status === "pending" && (
                          <Button size="sm">Accept Request</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}