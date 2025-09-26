import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, MapPin, CreditCard, Plus, QrCode, Upload } from "lucide-react";

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
}

export default function FarmerDashboard({ farmer, onGenerateQR, onViewHistory, onLogout }: FarmerDashboardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-foreground">Dashboard</h1>
        <Button variant="outline" size="sm" onClick={onLogout} data-testid="button-logout">
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
              <p className="text-sm text-muted-foreground">Registered Crops:</p>
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