
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Code2, Check, ArrowRight, Star } from "lucide-react";

export default function Signup() {
  const handleSignup = () => {
    window.location.href = "/api/login";
  };

  const features = [
    "Scan all your Replit projects",
    "Advanced duplicate code detection",
    "Cross-project pattern analysis",
    "Side-by-side code comparison",
    "Export analysis reports",
    "Priority support"
  ];

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
            <Button 
              onClick={() => window.location.href = "/"}
              variant="ghost"
              className="text-gray-300 hover:text-white"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Star className="text-replit-orange text-3xl mr-2" />
            <h1 className="text-4xl font-bold text-white">Start Your Free Trial</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get full access to Replit Project Analyzer for 14 days. No credit card required.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Trial Plan Card */}
          <Card className="bg-navy-dark border-2 border-replit-orange relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-replit-orange text-white px-3 py-1 text-sm font-medium">
              POPULAR
            </div>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-white mb-2">
                14-Day Free Trial
              </CardTitle>
              <div className="text-4xl font-bold text-replit-orange mb-2">
                $0
                <span className="text-lg font-normal text-gray-400">/14 days</span>
              </div>
              <p className="text-gray-300">
                Then $29/month, cancel anytime
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="text-success-green h-5 w-5 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={handleSignup}
                className="w-full bg-replit-orange hover:bg-orange-600 text-white py-3 text-lg font-semibold"
                size="lg"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <p className="text-center text-sm text-gray-400">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardContent>
          </Card>

          {/* Benefits Card */}
          <div className="space-y-6">
            <Card className="bg-navy-dark border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Code2 className="text-accent-blue mr-2 h-6 w-6" />
                  Why Choose Our Analyzer?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-1">Save Development Time</h4>
                    <p className="text-gray-300 text-sm">
                      Quickly identify reusable code patterns across all your projects
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Improve Code Quality</h4>
                    <p className="text-gray-300 text-sm">
                      Eliminate duplicate code and create cleaner, more maintainable projects
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Seamless Integration</h4>
                    <p className="text-gray-300 text-sm">
                      Works directly with your Replit account - no additional setup required
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-replit-orange/10 to-accent-blue/10 border-gray-700">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    🚀 Get Started in Seconds
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Connect your Replit account and we'll automatically scan your projects
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                    <span>✓ No downloads</span>
                    <span>•</span>
                    <span>✓ No configuration</span>
                    <span>•</span>
                    <span>✓ Instant results</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-navy-dark border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-2">
                  Is the trial really free?
                </h4>
                <p className="text-gray-300 text-sm">
                  Yes! No credit card required. You get full access to all features for 14 days.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-navy-dark border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-2">
                  What happens after the trial?
                </h4>
                <p className="text-gray-300 text-sm">
                  You can choose to continue with a paid plan or your account will revert to limited free access.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-navy-dark border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-2">
                  Can I cancel anytime?
                </h4>
                <p className="text-gray-300 text-sm">
                  Absolutely! Cancel your subscription at any time with no questions asked.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-navy-dark border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-2">
                  Is my code secure?
                </h4>
                <p className="text-gray-300 text-sm">
                  Yes! We use Replit's secure API and never store your actual code content.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
