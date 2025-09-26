import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Camera, QrCode, MapPin, DollarSign, Upload, Scan } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScannedCrop {
  id: string;
  cropType: string;
  farmerName: string;
  farmerLocation: string;
  giTag?: string;
  quantity: string;
  currentStatus: string;
}

interface QRScannerProps {
  userType: "retailer" | "consumer";
  onStatusUpdate: (qrCode: string, newStatus: string, price?: string) => void;
}

export default function QRScanner({ userType, onStatusUpdate }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedCrop | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [location, setLocation] = useState("");
  const { toast } = useToast();

  const statusOptions = userType === "retailer" 
    ? ["received", "in_store", "price_updated", "sold"] 
    : ["purchased", "received", "consumed"];

  const mockScanData: ScannedCrop = {
    id: "QR-Rice-5kg-1234567890-0",
    cropType: "Rice",
    farmerName: "Ravi Kumar",
    farmerLocation: "Mysore, Karnataka",
    giTag: "Basmati Rice - GI Tag",
    quantity: "5kg",
    currentStatus: "with_farmer"
  };

  const startScanning = () => {
    setIsScanning(true);
    toast({
      title: "Camera Access",
      description: "Starting QR code scanner...",
    });

    // Simulate QR scanning
    setTimeout(() => {
      setIsScanning(false);
      setScannedData(mockScanData);
      toast({
        title: "QR Code Scanned",
        description: `Successfully scanned ${mockScanData.cropType} from ${mockScanData.farmerName}`,
      });
      console.log('QR scanned:', mockScanData);
    }, 2000);
  };

  const stopScanning = () => {
    setIsScanning(false);
    toast({
      title: "Scanning Stopped",
      description: "QR code scanning has been stopped",
    });
  };

  const handleStatusUpdate = () => {
    if (!scannedData || !newStatus) {
      toast({
        title: "Missing Information",
        description: "Please select a status to update",
        variant: "destructive",
      });
      return;
    }

    onStatusUpdate(scannedData.id, newStatus, newPrice || undefined);
    
    toast({
      title: "Status Updated",
      description: `Crop status updated to: ${newStatus}`,
    });

    // Update local state
    setScannedData(prev => prev ? { ...prev, currentStatus: newStatus } : null);
    setNewStatus("");
    setNewPrice("");
    
    console.log('Status update:', { qrCode: scannedData.id, newStatus, newPrice, location });
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      with_farmer: "bg-blue-100 text-blue-800",
      in_transit: "bg-yellow-100 text-yellow-800",
      with_retailer: "bg-orange-100 text-orange-800",
      received: "bg-green-100 text-green-800",
      in_store: "bg-purple-100 text-purple-800",
      sold: "bg-gray-100 text-gray-800",
      purchased: "bg-green-100 text-green-800",
      consumed: "bg-gray-100 text-gray-800"
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-medium">QR Scanner</h1>
        <p className="text-muted-foreground">
          Scan QR codes to track crop journey ({userType === "retailer" ? "Distributer / Retailer" : userType})
        </p>
      </div>

      {/* Scanner Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="w-5 h-5" />
            <span>Scan QR Code</span>
          </CardTitle>
          <CardDescription>
            Point your camera at a crop QR code to scan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isScanning ? (
            <div className="text-center space-y-4">
              <div className="w-64 h-64 bg-muted border-2 border-dashed border-border rounded-lg mx-auto flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Camera className="w-16 h-16 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Camera preview will appear here</p>
                </div>
              </div>
              <Button onClick={startScanning} size="lg" data-testid="button-start-scan">
                <Scan className="w-4 h-4 mr-2" />
                Start Scanning
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-64 h-64 bg-primary/10 border-2 border-primary rounded-lg mx-auto flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-primary font-medium">Scanning...</p>
                </div>
              </div>
              <Button variant="destructive" onClick={stopScanning} data-testid="button-stop-scan">
                Stop Scanning
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scanned Data */}
      {scannedData && (
        <Card>
          <CardHeader>
            <CardTitle>Scanned Crop Information</CardTitle>
            <CardDescription>Details from the QR code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-muted-foreground">Crop Type</Label>
                  <p className="font-medium" data-testid="text-crop-type">{scannedData.cropType}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Farmer</Label>
                  <p className="font-medium" data-testid="text-farmer-name">{scannedData.farmerName}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Location</Label>
                  <p className="flex items-center font-medium">
                    <MapPin className="w-4 h-4 mr-1" />
                    {scannedData.farmerLocation}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-muted-foreground">Quantity</Label>
                  <p className="font-medium">{scannedData.quantity}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Current Status</Label>
                  <Badge className={getStatusColor(scannedData.currentStatus)}>
                    {scannedData.currentStatus.replace('_', ' ')}
                  </Badge>
                </div>
                {scannedData.giTag && (
                  <div>
                    <Label className="text-sm text-muted-foreground">GI Tag</Label>
                    <Badge variant="outline">{scannedData.giTag}</Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Update Status */}
      {scannedData && (
        <Card>
          <CardHeader>
            <CardTitle>Update Status</CardTitle>
            <CardDescription>
              Update the crop status and price information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">New Status *</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger data-testid="select-new-status">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {userType === "retailer" && (
                <div className="space-y-2">
                  <Label htmlFor="price">Price (Optional)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      placeholder="Enter price"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="pl-10"
                      data-testid="input-price"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Current Location (Optional)</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="Enter current location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                  data-testid="input-location"
                />
              </div>
            </div>

            <Button onClick={handleStatusUpdate} className="w-full" data-testid="button-update-status">
              <Upload className="w-4 h-4 mr-2" />
              Update Status
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}