import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Shield, Users, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">LUMINA Estate Systems</h1>
            <div className="flex gap-4">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/waitlist">Join Waitlist</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
            Luxury Estate Management
            <br />
            <span className="text-primary">Simplified</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            The premier estate management platform for ultra-high-net-worth clients
            in the Pacific Northwest
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8">
              <Link href="/waitlist">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8">
              <Link href="/auth/login">Client Portal</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12">
            Comprehensive Estate Management
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Home,
                title: "Property Oversight",
                description:
                  "Complete management of your estate properties, systems, and documentation",
              },
              {
                icon: Users,
                title: "Vendor Coordination",
                description:
                  "Access to vetted, insured professionals across all service categories",
              },
              {
                icon: Shield,
                title: "24/7 Monitoring",
                description:
                  "Round-the-clock oversight with emergency response protocols",
              },
              {
                icon: TrendingUp,
                title: "Cost Optimization",
                description:
                  "Transparent pricing and proactive maintenance to maximize value",
              },
            ].map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-8">
                  <feature.icon className="w-12 h-12 mx-auto mb-4 text-accent" />
                  <h4 className="text-xl font-semibold mb-3">{feature.title}</h4>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">
                Why LUMINA Estate Systems?
              </h3>
              <ul className="space-y-4">
                {[
                  "Dedicated estate management professionals",
                  "Proprietary technology platform for seamless communication",
                  "Curated network of vetted service providers",
                  "Proactive maintenance scheduling and tracking",
                  "Transparent invoicing and cost management",
                  "Emergency response protocols and 24/7 availability",
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="rounded-full bg-accent/10 p-1 mt-0.5">
                      <ArrowRight className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card>
              <CardContent className="p-8">
                <h4 className="text-2xl font-bold mb-4">Ready to get started?</h4>
                <p className="text-muted-foreground mb-6">
                  Join our exclusive waitlist and discover how LUMINA can transform
                  your estate management experience.
                </p>
                <Button size="lg" className="w-full" asChild>
                  <Link href="/waitlist">Join Waitlist</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/80 backdrop-blur-sm py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} LUMINA Estate Systems. All rights
              reserved.
            </p>
            <p className="text-xs mt-2">
              Serving the Pacific Northwest with excellence
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
