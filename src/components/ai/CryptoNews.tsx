
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Newspaper, ExternalLink, Clock, TrendingUp } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  timestamp: string;
  category: 'bullish' | 'bearish' | 'neutral';
  url: string;
}

const CryptoNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching news data
    setTimeout(() => {
      const mockNews: NewsItem[] = [
        {
          id: '1',
          title: 'Bitcoin Reaches New Monthly High',
          summary: 'BTC surges past $45K as institutional adoption continues to grow.',
          source: 'CryptoDaily',
          timestamp: '2 hours ago',
          category: 'bullish',
          url: '#'
        },
        {
          id: '2',
          title: 'Ethereum 2.0 Staking Rewards Increase',
          summary: 'ETH staking yields reach 5.2% as more validators join the network.',
          source: 'BlockchainNews',
          timestamp: '4 hours ago',
          category: 'bullish',
          url: '#'
        },
        {
          id: '3',
          title: 'DeFi TVL Drops 3% This Week',
          summary: 'Total Value Locked in DeFi protocols sees slight decline amid market uncertainty.',
          source: 'DeFiPulse',
          timestamp: '6 hours ago',
          category: 'bearish',
          url: '#'
        },
        {
          id: '4',
          title: 'New Regulations Proposed for Crypto',
          summary: 'Government announces framework for digital asset compliance.',
          source: 'RegulatoryWatch',
          timestamp: '8 hours ago',
          category: 'neutral',
          url: '#'
        },
        {
          id: '5',
          title: 'Major Exchange Lists New Altcoins',
          summary: 'Three promising projects get listed on top-tier exchange.',
          source: 'ExchangeNews',
          timestamp: '12 hours ago',
          category: 'bullish',
          url: '#'
        }
      ];
      setNews(mockNews);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bullish':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'bearish':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bullish':
        return <TrendingUp className="h-3 w-3" />;
      case 'bearish':
        return <TrendingUp className="h-3 w-3 rotate-180" />;
      default:
        return <Newspaper className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Newspaper className="h-8 w-8 text-purple-400 animate-pulse mx-auto mb-2" />
          <p className="text-slate-400 text-sm">Loading crypto news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium text-sm flex items-center">
          <Newspaper className="mr-2 h-4 w-4 text-purple-400" />
          Latest Crypto News
        </h3>
        <Badge variant="outline" className="border-purple-500/50 text-purple-400 text-xs">
          Live Feed
        </Badge>
      </div>

      {news.map((item) => (
        <Card key={item.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-white text-sm font-medium leading-tight line-clamp-2">
                  {item.title}
                </h4>
                <Badge className={`${getCategoryColor(item.category)} text-xs flex items-center gap-1 shrink-0`}>
                  {getCategoryIcon(item.category)}
                  {item.category}
                </Badge>
              </div>
              
              <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">
                {item.summary}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-slate-400">
                  <Clock className="mr-1 h-3 w-3" />
                  {item.timestamp}
                  <span className="mx-2">•</span>
                  {item.source}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-slate-400 hover:text-white"
                  onClick={() => window.open(item.url, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Button 
        variant="outline" 
        className="w-full border-slate-600 text-slate-300 hover:text-white text-xs"
      >
        Load More News
      </Button>
    </div>
  );
};

export default CryptoNews;
