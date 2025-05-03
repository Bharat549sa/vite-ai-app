import { useContext } from "react";
import { useLocation } from "wouter";
import { AuthContext } from "@/components/auth-provider";
import { signInWithGoogle, signInWithEmail, registerWithEmail, signOut } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const { user, isLoading, error } = useContext(AuthContext);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const login = async (email: string, password: string) => {
    const result = await signInWithEmail(email, password);
    
    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: result.error,
      });
      return false;
    }
    
    toast({
      title: "Login Successful",
      description: "Welcome back!",
    });
    
    navigate("/");
    return true;
  };

  const register = async (email: string, password: string, username: string) => {
    const result = await registerWithEmail(email, password);
    
    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: result.error,
      });
      return false;
    }
    
    toast({
      title: "Registration Successful",
      description: "Your account has been created!",
    });
    
    navigate("/");
    return true;
  };

  const loginWithGoogle = async () => {
    const result = await signInWithGoogle();
    
    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Google Login Failed",
        description: result.error,
      });
      return false;
    }
    
    return true;
  };

  const logout = async () => {
    const result = await signOut();
    
    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: result.error,
      });
      return false;
    }
    
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
    
    navigate("/login");
    return true;
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    loginWithGoogle,
    logout,
  };
}
