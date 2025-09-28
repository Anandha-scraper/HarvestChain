import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import UserTypeSelector from "@/components/UserTypeSelector";
import FarmerLogin from "@/components/FarmerLogin";
import FarmerDashboard from "@/components/FarmerDashboard";
import FarmerRegister from "@/components/FarmerRegister";
import QRGenerator from "@/components/QRGenerator";
import QRScanner from "@/components/QRScanner";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";
import ThemeToggle from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";

type UserType = "farmer" | "retailer" | "consumer" | "admin" | null;
type AppState = "userSelect" | "farmerLogin" | "farmerRegister" | "farmerDashboard" | "qrGenerator" | "qrScanner" | "adminLogin" | "adminDashboard";

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
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
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

  const handleFarmerLogin = (farmerData: any) => {
    // Convert MongoDB farmer data to app format
    const farmer: Farmer = {
      id: farmerData._id || farmerData.firebaseUid,
      name: farmerData.name,
      phoneNumber: farmerData.phoneNumber,
      aadharNumber: farmerData.aadharNumber,
      place: farmerData.location,
      cropsGrown: farmerData.cropsGrown
    };

    setCurrentFarmer(farmer);
    setAppState("farmerDashboard");
    toast({
      title: "Login Successful",
      description: `Welcome back, ${farmer.name}!`,
    });
    console.log('Farmer logged in:', farmer);
  };

  const handleGoToRegister = () => {
    setAppState("farmerRegister");
  };

  const handleRegistered = (farmer: Farmer) => {
    setCurrentFarmer(farmer);
    setUserType("farmer");
    setAppState("farmerDashboard");
    toast({ title: "Welcome", description: `Account created for ${farmer.name}` });
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
    setCurrentAdmin(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    console.log('User logged out');
  };

  const handleAdminLogin = (adminData: any) => {
    setCurrentAdmin(adminData);
    setAppState("adminDashboard");
    toast({
      title: "Admin Login Successful",
      description: `Welcome back, ${adminData.username}!`,
    });
    console.log('Admin logged in:', adminData);
  };

  const handleAdminLogout = () => {
    setAppState("userSelect");
    setUserType(null);
    setCurrentAdmin(null);
    toast({
      title: "Admin Logged Out",
      description: "You have been successfully logged out",
    });
    console.log('Admin logged out');
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

  const handleCropsUpdate = (crops: string[]) => {
    if (currentFarmer) {
      setCurrentFarmer({
        ...currentFarmer,
        cropsGrown: crops
      });
    }
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
        return <FarmerLogin onLogin={handleFarmerLogin} onRegister={handleGoToRegister} onBack={handleBack} />;

      case "farmerRegister":
        return (
          <FarmerRegister
            onBack={() => setAppState("farmerLogin")}
            onRegistered={(data) =>
              handleRegistered({
                id: "farmer-new",
                name: data.name,
                phoneNumber: data.phoneNumber,
                aadharNumber: data.aadharNumber,
                place: "",
                cropsGrown: data.cropsGrown,
              })
            }
          />
        );
      
      case "farmerDashboard":
        return currentFarmer ? (
          <FarmerDashboard
            farmer={currentFarmer}
            onGenerateQR={handleGenerateQR}
            onViewHistory={handleViewHistory}
            onLogout={handleLogout}
            onCropsUpdate={handleCropsUpdate}
          />
        ) : null;

      case "adminLogin":
        return <AdminLogin onLogin={handleAdminLogin} onBack={handleBack} />;

      case "adminDashboard":
        return currentAdmin ? (
          <AdminDashboard
            adminData={currentAdmin}
            onLogout={handleAdminLogout}
          />
        ) : null;
      
      case "qrGenerator":
        return currentFarmer ? (
          <QRGenerator
            farmerName={currentFarmer.name}
            registeredCrops={currentFarmer.cropsGrown}
            onBack={handleBack}
            onUploadToIPFS={handleUploadToIPFS}
          />
        ) : null;
      
      case "qrScanner":
        return (
          <QRScanner
            userType={userType as "retailer" | "consumer"}
            onStatusUpdate={handleStatusUpdate}
            onPriceUpdateRequest={handlePriceUpdateRequest}
            onBack={handleBack}
          />
        );
      
      default:
        return <UserTypeSelector onSelectUserType={handleUserTypeSelect} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="relative">
          {/* Hidden admin access - completely invisible, only on hover in bottom-left */}
          <div className="fixed bottom-4 left-4 z-50">
            <div className="group w-10 h-10">
              <button
                onClick={() => {
                  setUserType("admin");
                  setAppState("adminLogin");
                }}
                className="w-full h-full opacity-0 group-hover:opacity-100 transition-all duration-300 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 flex items-center justify-center"
                title="Admin Access"
              >
                <Shield className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Global theme toggle visible only on user selection and QR scanner screens */}
          {(appState === "userSelect" || appState === "qrScanner") && (
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
