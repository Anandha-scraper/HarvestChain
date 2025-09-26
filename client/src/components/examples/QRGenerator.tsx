import QRGenerator from '../QRGenerator';

export default function QRGeneratorExample() {
  const handleBack = () => {
    console.log('Navigate back to dashboard');
  };

  const handleUploadToIPFS = (batchData: any) => {
    console.log('Upload to IPFS:', batchData);
    // In real implementation, this would upload to IPFS
  };

  return (
    <QRGenerator
      farmerName="Ravi Kumar"
      onBack={handleBack}
      onUploadToIPFS={handleUploadToIPFS}
    />
  );
}