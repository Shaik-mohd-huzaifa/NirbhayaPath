import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Shield, Clock, MapPin, Users, MessageCircle, Phone, Bus, Train, Car, Footprints } from "lucide-react";

// Dummy data for route details
const routeDetails = {
  distance: "25.3 km",
  duration: "1 hour 15 mins",
  safetyScore: 92,
  transportMode: "metro",
  estimatedCost: "₹60",
  routeHighlights: [
    "Direct metro connection available",
    "Well-lit stations and platforms",
    "Multiple emergency exits",
    "24/7 security personnel",
    "CCTV surveillance",
    "Women's coach available"
  ],
  pastExperiences: [
    {
      user: "Rahul Kumar",
      rating: 4.5,
      comment: "Safe and convenient route. Metro is well-maintained and staff is helpful. Women's coach provides extra security.",
      date: "2 days ago"
    },
    {
      user: "Priya Singh",
      rating: 4.8,
      comment: "Regular commuter on this route. Always feels safe, especially during evening hours. Good frequency of trains.",
      date: "1 week ago"
    },
    {
      user: "Anjali Patel",
      rating: 4.7,
      comment: "The route is well-connected and safe. Metro staff is very cooperative and security is top-notch.",
      date: "2 weeks ago"
    }
  ],
  availableSaathis: [
    {
      id: 1,
      name: "Priya Sharma",
      rating: 4.8,
      totalTrips: 156,
      currentLocation: "Connaught Place",
      timing: "8:00 AM - 10:00 AM",
      message: "Hi! I'm a regular commuter on this route. I can help you navigate safely through the metro and streets. I'm familiar with all the safe spots and emergency contacts.",
      contact: "+91 98765 43210",
      safetyScore: 95
    },
    {
      id: 2,
      name: "Rahul Verma",
      rating: 4.9,
      totalTrips: 203,
      currentLocation: "Noida Sector 62",
      timing: "9:00 AM - 11:00 AM",
      message: "Experienced Saathi with 2 years of service. I'm familiar with all the safe routes and emergency contacts. I can help you with the best timings to avoid crowds.",
      contact: "+91 87654 32109",
      safetyScore: 98
    },
    {
      id: 3,
      name: "Anjali Patel",
      rating: 4.7,
      totalTrips: 89,
      currentLocation: "South Delhi",
      timing: "10:00 AM - 12:00 PM",
      message: "I work in Noida and travel this route daily. Happy to help fellow commuters! I know all the safe waiting areas and emergency protocols.",
      contact: "+91 76543 21098",
      safetyScore: 92
    }
  ]
};

interface RouteDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: string;
  destination: string;
  transportMode: string;
}

const TransportModeIcon = ({ mode }: { mode: string }) => {
  switch (mode) {
    case 'bus':
      return <Bus className="w-4 h-4" />;
    case 'metro':
    case 'train':
      return <Train className="w-4 h-4" />;
    case 'driving-car':
      return <Car className="w-4 h-4" />;
    case 'foot-walking':
      return <Footprints className="w-4 h-4" />;
    default:
      return <Car className="w-4 h-4" />;
  }
};

export function RouteDetailsModal({ isOpen, onClose, source, destination, transportMode }: RouteDetailsModalProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Route Details</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Route Overview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <TransportModeIcon mode={transportMode} />
                <h3 className="font-semibold capitalize">{transportMode.replace('-', ' ')} Route</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Distance</p>
                  <p className="font-medium">{routeDetails.distance}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{routeDetails.duration}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Estimated Cost</p>
                  <p className="font-medium">{routeDetails.estimatedCost}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Safety Score</p>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="font-medium">{routeDetails.safetyScore}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Route Highlights */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Route Highlights</h3>
              <ul className="space-y-2">
                {routeDetails.routeHighlights.map((highlight, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Past Experiences */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Past Experiences</h3>
              <div className="space-y-4">
                {routeDetails.pastExperiences.map((experience, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{experience.user}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm">{experience.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{experience.comment}</p>
                    <p className="text-xs text-muted-foreground">{experience.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Saathis */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Available Saathis</h3>
              <div className="space-y-4">
                {routeDetails.availableSaathis.map((saathi) => (
                  <div key={saathi.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{saathi.name}</p>
                        <p className="text-sm text-muted-foreground">{saathi.currentLocation}</p>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        {saathi.safetyScore}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{saathi.timing}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{saathi.message}</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Contact
                      </Button>
                      <Button size="sm" className="flex-1">
                        Request Saathi
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
} 