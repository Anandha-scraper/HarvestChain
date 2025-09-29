import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adminLogin } from "@/lib/adminApi";

interface AdminLoginProps {
  onLogin: (adminData: any) => void;
  onBack: () => void;
}

export default function AdminLogin({ onLogin, onBack }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting admin login with:', { username, password });
      const result = await adminLogin({ username, password });
      console.log('Admin login result:', result);
      
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Login failed');
      }
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${result.data.username}!`,
      });
      onLogin(result.data);
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username or password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Back button in top-left */}
      <div className="fixed top-4 left-4 z-50">
        <Button variant="outline" size="sm" onClick={onBack} data-testid="button-back">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-medium">Admin Login</CardTitle>
          <CardDescription>
            Enter your admin credentials to access the management panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="input-username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <PasswordInput
                id="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                showPassword={showPassword}
                onToggleVisibility={() => setShowPassword(!showPassword)}
                data-testid="input-password"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>


        </CardContent>
      </Card>
    </div>
  );
}