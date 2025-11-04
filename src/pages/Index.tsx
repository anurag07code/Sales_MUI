import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Building2, 
  FileText, 
  FileCheck, 
  TrendingUp, 
  ArrowRight,
  Star,
  Zap,
  Sparkles,
  Shield,
  Users,
  Award,
  Target,
  BarChart3,
  Clock,
  Globe,
  Brain,
  Rocket,
  ArrowUpRight,
  Sparkle
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";

const Index = () => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      title: "Brand Analysis",
      description: "Uncover deep market intelligence and competitive positioning with AI-driven insights.",
      icon: Building2,
      to: "/brand-analysis",
      gradient: "from-emerald-500/10 to-teal-500/5",
      color: "emerald",
      stat: "10M+",
      statLabel: "Companies Analyzed"
    },
    {
      title: "RFP Lifecycle",
      description: "Streamline proposals from analysis to generation with intelligent automation.",
      icon: FileText,
      to: "/rfp-lifecycle",
      gradient: "from-blue-500/10 to-indigo-500/5",
      color: "blue",
      stat: "60%",
      statLabel: "Time Saved"
    },
    {
      title: "Legal Contracts",
      description: "AI-powered contract review with instant risk assessment and compliance checks.",
      icon: FileCheck,
      to: "/contracts",
      gradient: "from-purple-500/10 to-pink-500/5",
      color: "purple",
      stat: "99.9%",
      statLabel: "Accuracy Rate"
    },
    {
      title: "Deals Tracker",
      description: "Predictive pipeline management with real-time forecasting and revenue intelligence.",
      icon: TrendingUp,
      to: "/deals",
      gradient: "from-orange-500/10 to-red-500/5",
      color: "orange",
      stat: "3.2x",
      statLabel: "Win Rate Increase"
    },
  ];

  const capabilities = [
    { icon: Brain, text: "AI-Powered Intelligence" },
    { icon: Zap, text: "Real-Time Analytics" },
    { icon: Shield, text: "Enterprise Security" },
    { icon: Globe, text: "Global Reach" },
    { icon: Clock, text: "24/7 Support" },
    { icon: Rocket, text: "Fast Implementation" },
  ];

  const testimonials = [
    {
      name: "Alexandra Chen",
      role: "Chief Revenue Officer",
      company: "Fortune 500 Enterprise",
      content: "SalesFirst transformed our entire sales organization. What used to take weeks now happens in hours, and our win rates have doubled.",
      rating: 5,
      highlight: "2x Win Rate"
    },
    {
      name: "Marcus Rodriguez",
      role: "VP of Sales Operations",
      company: "High-Growth Startup",
      content: "The AI insights are scarily accurate. We've reduced our sales cycle by 40% and increased pipeline velocity significantly.",
      rating: 5,
      highlight: "40% Faster"
    },
    {
      name: "Dr. Sarah Kim",
      role: "Sales Enablement Director",
      company: "Global Tech Leader",
      content: "Best investment we've made. The platform pays for itself in the first quarter with the efficiency gains alone.",
      rating: 5,
      highlight: "ROI in 90 Days"
    },
  ];

  const metrics = [
    { value: "280+", label: "Enterprise Teams", icon: Users },
    { value: "$2.5B+", label: "Deals Analyzed", icon: BarChart3 },
    { value: "95%", label: "Customer Satisfaction", icon: Award },
    { value: "10K+", label: "Active Users", icon: Target },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Hero Section - Asymmetric Layout */}
      <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-300 hover:border-primary hover:shadow-sm" style={{ borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>
                <Sparkle className="w-4 h-4 transition-transform duration-300 hover:scale-110" style={{ color: '#3B82F6' }} />
                <span className="text-sm font-medium transition-colors duration-300 hover:text-primary" style={{ color: '#3B82F6' }}>AI-Powered Sales Intelligence Platform</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="block text-foreground">Transform Your</span>
                  <span className="block bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, #3B82F6, #2563EB)' }}>
                    Sales Pipeline
                  </span>
                  <span className="block text-foreground">with Intelligence</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                  Unlock unprecedented insights into your prospects, automate your RFP process, 
                  and close deals faster with AI-driven sales intelligence.
                </p>
              </div>

              {/* Primary CTA Button */}
              <div className="pt-2">
                <Button
                  size="lg"
                  className="group relative overflow-hidden text-base md:text-lg px-8 py-6 h-auto rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:brightness-110"
                  style={{ 
                    backgroundColor: '#3B82F6',
                    color: '#FFFFFF',
                    border: 'none'
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2 font-semibold">
                    Get Started
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <span 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:translate-x-full"
                    style={{ 
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                      transform: 'translateX(-100%)',
                      width: '100%',
                    }}
                  />
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-primary/40 border-2 border-background ring-2 ring-primary/20"
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    280+ teams trust SalesFirst
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm ml-2 text-muted-foreground">4.9/5 rating</span>
                </div>
              </div>
            </div>

            {/* Right Side - Visual Element */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Feature Cards Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {features.slice(0, 4).map((feature, index) => (
                    <Card
                      key={feature.title}
                      className={cn(
                        "p-6 border-2 bg-card/50 backdrop-blur-sm transition-all duration-500",
                        "hover:border-primary/50 hover:shadow-xl hover:scale-105",
                        index % 2 === 0 ? "animate-float" : "",
                        index === 0 && "delay-0",
                        index === 1 && "delay-150",
                        index === 2 && "delay-300",
                        index === 3 && "delay-450"
                      )}
                      style={{ 
                        animationDelay: `${index * 150}ms`,
                        animationDuration: '6s'
                      }}
                    >
                      <feature.icon className="w-8 h-8 mb-3 text-primary" />
                      <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                      <div className="text-2xl font-bold text-primary mt-2">{feature.stat}</div>
                      <div className="text-xs text-muted-foreground">{feature.statLabel}</div>
                    </Card>
                  ))}
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-primary/20 animate-pulse">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-primary/20 animate-pulse" style={{ animationDelay: '1s' }}>
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-16 border-y border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {metrics.map((metric, index) => (
              <Card
                key={index}
                className="text-center group cursor-pointer p-6 rounded-xl border-2 border-border bg-card transition-all duration-300 hover:scale-105 hover:shadow-lg hover:-translate-y-1 hover:border-primary/40"
              >
                <metric.icon 
                  className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" 
                  style={{ color: '#3B82F6' }}
                />
                <div className="text-3xl md:text-4xl font-bold mb-2 transition-colors duration-300 group-hover:text-primary">
                  {metric.value}
                </div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Unique Grid Layout */}
      <section className="py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Everything You Need to
              <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Close More Deals
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four powerful modules working together to streamline your entire sales process
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Link
                key={feature.title}
                to={feature.to}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <Card
                  className={cn(
                    "relative overflow-hidden p-8 border-2 transition-all duration-500 group cursor-pointer h-full",
                    "hover:shadow-2xl hover:scale-[1.02]",
                    hoveredFeature === index
                      ? `border-primary/50 bg-gradient-to-br ${feature.gradient}`
                      : "border-border bg-card"
                  )}
                >
                  {/* Animated Background Gradient */}
                  <div
                    className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br",
                      feature.gradient
                    )}
                  />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div
                        className={cn(
                          "p-4 rounded-2xl border-2 transition-all duration-300",
                          hoveredFeature === index
                            ? "border-primary/50 bg-primary/10 scale-110 rotate-6"
                            : "border-border bg-muted/50 group-hover:scale-105"
                        )}
                      >
                        <feature.icon className="w-8 h-8 text-primary" />
                      </div>
                      <ArrowUpRight
                        className={cn(
                          "w-6 h-6 text-muted-foreground transition-all duration-300",
                          "group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1"
                        )}
                      />
                    </div>

                    <div className="mb-4">
                      <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
                        {feature.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <div className="text-3xl font-bold text-primary">{feature.stat}</div>
                        <div className="text-sm text-muted-foreground">{feature.statLabel}</div>
                      </div>
                      <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                        <span>Explore</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-transparent via-muted/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Modern Sales Teams
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Enterprise-grade features designed to scale with your business
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {capabilities.map((capability, index) => (
              <Card
                key={index}
                className="p-6 text-center border border-border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-lg hover:border-primary/50 group cursor-pointer"
              >
                <capability.icon className="w-8 h-8 mx-auto mb-3 text-primary transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6" />
                <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {capability.text}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Side-by-Side Layout */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-muted-foreground text-lg">
              See how sales teams are transforming their operations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="relative p-8 border-2 border-border bg-card transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-primary/30 group"
              >
                {/* Highlight Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-semibold text-primary">
                  {testimonial.highlight}
                </div>

                <div className="flex items-center gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform duration-300"
                      style={{ transitionDelay: `${i * 50}ms` }}
                    />
                  ))}
                </div>
                
                <p className="text-muted-foreground mb-6 leading-relaxed group-hover:text-foreground/80 transition-colors italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/80 to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-lg">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                    <div className="text-xs text-muted-foreground/80">
                      {testimonial.company}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section - Unique Design */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,0,0,0.05),transparent_50%)]" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm mb-6">
            <Rocket className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Powering Modern Sales Teams</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Transform Your Sales Process
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join 280+ teams using SalesFirst to close more deals with AI-powered sales intelligence.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-foreground mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/brand-analysis" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
                    Brand Analysis
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <Link to="/rfp-lifecycle" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
                    RFP Lifecycle
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <Link to="/contracts" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
                    Contracts
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <Link to="/deals" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
                    Deals Tracker
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">About</a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">Blog</a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">Careers</a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">Contact</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">Support</a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">API</a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">Integrations</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">Security</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">S</span>
              </div>
              <span className="text-lg font-bold text-foreground">SalesFirst</span>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-right">
              © 2024 SalesFirst. All rights reserved.
            </p>
        </div>
      </div>
      </footer>
    </div>
  );
};

export default Index;
