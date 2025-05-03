import { ReactNode } from "react";
import { Link } from "wouter";
import { 
  LogOut, 
  User, 
  Home,
  Menu,
  X,
  Gamepad,
  Target,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageContainerProps {
  children: ReactNode;
  title?: string;
}

export function PageContainer({ children, title }: PageContainerProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const isMobile = useIsMobile();
  
  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const NavItems = () => (
    <>
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <Home size={16} />
            <span>Home</span>
          </Button>
        </Link>
        {isAuthenticated && (
          <>
            <Link href="/game">
              <Button variant="ghost" className="gap-2">
                <Gamepad size={16} />
                <span>Game</span>
              </Button>
            </Link>
            <Link href="/fitness-goals">
              <Button variant="ghost" className="gap-2">
                <Target size={16} />
                <span>Fitness Goals</span>
              </Button>
            </Link>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <>
            <Link href="/membership">
              <Button variant="ghost" className="gap-2">
                <Star size={16} />
                <span>Upgrade</span>
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" className="gap-2">
                <User size={16} />
                <span>Profile</span>
              </Button>
            </Link>
            <Button variant="ghost" onClick={() => logout()} className="gap-2">
              <LogOut size={16} />
              <span>Logout</span>
            </Button>
            <Link href="/profile">
              <Avatar className="cursor-pointer">
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback>{getInitials(user?.displayName || null)}</AvatarFallback>
              </Avatar>
            </Link>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="default">Register</Button>
            </Link>
          </>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b sticky top-0 z-10 bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-xl font-semibold cursor-pointer">Firebase Auth Demo</h1>
            </Link>
          </div>
          
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-8">
                  <NavItems />
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <nav className="flex items-center gap-4">
              <NavItems />
            </nav>
          )}
        </div>
      </header>
      
      <main className="flex-1">
        {title && (
          <div className="bg-muted py-6">
            <div className="container mx-auto px-4">
              <h1 className="text-3xl font-bold">{title}</h1>
            </div>
          </div>
        )}
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      
      <footer className="border-t py-6 bg-muted">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Firebase Auth Demo. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
