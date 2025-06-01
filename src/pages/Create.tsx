
import DEXLayout from '@/components/layout/DEXLayout';
import TokenCreator from '@/components/create/TokenCreator';
import { Badge } from '@/components/ui/badge';
import { Rocket } from 'lucide-react';

const Create = () => {
  return (
    <DEXLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Rocket className="mr-3 h-8 w-8 text-emerald-400" />
              Create Token
            </h1>
            <p className="text-slate-400 mt-2">Launch your token with automated bonding curves and instant trading</p>
          </div>
          <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
            Auto-Listed
          </Badge>
        </div>

        <TokenCreator />
      </div>
    </DEXLayout>
  );
};

export default Create;
