import QRScanner from '../QRScanner';

export default function QRScannerExample() {
  const handleStatusUpdate = (qrCode: string, newStatus: string, price?: string) => {
    console.log('Status update:', { qrCode, newStatus, price });
    // In real implementation, this would update the backend
  };

  return (
    <QRScanner
      userType="retailer"
      onStatusUpdate={handleStatusUpdate}
    />
  );
}