import { motion } from 'framer-motion';
import {
  Link as LinkIcon,
  Zap,
  CheckCircle2,
  Clock,
  Shield,
  RefreshCw,
  Smartphone,
  Activity,
  Sparkles
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';

export function ConnectPage() {
  const integrations = [
    {
      name: 'Strava',
      logo: '🚴',
      description: 'Sync your rides, runs, and activities automatically',
      status: 'available',
      category: 'Social & Tracking'
    },
    {
      name: 'Garmin',
      logo: '⌚',
      description: 'Connect your Garmin devices for automatic workout sync',
      status: 'available',
      category: 'Devices'
    },
    {
      name: 'Polar',
      logo: '🏃',
      description: 'Import training data from Polar Flow',
      status: 'available',
      category: 'Devices'
    },
    {
      name: 'Zwift',
      logo: '🚴',
      description: 'Sync your virtual cycling and running workouts',
      status: 'available',
      category: 'Virtual Training'
    },
    {
      name: 'Apple Health',
      logo: '❤️',
      description: 'Integrate with Apple Health and Apple Watch',
      status: 'available',
      category: 'Health Platforms'
    },
    {
      name: 'Google Fit',
      logo: '🏋️',
      description: 'Sync with Google Fit and WearOS devices',
      status: 'available',
      category: 'Health Platforms'
    },
    {
      name: 'Wahoo',
      logo: '📱',
      description: 'Connect Wahoo devices and sensors',
      status: 'available',
      category: 'Devices'
    },
    {
      name: 'TrainingPeaks',
      logo: '📈',
      description: 'Import structured workouts and training plans',
      status: 'coming-soon',
      category: 'Training Platforms'
    },
    {
      name: 'Suunto',
      logo: '⌚',
      description: 'Sync activities from Suunto watches',
      status: 'available',
      category: 'Devices'
    }
  ];

  const features = [
    {
      icon: RefreshCw,
      title: 'Auto-Sync',
      description: 'Workouts automatically sync in real-time across all connected platforms'
    },
    {
      icon: Shield,
      title: 'Secure Connection',
      description: 'Bank-level encryption for all your health and training data'
    },
    {
      icon: Clock,
      title: 'Historical Import',
      description: 'Import your complete training history from connected services'
    },
    {
      icon: Zap,
      title: 'Instant Updates',
      description: 'Changes reflect immediately across all integrated platforms'
    }
  ];

  const benefits = [
    'Never manually log workouts again',
    'One central hub for all your training data',
    'Seamless cross-platform experience',
    'Automatic backup of your training history',
    'Real-time data synchronization',
    'Support for multiple devices simultaneously'
  ];

  return (
    <Layout type="public">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 gradient-connect opacity-10" />
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-6 flex justify-center">
              <Badge variant="connect" className="px-4 py-2 text-sm">
                <LinkIcon className="mr-2 h-4 w-4" />
                Seamless Integration
              </Badge>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl mb-6">
              <span className="gradient-connect bg-clip-text text-transparent">
                Trainlytics Connect
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with your favorite fitness platforms and devices.
              All your training data, automatically synced in one place.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button size="xl" variant="connect" className="gap-2">
                <Sparkles className="h-5 w-5" />
                Start Connecting
              </Button>
              <Button size="xl" variant="outline">
                View All Integrations
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Why Connect?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful integration features that make your life easier
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="text-center h-full hover:shadow-lg transition-all hover:border-cyan-500/50">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-lg bg-cyan-500/10">
                        <feature.icon className="h-6 w-6 text-cyan-500" />
                      </div>
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

      {/* Integrations Grid */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Supported Integrations
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with the platforms and devices you already use
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-4xl">{integration.logo}</div>
                      <Badge
                        variant={integration.status === 'available' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {integration.status === 'available' ? 'Available' : 'Coming Soon'}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{integration.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {integration.description}
                    </CardDescription>
                    <div className="pt-2">
                      <Badge variant="outline" className="text-xs">
                        {integration.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {integration.status === 'available' ? (
                      <Button variant="outline" className="w-full gap-2" size="sm">
                        <LinkIcon className="h-4 w-4" />
                        Connect
                      </Button>
                    ) : (
                      <Button variant="ghost" className="w-full" size="sm" disabled>
                        Notify Me
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/50">
        <div className="container max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Benefits of Connect
            </h2>
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefits.map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-cyan-500 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              How It Works
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                step: '1',
                title: 'Choose Your Platforms',
                description: 'Select the devices and services you want to connect',
                icon: Smartphone
              },
              {
                step: '2',
                title: 'Authorize Access',
                description: 'Securely grant Trainlytics permission to access your data',
                icon: Shield
              },
              {
                step: '3',
                title: 'Auto-Sync Begins',
                description: 'Your workouts automatically sync to Trainlytics in real-time',
                icon: RefreshCw
              },
              {
                step: '4',
                title: 'Train & Analyze',
                description: 'Focus on training while we handle the data synchronization',
                icon: Activity
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card>
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-xl font-bold text-cyan-500">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <item.icon className="h-5 w-5 text-cyan-500" />
                        <h3 className="text-xl font-semibold">{item.title}</h3>
                      </div>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                    <CheckCircle2 className="h-6 w-6 text-cyan-500 shrink-0" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 gradient-connect opacity-10" />
            <CardContent className="relative p-12 text-center">
              <LinkIcon className="h-12 w-12 text-cyan-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">
                Ready to Connect?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Start syncing your workouts automatically. No more manual data entry.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="xl" variant="connect">
                  Get Started
                </Button>
                <Button size="xl" variant="outline">
                  View Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
