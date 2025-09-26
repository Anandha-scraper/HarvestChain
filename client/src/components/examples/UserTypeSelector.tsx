import UserTypeSelector from '../UserTypeSelector';

export default function UserTypeSelectorExample() {
  const handleSelectUserType = (userType: "farmer" | "retailer" | "consumer") => {
    console.log('Selected user type:', userType);
    // In real implementation, this would navigate to the appropriate flow
  };

  return <UserTypeSelector onSelectUserType={handleSelectUserType} />;
}