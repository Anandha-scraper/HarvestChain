import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, MapPin, CreditCard, Plus, QrCode, Upload, LogOut, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateFarmerCrops } from "@/lib/farmerApi";

interface Farmer {
  id: string;
  name: string;
  phoneNumber: string;
  aadharNumber: string;
  place: string;
  cropsGrown: string[];
}

interface FarmerDashboardProps {
  farmer: Farmer;
  onGenerateQR: () => void;
  onViewHistory: () => void;
  onLogout: () => void;
  onCropsUpdate?: (crops: string[]) => void;
}

const defaultCrops = [
  "Rice",
  "Wheat",
  "Sugarcane",
  "Cotton",
  "Coconut",
  "Banana",
  "Maize",
  "Millet",
  "Groundnut",
  "Pulses",
];

export default function FarmerDashboard({ farmer, onGenerateQR, onViewHistory, onLogout, onCropsUpdate }: FarmerDashboardProps) {
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [selectedCrops, setSelectedCrops] = useState<string[]>(farmer.cropsGrown);
  const [customCrop, setCustomCrop] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const availableCrops = defaultCrops.filter(crop => !selectedCrops.includes(crop));

  const toggleCrop = (crop: string) => {
    if (selectedCrops.includes(crop)) {
      setSelectedCrops(selectedCrops.filter(c => c !== crop));
    } else {
      setSelectedCrops([...selectedCrops, crop]);
    }
  };

  const addCustomCrop = () => {
    if (customCrop.trim() && !selectedCrops.includes(customCrop.trim())) {
      setSelectedCrops([...selectedCrops, customCrop.trim()]);
      setCustomCrop("");
    }
  };

  const removeCrop = (crop: string) => {
    setSelectedCrops(selectedCrops.filter(c => c !== crop));
  };

  const handleSaveCrops = async () => {
    if (selectedCrops.length === 0) {
      toast({
        title: "No Crops Selected",
        description: "Please select at least one crop",
        variant: "destructive"
      });
      return;
    }

    console.log('🔍 Farmer object:', farmer);
    console.log('🔍 Farmer ID:', farmer.id);
    console.log('🔍 Selected crops:', selectedCrops);

    if (!farmer.id) {
      toast({
        title: "Error",
        description: "Farmer ID is missing. Please login again.",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      // Call the real API to update crops in MongoDB
      const result = await updateFarmerCrops(farmer.id, selectedCrops);
      
      if (result.success) {
        // Update local state
        if (onCropsUpdate) {
          onCropsUpdate(selectedCrops);
        }
        
        toast({
          title: "Crops Updated",
          description: "Your crop list has been updated successfully in the database",
        });
        
        setIsCropDialogOpen(false);
      } else {
        throw new Error(result.message || 'Failed to update crops');
      }
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update crops",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium text-foreground">Dashboard</h1>
        </div>
        <Button variant="destructive" size="sm" onClick={onLogout} data-testid="button-logout">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Farmer Profile Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {getInitials(farmer.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-xl" data-testid="text-farmer-name">{farmer.name}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {farmer.place}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <User className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">Phone:</span>
                <span className="ml-2 font-medium" data-testid="text-phone">{farmer.phoneNumber}</span>
              </div>
              <div className="flex items-center text-sm">
                <CreditCard className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">Aadhar:</span>
                <span className="ml-2 font-medium" data-testid="text-aadhar">{farmer.aadharNumber}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Registered Crops:</p>
                <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <Plus className="w-4 h-4 mr-1" />
                      Add New Crop
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Manage Crops</DialogTitle>
                      <DialogDescription>
                        Add, update, or remove your registered crops
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Select Crops</Label>
                        <Tabs defaultValue="pick">
                          <TabsList className="grid grid-cols-2 w-full">
                            <TabsTrigger value="pick">Choose</TabsTrigger>
                            <TabsTrigger value="custom">Add Custom</TabsTrigger>
                          </TabsList>
                          <TabsContent value="pick" className="mt-3">
                            <div className="flex flex-wrap gap-2">
                              {availableCrops.map((crop) => (
                                <Badge
                                  key={crop}
                                  onClick={() => toggleCrop(crop)}
                                  className={`cursor-pointer select-none ${selectedCrops.includes(crop) ? 'bg-primary text-primary-foreground' : ''}`}
                                >
                                  {crop}
                                </Badge>
                              ))}
                            </div>
                          </TabsContent>
                          <TabsContent value="custom" className="mt-3">
                            <div className="flex gap-2">
                              <Input 
                                placeholder="Enter crop name" 
                                value={customCrop} 
                                onChange={(e) => setCustomCrop(e.target.value)} 
                              />
                              <Button type="button" onClick={addCustomCrop}>
                                <Plus className="w-4 h-4 mr-1" /> Add
                              </Button>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>

                      {selectedCrops.length > 0 && (
                        <div className="space-y-2">
                          <Label>Selected Crops</Label>
                          <div className="flex flex-wrap gap-2">
                            {selectedCrops.map((crop, index) => (
                              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                {crop}
                                <button
                                  onClick={() => removeCrop(crop)}
                                  className="ml-1 hover:text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button 
                          onClick={handleSaveCrops} 
                          disabled={isUpdating || selectedCrops.length === 0}
                          className="flex-1"
                        >
                          {isUpdating ? "Updating..." : "Save Changes"}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsCropDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex flex-wrap gap-2">
                {farmer.cropsGrown.map((crop, index) => (
                  <Badge key={index} variant="secondary" data-testid={`badge-crop-${index}`}>
                    {crop}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover-elevate cursor-pointer" onClick={onGenerateQR}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <QrCode className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Generate QR Codes</h3>
                <p className="text-sm text-muted-foreground">Create QR codes for your crops</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate cursor-pointer" onClick={onViewHistory}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-chart-2/10 rounded-lg">
                <Upload className="w-6 h-6 text-chart-2" />
              </div>
              <div>
                <h3 className="font-medium">View History</h3>
                <p className="text-sm text-muted-foreground">Track your crop batches</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Your latest crop tracking activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity. Start by generating QR codes for your crops.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}