"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home, Shield, Users, TrendingUp } from "lucide-react";

const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  property_location: z.string().min(1, "Please select a location"),
  square_footage: z.string().min(1, "Please select square footage"),
  pain_points: z.array(z.string()).min(1, "Please select at least one pain point"),
  budget_range: z.string().min(1, "Please select a budget range"),
  decision_timeline: z.string().min(1, "Please select a timeline"),
  schedule_consultation: z.boolean().optional(),
});

type WaitlistForm = z.infer<typeof waitlistSchema>;

const PAIN_POINTS = [
  "Vendor coordination",
  "Maintenance tracking",
  "HOA compliance",
  "Emergency response",
  "Staff scheduling",
  "Energy costs",
  "Other",
];

export default function WaitlistPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<WaitlistForm>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      pain_points: [],
      schedule_consultation: false,
    },
  });

  const painPoints = watch("pain_points");

  const togglePainPoint = (point: string) => {
    const current = painPoints || [];
    if (current.includes(point)) {
      setValue(
        "pain_points",
        current.filter((p) => p !== point)
      );
    } else {
      setValue("pain_points", [...current, point]);
    }
  };

  const onSubmit = async (data: WaitlistForm) => {
    setLoading(true);
    try {
      const { error } = await (supabase.from("waitlist").insert as any)({
        email: data.email,
        full_name: data.full_name,
        property_location: data.property_location,
        square_footage: data.square_footage,
        pain_points: data.pain_points,
        budget_range: data.budget_range,
        decision_timeline: data.decision_timeline,
        survey_data: {
          schedule_consultation: data.schedule_consultation,
        },
        status: "pending",
      });

      if (error) throw error;

      setSubmitted(true);
    } catch (error: any) {
      console.error("Error submitting waitlist:", error);
      alert(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
        <Card className="w-full max-w-2xl text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl">Thank You!</CardTitle>
            <CardDescription className="text-lg mt-2">
              We&apos;ll contact you within 48 hours to discuss how LUMINA can
              transform your estate management experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/auth/login")} className="mt-4">
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Hero Section */}
      {step === 1 && (
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                LUMINA Estate Systems
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
                Luxury estate management for ultra-high-net-worth clients in the Pacific Northwest
              </p>

              {/* Feature Cards */}
              <div className="grid md:grid-cols-4 gap-6 mb-12">
                {[
                  {
                    icon: Home,
                    title: "Property Management",
                    description: "Comprehensive oversight of your estates",
                  },
                  {
                    icon: Users,
                    title: "Vendor Coordination",
                    description: "Vetted professionals at your service",
                  },
                  {
                    icon: Shield,
                    title: "24/7 Monitoring",
                    description: "Peace of mind around the clock",
                  },
                  {
                    icon: TrendingUp,
                    title: "Cost Optimization",
                    description: "Maximize value, minimize hassle",
                  },
                ].map((feature, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6 text-center">
                      <feature.icon className="w-12 h-12 mx-auto mb-4 text-accent" />
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button size="lg" onClick={() => setStep(2)} className="text-lg px-8">
                Join Our Waitlist
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Waitlist Form */}
      {step > 1 && (
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card>
            <CardHeader>
              <CardTitle>Join the Waitlist</CardTitle>
              <CardDescription>
                Step {step - 1} of 3: {step === 2 && "Basic Information"}
                {step === 3 && "Your Needs"}
                {step === 4 && "Timeline & Budget"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 2: Basic Info */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        {...register("full_name")}
                        placeholder="John Smith"
                      />
                      {errors.full_name && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.full_name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="john@example.com"
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="property_location">
                        Property Location *
                      </Label>
                      <Select onValueChange={(value) => setValue("property_location", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="seattle">Seattle, WA</SelectItem>
                          <SelectItem value="bellevue">Bellevue, WA</SelectItem>
                          <SelectItem value="mercer-island">Mercer Island, WA</SelectItem>
                          <SelectItem value="medina">Medina, WA</SelectItem>
                          <SelectItem value="portland">Portland, OR</SelectItem>
                          <SelectItem value="vancouver">Vancouver, BC</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.property_location && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.property_location.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="square_footage">Square Footage *</Label>
                      <Select onValueChange={(value) => setValue("square_footage", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5000-10000">5,000 - 10,000 sq ft</SelectItem>
                          <SelectItem value="10000-15000">10,000 - 15,000 sq ft</SelectItem>
                          <SelectItem value="15000-20000">15,000 - 20,000 sq ft</SelectItem>
                          <SelectItem value="20000+">20,000+ sq ft</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.square_footage && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.square_footage.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Pain Points */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <Label>Top 3 Pain Points *</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Select all that apply
                      </p>
                      <div className="space-y-3">
                        {PAIN_POINTS.map((point) => (
                          <div key={point} className="flex items-center space-x-2">
                            <Checkbox
                              id={point}
                              checked={painPoints?.includes(point)}
                              onCheckedChange={() => togglePainPoint(point)}
                            />
                            <Label htmlFor={point} className="font-normal cursor-pointer">
                              {point}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {errors.pain_points && (
                        <p className="text-sm text-destructive mt-2">
                          {errors.pain_points.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Budget & Timeline */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="budget_range">Monthly Budget Range *</Label>
                      <Select onValueChange={(value) => setValue("budget_range", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="<5k">&lt;$5,000/month</SelectItem>
                          <SelectItem value="5k-10k">$5,000 - $10,000/month</SelectItem>
                          <SelectItem value="10k-15k">$10,000 - $15,000/month</SelectItem>
                          <SelectItem value="15k+">$15,000+/month</SelectItem>
                          <SelectItem value="annual">Prefer annual contract</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.budget_range && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.budget_range.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="decision_timeline">Decision Timeline *</Label>
                      <Select onValueChange={(value) => setValue("decision_timeline", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate (1-2 weeks)</SelectItem>
                          <SelectItem value="month">Within a month</SelectItem>
                          <SelectItem value="quarter">Within 3 months</SelectItem>
                          <SelectItem value="exploring">Just exploring</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.decision_timeline && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.decision_timeline.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="schedule_consultation"
                        onCheckedChange={(checked) =>
                          setValue("schedule_consultation", checked as boolean)
                        }
                      />
                      <Label htmlFor="schedule_consultation" className="font-normal">
                        I&apos;d like to schedule a consultation call
                      </Label>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  {step > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                    >
                      Previous
                    </Button>
                  )}
                  {step < 4 ? (
                    <Button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      className="ml-auto"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button type="submit" disabled={loading} className="ml-auto">
                      {loading ? "Submitting..." : "Submit"}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
