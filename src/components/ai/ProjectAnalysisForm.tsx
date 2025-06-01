
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Globe, Search, TrendingUp, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

interface AnalysisResult {
  score: number;
  status: 'analyzing' | 'completed' | 'error';
  metrics: {
    technology: number;
    community: number;
    tokenomics: number;
    risk: number;
  };
  insights: string[];
  risks: string[];
}

const ProjectAnalysisForm = () => {
  const [projectName, setProjectName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!projectName || !websiteUrl) return;

    setIsAnalyzing(true);
    setAnalysisResult({
      score: 0,
      status: 'analyzing',
      metrics: { technology: 0, community: 0, tokenomics: 0, risk: 0 },
      insights: [],
      risks: []
    });

    // Simulate analysis process
    setTimeout(() => {
      const mockResult: AnalysisResult = {
        score: Math.floor(Math.random() * 40) + 60, // 60-100 range
        status: 'completed',
        metrics: {
          technology: Math.floor(Math.random() * 30) + 70,
          community: Math.floor(Math.random() * 40) + 50,
          tokenomics: Math.floor(Math.random() * 35) + 65,
          risk: Math.floor(Math.random() * 50) + 30,
        },
        insights: [
          'Strong technical implementation detected',
          'Active community engagement on social platforms',
          'Transparent tokenomics structure',
          'Regular development updates'
        ],
        risks: [
          'Limited exchange listings',
          'Relatively new project (high volatility)',
          'Concentrated token distribution'
        ]
      };

      setAnalysisResult(mockResult);
      setIsAnalyzing(false);
    }, 3000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      <div className="space-y-3">
        <div>
          <Label htmlFor="projectName" className="text-slate-300 text-sm">Project Name</Label>
          <Input
            id="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g., Ethereum, Solana, etc."
            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
          />
        </div>

        <div>
          <Label htmlFor="websiteUrl" className="text-slate-300 text-sm">Website URL</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="websiteUrl"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://project-website.com"
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 pl-10"
            />
          </div>
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={!projectName || !websiteUrl || isAnalyzing}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Analyze Project
            </>
          )}
        </Button>
      </div>

      {analysisResult && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Analysis Result</h3>
              <Badge 
                variant={analysisResult.status === 'completed' ? 'default' : 'secondary'}
                className={analysisResult.status === 'completed' ? 'bg-green-500/20 text-green-400' : ''}
              >
                {analysisResult.status === 'analyzing' ? 'Processing...' : 'Completed'}
              </Badge>
            </div>

            {analysisResult.status === 'completed' && (
              <>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(analysisResult.score)}`}>
                    {analysisResult.score}/100
                  </div>
                  <p className="text-slate-400 text-sm">Overall Score</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Technology</span>
                    <span className="text-white">{analysisResult.metrics.technology}%</span>
                  </div>
                  <Progress value={analysisResult.metrics.technology} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Community</span>
                    <span className="text-white">{analysisResult.metrics.community}%</span>
                  </div>
                  <Progress value={analysisResult.metrics.community} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Tokenomics</span>
                    <span className="text-white">{analysisResult.metrics.tokenomics}%</span>
                  </div>
                  <Progress value={analysisResult.metrics.tokenomics} className="h-2" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-white text-sm font-medium flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-400" />
                    Key Insights
                  </h4>
                  <div className="space-y-1">
                    {analysisResult.insights.map((insight, index) => (
                      <p key={index} className="text-slate-300 text-xs">• {insight}</p>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-white text-sm font-medium flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4 text-yellow-400" />
                    Risk Factors
                  </h4>
                  <div className="space-y-1">
                    {analysisResult.risks.map((risk, index) => (
                      <p key={index} className="text-slate-300 text-xs">• {risk}</p>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectAnalysisForm;
