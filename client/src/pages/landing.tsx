import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code2, Search, GitBranch, Zap } from "lucide-react";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Find Duplicate Code
            <span className="block text-replit-orange">Across Your Repls</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Connect your Replit account to automatically scan all your projects, identify duplicate code patterns, 
            and discover opportunities to optimize your codebase.
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
              Sign In with Replit
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <Card className="bg-navy-dark border-gray-700 hover:border-replit-orange transition-colors">
            <CardHeader>
              <Search className="w-8 h-8 text-accent-blue mb-2" />
              <CardTitle className="text-white">Smart Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Advanced pattern recognition to detect similar code structures, functions, and components.
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

          <Card className="bg-navy-dark border-gray-700 hover:border-replit-orange transition-colors">
            <CardHeader>
              <Zap className="w-8 h-8 text-yellow-400 mb-2" />
              <CardTitle className="text-white">Instant Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Fast analysis powered by intelligent algorithms to quickly identify optimization opportunities.
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
