
import React from 'react';
import DEXLayout from '@/components/layout/DEXLayout';
import { EnterpriseDashboard } from '@/components/enterprise/EnterpriseDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Shield, Bot, TrendingUp, Globe, BarChart3 } from 'lucide-react';

const Enterprise = () => {
  const enterpriseFeatures = [
    {
      icon: <Building2 className="h-8 w-8 text-blue-400" />,
      title: "Institutional Accounts",
      description: "Multi-user hierarchies with role-based permissions and trading limits",
      status: "Active"
    },
    {
      icon: <Shield className="h-8 w-8 text-green-400" />,
      title: "Regulatory Compliance",
      description: "Automated compliance monitoring, reporting, and audit trails",
      status: "Active"
    },
    {
      icon: <Bot className="h-8 w-8 text-purple-400" />,
      title: "AI/ML Trading",
      description: "Quantitative strategies, ML models, and portfolio optimization",
      status: "Active"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-cyan-400" />,
      title: "Market Making",
      description: "Liquidity provision strategies with risk management",
      status: "Active"
    },
    {
      icon: <Globe className="h-8 w-8 text-orange-400" />,
      title: "White-Label Platform",
      description: "Customizable platform solutions for brokers and institutions",
      status: "Active"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-red-400" />,
      title: "Business Intelligence",
      description: "Advanced analytics, reporting, and executive dashboards",
      status: "Active"
    }
  ];

  return (
    <DEXLayout>
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Building2 className="h-12 w-12 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">
              Enterprise Platform
            </h1>
          </div>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Institutional-grade trading platform with comprehensive compliance, 
            AI-powered strategies, and enterprise-level security
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="outline" className="border-green-500/50 text-green-400">
              SOC2 Compliant
            </Badge>
            <Badge variant="outline" className="border-blue-500/50 text-blue-400">
              ISO27001 Certified
            </Badge>
            <Badge variant="outline" className="border-purple-500/50 text-purple-400">
              Enterprise Ready
            </Badge>
          </div>
        </div>

        {/* Enterprise Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enterpriseFeatures.map((feature, index) => (
            <Card key={index} className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:border-slate-700 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {feature.icon}
                    <CardTitle className="text-white text-lg">
                      {feature.title}
                    </CardTitle>
                  </div>
                  <Badge 
                    variant={feature.status === 'Active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {feature.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enterprise Dashboard */}
        <div className="space-y-6">
          <div className="border-t border-slate-800 pt-8">
            <EnterpriseDashboard />
          </div>
        </div>

        {/* Platform Architecture */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Platform Architecture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Core Infrastructure</h3>
                <div className="space-y-2 text-slate-300">
                  <div>• Multi-chain blockchain integration</div>
                  <div>• Real-time trading engine</div>
                  <div>• Advanced order management</div>
                  <div>• Risk management system</div>
                  <div>• Compliance monitoring</div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Enterprise Features</h3>
                <div className="space-y-2 text-slate-300">
                  <div>• Institutional account management</div>
                  <div>• AI/ML trading algorithms</div>
                  <div>• Market making strategies</div>
                  <div>• Regulatory reporting</div>
                  <div>• Business intelligence</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DEXLayout>
  );
};

export default Enterprise;
