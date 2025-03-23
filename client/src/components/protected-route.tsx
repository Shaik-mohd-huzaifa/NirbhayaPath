import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export function ProtectedRoute(Component: React.ComponentType) {
  return function ProtectedRouteWrapper(props: any) {
    const [, setLocation] = useLocation();
    const { user, isLoading } = useAuth();

    useEffect(() => {
      if (!isLoading && !user) {
        setLocation("/auth");
      }
    }, [isLoading, user, setLocation]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <Component {...props} />;
  };
} 