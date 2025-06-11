import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code2, Search, GitBranch, Zap, Shield, Clock } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            <Zap className="h-3 w-3 mr-1" />
            Powered by AI Analysis
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Find Duplicate Code Patterns
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Analyze your Replit projects to identify duplicate code patterns, 
            improve code quality, and accelerate development with intelligent refactoring suggestions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                <Code2 className="h-5 w-5 mr-2" />
                Start Analysis
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <GitBranch className="h-5 w-5 mr-2" />
              View Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Key Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive code analysis tools to help you maintain clean, efficient codebases
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <Search className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Smart Detection</CardTitle>
              <CardDescription>
                Advanced pattern recognition to find exact and similar code duplicates across your projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Function-level analysis</li>
                <li>• Cross-file detection</li>
                <li>• Semantic similarity matching</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <Code2 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Refactoring Suggestions</CardTitle>
              <CardDescription>
                AI-powered recommendations to extract common patterns into reusable components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Extract functions</li>
                <li>• Create modules</li>
                <li>• Template generation</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Quality Metrics</CardTitle>
              <CardDescription>
                Comprehensive code quality analysis with maintainability scores and technical debt tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Complexity analysis</li>
                <li>• Security issue detection</li>
                <li>• Performance recommendations</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-muted/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Clean Your Code?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect your Replit account and start analyzing your projects in minutes
          </p>
          <Link href="/dashboard">
            <Button size="lg">
              <Clock className="h-5 w-5 mr-2" />
              Get Started Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}