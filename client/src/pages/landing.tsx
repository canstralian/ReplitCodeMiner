
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  Code2, 
  Search, 
  Shield, 
  Zap, 
  Users, 
  CheckCircle, 
  Star,
  ArrowRight,
  Github,
  Twitter,
  ChevronDown,
  Menu,
  X,
  Play
} from "lucide-react";

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Code2,
      title: "Smart Code Analysis",
      description: "Advanced pattern detection using machine learning to identify duplicates across your entire codebase.",
      color: "text-accent-blue"
    },
    {
      icon: Search,
      title: "Intelligent Search",
      description: "Find similar code patterns, functions, and structures with our powerful semantic search engine.",
      color: "text-success-green"
    },
    {
      icon: Shield,
      title: "Security First",
      description: "Enterprise-grade security with end-to-end encryption and SOC 2 compliance for your code.",
      color: "text-replit-orange"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Analyze thousands of files in seconds with our optimized scanning algorithms and caching.",
      color: "text-warning-yellow"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior Developer at TechCorp",
      content: "This tool saved us weeks of manual code review. The duplicate detection is incredibly accurate.",
      avatar: "SC",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "CTO at StartupXYZ",
      content: "Game-changer for code quality. Our technical debt decreased by 40% in just two months.",
      avatar: "MR",
      rating: 5
    },
    {
      name: "Emily Johnson",
      role: "Lead Engineer at DevStudio",
      content: "The best investment we made for our development workflow. Highly recommended!",
      avatar: "EJ",
      rating: 5
    }
  ];

  const stats = [
    { number: "50K+", label: "Developers" },
    { number: "1M+", label: "Repos Analyzed" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-orange-50">
      {/* Skip Navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Header */}
      <header className="relative z-50 bg-white/80 backdrop-blur-md border-b border-gray-100" role="banner">
        <nav className="max-w-7xl mx-auto container-padding" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold text-gray-900">DuplicateDetector</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="nav-link">Features</a>
              <a href="#pricing" className="nav-link">Pricing</a>
              <a href="#testimonials" className="nav-link">Reviews</a>
              <a href="#contact" className="nav-link">Contact</a>
              <Link href="/signup">
                <Button className="btn-primary">
                  Get Started <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:bg-gray-100"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div id="mobile-menu" className="md:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="nav-link" onClick={() => setIsMenuOpen(false)}>Features</a>
                <a href="#pricing" className="nav-link" onClick={() => setIsMenuOpen(false)}>Pricing</a>
                <a href="#testimonials" className="nav-link" onClick={() => setIsMenuOpen(false)}>Reviews</a>
                <a href="#contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>Contact</a>
                <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button className="btn-primary w-full">Get Started</Button>
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      <main id="main-content">
        {/* Hero Section */}
        <section className="section-padding" aria-labelledby="hero-heading">
          <div className="max-w-7xl mx-auto container-padding text-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
              <Badge className="mb-6 px-4 py-2 bg-replit-orange/10 text-replit-orange border-replit-orange/20">
                ✨ New: AI-Powered Pattern Detection
              </Badge>
              
              <h1 id="hero-heading" className="mb-6 font-bold text-gray-900">
                Find Code Duplicates
                <span className="text-gradient"> Instantly</span>
              </h1>
              
              <p className="mb-8 text-gray-600 max-w-3xl mx-auto">
                Eliminate redundant code, improve maintainability, and boost your development velocity with our intelligent duplicate detection platform. Trusted by 50,000+ developers worldwide.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link href="/signup">
                  <Button size="lg" className="btn-primary text-lg px-8 py-4">
                    <Play className="w-5 h-5 mr-2" aria-hidden="true" />
                    Start Free Trial
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="btn-secondary text-lg px-8 py-4">
                  <Github className="w-5 h-5 mr-2" aria-hidden="true" />
                  View Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
                    <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="section-padding bg-white" aria-labelledby="features-heading">
          <div className="max-w-7xl mx-auto container-padding">
            <div className="text-center mb-16">
              <h2 id="features-heading" className="mb-4 font-bold text-gray-900">
                Powerful Features for Modern Development
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our comprehensive suite of tools helps you maintain clean, efficient code across all your projects.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="card-feature animate-slide-up"
                  style={{animationDelay: `${index * 150}ms`}}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-4 ${feature.color}`}>
                    <feature.icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="section-padding bg-gray-50" aria-labelledby="pricing-heading">
          <div className="max-w-7xl mx-auto container-padding">
            <div className="text-center mb-16">
              <h2 id="pricing-heading" className="mb-4 font-bold text-gray-900">
                Simple, Transparent Pricing
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Choose the plan that fits your needs. All plans include our core features with priority support.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Free Plan */}
              <Card className="card-interactive border-2 border-gray-200">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">Free</CardTitle>
                  <div className="text-4xl font-bold text-gray-900 mt-4">$0</div>
                  <p className="text-gray-600">per month</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {[
                      "Up to 3 projects",
                      "Basic duplicate detection",
                      "Community support",
                      "Public repositories only"
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-success-green mr-3 flex-shrink-0" aria-hidden="true" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button variant="outline" className="w-full btn-secondary">
                      Get Started Free
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card className="card-interactive border-2 border-replit-orange relative transform scale-105">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-replit-orange text-white px-4 py-2 shadow-lg">
                    Most Popular
                  </Badge>
                </div>
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">Pro</CardTitle>
                  <div className="text-4xl font-bold text-replit-orange mt-4">$9</div>
                  <p className="text-gray-600">per month</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {[
                      "Unlimited projects",
                      "Advanced pattern analysis",
                      "Real-time notifications",
                      "Priority support",
                      "Private repositories",
                      "Team collaboration"
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-success-green mr-3 flex-shrink-0" aria-hidden="true" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button className="w-full btn-primary">
                      Start Pro Trial
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Enterprise Plan */}
              <Card className="card-interactive border-2 border-gray-200">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">Enterprise</CardTitle>
                  <div className="text-4xl font-bold text-gray-900 mt-4">$29</div>
                  <p className="text-gray-600">per month</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {[
                      "Everything in Pro",
                      "Custom integrations",
                      "Advanced security",
                      "Dedicated support",
                      "SLA guarantee",
                      "Custom deployment"
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-success-green mr-3 flex-shrink-0" aria-hidden="true" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button variant="outline" className="w-full btn-secondary">
                      Contact Sales
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="section-padding bg-white" aria-labelledby="testimonials-heading">
          <div className="max-w-7xl mx-auto container-padding">
            <div className="text-center mb-16">
              <h2 id="testimonials-heading" className="mb-4 font-bold text-gray-900">
                Trusted by Developers Worldwide
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                See what our community has to say about their experience with our platform.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="card-feature animate-slide-up" style={{animationDelay: `${index * 200}ms`}}>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" aria-hidden="true" />
                      ))}
                    </div>
                    <blockquote className="text-gray-600 mb-4">"{testimonial.content}"</blockquote>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-replit-orange text-white rounded-full flex items-center justify-center font-semibold mr-3">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding gradient-primary text-white">
          <div className="max-w-4xl mx-auto container-padding text-center">
            <h2 className="mb-6 font-bold">Ready to Clean Up Your Code?</h2>
            <p className="mb-8 text-xl opacity-90">
              Join thousands of developers who have already improved their code quality with our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-replit-orange hover:bg-gray-100 px-8 py-4">
                  Start Your Free Trial
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-replit-orange px-8 py-4">
                Schedule Demo
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-navy-dark text-white py-16" role="contentinfo">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-replit-orange rounded-lg flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <span className="text-xl font-bold">DuplicateDetector</span>
              </div>
              <p className="text-gray-300 mb-4">
                The most advanced code duplicate detection platform for modern development teams.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="Follow us on Twitter">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="View our GitHub">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status Page</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-300">
            <p>&copy; 2025 DuplicateDetector. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
