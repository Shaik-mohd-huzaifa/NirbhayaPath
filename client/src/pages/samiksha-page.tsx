import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, MapPin, Navigation, Bus, Car, PersonStanding, Train, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Review = {
  id: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  type: 'location' | 'route' | 'commute';
  location?: {
    name: string;
    lat: number;
    lng: number;
  };
  route?: {
    startLocation: string;
    endLocation: string;
    transportMode: string;
  };
  commute?: {
    type: string;
    rating: number;
  };
};

export function SamikshaPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('location');

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["/api/reviews"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/reviews");
      return res.json();
    },
  });

  const filteredReviews = reviews?.filter((review: Review) => {
    const matchesSearch = searchQuery === '' || 
      review.location?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.route?.startLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.route?.endLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.commute?.type.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch && review.type === activeTab;
  });

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'foot-walking':
        return <PersonStanding className="w-4 h-4" />;
      case 'driving-car':
        return <Car className="w-4 h-4" />;
      case 'bus':
        return <Bus className="w-4 h-4" />;
      case 'metro':
      case 'train':
        return <Train className="w-4 h-4" />;
      default:
        return <Navigation className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">समीक्षा</h1>
          <p className="text-muted-foreground">Reviews & Ratings</p>
        </div>
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[300px]"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="location">Locations</TabsTrigger>
          <TabsTrigger value="route">Routes</TabsTrigger>
          <TabsTrigger value="commute">Commutes</TabsTrigger>
        </TabsList>

        <TabsContent value="location" className="space-y-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground">Loading reviews...</div>
          ) : filteredReviews?.length === 0 ? (
            <div className="text-center text-muted-foreground">No location reviews found</div>
          ) : (
            filteredReviews?.map((review: Review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{review.location?.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm">{review.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <Badge variant="outline">
                      <MapPin className="w-4 h-4 mr-1" />
                      Location
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>By {review.userName}</span>
                    <span>{new Date(review.date).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="route" className="space-y-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground">Loading reviews...</div>
          ) : filteredReviews?.length === 0 ? (
            <div className="text-center text-muted-foreground">No route reviews found</div>
          ) : (
            filteredReviews?.map((review: Review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">
                        {review.route?.startLocation} → {review.route?.endLocation}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm">{review.rating.toFixed(1)}</span>
                        {review.route?.transportMode && (
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            {getTransportIcon(review.route.transportMode)}
                            {review.route.transportMode}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline">
                      <Navigation className="w-4 h-4 mr-1" />
                      Route
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>By {review.userName}</span>
                    <span>{new Date(review.date).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="commute" className="space-y-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground">Loading reviews...</div>
          ) : filteredReviews?.length === 0 ? (
            <div className="text-center text-muted-foreground">No commute reviews found</div>
          ) : (
            filteredReviews?.map((review: Review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{review.commute?.type}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm">{review.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <Badge variant="outline">
                      <Navigation className="w-4 h-4 mr-1" />
                      Commute
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>By {review.userName}</span>
                    <span>{new Date(review.date).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 