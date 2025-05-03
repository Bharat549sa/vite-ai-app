import { createContext, useEffect, useState, ReactNode } from "react";
import { User } from "firebase/auth";
import { useLocation } from "wouter";
import { subscribeToAuthChanges, handleRedirectResult } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        const result = await handleRedirectResult();
        
        if (!result.success) {
          setError(result.error || "Authentication failed");
          return;
        }
        
        // If we have a user from redirect, sync with our backend
        if (result.user) {
          try {
            await apiRequest("POST", "/api/firebase-auth", {
              uid: result.user.uid,
              displayName: result.user.displayName,
              email: result.user.email,
              photoURL: result.user.photoURL,
            });
            
            // Navigate to home after successful auth
            navigate("/");
          } catch (err) {
            console.error("Error syncing user with backend:", err);
            setError("Failed to sync user data with server");
          }
        }
      } catch (err: any) {
        console.error("Auth redirect error:", err);
        setError(err?.message || "Authentication redirect error");
      }
    };

    handleAuthRedirect();
    
    // Subscribe to auth state changes
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      setUser(firebaseUser);
      
      // If we have a user, sync with our backend
      if (firebaseUser) {
        try {
          await apiRequest("POST", "/api/firebase-auth", {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
          });
        } catch (err) {
          console.error("Error syncing user with backend:", err);
        }
      }
      
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
