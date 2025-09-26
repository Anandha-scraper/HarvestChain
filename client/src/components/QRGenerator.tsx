import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Square, Upload, Download, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRGeneratorProps {
  farmerName: string;
  onBack: () => void;
  onUploadToIPFS: (batchData: any) => void;
}

type QuantityType = "5kg" | "single" | "custom";

export default function QRGenerator({ farmerName, onBack, onUploadToIPFS }: QRGeneratorProps) {
  const [cropType, setCropType] = useState("");
  const [giTag, setGiTag] = useState("");
  const [quantityType, setQuantityType] = useState<QuantityType>("5kg");
  const [customQuantity, setCustomQuantity] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQRs, setGeneratedQRs] = useState<string[]>([]);
  const [qrCount, setQrCount] = useState(1);
  const { toast } = useToast();

  const cropOptions = [
    "Rice", "Wheat", "Corn", "Sugarcane", "Cotton", "Coconut", 
    "Banana", "Apple", "Mango", "Tomato", "Potato", "Onion"
  ];

  const giTagOptions = [
    "Basmati Rice - GI Tag", "Mysore Silk - GI Tag", "Darjeeling Tea - GI Tag",
    "Alphonso Mango - GI Tag", "Coorg Coffee - GI Tag", "Custom GI Tag"
  ];

  const generateQRCode = () => {
    if (!cropType) {
      toast({
        title: "Missing Information",
        description: "Please select a crop type",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate QR generation
    setTimeout(() => {
      const quantity = quantityType === "custom" ? customQuantity : quantityType;
      const newQRs = Array.from({ length: qrCount }, (_, i) => 
        `QR-${cropType}-${quantity}-${Date.now()}-${i}`
      );
      
      setGeneratedQRs(prev => [...prev, ...newQRs]);
      setIsGenerating(false);
      
      toast({
        title: "QR Codes Generated",
        description: `Generated ${qrCount} QR code(s) for ${cropType}`,
      });
      
      console.log('Generated QR codes:', newQRs);
    }, 1500);
  };

  const stopGeneration = () => {
    setIsGenerating(false);
    toast({
      title: "Generation Stopped",
      description: "QR code generation has been stopped",
    });
  };

  const handleUploadToIPFS = () => {
    if (generatedQRs.length === 0) {
      toast({
        title: "No QR Codes",
        description: "Generate QR codes before uploading to IPFS",
        variant: "destructive",
      });
      return;
    }

    const batchData = {
      cropType,
      giTag,
      quantity: quantityType === "custom" ? customQuantity : quantityType,
      qrCodes: generatedQRs,
      farmerName,
      timestamp: new Date().toISOString()
    };

    onUploadToIPFS(batchData);
    
    toast({
      title: "Uploading to IPFS",
      description: "Your crop data is being uploaded to IPFS...",
    });
    
    console.log('Uploading to IPFS:', batchData);
  };

  const downloadQRs = () => {
    console.log('Downloading QR codes:', generatedQRs);
    toast({
      title: "Download Started",
      description: "QR codes are being downloaded",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={onBack} data-testid="button-back">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-medium">Generate QR Codes</h1>
          <p className="text-muted-foreground">Create QR codes for your crops</p>
        </div>
      </div>

      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle>Crop Information</CardTitle>
          <CardDescription>Enter details about your crop batch</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crop-type">Crop Type *</Label>
              <Select value={cropType} onValueChange={setCropType}>
                <SelectTrigger data-testid="select-crop-type">
                  <SelectValue placeholder="Select crop type" />
                </SelectTrigger>
                <SelectContent>
                  {cropOptions.map((crop) => (
                    <SelectItem key={crop} value={crop}>
                      {crop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gi-tag">GI Tag (Optional)</Label>
              <Select value={giTag} onValueChange={setGiTag}>
                <SelectTrigger data-testid="select-gi-tag">
                  <SelectValue placeholder="Select GI tag" />
                </SelectTrigger>
                <SelectContent>
                  {giTagOptions.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Quantity per QR Code</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={quantityType === "5kg" ? "default" : "outline"}
                size="sm"
                onClick={() => setQuantityType("5kg")}
                data-testid="button-quantity-5kg"
              >
                5/kg
              </Button>
              <Button
                variant={quantityType === "single" ? "default" : "outline"}
                size="sm"
                onClick={() => setQuantityType("single")}
                data-testid="button-quantity-single"
              >
                Single Item
              </Button>
              <Button
                variant={quantityType === "custom" ? "default" : "outline"}
                size="sm"
                onClick={() => setQuantityType("custom")}
                data-testid="button-quantity-custom"
              >
                Custom
              </Button>
            </div>
            
            {quantityType === "custom" && (
              <Input
                placeholder="Enter custom quantity"
                value={customQuantity}
                onChange={(e) => setCustomQuantity(e.target.value)}
                data-testid="input-custom-quantity"
              />
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Label>Number of QR Codes:</Label>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setQrCount(Math.max(1, qrCount - 1))}
                data-testid="button-decrease-count"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-12 text-center font-medium" data-testid="text-qr-count">{qrCount}</span>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setQrCount(qrCount + 1)}
                data-testid="button-increase-count"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle>QR Generation</CardTitle>
          <CardDescription>Control QR code generation process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {!isGenerating ? (
              <Button onClick={generateQRCode} data-testid="button-start-generation">
                <Play className="w-4 h-4 mr-2" />
                Start Generation
              </Button>
            ) : (
              <Button variant="destructive" onClick={stopGeneration} data-testid="button-stop-generation">
                <Square className="w-4 h-4 mr-2" />
                Stop Generation
              </Button>
            )}
            
            {generatedQRs.length > 0 && (
              <>
                <Button variant="outline" onClick={downloadQRs} data-testid="button-download">
                  <Download className="w-4 h-4 mr-2" />
                  Download QRs
                </Button>
                <Button variant="outline" onClick={handleUploadToIPFS} data-testid="button-upload-ipfs">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload to IPFS
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated QR Codes */}
      {generatedQRs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated QR Codes</CardTitle>
            <CardDescription>
              {generatedQRs.length} QR code(s) generated for {cropType}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {generatedQRs.map((qr, index) => (
                <div key={qr} className="text-center space-y-2">
                  <div className="w-24 h-24 bg-muted border-2 border-dashed border-border rounded-md flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">QR #{index + 1}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {qr.split('-').pop()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isGenerating && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Generating QR codes...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}