import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Shield, Phone, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type EmergencyContact = {
  name: string;
  phone: string;
};

type EmergencyButtonProps = {
  contacts: EmergencyContact[];
};

export function EmergencyButton({ contacts }: EmergencyButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const emergencyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/emergency/alert", {
        contacts,
        location: await getCurrentLocation(),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Emergency Alert Sent",
        description: "Your emergency contacts have been notified.",
      });
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send Alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  async function getCurrentLocation(): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position.coords),
        (error) => reject(new Error("Could not get your location"))
      );
    });
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="lg"
          className="w-full h-16 text-lg font-bold"
        >
          <Shield className="w-6 h-6 mr-2" />
          Emergency SOS
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Emergency Alert</AlertDialogTitle>
          <AlertDialogDescription>
            This will send an alert with your current location to:
            <ul className="mt-2 space-y-1">
              {contacts.map((contact, i) => (
                <li key={i} className="flex items-center text-sm">
                  <Phone className="w-4 h-4 mr-2" />
                  {contact.name} ({contact.phone})
                </li>
              ))}
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="sm:w-full"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => emergencyMutation.mutate()}
            disabled={emergencyMutation.isPending}
            className="sm:w-full"
          >
            {emergencyMutation.isPending ? (
              "Sending Alert..."
            ) : (
              <>
                <Bell className="w-4 h-4 mr-2" />
                Send Emergency Alert
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
