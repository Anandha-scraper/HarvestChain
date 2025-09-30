import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Square, Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface QRGeneratorProps {
  farmerName: string;
  registeredCrops: string[];
  onBack: () => void;
  onUploadToIPFS: (batchData: any) => void;
}

type QuantityType = "5kg" | "single" | "custom";

export default function QRGenerator({ farmerName, registeredCrops, onBack, onUploadToIPFS }: QRGeneratorProps) {
  const [cropType, setCropType] = useState("");
  const [giTag, setGiTag] = useState("");
  const [quantityType, setQuantityType] = useState<QuantityType>("5kg");
  const [customQuantity, setCustomQuantity] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQRs, setGeneratedQRs] = useState<string[]>([]);
  const [qrCount, setQrCount] = useState(1);
  const [qrCountInput, setQrCountInput] = useState("1");
  const { toast } = useToast();

  // Main/Sub QR linkage
  const [showMainDialog, setShowMainDialog] = useState(false);
  const [subPerMain, setSubPerMain] = useState(1);
  const [subPerMainInput, setSubPerMainInput] = useState("1");
  const [includeRemainderMain, setIncludeRemainderMain] = useState(true);
  const computedMainCount = Math.floor(qrCount / Math.max(1, subPerMain));
  const remainderSubs = Math.max(0, qrCount - computedMainCount * Math.max(1, subPerMain));

  // Grouped display state
  const [groups, setGroups] = useState<{ main?: string; subs: string[] }[]>([]);
  const [ungroupedSubs, setUngroupedSubs] = useState<string[]>([]);
  const [groupingConfirmed, setGroupingConfirmed] = useState(false);

  // Use registered crops instead of hardcoded options
  const cropOptions = registeredCrops;

  const giTagOptions = [
    "Basmati Rice - GI Tag", "Mysore Silk - GI Tag", "Darjeeling Tea - GI Tag",
    "Alphonso Mango - GI Tag", "Coorg Coffee - GI Tag", "Custom GI Tag"
  ];

  const openGroupingDialog = () => {
    if (!cropType) {
      toast({
        title: "Missing Information",
        description: "Please select a crop type",
        variant: "destructive",
      });
      return;
    }

    if (registeredCrops.length === 0) {
      toast({
        title: "No Registered Crops",
        description: "Please register crops in your dashboard before generating QR codes",
        variant: "destructive",
      });
      return;
    }

    // Ask for main QR distribution first
    setGroupingConfirmed(false);
    setShowMainDialog(true);
  };

  const generateNow = () => {
    if (!groupingConfirmed) {
      toast({
        title: "Confirm grouping first",
        description: "Click Submit and confirm distribution before generating.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);

    setTimeout(() => {
      const quantity = quantityType === "custom" ? customQuantity : quantityType;

      // Create sub QRs
      const newQRs = Array.from({ length: qrCount }, (_, i) => `SUB-${cropType}-${quantity}-${Date.now()}-${i + 1}`);

      // Create main QRs and link sub-sets
      const mainCountFinal = computedMainCount + (remainderSubs > 0 && includeRemainderMain ? 1 : 0);
      const mainQRs = Array.from({ length: mainCountFinal }, (_, i) => `MAIN-${cropType}-${quantity}-${Date.now()}-${i + 1}`);

      const linkage: { main: string; subs: string[] }[] = [];
      let cursor = 0;
      // Full groups
      for (let i = 0; i < computedMainCount; i++) {
        const start = cursor;
        const end = Math.min(start + subPerMain, newQRs.length);
        linkage.push({ main: mainQRs[i], subs: newQRs.slice(start, end) });
        cursor = end;
      }
      // Remainder group
      if (remainderSubs > 0) {
        if (includeRemainderMain) {
          linkage.push({ main: mainQRs[mainQRs.length - 1], subs: newQRs.slice(cursor) });
          cursor = newQRs.length;
        } else {
          // remainder subs stay ungrouped (no main QR)
          cursor = newQRs.length;
        }
      }

      setGeneratedQRs(prev => [...prev, ...newQRs]);
      setGroups(linkage);
      setUngroupedSubs(!includeRemainderMain ? newQRs.slice(cursor) : []);
      setIsGenerating(false);

      toast({
        title: "QR Codes Generated",
        description: `Generated ${newQRs.length} sub QRs, ${mainQRs.length} main QRs (${subPerMain} sub/main${remainderSubs > 0 ? `, remainder ${includeRemainderMain ? 'grouped' : 'ungrouped'}` : ''}).`,
      });

      console.log('Main/Sub QR linkage:', linkage);
    }, 800);
  };

  const confirmGenerate = () => {
    setGroupingConfirmed(true);
    setShowMainDialog(false);
    toast({
      title: "Grouping confirmed",
      description: `Main QRs: ${computedMainCount + (remainderSubs > 0 && includeRemainderMain ? 1 : 0)} • Sub per main: ${subPerMain}${remainderSubs ? ` • Remainder: ${remainderSubs} (${includeRemainderMain ? 'with main' : 'ungrouped'})` : ''}`,
    });
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

  // Quick path: generate only sub QRs (no main QR grouping)
  const generateSubOnly = () => {
    if (!cropType) {
      toast({ title: "Missing Information", description: "Please select a crop type", variant: "destructive" });
      return;
    }
    if (registeredCrops.length === 0) {
      toast({ title: "No Registered Crops", description: "Please register crops first", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setGroupingConfirmed(false);
    setGroups([]);
    setUngroupedSubs([]);

    setTimeout(() => {
      const quantity = quantityType === "custom" ? customQuantity : quantityType;
      const newQRs = Array.from({ length: qrCount }, (_, i) => `SUB-${cropType}-${quantity}-${Date.now()}-${i + 1}`);
      setGeneratedQRs(prev => [...prev, ...newQRs]);
      setGroups([]);
      setUngroupedSubs(newQRs);
      setIsGenerating(false);
      toast({ title: "QR Codes Generated", description: `Generated ${newQRs.length} sub QRs (no main QRs).` });
    }, 600);
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
              {registeredCrops.length === 0 ? (
                <div className="p-4 border border-dashed border-muted-foreground rounded-md text-center">
                  <p className="text-sm text-muted-foreground">
                    No registered crops found. Please add crops in your dashboard first.
                  </p>
                </div>
              ) : (
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
              )}
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

          <div className="space-y-2">
            <Label htmlFor="qr-count">Number of QR Codes</Label>
            <div className="flex items-end gap-2">
              <Input
                id="qr-count"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="1-100"
                value={qrCountInput}
                onChange={(e) => {
                  const raw = e.target.value.trim();
                  // allow clearing while typing
                  if (raw === "") {
                    setQrCountInput("");
                    return;
                  }
                  // digits only
                  if (!/^\d+$/.test(raw)) {
                    return;
                  }
                  const n = parseInt(raw, 10);
                  if (n >= 1 && n <= 100) {
                    setQrCount(n);
                    setQrCountInput(raw);
                  } else {
                    // remove invalid entry and notify
                    setQrCountInput("");
                    toast({
                      title: "Out of range",
                      description: "Allowed range is 1 to 100.",
                      variant: "destructive",
                    });
                  }
                }}
                className="w-48"
                data-testid="input-qr-count"
              />
              <Button size="sm" onClick={openGroupingDialog} data-testid="button-submit-qrcount">Submit</Button>
              <Button size="sm" variant="outline" onClick={generateSubOnly} disabled={isGenerating} data-testid="button-no-main">No Main QR</Button>
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
              <Button onClick={generateNow} disabled={!groupingConfirmed} data-testid="button-start-generation">
                <Play className="w-4 h-4 mr-2" />
                Start Generation
              </Button>
            ) : (
              <Button variant="destructive" onClick={stopGeneration} data-testid="button-stop-generation">
                <Square className="w-4 h-4 mr-2" />
                Stop Generation
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleUploadToIPFS}
              disabled={generatedQRs.length === 0}
              data-testid="button-upload-near-start"
            >
              Upload QR
            </Button>
            
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
      {(groups.length > 0 || ungroupedSubs.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Generated QR Codes</CardTitle>
            <CardDescription>
              {generatedQRs.length} sub QR(s) for {cropType}{giTag ? ` • ${giTag}` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {groups.length > 0 && (
              <div className="space-y-6">
                {groups.map((g, idx) => (
                  <div key={g.main || `group-${idx}`} className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Main {idx + 1}</Badge>
                        {g.main && (
                          <Badge variant="outline" className="text-xs">{g.main}</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">{g.subs.length} sub QR(s)</span>
                    </div>
                    {/* Larger Main QR visual */}
                    <div className="mb-4 flex items-center gap-3">
                      <div className="w-40 h-40 bg-muted border-2 border-dashed border-border rounded-md flex items-center justify-center">
                        <span className="text-sm text-muted-foreground">Main QR</span>
                      </div>
                      {g.main && (
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Main ID</div>
                          <Badge variant="outline" className="text-xs break-all max-w-xs">{g.main}</Badge>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {g.subs.map((qr, i) => (
                        <div key={qr} className="text-center space-y-2">
                          <div className="w-24 h-24 bg-muted border-2 border-dashed border-border rounded-md flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">Sub #{i + 1}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">{qr.split('-').pop()}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {ungroupedSubs.length > 0 && (
              <div className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Ungrouped</Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{ungroupedSubs.length} sub QR(s)</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {ungroupedSubs.map((qr, i) => (
                    <div key={qr} className="text-center space-y-2">
                      <div className="w-24 h-24 bg-muted border-2 border-dashed border-border rounded-md flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Sub #{i + 1}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{qr.split('-').pop()}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

      {/* Main QR distribution dialog */}
      <Dialog open={showMainDialog} onOpenChange={setShowMainDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Distribute into Main QRs</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              You are generating {qrCount} sub QR(s). Enter how many sub QR(s) per main QR.
            </p>
            <div className="space-y-2">
              <Label htmlFor="sub-per-main">Sub QRs per Main</Label>
              <Input
                id="sub-per-main"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={subPerMainInput}
                placeholder={`1 - ${qrCount}`}
                onChange={(e) => {
                  const raw = e.target.value.trim();
                  if (raw === "") {
                    setSubPerMainInput("");
                    return;
                  }
                  if (!/^\d+$/.test(raw)) {
                    return;
                  }
                  const n = parseInt(raw, 10);
                  if (n >= 1 && n <= qrCount) {
                    setSubPerMain(n);
                    setSubPerMainInput(raw);
                  } else {
                    setSubPerMainInput("");
                    toast({
                      title: "Out of range",
                      description: `Sub-per-main must be between 1 and ${qrCount}.`,
                      variant: "destructive",
                    });
                  }
                }}
              />
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Main QRs: {computedMainCount}{remainderSubs > 0 && includeRemainderMain ? ' + 1 (remainder)' : ''}</p>
                <p>Remainder sub QRs: {remainderSubs}</p>
              </div>
              {remainderSubs > 0 && (
                <div className="space-y-2 pt-2">
                  <Label>Remainder handling</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={includeRemainderMain ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIncludeRemainderMain(true)}
                    >
                      Create main for remainder
                    </Button>
                    <Button
                      type="button"
                      variant={!includeRemainderMain ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIncludeRemainderMain(false)}
                    >
                      No main for remainder
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMainDialog(false)}>Cancel</Button>
            <Button onClick={confirmGenerate}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}