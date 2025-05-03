import { useState } from "react";
import { PageContainer } from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Check, CreditCard, Shield, Zap, Star, Leaf, Activity } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Mock pricing data
const pricingPlans = {
  monthly: {
    price: 4.99,
    billingPeriod: "month",
    savings: 0,
  },
  yearly: {
    price: 39.99,
    billingPeriod: "year",
    savings: 20, // Percentage savings compared to monthly
  }
};

// Features included in the premium subscription
const features = [
  { 
    title: "Unlimited Fitness Goals",
    description: "Create and track as many goals as you want",
    icon: <Star className="h-5 w-5 text-yellow-500" />
  },
  { 
    title: "Fitbit Integration",
    description: "Automatically sync your Fitbit data",
    icon: <Activity className="h-5 w-5 text-blue-500" />
  },
  { 
    title: "Advanced Analytics",
    description: "Get detailed insights on your progress",
    icon: <Zap className="h-5 w-5 text-purple-500" />
  },
  { 
    title: "Custom Workout Plans",
    description: "Access personalized workout recommendations",
    icon: <Leaf className="h-5 w-5 text-green-500" />
  },
  { 
    title: "Priority Support",
    description: "Get help when you need it most",
    icon: <Shield className="h-5 w-5 text-red-500" />
  }
];

export default function MembershipPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Mock user membership status - in a real app, this would come from user data
  const [membershipStatus, setMembershipStatus] = useState({
    type: "free",
    expiryDate: null,
  });
  
  // Redirect if not authenticated
  if (isLoading) {
    return (
      <PageContainer title="Upgrade Membership">
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size={48} />
        </div>
      </PageContainer>
    );
  }

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }
  
  const handlePurchase = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      
      // Update membership status (in a real app, this would happen on the server)
      const expiryDate = new Date();
      if (billingPeriod === 'yearly') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      } else {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      }
      
      setMembershipStatus({
        type: "pro",
        expiryDate,
      });
      
      toast({
        title: "Subscription Successful",
        description: `You are now a Pro member! Your subscription will renew on ${expiryDate.toLocaleDateString()}.`,
      });
    }, 2000);
  };
  
  const isPro = membershipStatus.type === "pro";
  
  return (
    <PageContainer title="Upgrade Membership">
      <div className="max-w-4xl mx-auto my-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Upgrade Your Fitness Journey</h1>
          <p className="text-muted-foreground">
            Unlock premium features to maximize your fitness tracking experience
          </p>
        </div>
        
        {isPro ? (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Check className="h-5 w-5" />
                You're a Pro Member!
              </CardTitle>
              <CardDescription className="text-green-600">
                Your subscription is active until{" "}
                {membershipStatus.expiryDate?.toLocaleDateString() || "N/A"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-green-600">
                Enjoy all premium features including unlimited goals, Fitbit integration, and advanced analytics.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="text-green-700 border-green-300">
                Manage Subscription
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <>
            <div className="flex justify-center items-center mb-8">
              <div className="flex items-center space-x-2">
                <Label htmlFor="billing-toggle" className={billingPeriod === "monthly" ? "font-medium" : ""}>Monthly</Label>
                <Switch
                  id="billing-toggle"
                  checked={billingPeriod === "yearly"}
                  onCheckedChange={(checked) => setBillingPeriod(checked ? "yearly" : "monthly")}
                />
                <div className="flex items-center gap-2">
                  <Label htmlFor="billing-toggle" className={billingPeriod === "yearly" ? "font-medium" : ""}>Yearly</Label>
                  {billingPeriod === "yearly" && (
                    <Badge className="bg-green-500">Save 20%</Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle>Free Plan</CardTitle>
                  <CardDescription>Your current plan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">$0</div>
                  
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Up to 3 fitness goals</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Basic activity tracking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Simple progress charts</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" disabled className="w-full">
                    Current Plan
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-primary/5 border-primary">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Pro Plan</CardTitle>
                    <Badge>Recommended</Badge>
                  </div>
                  <CardDescription>Unlock all premium features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-bold">
                      ${pricingPlans[billingPeriod].price}
                    </div>
                    <div className="text-muted-foreground mb-1">
                      /{pricingPlans[billingPeriod].billingPeriod}
                    </div>
                  </div>
                  
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="shrink-0">{feature.icon}</div>
                        <div>
                          <div className="font-medium">{feature.title}</div>
                          <div className="text-xs text-muted-foreground">{feature.description}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" disabled={isProcessing} onClick={handlePurchase}>
                    {isProcessing ? (
                      <>
                        <LoadingSpinner size={16} className="mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Upgrade Now
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </>
        )}
        
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your subscription at any time. Your Pro access will remain until the end of your billing period.
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-medium">How does the Fitbit integration work?</h3>
              <p className="text-muted-foreground">
                After upgrading, you'll be able to connect your Fitbit account in your profile settings. Your activity data will
                sync automatically once connected.
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-medium">Will I lose my data if I downgrade?</h3>
              <p className="text-muted-foreground">
                No, your data will be preserved. However, you'll only be able to actively track up to 3 goals on the free plan.
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-medium">Do you offer refunds?</h3>
              <p className="text-muted-foreground">
                We offer a 7-day money-back guarantee if you're not satisfied with your Pro subscription.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}