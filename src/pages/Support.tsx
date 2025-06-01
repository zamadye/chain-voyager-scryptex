
import DEXLayout from '@/components/layout/DEXLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Book, 
  Video,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  ExternalLink,
  Users,
  FileText
} from 'lucide-react';
import { useState } from 'react';

const Support = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

  const faqs = [
    {
      question: "How do I create a token on SCRYPTEX?",
      answer: "Go to the Create page, fill in your token details, configure bonding curve parameters, and deploy to your chosen chain.",
      category: "Token Creation"
    },
    {
      question: "What are STEX points and how do I earn them?",
      answer: "STEX points are rewards for platform activity. Earn them through daily GM posts (10 points), swaps (30 for 3x), bridges (50 for 2x), and token creation (100 points).",
      category: "Points System"
    },
    {
      question: "How does the referral system work?",
      answer: "Share your referral link with friends. When they join and complete their first transaction, you both get 50 STEX points plus you earn 5% of their future points.",
      category: "Referrals"
    },
    {
      question: "Which chains are supported for bridging?",
      answer: "SCRYPTEX supports Ethereum, Nexus, 0G, Somnia, Aztec, RiseChain, and MegaETH for cross-chain bridging.",
      category: "Bridging"
    },
    {
      question: "How are trading fees calculated?",
      answer: "Trading fees are determined by the bonding curve of each token, typically ranging from 0.3% to 1% depending on the token configuration.",
      category: "Trading"
    },
    {
      question: "What is the GM ritual?",
      answer: "The GM ritual is a daily community engagement feature where you can post 'Good Morning' messages on any chain to earn 10 STEX points per day.",
      category: "Community"
    }
  ];

  const supportChannels = [
    {
      title: "Discord Community",
      description: "Join our active community for real-time help",
      icon: Users,
      link: "https://discord.gg/scryptex",
      status: "online"
    },
    {
      title: "Documentation",
      description: "Comprehensive guides and tutorials",
      icon: Book,
      link: "/docs",
      status: "available"
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step video guides",
      icon: Video,
      link: "/tutorials",
      status: "available"
    },
    {
      title: "Email Support",
      description: "Direct email support for complex issues",
      icon: Mail,
      link: "mailto:support@scryptex.io",
      status: "available"
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DEXLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <HelpCircle className="mr-3 h-8 w-8 text-blue-400" />
              Help & Support
            </h1>
            <p className="text-slate-400 mt-2">Get help with SCRYPTEX platform features and troubleshooting</p>
          </div>
        </div>

        {/* Search */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help articles, guides, and FAQs..."
                className="pl-10 bg-slate-800 border-slate-700 text-white text-lg py-3"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Support Channels */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Get Help</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {supportChannels.map((channel, index) => {
                    const Icon = channel.icon;
                    return (
                      <div key={index} className="bg-slate-800/50 rounded-lg p-4 hover:bg-slate-800/70 transition-colors">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Icon className="h-5 w-5 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-white">{channel.title}</h3>
                              <Badge variant={channel.status === 'online' ? 'default' : 'outline'} className="text-xs">
                                {channel.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-400 mt-1">{channel.description}</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-3 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                              asChild
                            >
                              <a href={channel.link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Visit
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* FAQs */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredFaqs.map((faq, index) => (
                    <div key={index} className="bg-slate-800/30 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-white">{faq.question}</h3>
                            <Badge variant="outline" className="text-xs">
                              {faq.category}
                            </Badge>
                          </div>
                          <p className="text-slate-300">{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredFaqs.length === 0 && searchQuery && (
                    <div className="text-center text-slate-400 py-8">
                      No FAQs found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5 text-green-400" />
                  Submit Support Ticket
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Subject</Label>
                  <Input
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Brief description of your issue"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Category</Label>
                  <select className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white">
                    <option value="">Select a category</option>
                    <option value="trading">Trading Issues</option>
                    <option value="wallet">Wallet Connection</option>
                    <option value="tokens">Token Creation</option>
                    <option value="bridge">Bridging Problems</option>
                    <option value="points">STEX Points</option>
                    <option value="referrals">Referral System</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Message</Label>
                  <textarea
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    className="w-full h-32 px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-400 resize-none"
                  />
                </div>

                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Ticket
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Support Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Platform Status</span>
                  <Badge className="bg-green-500/20 text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Response Time</span>
                  <span className="text-cyan-400">~2 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Discord Active</span>
                  <Badge className="bg-green-500/20 text-green-400">
                    Online
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white">
                  <FileText className="h-4 w-4 mr-2" />
                  Platform Documentation
                </Button>
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white">
                  <Video className="h-4 w-4 mr-2" />
                  Video Tutorials
                </Button>
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white">
                  <Users className="h-4 w-4 mr-2" />
                  Community Guidelines
                </Button>
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Report a Bug
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-blue-900/20 border-blue-800">
              <CardHeader>
                <CardTitle className="text-white">Need Immediate Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm mb-3">
                  For urgent issues or live support, join our Discord community where our team and community members are ready to help.
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Users className="h-4 w-4 mr-2" />
                  Join Discord
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DEXLayout>
  );
};

export default Support;
