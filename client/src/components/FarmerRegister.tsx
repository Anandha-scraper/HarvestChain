import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Lock, User, CreditCard, MapPin, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseAuth, getDb, RecaptchaVerifier, signInWithPhoneNumber, setDoc, doc, serverTimestamp } from "@/lib/firebase";

interface FarmerRegisterProps {
  onBack: () => void;
  onRegistered: (farmer: {
    name: string;
    phoneNumber: string;
    aadharNumber: string;
    cropsGrown: string[];
  }) => void;
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

export default function FarmerRegister({ onBack, onRegistered }: FarmerRegisterProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [location, setLocation] = useState("");
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [customCrop, setCustomCrop] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableCrops = useMemo(() => {
    const set = new Set([...defaultCrops, ...selectedCrops]);
    return Array.from(set);
  }, [selectedCrops]);

  const toggleCrop = (crop: string) => {
    setSelectedCrops((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]
    );
  };

  const addCustomCrop = () => {
    const cleaned = customCrop.trim();
    if (!cleaned) return;
    if (!selectedCrops.includes(cleaned)) setSelectedCrops((p) => [...p, cleaned]);
    setCustomCrop("");
  };

  const sendOtp = async () => {
    if (phoneNumber.length !== 10) {
      toast({ title: "Invalid phone", description: "Enter 10-digit phone number", variant: "destructive" });
      return;
    }
    try {
      const auth = getFirebaseAuth();
      // attach verifier to a hidden container id
      const verifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
      const fullPhone = "+91" + phoneNumber; // adjust country code if needed
      const confirmation = await signInWithPhoneNumber(auth, fullPhone, verifier);
      // store confirmation in window for simplicity
      (window as any).confirmationResult = confirmation;
      setOtpSent(true);
      toast({ title: "OTP sent", description: `Code sent to ${fullPhone}` });
    } catch (err: any) {
      toast({ title: "OTP error", description: err.message || String(err), variant: "destructive" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phoneNumber || !passcode || !confirmPasscode || !aadharNumber || !location) {
      toast({ title: "Missing fields", description: "Fill all required fields", variant: "destructive" });
      return;
    }
    if (phoneNumber.length !== 10) {
      toast({ title: "Invalid phone", description: "Phone must be 10 digits", variant: "destructive" });
      return;
    }
    if (passcode.length !== 4 || /\D/.test(passcode)) {
      toast({ title: "Invalid passcode", description: "Passcode must be 4 digits", variant: "destructive" });
      return;
    }
    if (passcode !== confirmPasscode) {
      toast({ title: "Mismatch", description: "Passcodes do not match", variant: "destructive" });
      return;
    }
    if (!otpSent) {
      toast({ title: "Verify OTP", description: "Press 'Send OTP' and verify", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const confirmation = (window as any).confirmationResult;
      const result = await confirmation.confirm(otp);
      const uid: string = result.user.uid;
      const db = getDb();
      await setDoc(doc(db, "farmers", uid), {
        name,
        phoneNumber,
        aadharNumber,
        location,
        cropsGrown: selectedCrops.length ? selectedCrops : ["Rice"],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setIsSubmitting(false);
      toast({ title: "Registered", description: "Farmer registered successfully" });
      onRegistered({
        name,
        phoneNumber,
        aadharNumber,
        cropsGrown: selectedCrops.length ? selectedCrops : ["Rice"],
      });
    } catch (err: any) {
      setIsSubmitting(false);
      toast({ title: "Verification failed", description: err.message || String(err), variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-medium">Farmer Registration</CardTitle>
          <CardDescription>Enter your details to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Farmer Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="name" placeholder="Enter full name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="phone" type="tel" placeholder="10-digit number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="passcode">Passcode (4 digits)</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="passcode" type="password" placeholder="e.g. 1234" value={passcode} onChange={(e) => setPasscode(e.target.value.replace(/\D/g, '').slice(0, 4))} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Passcode</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="confirm" type="password" placeholder="re-enter passcode" value={confirmPasscode} onChange={(e) => setConfirmPasscode(e.target.value.replace(/\D/g, '').slice(0, 4))} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="aadhar">Aadhar Number</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="aadhar" placeholder="XXXX-XXXX-XXXX" value={aadharNumber} onChange={(e) => setAadharNumber(e.target.value)} className="pl-10" />
                </div>
              </div>
            </div>

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
                    <Input placeholder="Enter crop name" value={customCrop} onChange={(e) => setCustomCrop(e.target.value)} />
                    <Button type="button" onClick={addCustomCrop}>
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
              {selectedCrops.length > 0 && (
                <div className="text-xs text-muted-foreground">Selected: {selectedCrops.join(", ")}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="location" placeholder="City, State" value={location} onChange={(e) => setLocation(e.target.value)} className="pl-10" />
              </div>
            </div>

            <div id="recaptcha-container" />
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" onClick={sendOtp} disabled={otpSent}>
                {otpSent ? "OTP Sent" : "Send OTP"}
              </Button>
              <Input placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-40" />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onBack}>Back</Button>
              <Button type="submit" className="ml-auto" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Verify & Register"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


