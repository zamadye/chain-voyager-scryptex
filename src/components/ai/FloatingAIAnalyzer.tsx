
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, X, Minimize2, Maximize2 } from 'lucide-react';
import ProjectAnalysisForm from './ProjectAnalysisForm';
import MarketAnalysis from './MarketAnalysis';
import CryptoNews from './CryptoNews';

const FloatingAIAnalyzer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) {
    return (
      <div className="fixed bottom-20 right-6 z-50 md:bottom-6">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
          size="icon"
        >
          <Brain className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed ${isMinimized ? 'bottom-20 right-6' : 'top-4 right-4 bottom-4'} z-50 md:bottom-6 transition-all duration-300`}>
      <Card className={`bg-slate-900/95 backdrop-blur-lg border-slate-700 shadow-2xl ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      } transition-all duration-300`}>
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-white text-sm">AI Market Analyzer</CardTitle>
            <Badge variant="outline" className="border-green-500/50 text-green-400 text-xs">
              LIVE
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-white"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 h-full overflow-hidden">
            <Tabs defaultValue="project" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800 mx-4 mb-2">
                <TabsTrigger value="project" className="text-xs">Project</TabsTrigger>
                <TabsTrigger value="market" className="text-xs">Market</TabsTrigger>
                <TabsTrigger value="news" className="text-xs">News</TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-hidden px-4 pb-4">
                <TabsContent value="project" className="h-full m-0">
                  <ProjectAnalysisForm />
                </TabsContent>
                
                <TabsContent value="market" className="h-full m-0">
                  <MarketAnalysis />
                </TabsContent>
                
                <TabsContent value="news" className="h-full m-0">
                  <CryptoNews />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default FloatingAIAnalyzer;
