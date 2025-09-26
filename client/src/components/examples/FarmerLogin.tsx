import FarmerLogin from '../FarmerLogin';

export default function FarmerLoginExample() {
  const handleLogin = (phoneNumber: string, passcode: string) => {
    console.log('Login attempted with:', { phoneNumber, passcode });
    // In real implementation, this would authenticate the farmer
  };

  return <FarmerLogin onLogin={handleLogin} />;
}