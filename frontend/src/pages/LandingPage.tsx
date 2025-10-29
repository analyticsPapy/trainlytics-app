import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  Users,
  Zap,
  FlaskConical,
  Link as LinkIcon,
  TrendingUp,
  BarChart3,
  Target,
  Heart,
  Timer,
  Award,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function LandingPage() {
  return (
    <Layout type="public">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/50 py-20 md:py-32">
        <div className="container relative z-10">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="mx-auto max-w-4xl text-center"
          >
            <motion.div variants={fadeInUp} className="mb-6 flex justify-center">
              <Badge variant="outline" className="px-4 py-2">
                <Sparkles className="mr-2 h-3 w-3" />
                Next-Gen Training Analytics
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl mb-6"
            >
              Train Smarter with{' '}
              <span className="gradient-primary bg-clip-text text-transparent">
                Trainlytics
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Advanced analytics and insights for athletes and coaches. Track performance,
              analyze data, and achieve your training goals with cutting-edge technology.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <Link to="/athlete">
                <Button size="xl" variant="gradient" className="gap-2">
                  <Trophy className="h-5 w-5" />
                  For Athletes
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/coach">
                <Button size="xl" variant="outline" className="gap-2">
                  <Users className="h-5 w-5" />
                  For Coaches
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Background Decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2">
            <div className="h-[600px] w-[600px] rounded-full bg-primary/10 blur-3xl" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Everything you need to excel
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for athletes and coaches who demand the best
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: 'Advanced Analytics',
                description: 'Deep insights into your training data with AI-powered analysis',
                color: 'text-primary'
              },
              {
                icon: Target,
                title: 'Goal Tracking',
                description: 'Set, monitor, and achieve your training objectives',
                color: 'text-secondary'
              },
              {
                icon: Heart,
                title: 'Health Monitoring',
                description: 'Track vital metrics and recovery to optimize performance',
                color: 'text-red-500'
              },
              {
                icon: Timer,
                title: 'Workout Planning',
                description: 'Create and customize training plans that adapt to your progress',
                color: 'text-accent'
              },
              {
                icon: TrendingUp,
                title: 'Progress Insights',
                description: 'Visualize your improvement with beautiful charts and reports',
                color: 'text-primary'
              },
              {
                icon: Award,
                title: 'Performance Tracking',
                description: 'Monitor key performance indicators across all your activities',
                color: 'text-secondary'
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <feature.icon className={`h-12 w-12 mb-4 ${feature.color}`} />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Tiers Section */}
      <section className="py-20 md:py-32 bg-muted/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Choose your training edge
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Unlock premium features and take your training to the next level
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Trainlytics Pro */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="relative overflow-hidden h-full">
                <div className="absolute top-0 left-0 right-0 h-1 gradient-pro" />
                <CardHeader>
                  <Zap className="h-12 w-12 mb-4 text-purple-500" />
                  <CardTitle className="flex items-center gap-2">
                    Trainlytics Pro
                    <Badge variant="pro">Premium</Badge>
                  </CardTitle>
                  <CardDescription>
                    Advanced analytics and professional insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {[
                      'Advanced performance metrics',
                      'AI-powered training recommendations',
                      'Custom analytics dashboards',
                      'Priority support',
                      'Export detailed reports'
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/pro">
                    <Button variant="pro" className="w-full">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Trainlytics Lab */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="relative overflow-hidden h-full">
                <div className="absolute top-0 left-0 right-0 h-1 gradient-lab" />
                <CardHeader>
                  <FlaskConical className="h-12 w-12 mb-4 text-orange-500" />
                  <CardTitle className="flex items-center gap-2">
                    Trainlytics Lab
                    <Badge variant="lab">Research</Badge>
                  </CardTitle>
                  <CardDescription>
                    Experimentation space for coaches and researchers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {[
                      'Create custom experiments',
                      'A/B test training protocols',
                      'Advanced data modeling',
                      'Research-grade analytics',
                      'Collaborative workspaces'
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/lab">
                    <Button variant="lab" className="w-full">
                      Explore Lab
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Trainlytics Connect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="relative overflow-hidden h-full">
                <div className="absolute top-0 left-0 right-0 h-1 gradient-connect" />
                <CardHeader>
                  <LinkIcon className="h-12 w-12 mb-4 text-cyan-500" />
                  <CardTitle className="flex items-center gap-2">
                    Trainlytics Connect
                    <Badge variant="connect">Integrations</Badge>
                  </CardTitle>
                  <CardDescription>
                    Seamless integration with your favorite platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {[
                      'Strava integration',
                      'Garmin & Polar sync',
                      'Zwift connectivity',
                      'Apple Health & Google Fit',
                      'Auto-sync workouts'
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-cyan-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/connect">
                    <Button variant="connect" className="w-full">
                      View Integrations
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 gradient-primary opacity-10" />
            <CardContent className="relative p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to transform your training?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of athletes and coaches already using Trainlytics
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/athlete">
                  <Button size="xl" variant="gradient">
                    Get Started Free
                  </Button>
                </Link>
                <Button size="xl" variant="outline">
                  Watch Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
