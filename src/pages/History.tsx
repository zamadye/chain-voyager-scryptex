
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/stores/useAppStore';
import { SUPPORTED_CHAINS } from '@/lib/chains';
import { history, Search, Filter, ExternalLink, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';

const History = () => {
  const { deployments, swaps, gmPosts } = useAppStore();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const allTransactions = [
    ...deployments.map(d => ({
      ...d,
      type: 'deployment' as const,
      title: `Deploy ${d.contractName}`,
      chain: Object.values(SUPPORTED_CHAINS).find(c => c.id === d.chainId)?.name || 'Unknown'
    })),
    ...swaps.map(s => ({
      ...s,
      type: 'swap' as const,
      title: `Swap ${s.amount} ${s.fromToken} → ${s.toToken}`,
      chain: Object.values(SUPPORTED_CHAINS).find(c => c.id === s.chainId)?.name || 'Unknown'
    })),
    ...gmPosts.map(g => ({
      ...g,
      type: 'gm' as const,
      title: 'GM Post',
      chain: Object.values(SUPPORTED_CHAINS).find(c => c.id === g.chainId)?.name || 'Unknown'
    }))
  ].sort((a, b) => b.timestamp - a.timestamp);

  const filteredTransactions = allTransactions.filter(tx => {
    const matchesFilter = filter === 'all' || tx.type === filter;
    const matchesSearch = searchTerm === '' || 
      tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.chain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.txHash?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'pending':
        return <Loader className="h-4 w-4 text-yellow-400 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/50">Failed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deployment':
        return 'text-purple-400';
      case 'swap':
        return 'text-blue-400';
      case 'gm':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const stats = {
    total: allTransactions.length,
    completed: allTransactions.filter(tx => tx.status === 'completed').length,
    pending: allTransactions.filter(tx => tx.status === 'pending').length,
    failed: allTransactions.filter(tx => tx.status === 'failed').length
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <history className="mr-3 h-8 w-8 text-orange-400" />
              Transaction History
            </h1>
            <p className="text-gray-400 mt-2">View all your blockchain activities across chains</p>
          </div>
          <Badge variant="outline" className="border-orange-500/50 text-orange-400">
            {stats.total} Transactions
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-gray-400 text-sm">Total</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
              <div className="text-gray-400 text-sm">Completed</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
              <div className="text-gray-400 text-sm">Pending</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{stats.failed}</div>
              <div className="text-gray-400 text-sm">Failed</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="deployment">Deployments</SelectItem>
                    <SelectItem value="swap">Swaps</SelectItem>
                    <SelectItem value="gm">GM Posts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction List */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-lg">No transactions found</div>
                  <p className="text-gray-500 text-sm mt-2">
                    {searchTerm || filter !== 'all' 
                      ? 'Try adjusting your filters or search term'
                      : 'Start using the platform to see your transaction history here'
                    }
                  </p>
                </div>
              ) : (
                filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors border border-gray-700"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(tx.status)}
                        <div className={`text-sm font-medium capitalize ${getTypeColor(tx.type)}`}>
                          {tx.type}
                        </div>
                      </div>
                      <div>
                        <div className="text-white font-medium">{tx.title}</div>
                        <div className="text-gray-400 text-sm">
                          {tx.chain} • {new Date(tx.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(tx.status)}
                      {tx.txHash && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="text-gray-400 hover:text-white"
                        >
                          <a 
                            href={`${SUPPORTED_CHAINS[Object.keys(SUPPORTED_CHAINS).find(k => SUPPORTED_CHAINS[k].id === tx.chainId)]?.blockExplorer}/tx/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default History;
