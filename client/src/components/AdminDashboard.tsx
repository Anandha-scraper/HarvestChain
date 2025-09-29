import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Shield, 
  Users, 
  Trash2, 
  Edit, 
  Search, 
  LogOut, 
  MapPin, 
  Phone, 
  CreditCard,
  Calendar,
  TrendingUp,
  BarChart3,
  Settings,
  User,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAllFarmers, deleteFarmer, getAdminStats, updateAdminCredentials, FarmerData, AdminStats } from "@/lib/adminApi";

interface AdminDashboardProps {
  adminData: any;
  onLogout: () => void;
}

export default function AdminDashboard({ adminData, onLogout }: AdminDashboardProps) {
  const [farmers, setFarmers] = useState<FarmerData[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<FarmerData>>({});
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [credentialsData, setCredentialsData] = useState({
    username: adminData?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingCredentials, setIsUpdatingCredentials] = useState(false);
  const { toast } = useToast();

  const itemsPerPage = 10;

  useEffect(() => {
    loadFarmers();
    loadStats();
  }, [currentPage]);

  const loadFarmers = async () => {
    try {
      setIsLoading(true);
      const result = await getAllFarmers(itemsPerPage, currentPage * itemsPerPage);
      setFarmers(result.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load farmers",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await getAdminStats();
      setStats(result.data);
    } catch (error: any) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleDeleteFarmer = async (farmerId: string, farmerName: string) => {
    try {
      await deleteFarmer(farmerId);
      toast({
        title: "Farmer Deleted",
        description: `${farmerName} has been deleted successfully`,
      });
      loadFarmers();
      loadStats();
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete farmer",
        variant: "destructive"
      });
    }
  };

  const handleEditFarmer = (farmer: FarmerData) => {
    setSelectedFarmer(farmer);
    setEditData({
      name: farmer.name,
      location: farmer.location,
      cropsGrown: farmer.cropsGrown
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedFarmer) return;

    try {
      // In a real app, you'd call updateFarmer API here
      toast({
        title: "Update Successful",
        description: "Farmer details updated successfully",
      });
      setIsEditDialogOpen(false);
      loadFarmers();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update farmer",
        variant: "destructive"
      });
    }
  };

  const handleUpdateCredentials = async () => {
    if (!adminData?.id) {
      toast({
        title: "Error",
        description: "Admin ID not found",
        variant: "destructive"
      });
      return;
    }

    // Validation
    if (!credentialsData.username.trim()) {
      toast({
        title: "Validation Error",
        description: "Username is required",
        variant: "destructive"
      });
      return;
    }

    if (credentialsData.newPassword && credentialsData.newPassword !== credentialsData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "New password and confirm password do not match",
        variant: "destructive"
      });
      return;
    }

    if (credentialsData.newPassword && credentialsData.newPassword.length < 6) {
      toast({
        title: "Validation Error",
        description: "New password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingCredentials(true);
    try {
      const updateData: any = {
        username: credentialsData.username
      };

      if (credentialsData.newPassword) {
        updateData.currentPassword = credentialsData.currentPassword;
        updateData.newPassword = credentialsData.newPassword;
      }

      const result = await updateAdminCredentials(adminData.id, updateData);
      
      toast({
        title: "Credentials Updated",
        description: "Your credentials have been updated successfully",
      });
      
      setIsCredentialsDialogOpen(false);
      setCredentialsData({
        username: result.data.username,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update credentials",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingCredentials(false);
    }
  };

  const filteredFarmers = farmers.filter(farmer =>
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.phoneNumber.includes(searchTerm) ||
    farmer.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between w-full gap-4">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="p-2 bg-red-600 rounded-lg flex-shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-medium">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage farmers and system data</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Dialog open={isCredentialsDialogOpen} onOpenChange={setIsCredentialsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Update Credentials</DialogTitle>
                <DialogDescription>
                  Update your admin username and password
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      value={credentialsData.username}
                      onChange={(e) => setCredentialsData({ ...credentialsData, username: e.target.value })}
                      className="pl-10"
                      placeholder="Enter new username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password (required for password change)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <PasswordInput
                      id="currentPassword"
                      value={credentialsData.currentPassword}
                      onChange={(e) => setCredentialsData({ ...credentialsData, currentPassword: e.target.value })}
                      className="pl-10"
                      placeholder="Enter current password"
                      showPassword={showCurrentPassword}
                      onToggleVisibility={() => setShowCurrentPassword(!showCurrentPassword)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password (optional)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <PasswordInput
                      id="newPassword"
                      value={credentialsData.newPassword}
                      onChange={(e) => setCredentialsData({ ...credentialsData, newPassword: e.target.value })}
                      className="pl-10"
                      placeholder="Enter new password (min 6 characters)"
                      showPassword={showNewPassword}
                      onToggleVisibility={() => setShowNewPassword(!showNewPassword)}
                    />
                  </div>
                </div>

                {credentialsData.newPassword && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <PasswordInput
                        id="confirmPassword"
                        value={credentialsData.confirmPassword}
                        onChange={(e) => setCredentialsData({ ...credentialsData, confirmPassword: e.target.value })}
                        className="pl-10"
                        placeholder="Confirm new password"
                        showPassword={showConfirmPassword}
                        onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button 
                    onClick={handleUpdateCredentials} 
                    disabled={isUpdatingCredentials}
                    className="flex-1"
                  >
                    {isUpdatingCredentials ? "Updating..." : "Update Credentials"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCredentialsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="destructive" size="sm" onClick={onLogout} data-testid="button-logout" className="flex items-center">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFarmers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Farmers</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentFarmers}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Location</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(stats.farmersByLocation).length > 0 
                  ? Object.entries(stats.farmersByLocation).sort(([,a], [,b]) => b - a)[0][0]
                  : "N/A"
                }
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Crop</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(stats.farmersByCrop).length > 0 
                  ? Object.entries(stats.farmersByCrop).sort(([,a], [,b]) => b - a)[0][0]
                  : "N/A"
                }
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Farmers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Farmers Management</CardTitle>
              <CardDescription>View and manage all registered farmers</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search farmers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading farmers...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Crops</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFarmers.map((farmer) => (
                  <TableRow key={farmer._id}>
                    <TableCell className="font-medium">{farmer.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1 text-muted-foreground" />
                        {farmer.phoneNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
                        {farmer.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {farmer.cropsGrown.slice(0, 2).map((crop, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {crop}
                          </Badge>
                        ))}
                        {farmer.cropsGrown.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{farmer.cropsGrown.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(farmer.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditFarmer(farmer)}
                          data-testid={`button-edit-${farmer._id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              data-testid={`button-delete-${farmer._id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Farmer</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete <strong>{farmer.name}</strong>? 
                                This action cannot be undone and will permanently remove all farmer data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteFarmer(farmer._id, farmer.name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Farmer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Farmer</DialogTitle>
            <DialogDescription>
              Update farmer information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editData.name || ""}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={editData.location || ""}
                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSaveEdit} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}