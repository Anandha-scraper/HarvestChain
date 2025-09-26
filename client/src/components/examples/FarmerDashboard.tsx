import FarmerDashboard from '../FarmerDashboard';

export default function FarmerDashboardExample() {
  const mockFarmer = {
    id: "farmer-1",
    name: "Ravi Kumar",
    phoneNumber: "9876543210",
    aadharNumber: "1234-5678-9012",
    place: "Mysore, Karnataka",
    cropsGrown: ["Rice", "Wheat", "Sugarcane"]
  };

  const handleGenerateQR = () => {
    console.log('Navigate to QR generation');
  };

  const handleViewHistory = () => {
    console.log('Navigate to history view');
  };

  const handleLogout = () => {
    console.log('Logout triggered');
  };

  return (
    <FarmerDashboard
      farmer={mockFarmer}
      onGenerateQR={handleGenerateQR}
      onViewHistory={handleViewHistory}
      onLogout={handleLogout}
    />
  );
}