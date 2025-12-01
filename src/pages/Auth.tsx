import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Crown, User, Building2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<"admin" | "user" | null>(null);
  const [showHfrDialog, setShowHfrDialog] = useState(false);
  const [hfrNumber, setHfrNumber] = useState("");
  const [hfrVerified, setHfrVerified] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupFullName, setSignupFullName] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      // Update user role based on login type
      if (data.user && loginType === "admin" && hfrVerified) {
        // Update HFR number in profile
        await supabase.from("profiles").update({ hfr_number: hfrNumber }).eq("id", data.user.id);
        
        // Update role to admin
        await supabase.from("user_roles").update({ role: "admin" }).eq("user_id", data.user.id);
      }

      toast.success("Welcome back!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            full_name: signupFullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      // If admin signup with HFR verified, update role and HFR
      if (data.user && loginType === "admin" && hfrVerified) {
        await supabase.from("profiles").update({ hfr_number: hfrNumber }).eq("id", data.user.id);
        await supabase.from("user_roles").update({ role: "admin" }).eq("user_id", data.user.id);
      }

      toast.success("Account created successfully!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminClick = () => {
    setShowHfrDialog(true);
  };

  const handleHfrSubmit = () => {
    if (hfrNumber.length < 6) {
      toast.error("Please enter a valid HFR number");
      return;
    }
    setHfrVerified(true);
    setShowHfrDialog(false);
    setLoginType("admin");
    toast.success("HFR number verified! You can now login as admin.");
  };

  if (!loginType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">MediCheck AI</h1>
            <p className="text-muted-foreground">Choose your login type to continue</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Admin Login Card */}
            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={handleAdminClick}>
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-warning/10 flex items-center justify-center">
                    <Crown className="h-8 w-8 text-warning" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Admin Login</CardTitle>
                <CardDescription className="text-base mt-2">
                  Hospital/Health Facility access with full features
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-2 text-sm text-muted-foreground">
                <p>✓ Dashboard Analytics</p>
                <p>✓ Medicine Scanning</p>
                <p>✓ Quality Reports</p>
                <p>✓ Medicine Database</p>
                <div className="mt-4 p-3 bg-warning/10 rounded-lg">
                  <p className="text-warning font-semibold">Requires HFR Number</p>
                </div>
                <Button className="w-full mt-4" variant="default">
                  Continue as Admin
                </Button>
              </CardContent>
            </Card>

            {/* User Login Card */}
            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setLoginType("user")}>
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl">User Login</CardTitle>
                <CardDescription className="text-base mt-2">
                  Standard access for medicine verification
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-2 text-sm text-muted-foreground">
                <p>✓ Dashboard Analytics</p>
                <p>✓ Medicine Scanning</p>
                <p className="text-muted-foreground/50">✗ Quality Reports</p>
                <p className="text-muted-foreground/50">✗ Medicine Database</p>
                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                  <p className="text-primary font-semibold">Free Access</p>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Continue as User
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* HFR Number Dialog */}
        <Dialog open={showHfrDialog} onOpenChange={setShowHfrDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-warning/10 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-warning" />
                </div>
              </div>
              <DialogTitle className="text-center text-2xl">Enter HFR Number</DialogTitle>
              <DialogDescription className="text-center text-base">
                Health Facility Registry number is required for admin access
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-sm">Full Dashboard Analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-sm">Medicine Scanning</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-sm">Quality Reports Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-sm">Complete Medicine Database Access</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hfr-number">HFR Number</Label>
                <Input
                  id="hfr-number"
                  type="text"
                  placeholder="Enter your HFR number"
                  value={hfrNumber}
                  onChange={(e) => setHfrNumber(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  HFR (Health Facility Registry) number is assigned by the National Health Authority
                </p>
              </div>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button 
                onClick={handleHfrSubmit} 
                className="w-full"
                size="lg"
                disabled={!hfrNumber}
              >
                <Building2 className="mr-2 h-5 w-5" />
                Verify & Continue
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowHfrDialog(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLoginType(null)}
            className="absolute left-4 top-4"
          >
            ← Back
          </Button>
          <div className="flex justify-center mb-4">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
              loginType === "admin" ? "bg-warning/10" : "bg-primary/10"
            }`}>
              {loginType === "admin" ? (
                <Crown className="h-6 w-6 text-warning" />
              ) : (
                <User className="h-6 w-6 text-primary" />
              )}
            </div>
          </div>
          <CardTitle>
            {loginType === "admin" ? "Admin Access" : "User Access"}
          </CardTitle>
          <CardDescription>
            {loginType === "admin" 
              ? "Login with your admin credentials to access all features"
              : "Login to access medicine scanning and dashboard"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
