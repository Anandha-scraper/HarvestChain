import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Lock, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { loginFarmer } from "@/lib/farmerApi";

interface FarmerLoginProps {
  onLogin: (farmerData: any) => void;
  onRegister?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
}

export default function FarmerLogin({ onLogin, onRegister, onBack, isLoading = false }: FarmerLoginProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [passcode, setPasscode] = useState("");
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !passcode) {
      toast({
        title: "Missing Information",
        description: "Please enter both phone number and passcode",
        variant: "destructive",
      });
      return;
    }

    if (phoneNumber.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Phone number must be 10 digits",
        variant: "destructive",
      });
      return;
    }

    if (passcode.length !== 4) {
      toast({
        title: "Invalid Passcode",
        description: "Passcode must be 4 digits",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await loginFarmer(phoneNumber, passcode);
      
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Login failed');
      }
      
      toast({
        title: "Login Successful",
        description: "Welcome back!"
      });
      onLogin(result.data);
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid phone number or passcode. Please try again.",
        variant: "destructive"
      });
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
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Smartphone className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-medium">Farmer Login</CardTitle>
          <CardDescription>
            Enter your registered phone number and passcode to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="pl-10"
                  data-testid="input-phone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passcode" className="text-sm font-medium">
                Passcode
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="passcode"
                  type="password"
                  placeholder="Enter your 4-digit passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="pl-10"
                  data-testid="input-passcode"
                />
              </div>
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

          <div className="mt-6">
            <Button type="button" variant="outline" className="w-full" onClick={onRegister} data-testid="button-register">
              Register
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}