
import ChainFirstLayout from '@/components/navigation/ChainFirstLayout';

const Index = () => {
  return (
    <ChainFirstLayout>
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">
          Welcome to Scryptex
        </h2>
        <p className="text-gray-400">
          Select a blockchain to get started with your multi-chain automation journey
        </p>
      </div>
    </ChainFirstLayout>
  );
};

export default Index;
