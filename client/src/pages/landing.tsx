import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Code2, Search, GitBranch, Zap } from "lucide-react";
import { Link } from "next/link";
import { Play } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-editor-dark">
      {/* Header */}
      <header className="bg-navy-dark border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Code2 className="text-replit-orange text-2xl" />
              <h1 className="text-xl font-semibold text-white">Replit Project Analyzer</h1>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={() => window.location.href = "/signup"}
                variant="outline" 
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                Start Free Trial
              </Button>
              <Button onClick={handleLogin} className="bg-replit-orange hover:bg-orange-600">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
            Find Duplicate Code
            <span className="text-replit-orange"> Instantly</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8 leading-relaxed">
            Automatically scan your Replit projects to identify duplicate code patterns, 
            optimize your codebase, and improve development efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Link href="/auth/replit">
              <Button size="lg" className="bg-replit-orange hover:bg-orange-600 text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg w-full sm:w-auto">
                <Code2 className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Connect with Replit
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-gray-600 text-gray-300 hover:bg-editor-dark px-6 md:px-8 py-3 md:py-4 text-base md:text-lg w-full sm:w-auto">
              <Play className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto px-4">
          <Card className="bg-navy-dark border-gray-700 hover:border-replit-orange transition-colors">
            <CardHeader>
              <Search className="w-6 h-6 md:w-8 md:h-8 text-accent-blue mb-2" />
              <CardTitle className="text-white text-lg md:text-xl">Smart Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm md:text-base">
                Advanced pattern matching algorithms to find exact and similar code duplicates across all your projects.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-navy-dark border-gray-700 hover:border-replit-orange transition-colors">
            <CardHeader>
              <GitBranch className="w-8 h-8 text-success-green mb-2" />
              <CardTitle className="text-white">Cross-Project Search</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Search for specific patterns, functions, or themes across all your Replit projects at once.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-navy-dark border-gray-700 hover:border-replit-orange transition-colors">
            <CardHeader>
              <Code2 className="w-8 h-8 text-replit-orange mb-2" />
              <CardTitle className="text-white">Side-by-Side Compare</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Visual comparison interface with syntax highlighting to review similar code blocks.
              </p>
            </CardContent>
          </Card>

          
        </div>

        {/* Stats Section */}
        <div className="mt-20 text-center">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-replit-orange mb-2">50+</div>
              <div className="text-gray-300">File Types Supported</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent-blue mb-2">95%</div>
              <div className="text-gray-300">Pattern Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-success-green mb-2">10s</div>
              <div className="text-gray-300">Average Scan Time</div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-300 text-lg">
              Choose the plan that works for your development needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Trial */}
            <Card className="bg-navy-dark border-gray-700 relative">
              <CardHeader>
                <CardTitle className="text-white text-xl">Free Trial</CardTitle>
                <div className="text-3xl font-bold text-replit-orange">$0</div>
                <p className="text-gray-300">7 days free</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center">
                    <Code2 className="w-4 h-4 text-success-green mr-2" />
                    Up to 5 projects
                  </li>
                  <li className="flex items-center">
                    <Code2 className="w-4 h-4 text-success-green mr-2" />
                    Basic duplicate detection
                  </li>
                  <li className="flex items-center">
                    <Code2 className="w-4 h-4 text-success-green mr-2" />
                    Pattern comparison
                  </li>
                  <li className="flex items-center">
                    <Code2 className="w-4 h-4 text-success-green mr-2" />
                    Export results
                  </li>
                </ul>
                <Button 
                  onClick={() => window.location.href = "/signup"}
                  className="w-full mt-6 bg-replit-orange hover:bg-orange-600"
                >
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="bg-navy-dark border-replit-orange relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-replit-orange text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-white text-xl">Pro</CardTitle>
                <div className="text-3xl font-bold text-replit-orange">$9</div>
                <p className="text-gray-300">per month</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center">
                    <Code2 className="w-4 h-4 text-success-green mr-2" />
                    Unlimited projects
                  </li>
                  <li className="flex items-center">
                    <Code2 className="w-4 h-4 text-success-green mr-2" />
                    Advanced pattern analysis
                  </li>
                  <li className="flex items-center">
                    <Code2 className="w-4 h-4 text-success-green mr-2" />
                    Real-time notifications
                  </li>
                  <li className="flex items-center">
                    <Code2 className="w-4 h-4 text-success-green mr-2" />
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <Code2 className="w-4 h-4 text-success-green mr-2" />
                    API access
                  </li>
                </ul>
                <Button 
                  onClick={handleLogin}
                  className="w-full mt-6 bg-replit-orange hover:bg-orange-600"
                >
                  Get Pro
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="bg-navy-dark border-gray-700 relative">
              <CardHeader>
                <CardTitle className="text-white text-xl">Enterprise</CardTitle>
                <div className="text-3xl font-bold text-replit-orange">$29</div>
                <p className="text-gray-300">per month</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center">
                    <Code2 className="w-4 h-4 text-success-green mr-2" />
                    Everything in Pro
                  </li>
                  <li className="flex items-center">
                    <Code2 className="w-4 h-4 text-success-green mr-2" />
                    Team collaboration
                  </li>
                  <li className="flex items-center">
                    <Code2 className="w-4 h-4 text-success-green mr-2" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center">
                    <Code2 className="w-4 h-4 text-success-green mr-2" />
                    Custom integrations
                  </li>
                  <li className="flex items-center">
                    <Code2 className="w-4 h-4 text-success-green mr-2" />
                    Dedicated support
                  </li>
                </ul>
                <Button 
                  onClick={handleLogin}
                  variant="outline"
                  className="w-full mt-6 border-gray-600 text-white hover:bg-gray-700"
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-navy-dark rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Optimize Your Code?
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Connect your Replit account and start discovering duplicate patterns in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = "/signup"}
              size="lg"
              className="bg-replit-orange hover:bg-orange-600 text-white px-8 py-4 text-lg"
            >
              Start Free Trial
            </Button>
            <Button 
              onClick={handleLogin}
              size="lg"
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-700 px-8 py-4 text-lg"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}