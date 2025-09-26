import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Camera, QrCode, MapPin, IndianRupee, Upload, Scan, Clock, CheckCircle, XCircle, TrendingUp, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PriceHistory {
  stage: string;
  price: string;
  date: string;
  location?: string;
  updatedBy: string;
}

interface ScannedCrop {
  id: string;
  cropType: string;
  farmerName: string;
  farmerLocation: string;
  giTag?: string;
  quantity: string;
  currentStatus: string;
  priceHistory: PriceHistory[];
  currentPrice?: string;
}

interface PriceUpdateRequest {
  id: string;
  qrCode: string;
  cropType: string;
  farmerName: string;
  currentPrice?: string;
  proposedPrice: string;
  requestedBy: string;
  status: "pending" | "approved" | "rejected";
  timestamp: Date;
}

interface QRScannerProps {
  userType: "retailer" | "consumer";
  onStatusUpdate: (qrCode: string, newStatus: string, price?: string) => void;
  onPriceUpdateRequest?: (request: PriceUpdateRequest) => void;
}

export default function QRScanner({ userType, onStatusUpdate, onPriceUpdateRequest }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedCrop | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [location, setLocation] = useState("");
  const [pendingPriceUpdate, setPendingPriceUpdate] = useState<PriceUpdateRequest | null>(null);
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
    currentStatus: "with_farmer",
    currentPrice: "45",
    priceHistory: [
      {
        stage: "Farmer",
        price: "45",
        date: "2025-09-20",
        location: "Mysore, Karnataka",
        updatedBy: "Ravi Kumar"
      },
      {
        stage: "Distributer/Retailer",
        price: "65",
        date: "2025-09-23",
        location: "Bangalore, Karnataka",
        updatedBy: "SuperMart Wholesale"
      },
      {
        stage: "Retail Store",
        price: "85",
        date: "2025-09-25",
        location: "MG Road, Bangalore",
        updatedBy: "Fresh Grocers"
      }
    ]
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

    // For retailer, require both price and location
    if (userType === "retailer") {
      if (!newPrice || newPrice.trim() === "" || !location || location.trim() === "") {
        toast({
          title: "Missing Details",
          description: "Retailer must enter both price and location",
          variant: "destructive",
        });
        return;
      }
    }

    // If retailer is updating price, require farmer confirmation
    if (userType === "retailer" && newPrice && newPrice.trim() !== "") {
      const priceUpdateRequest: PriceUpdateRequest = {
        id: `price-req-${Date.now()}`,
        qrCode: scannedData.id,
        cropType: scannedData.cropType,
        farmerName: scannedData.farmerName,
        currentPrice: "Previous price", // In real app, get from scannedData
        proposedPrice: newPrice,
        requestedBy: "Distributer/Retailer",
        status: "pending",
        timestamp: new Date()
      };
      
      setPendingPriceUpdate(priceUpdateRequest);
      onPriceUpdateRequest?.(priceUpdateRequest);
      
      toast({
        title: "Price Update Requested",
        description: `Farmer confirmation required for price update to ₹${newPrice}`,
        variant: "default",
      });
      
      console.log('Price update request sent:', priceUpdateRequest);
      return;
    }

    // For consumer updates with price, add to price history
    if (userType === "consumer" && newPrice && newPrice.trim() !== "") {
      const newPriceEntry: PriceHistory = {
        stage: "Consumer",
        price: newPrice,
        date: new Date().toISOString().split('T')[0],
        location: location || "Consumer location",
        updatedBy: "Consumer"
      };
      
      // Update price history locally
      setScannedData(prev => prev ? {
        ...prev,
        currentPrice: newPrice,
        priceHistory: [...prev.priceHistory, newPriceEntry]
      } : null);
      
      toast({
        title: "Consumer Price Added",
        description: `Added consumer price: ₹${newPrice}`,
      });
      
      console.log('Consumer price added:', { qrCode: scannedData.id, newStatus, newPrice, location, priceHistory: newPriceEntry });
    }
    
    // For status updates without price or consumer updates, proceed normally
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

  const handlePriceConfirmationResponse = (approved: boolean) => {
    if (!pendingPriceUpdate) return;

    if (approved) {
      // Simulate farmer approval and IPFS upload
      onStatusUpdate(pendingPriceUpdate.qrCode, newStatus || "price_updated", pendingPriceUpdate.proposedPrice);
      
      toast({
        title: "Price Update Approved",
        description: `Farmer approved price update. Uploading to IPFS...`,
      });
      
      // Simulate IPFS upload after approval
      setTimeout(() => {
        toast({
          title: "IPFS Upload Complete",
          description: `Price update (₹${pendingPriceUpdate.proposedPrice}) uploaded to IPFS successfully`,
        });
      }, 2000);
      
      // Update local state
      setScannedData(prev => prev ? { ...prev, currentStatus: "price_updated" } : null);
      setNewStatus("");
      setNewPrice("");
    } else {
      toast({
        title: "Price Update Rejected",
        description: "Farmer rejected the price update request",
        variant: "destructive",
      });
    }
    
    setPendingPriceUpdate(null);
    console.log('Price confirmation response:', { approved, request: pendingPriceUpdate });
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

      {/* Price History */}
      {scannedData && scannedData.priceHistory && scannedData.priceHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="w-5 h-5" />
              <span>Price History</span>
            </CardTitle>
            <CardDescription>
              Track pricing across the entire supply chain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scannedData.priceHistory.map((entry, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover-elevate"
                  data-testid={`price-entry-${index}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={entry.stage === "Farmer" ? "default" : 
                                entry.stage === "Consumer" ? "secondary" : "outline"}
                      >
                        {entry.stage}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{entry.date}</span>
                    </div>
                    <p className="font-medium text-sm mt-1" data-testid={`text-updated-by-${index}`}>
                      {entry.updatedBy}
                    </p>
                    {entry.location && (
                      <p className="text-sm text-muted-foreground flex items-center mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {entry.location}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-xl font-bold text-primary" data-testid={`text-price-${index}`}>
                        ₹{entry.price}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">per {scannedData.quantity}</p>
                  </div>
                </div>
              ))}
              
              {/* Price Summary */}
              <div className="bg-muted/50 rounded-lg p-4 mt-4">
                <h4 className="font-medium mb-2">Price Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Farm Price:</span>
                    <span className="font-medium ml-2">₹{scannedData.priceHistory.find(p => p.stage === "Farmer")?.price || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current Price:</span>
                    <span className="font-medium ml-2">₹{scannedData.currentPrice || scannedData.priceHistory[scannedData.priceHistory.length - 1]?.price || "N/A"}</span>
                  </div>
                  {scannedData.priceHistory.find(p => p.stage === "Consumer") && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">You Paid:</span>
                      <span className="font-medium ml-2 text-green-600">
                        ₹{scannedData.priceHistory.find(p => p.stage === "Consumer")?.price}
                      </span>
                    </div>
                  )}
                </div>
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

              {(userType === "retailer" || userType === "consumer") && (
                <div className="space-y-2">
                  <Label htmlFor="price">
                    {userType === "consumer" ? "Price You Paid (Optional)" : "Price"}
                  </Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="text"
                      inputMode="decimal"
                      placeholder={userType === "consumer" ? "Enter price you paid" : "Enter price"}
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value.replace(/[^\d.]/g, ''))}
                      className="pl-10"
                      data-testid="input-price"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{userType === "consumer" ? "Current Location (Optional)" : "Current Location"}</Label>
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

            <Button 
              onClick={handleStatusUpdate} 
              className="w-full" 
              data-testid="button-update-status"
              disabled={!!pendingPriceUpdate}
            >
              <Upload className="w-4 h-4 mr-2" />
              {pendingPriceUpdate ? "Waiting for Farmer Confirmation" : "Update Status"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pending Price Update Confirmation */}
      {pendingPriceUpdate && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
              <Clock className="w-5 h-5" />
              <span>Farmer Confirmation Required</span>
            </CardTitle>
            <CardDescription>
              Waiting for farmer approval for price update
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Crop</Label>
                <p className="font-medium">{pendingPriceUpdate.cropType}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Farmer</Label>
                <p className="font-medium">{pendingPriceUpdate.farmerName}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Current Price</Label>
                <p className="font-medium">{pendingPriceUpdate.currentPrice || "Not set"}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Proposed Price</Label>
                <p className="font-medium text-primary">₹{pendingPriceUpdate.proposedPrice}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Requested: {pendingPriceUpdate.timestamp.toLocaleString()}</span>
            </div>

            {/* Simulate farmer response buttons for demo */}
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-3">
                Simulate farmer response (for demo purposes):
              </p>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => handlePriceConfirmationResponse(true)}
                  data-testid="button-farmer-approve"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Farmer Approves
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handlePriceConfirmationResponse(false)}
                  data-testid="button-farmer-reject"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Farmer Rejects
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}