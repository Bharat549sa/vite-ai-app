import { PageContainer } from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { FullPageLoader } from "@/components/loading-spinner";
import { LockKeyhole, UserPlus, LogIn, Gamepad, Target, Star } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <FullPageLoader />;
  }

  return (
    <PageContainer>
      <div className="flex flex-col items-center text-center gap-8 py-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Welcome to Firebase Authentication Demo
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            A simple demonstration of Firebase Authentication integration with a web application.
          </p>
        </div>

        {isAuthenticated ? (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Welcome back, {user?.displayName || "User"}!</CardTitle>
              <CardDescription>You are successfully authenticated.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You can now access all the features of the application. Visit your profile to see your account details.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <div className="flex gap-2 w-full">
                <Link href="/profile" className="flex-1">
                  <Button className="w-full">View Profile</Button>
                </Link>
                <Link href="/game" className="flex-1">
                  <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                    <Gamepad size={16} />
                    Play Game
                  </Button>
                </Link>
              </div>
              <Link href="/fitness-goals" className="w-full">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <Target size={16} />
                  Track Fitness Goals
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-2 flex items-center justify-center">
                  <div className="rounded-full bg-primary/10 p-3">
                    <LogIn className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center">Login</CardTitle>
                <CardDescription className="text-center">
                  Already have an account? Sign in to continue.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href="/login">
                  <Button className="w-full">Login</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex items-center justify-center">
                  <div className="rounded-full bg-primary/10 p-3">
                    <UserPlus className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center">Register</CardTitle>
                <CardDescription className="text-center">
                  Create a new account to get started.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href="/register">
                  <Button className="w-full">Register</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex items-center justify-center">
                  <div className="rounded-full bg-primary/10 p-3">
                    <LockKeyhole className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center">Secure</CardTitle>
                <CardDescription className="text-center">
                  Firebase authentication keeps your account safe.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" className="w-full" disabled>
                  Learn More
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
