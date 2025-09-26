import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Scan, ShoppingCart } from "lucide-react";

interface UserTypeSelectorProps {
  onSelectUserType: (userType: "farmer" | "retailer" | "consumer") => void;
}

export default function UserTypeSelector({ onSelectUserType }: UserTypeSelectorProps) {
  const userTypes = [
    {
      type: "farmer" as const,
      title: "Farmer",
      description: "Register crops, generate QR codes, and upload to IPFS",
      icon: User,
      color: "bg-primary",
      features: ["Login with phone & passcode", "Generate crop QR codes", "Upload to IPFS"]
    },
    {
      type: "retailer" as const,
      title: "Distributer / Retailer", 
      description: "Scan QR codes and update crop prices",
      icon: Scan,
      color: "bg-chart-2",
      features: ["Scan crop QR codes", "Update prices", "Track inventory"]
    },
    {
      type: "consumer" as const,
      title: "Consumer",
      description: "Scan QR codes to verify crop authenticity and track journey",
      icon: ShoppingCart,
      color: "bg-chart-3",
      features: ["Verify crop authenticity", "Track crop journey", "View farmer details"]
    }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-medium text-foreground">Crop Tracking System</h1>
          <p className="text-lg text-muted-foreground">
            Choose your role to get started with crop tracking and verification
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {userTypes.map((userType) => {
            const IconComponent = userType.icon;
            return (
              <Card 
                key={userType.type} 
                className="hover-elevate cursor-pointer transition-all duration-200"
                onClick={() => onSelectUserType(userType.type)}
              >
                <CardHeader className="text-center space-y-4">
                  <div className={`mx-auto w-16 h-16 ${userType.color} rounded-full flex items-center justify-center`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl" data-testid={`title-${userType.type}`}>
                      {userType.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {userType.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Features:</p>
                    <div className="space-y-1">
                      {userType.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full"
                    data-testid={`button-select-${userType.type}`}
                  >
                    Continue as {userType.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Badge variant="outline" className="px-4 py-2">
            Secure • Transparent • Traceable
          </Badge>
        </div>
      </div>
    </div>
  );
}