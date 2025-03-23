import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Clock, MessageCircle, Phone, Star, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Dummy data for Saathis
const dummySaathis = [
  {
    id: 1,
    name: "Priya Sharma",
    rating: 4.8,
    totalTrips: 156,
    currentLocation: "Connaught Place, Delhi",
    status: "available",
    source: "Connaught Place",
    destination: "Karol Bagh",
    timing: "8:00 AM - 10:00 AM",
    message: "Hi! I'm a regular commuter on this route. I can help you navigate safely through the metro and streets.",
    contact: "+91 98765 43210",
    safetyScore: 95,
    verificationStatus: "verified"
  },
  {
    id: 2,
    name: "Rahul Verma",
    rating: 4.9,
    totalTrips: 203,
    currentLocation: "Noida Sector 62",
    status: "available",
    source: "Noida Sector 62",
    destination: "Connaught Place",
    timing: "9:00 AM - 11:00 AM",
    message: "Experienced Saathi with 2 years of service. I'm familiar with all the safe routes and emergency contacts.",
    contact: "+91 87654 32109",
    safetyScore: 98,
    verificationStatus: "verified"
  },
  {
    id: 3,
    name: "Anjali Patel",
    rating: 4.7,
    totalTrips: 89,
    currentLocation: "South Delhi",
    status: "available",
    source: "South Delhi",
    destination: "Gurgaon",
    timing: "10:00 AM - 12:00 PM",
    message: "I work in Gurgaon and travel this route daily. Happy to help fellow commuters!",
    contact: "+91 76543 21098",
    safetyScore: 92,
    verificationStatus: "verified"
  }
];

export function SaathiPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const handleRequestSaathi = (saathiId: number) => {
    toast({
      title: "Request Sent",
      description: "Your request has been sent to the Saathi. They will contact you shortly.",
    });
  };

  const filteredSaathis = dummySaathis.filter(saathi =>
    saathi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    saathi.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
    saathi.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Find a Saathi</h1>
          <p className="text-muted-foreground">
            Connect with verified Saathis who can accompany you on your journey for added safety.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, source, or destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid gap-4">
          {filteredSaathis.map((saathi) => (
            <Card key={saathi.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{saathi.name}</h3>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {saathi.rating}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {saathi.totalTrips} trips completed • {saathi.currentLocation}
                    </p>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {saathi.safetyScore}% Safe
                  </Badge>
                </div>

                <div className="mt-4 grid gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{saathi.source} → {saathi.destination}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{saathi.timing}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-start gap-2">
                    <MessageCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm">{saathi.message}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Contact
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => handleRequestSaathi(saathi.id)}
                  >
                    Request Saathi
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 