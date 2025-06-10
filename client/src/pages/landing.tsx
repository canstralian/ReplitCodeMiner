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
            <Button onClick={handleLogin} className="bg-replit-orange hover:bg-orange-600">
              Connect to Replit
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Find Duplicate Code
            <span className="block text-replit-orange mt-1 sm:mt-2">Across Your Repls</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl lg:max-w-3xl mx-auto px-2 leading-relaxed">
            Connect your Replit account to automatically scan all your projects, identify duplicate code patterns, 
            and discover opportunities to optimize your codebase.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-replit-orange hover:bg-orange-600 text-white px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg w-full sm:w-auto max-w-xs sm:max-w-none"
          >
            Get Started Free
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-12 sm:mt-20">
          <Card className="bg-navy-dark border-gray-700 hover:border-replit-orange transition-colors p-4 sm:p-6">
            <CardHeader className="pb-3 sm:pb-4">
              <Search className="w-6 h-6 sm:w-8 sm:h-8 text-accent-blue mb-1 sm:mb-2" />
              <CardTitle className="text-white text-lg sm:text-xl">Smart Analysis</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
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
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-replit-orange hover:bg-orange-600 text-white px-8 py-4 text-lg"
          >
            Connect to Replit Now
          </Button>
        </div>
      </div>
    </div>
  );
}
