import { useState, useCallback, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MapPin, Navigation, Search, Car, Bus, PersonStanding, Building, MapPinned, Train, Store, Coffee, Landmark, BusFront, School, Hospital, ShoppingBag, Locate, Shield } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { HERE_MAPS_CONFIG } from '@/config/maps';
import { RouteDetailsModal } from "./route-details-modal";

type Location = {
  lat: number;
  lng: number;
  name: string;
  country: string;
  state?: string;
  city?: string;
  street?: string;
  houseNumber?: string;
  postcode?: string;
  district?: string;
  type?: string;
  category?: string;
  label?: string;
  distance?: number;
  description?: string;
  openingHours?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews?: any[];
  amenities?: any[];
  accessibility?: any;
  parking?: any;
  photos?: string[];
};

type RouteSearchProps = {
  onRouteSelect: (route: { startLocation: { lat: number; lng: number }; endLocation: { lat: number; lng: number } }) => void;
  onTransportModeChange: (mode: string) => void;
  onLocationSelect: (location: Location) => void;
};

const transportModes = [
  { id: 'foot-walking', name: 'Walk', icon: <PersonStanding className="w-5 h-5" /> },
  { id: 'driving-car', name: 'Car', icon: <Car className="w-5 h-5" /> },
  { id: 'bus', name: 'Bus', icon: <Bus className="w-5 h-5" /> },
  { id: 'metro', name: 'Metro', icon: <Train className="w-5 h-5" /> },
  { id: 'train', name: 'Train', icon: <Train className="w-5 h-5 rotate-90" /> },
];

export function RouteSearch({ onRouteSelect, onTransportModeChange, onLocationSelect }: RouteSearchProps) {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [startSearch, setStartSearch] = useState('');
  const [endSearch, setEndSearch] = useState('');
  const [startResults, setStartResults] = useState<Location[]>([]);
  const [endResults, setEndResults] = useState<Location[]>([]);
  const [selectedStart, setSelectedStart] = useState<Location | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<Location | null>(null);
  const [commuteType, setCommuteType] = useState('metro');
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const { toast } = useToast();
  const [showRouteDetails, setShowRouteDetails] = useState(true);

  const debouncedStartSearch = useDebounce(startSearch, 300);
  const debouncedEndSearch = useDebounce(endSearch, 300);

  const searchLocation = useCallback(async (query: string) => {
    if (!query || query.length < 2) return [];

    try {
      const apiKey = window.H?.API_KEY;
      if (!apiKey) {
        console.error('HERE Maps API key is missing');
        toast({
          title: "Error",
          description: "HERE Maps API key is missing. Please check your configuration.",
          variant: "destructive"
        });
        return [];
      }

      const encodedQuery = encodeURIComponent(query);
      const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodedQuery}&in=countryCode:IND&limit=10&apiKey=${apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 429) {
          console.warn('Rate limit reached, waiting before retrying...');
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          return searchLocation(query); // Retry once
        }
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch search results: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.items || data.items.length === 0) {
        return [];
      }

      return data.items.map((item: any) => {
        const address = item.address;
        return {
          lat: item.position.lat,
          lng: item.position.lng,
          name: address?.label || query,
          country: address?.countryCode || 'India',
          state: address?.state,
          city: address?.city,
          street: address?.street,
          houseNumber: address?.houseNumber,
          postcode: address?.postalCode,
          district: address?.district,
          type: item.resultType,
          label: address?.label,
          distance: item.distance,
          category: item.categories?.map((c: any) => c.name).join(', ') || 'Location',
          description: address?.label
        };
      });
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }, [toast]);

  const debouncedHandleStartSearch = useCallback(
    async () => {
      if (!debouncedStartSearch || debouncedStartSearch.length < 2) {
        setStartResults([]);
        return;
      }
      const results = await searchLocation(debouncedStartSearch);
      setStartResults(results);
    },
    [debouncedStartSearch, searchLocation]
  );

  const debouncedHandleEndSearch = useCallback(
    async () => {
      if (!debouncedEndSearch || debouncedEndSearch.length < 2) {
        setEndResults([]);
        return;
      }
      const results = await searchLocation(debouncedEndSearch);
      setEndResults(results);
    },
    [debouncedEndSearch, searchLocation]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      debouncedHandleStartSearch();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [debouncedHandleStartSearch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      debouncedHandleEndSearch();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [debouncedHandleEndSearch]);

  const handleStartInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartSearch(value);
    if (!startOpen && value.length >= 2) {
      setStartOpen(true);
    }
  }, [startOpen]);

  const handleEndInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndSearch(value);
    if (!endOpen && value.length >= 2) {
      setEndOpen(true);
    }
  }, [endOpen]);

  const handleRouteSelection = useCallback(() => {
    if (selectedStart && selectedEnd) {
      // Calculate route using HERE Maps Routing API
      const apiKey = window.H?.API_KEY;
      if (!apiKey) {
        toast({
          title: "Error",
          description: "HERE Maps API key is missing",
          variant: "destructive"
        });
        return;
      }

      // Map transport modes to HERE Maps supported modes
      const transportModeMap: { [key: string]: string } = {
        'foot-walking': 'pedestrian',
        'driving-car': 'car',
        'bus': 'publicTransport',
        'metro': 'publicTransport',
        'train': 'publicTransport'
      };

      const mappedMode = transportModeMap[commuteType] || 'car';
      const routeUrl = `https://router.hereapi.com/v8/routes?transportMode=${mappedMode}&origin=${selectedStart.lat},${selectedStart.lng}&destination=${selectedEnd.lat},${selectedEnd.lng}&return=polyline,actions,instructions&apiKey=${apiKey}`;
      
      fetch(routeUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const routeInfo = {
              startLocation: { lat: selectedStart.lat, lng: selectedStart.lng },
              endLocation: { lat: selectedEnd.lat, lng: selectedEnd.lng },
              distance: route.sections[0].summary.length,
              duration: route.sections[0].summary.duration,
              polyline: route.sections[0].polyline,
              instructions: route.sections[0].actions.map((action: any) => ({
                instruction: action.instruction,
                distance: action.length,
                duration: action.duration
              }))
            };

            // Call the parent component's callback with route information
            onRouteSelect(routeInfo);
            
            // Show success message
            toast({
              title: "Route found",
              description: `Distance: ${(routeInfo.distance / 1000).toFixed(2)}km, Duration: ${Math.round(routeInfo.duration / 60)}min`,
            });

            // Show route details modal
            setShowRouteDetails(true);
          } else {
            throw new Error("No route found");
          }
        })
        .catch(error => {
          console.error('Route calculation error:', error);
          toast({
            title: "Error calculating route",
            description: error.message || "Failed to calculate the route. Please try again.",
            variant: "destructive"
          });
        });
    }
  }, [selectedStart, selectedEnd, commuteType, onRouteSelect, toast]);

  useEffect(() => {
    handleRouteSelection();
  }, [handleRouteSelection]);

  const handleTransportModeChange = useCallback((mode: string) => {
    setCommuteType(mode);
    onTransportModeChange(mode);
  }, [onTransportModeChange]);

  const searchRouteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedStart || !selectedEnd) return;

      const route = {
        startLocation: { lat: selectedStart.lat, lng: selectedStart.lng },
        endLocation: { lat: selectedEnd.lat, lng: selectedEnd.lng },
        userId: 1,
        safetyScore: 85,
        transportMode: commuteType
      };

      const res = await apiRequest("POST", "/api/routes", route);
      const data = await res.json();
      setSelectedRoute(data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
      toast({
        title: "Route created",
        description: "Your route has been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create route",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const requestSaathiMutation = useMutation({
    mutationFn: async () => {
      if (!selectedStart || !selectedEnd || !selectedRoute) return;

      const request = {
        userId: 1,
        routeId: selectedRoute.id,
        status: "pending"
      };

      const res = await apiRequest("POST", "/api/saathi/requests", request);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saathi/requests"] });
      toast({
        title: "Saathi request created",
        description: "We'll notify you when a Saathi accepts your request.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to request Saathi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getLocationIcon = useMemo(() => (type?: string, category?: string) => {
    if (category?.includes('hospital') || category?.includes('health')) return <Hospital className="w-4 h-4" />;
    if (category?.includes('shop') || category?.includes('store')) return <Store className="w-4 h-4" />;
    if (category?.includes('restaurant') || category?.includes('cafe')) return <Coffee className="w-4 h-4" />;
    if (category?.includes('school') || category?.includes('education')) return <School className="w-4 h-4" />;
    if (category?.includes('mall') || category?.includes('shopping')) return <ShoppingBag className="w-4 h-4" />;
    if (category?.includes('landmark') || category?.includes('tourist')) return <Landmark className="w-4 h-4" />;
    if (category?.includes('transport') || category?.includes('station')) return <BusFront className="w-4 h-4" />;

    switch (type) {
      case 'venue':
        return <Building className="w-4 h-4" />;
      case 'address':
        return <MapPinned className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  }, []);

  const formatLocation = useCallback((location: Location | null): string => {
    if (!location) return 'Location not selected';

    const parts = [];

    if (location.name && typeof location.name === 'string') {
      parts.push(location.name);
    }

    if (location.houseNumber && location.street) {
      parts.push(`${location.houseNumber} ${location.street}`);
    } else if (location.street) {
      parts.push(location.street);
    }

    if (location.district && !parts.includes(location.district)) {
      parts.push(location.district);
    }

    if (location.city && !parts.includes(location.city)) {
      parts.push(location.city);
    }

    if (location.state && !parts.includes(location.state)) {
      parts.push(location.state);
    }

    if (typeof location.distance === 'number') {
      const distanceText = location.distance < 1000
        ? `${Math.round(location.distance)}m away`
        : `${(location.distance / 1000).toFixed(1)}km away`;
      parts.push(distanceText);
    }

    return parts.filter(Boolean).join(", ") || 'Location details not available';
  }, []);

  return (
    <>
      <Card className="w-full bg-white/95 backdrop-blur shadow-xl border-0">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              {transportModes.map((mode) => (
                <Button
                  key={mode.id}
                  variant={commuteType === mode.id ? "default" : "outline"}
                  className={`flex-1 gap-2 ${
                    commuteType === mode.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-white hover:bg-primary/10"
                  }`}
                  onClick={() => handleTransportModeChange(mode.id)}
                >
                  {mode.icon}
                  <span className="hidden sm:inline">{mode.name}</span>
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <Popover open={startOpen} onOpenChange={setStartOpen}>
                  <PopoverTrigger asChild>
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter starting point"
                        value={startSearch}
                        onChange={handleStartInputChange}
                        className="pl-9 bg-white shadow-sm hover:shadow focus:shadow-md transition-shadow"
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[400px] max-h-[300px] overflow-auto shadow-xl" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search location..."
                        value={startSearch}
                        onValueChange={setStartSearch}
                      />
                      <CommandEmpty>No locations found.</CommandEmpty>
                      <CommandGroup>
                        {startResults.map((result, index) => (
                          <CommandItem
                            key={index}
                            onSelect={() => {
                              setSelectedStart(result);
                              setStartSearch(formatLocation(result));
                              setStartOpen(false);
                            }}
                            className="flex items-start gap-2 p-2 hover:bg-primary/5"
                          >
                            {getLocationIcon(result.type, result.category)}
                            <div className="flex flex-col overflow-hidden">
                              <span className="font-medium truncate">{result.name || formatLocation(result)}</span>
                              {result.name && (
                                <span className="text-sm text-muted-foreground truncate">
                                  {formatLocation(result)}
                                </span>
                              )}
                              {result.description && (
                                <span className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {result.description}
                                </span>
                              )}
                              {result.category && (
                                <span className="text-xs text-primary mt-1">
                                  {result.category}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-2">
                <Popover open={endOpen} onOpenChange={setEndOpen}>
                  <PopoverTrigger asChild>
                    <div className="relative flex-1">
                      <Navigation className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Where to?"
                        value={endSearch}
                        onChange={handleEndInputChange}
                        className="pl-9 bg-white shadow-sm hover:shadow focus:shadow-md transition-shadow"
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[400px] max-h-[300px] overflow-auto shadow-xl" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search location..."
                        value={endSearch}
                        onValueChange={setEndSearch}
                      />
                      <CommandEmpty>No locations found.</CommandEmpty>
                      <CommandGroup>
                        {endResults.map((result, index) => (
                          <CommandItem
                            key={index}
                            onSelect={() => {
                              setSelectedEnd(result);
                              setEndSearch(formatLocation(result));
                              setEndOpen(false);
                            }}
                            className="flex items-start gap-2 p-2 hover:bg-primary/5"
                          >
                            {getLocationIcon(result.type, result.category)}
                            <div className="flex flex-col overflow-hidden">
                              <span className="font-medium truncate">{result.name || formatLocation(result)}</span>
                              {result.name && (
                                <span className="text-sm text-muted-foreground truncate">
                                  {formatLocation(result)}
                                </span>
                              )}
                              {result.description && (
                                <span className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {result.description}
                                </span>
                              )}
                              {result.category && (
                                <span className="text-xs text-primary mt-1">
                                  {result.category}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-white shadow-md"
                onClick={() => searchRouteMutation.mutate()}
                disabled={!selectedStart || !selectedEnd || searchRouteMutation.isPending}
              >
                {searchRouteMutation.isPending ? (
                  "Searching..."
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Find Safe Route
                  </>
                )}
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full border-primary/20 hover:bg-primary/5"
                    disabled={!selectedStart || !selectedEnd}
                  >
                    <Shield className="w-4 h-4 mr-2 text-primary" />
                    Request Saathi Companion
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request a Saathi Companion</DialogTitle>
                    <DialogDescription>
                      A Saathi is a verified companion who will accompany you on your journey for added safety.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {selectedStart && selectedEnd ? (
                      <>
                        <div className="space-y-2">
                          <h4 className="font-medium">Route Details</h4>
                          <div className="text-sm text-muted-foreground">
                            <p>From: {formatLocation(selectedStart)}</p>
                            <p>To: {formatLocation(selectedEnd)}</p>
                            <p>Mode: {transportModes.find(m => m.id === commuteType)?.name || 'Not specified'}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Safety Features</h4>
                          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                            <li>Real-time location sharing</li>
                            <li>Emergency contact alerts</li>
                            <li>In-app communication</li>
                            <li>Verified Saathi profiles</li>
                          </ul>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => requestSaathiMutation.mutate()}
                          disabled={requestSaathiMutation.isPending}
                        >
                          {requestSaathiMutation.isPending ? "Requesting..." : "Confirm Request"}
                        </Button>
                      </>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        Please select both start and end locations to request a Saathi.
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <RouteDetailsModal
        isOpen={showRouteDetails}
        onClose={() => setShowRouteDetails(false)}
        source="Delhi"
        destination="Noida"
        transportMode="metro"
      />
    </>
  );
}