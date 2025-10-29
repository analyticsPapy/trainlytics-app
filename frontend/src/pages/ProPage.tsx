import { motion } from 'framer-motion';
import {
  Zap,
  Brain,
  BarChart3,
  FileDown,
  Shield,
  Target,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Crown
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';

export function ProPage() {
  const proFeatures = [
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Get personalized training recommendations powered by advanced machine learning algorithms'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Deep dive into your data with professional-grade analytics and custom dashboards'
    },
    {
      icon: FileDown,
      title: 'Detailed Reports',
      description: 'Export comprehensive PDF reports with all your training metrics and insights'
    },
    {
      icon: Target,
      title: 'Smart Goal Setting',
      description: 'AI-assisted goal planning based on your historical performance and capacity'
    },
    {
      icon: TrendingUp,
      title: 'Predictive Analytics',
      description: 'Forecast your performance trajectory and identify potential improvement areas'
    },
    {
      icon: Shield,
      title: 'Priority Support',
      description: '24/7 priority support from our team of sports science experts'
    }
  ];

  const pricingTiers = [
    {
      name: 'Pro Monthly',
      price: '$19',
      period: '/month',
      description: 'Perfect for dedicated athletes',
      features: [
        'All Pro features',
        'Unlimited workouts',
        'Advanced analytics',
        'AI coaching',
        'Priority support',
        'Custom reports'
      ]
    },
    {
      name: 'Pro Annual',
      price: '$15',
      period: '/month',
      badge: 'Best Value',
      description: 'Save 20% with annual billing',
      features: [
        'All Pro features',
        'Unlimited workouts',
        'Advanced analytics',
        'AI coaching',
        'Priority support',
        'Custom reports',
        '2 months free'
      ]
    }
  ];

  return (
    <Layout type="public">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 gradient-pro opacity-10" />
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-6 flex justify-center">
              <Badge variant="pro" className="px-4 py-2 text-sm">
                <Crown className="mr-2 h-4 w-4" />
                Premium Features
              </Badge>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl mb-6">
              <span className="gradient-pro bg-clip-text text-transparent">
                Trainlytics Pro
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Unlock the full potential of your training with AI-powered insights,
              advanced analytics, and professional-grade tools
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button size="xl" variant="pro" className="gap-2">
                <Sparkles className="h-5 w-5" />
                Start Free Trial
              </Button>
              <Button size="xl" variant="outline">
                See Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Professional Tools for Serious Athletes
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to take your training to the next level
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {proFeatures.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all hover:border-purple-500/50">
                  <CardHeader>
                    <div className="p-3 rounded-lg bg-purple-500/10 w-fit mb-4">
                      <feature.icon className="h-6 w-6 text-purple-500" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Choose Your Pro Plan
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              14-day free trial, cancel anytime
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingTiers.map((tier, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`relative h-full ${tier.badge ? 'border-purple-500 shadow-lg' : ''}`}>
                  {tier.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge variant="pro" className="px-4 py-1">
                        {tier.badge}
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                    <div className="mb-2">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      <span className="text-muted-foreground">{tier.period}</span>
                    </div>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature, featureIdx) => (
                        <li key={featureIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant="pro"
                      className="w-full"
                      size="lg"
                    >
                      Start Free Trial
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-muted/50">
        <div className="container max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Free vs Pro
            </h2>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {[
                  { feature: 'Workout Tracking', free: true, pro: true },
                  { feature: 'Basic Analytics', free: true, pro: true },
                  { feature: 'AI-Powered Insights', free: false, pro: true },
                  { feature: 'Advanced Analytics', free: false, pro: true },
                  { feature: 'Custom Reports', free: false, pro: true },
                  { feature: 'Priority Support', free: false, pro: true },
                  { feature: 'Predictive Analytics', free: false, pro: true }
                ].map((item, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-4 p-4">
                    <div className="col-span-1 font-medium">{item.feature}</div>
                    <div className="text-center">
                      {item.free ? (
                        <CheckCircle2 className="h-5 w-5 text-primary inline" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                    <div className="text-center">
                      {item.pro ? (
                        <CheckCircle2 className="h-5 w-5 text-purple-500 inline" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 gradient-pro opacity-10" />
            <CardContent className="relative p-12 text-center">
              <Zap className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">
                Ready to go Pro?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Start your 14-day free trial today. No credit card required.
              </p>
              <Button size="xl" variant="pro">
                Start Free Trial
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
