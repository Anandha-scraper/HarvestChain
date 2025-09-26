import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import UserTypeSelector from "@/components/UserTypeSelector";
import FarmerLogin from "@/components/FarmerLogin";
import FarmerDashboard from "@/components/FarmerDashboard";
import QRGenerator from "@/components/QRGenerator";
import QRScanner from "@/components/QRScanner";
import ThemeToggle from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";

type UserType = "farmer" | "retailer" | "consumer" | null;
type AppState = "userSelect" | "farmerLogin" | "farmerDashboard" | "qrGenerator" | "qrScanner";

interface Farmer {
  id: string;
  name: string;
  phoneNumber: string;
  aadharNumber: string;
  place: string;
  cropsGrown: string[];
}

// Mock farmers data
const mockFarmers: Record<string, Farmer> = {
  "9876543210": {
    id: "farmer-1",
    name: "Ravi Kumar",
    phoneNumber: "9876543210",
    aadharNumber: "1234-5678-9012",
    place: "Mysore, Karnataka",
    cropsGrown: ["Rice", "Wheat", "Sugarcane"]
  },
  "9876543211": {
    id: "farmer-2",
    name: "Priya Sharma",
    phoneNumber: "9876543211",
    aadharNumber: "2345-6789-0123",
    place: "Coimbatore, Tamil Nadu",
    cropsGrown: ["Cotton", "Coconut", "Banana"]
  }
};

// Mock passcodes
const mockPasscodes: Record<string, string> = {
  "9876543210": "1234",
  "9876543211": "5678"
};

function App() {
  const [userType, setUserType] = useState<UserType>(null);
  const [appState, setAppState] = useState<AppState>("userSelect");
  const [currentFarmer, setCurrentFarmer] = useState<Farmer | null>(null);
  const { toast } = useToast();

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    if (type === "farmer") {
      setAppState("farmerLogin");
    } else {
      setAppState("qrScanner");
    }
    console.log('Selected user type:', type);
  };

  const handleFarmerLogin = (phoneNumber: string, passcode: string) => {
    // Simulate authentication
    const farmer = mockFarmers[phoneNumber];
    const expectedPasscode = mockPasscodes[phoneNumber];

    if (farmer && expectedPasscode === passcode) {
      setCurrentFarmer(farmer);
      setAppState("farmerDashboard");
      toast({
        title: "Login Successful",
        description: `Welcome back, ${farmer.name}!`,
      });
      console.log('Farmer logged in:', farmer);
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid phone number or passcode",
        variant: "destructive",
      });
      console.log('Login failed for:', phoneNumber);
    }
  };

  const handleGenerateQR = () => {
    setAppState("qrGenerator");
  };

  const handleViewHistory = () => {
    toast({
      title: "Coming Soon",
      description: "History view will be available soon",
    });
    console.log('View history clicked');
  };

  const handleBack = () => {
    if (appState === "qrGenerator") {
      setAppState("farmerDashboard");
    } else {
      setAppState("userSelect");
      setUserType(null);
      setCurrentFarmer(null);
    }
  };

  const handleLogout = () => {
    setAppState("userSelect");
    setUserType(null);
    setCurrentFarmer(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    console.log('User logged out');
  };

  const handleUploadToIPFS = (batchData: any) => {
    // Simulate IPFS upload
    setTimeout(() => {
      toast({
        title: "Upload Complete",
        description: "Crop data successfully uploaded to IPFS",
      });
      console.log('Uploaded to IPFS:', batchData);
    }, 2000);
  };

  const handleStatusUpdate = (qrCode: string, newStatus: string, price?: string) => {
    // Simulate status update
    console.log('Status update:', { qrCode, newStatus, price });
    // In real implementation, this would update the backend
  };

  const handlePriceUpdateRequest = (request: any) => {
    // Simulate sending price update request to farmer
    console.log('Price update request sent to farmer:', request);
    toast({
      title: "Confirmation Request Sent",
      description: `Price update request sent to ${request.farmerName}`,
    });
    // In real implementation, this would notify the farmer through push notifications or SMS
  };

  const renderContent = () => {
    switch (appState) {
      case "userSelect":
        return <UserTypeSelector onSelectUserType={handleUserTypeSelect} />;
      
      case "farmerLogin":
        return <FarmerLogin onLogin={handleFarmerLogin} />;
      
      case "farmerDashboard":
        return currentFarmer ? (
          <FarmerDashboard
            farmer={currentFarmer}
            onGenerateQR={handleGenerateQR}
            onViewHistory={handleViewHistory}
            onLogout={handleLogout}
          />
        ) : null;
      
      case "qrGenerator":
        return currentFarmer ? (
          <QRGenerator
            farmerName={currentFarmer.name}
            onBack={handleBack}
            onUploadToIPFS={handleUploadToIPFS}
          />
        ) : null;
      
      case "qrScanner":
        return (
          <div className="relative">
            <div className="absolute top-4 right-4 z-10">
              <ThemeToggle />
            </div>
            <QRScanner
              userType={userType as "retailer" | "consumer"}
              onStatusUpdate={handleStatusUpdate}
              onPriceUpdateRequest={handlePriceUpdateRequest}
            />
            <div className="fixed bottom-4 left-4">
              <button
                onClick={handleBack}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover-elevate"
                data-testid="button-back-to-user-select"
              >
                Back to User Selection
              </button>
            </div>
          </div>
        );
      
      default:
        return <UserTypeSelector onSelectUserType={handleUserTypeSelect} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="relative">
          {/* Theme toggle for farmer screens */}
          {(appState === "farmerDashboard" || appState === "qrGenerator") && (
            <div className="fixed top-4 right-4 z-50">
              <ThemeToggle />
            </div>
          )}
          
          {renderContent()}
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
