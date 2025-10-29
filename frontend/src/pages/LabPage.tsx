import { motion } from 'framer-motion';
import {
  FlaskConical,
  Microscope,
  LineChart,
  Users,
  Database,
  GitBranch,
  Beaker,
  FileCode,
  CheckCircle2,
  Sparkles,
  TestTube2
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';

export function LabPage() {
  const labFeatures = [
    {
      icon: Beaker,
      title: 'Custom Experiments',
      description: 'Design and run controlled training experiments with multiple variables'
    },
    {
      icon: LineChart,
      title: 'Statistical Analysis',
      description: 'Advanced statistical tools for analyzing experiment results and correlations'
    },
    {
      icon: GitBranch,
      title: 'A/B Testing',
      description: 'Compare different training protocols side-by-side with rigorous methodology'
    },
    {
      icon: Database,
      title: 'Data Modeling',
      description: 'Build custom data models to test hypotheses and predict outcomes'
    },
    {
      icon: Users,
      title: 'Collaborative Research',
      description: 'Share experiments and findings with other coaches and researchers'
    },
    {
      icon: FileCode,
      title: 'Custom Metrics',
      description: 'Define and track custom performance metrics unique to your research'
    }
  ];

  const useCases = [
    {
      title: 'Training Protocol Optimization',
      description: 'Test different training methods to find what works best for specific athlete profiles',
      icon: TestTube2,
      color: 'text-orange-500'
    },
    {
      title: 'Recovery Analysis',
      description: 'Experiment with various recovery strategies and measure their impact on performance',
      icon: Microscope,
      color: 'text-orange-500'
    },
    {
      title: 'Nutrition Studies',
      description: 'Track the relationship between nutrition timing, content, and athletic performance',
      icon: FlaskConical,
      color: 'text-orange-500'
    }
  ];

  return (
    <Layout type="public">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 gradient-lab opacity-10" />
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-6 flex justify-center">
              <Badge variant="lab" className="px-4 py-2 text-sm">
                <FlaskConical className="mr-2 h-4 w-4" />
                Research & Development
              </Badge>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl mb-6">
              <span className="gradient-lab bg-clip-text text-transparent">
                Trainlytics Lab
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A powerful experimentation platform for coaches and researchers to test,
              analyze, and optimize training protocols with scientific rigor
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button size="xl" variant="lab" className="gap-2">
                <Sparkles className="h-5 w-5" />
                Request Access
              </Button>
              <Button size="xl" variant="outline">
                Learn More
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
              Research-Grade Tools
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to conduct rigorous training research
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {labFeatures.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all hover:border-orange-500/50">
                  <CardHeader>
                    <div className="p-3 rounded-lg bg-orange-500/10 w-fit mb-4">
                      <feature.icon className="h-6 w-6 text-orange-500" />
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

      {/* Use Cases */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Real-World Applications
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              How coaches and researchers use Trainlytics Lab
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {useCases.map((useCase, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <useCase.icon className={`h-12 w-12 mb-4 ${useCase.color}`} />
                    <CardTitle className="text-xl">{useCase.title}</CardTitle>
                    <CardDescription>{useCase.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Experiment Workflow */}
      <section className="py-20 bg-muted/50">
        <div className="container max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Experiment Workflow
            </h2>
            <p className="text-xl text-muted-foreground">
              A structured approach to training research
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                step: '1',
                title: 'Define Hypothesis',
                description: 'Clearly state what you want to test and expected outcomes'
              },
              {
                step: '2',
                title: 'Design Experiment',
                description: 'Set up control and test groups, define variables and metrics'
              },
              {
                step: '3',
                title: 'Collect Data',
                description: 'Automatically gather data from training sessions over time'
              },
              {
                step: '4',
                title: 'Analyze Results',
                description: 'Use statistical tools to analyze data and test significance'
              },
              {
                step: '5',
                title: 'Share Findings',
                description: 'Document and share your results with the community'
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
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-xl font-bold text-orange-500">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                    <CheckCircle2 className="h-6 w-6 text-orange-500 shrink-0" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Who is Lab For?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: 'Elite Coaches',
                description: 'Optimize training protocols for competitive athletes',
                icon: Users
              },
              {
                title: 'Sports Scientists',
                description: 'Conduct rigorous research with proper methodology',
                icon: Microscope
              },
              {
                title: 'Training Teams',
                description: 'Collaborate on experiments and share insights',
                icon: GitBranch
              }
            ].map((audience, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="text-center h-full">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="p-4 rounded-full bg-orange-500/10">
                        <audience.icon className="h-8 w-8 text-orange-500" />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{audience.title}</CardTitle>
                    <CardDescription>{audience.description}</CardDescription>
                  </CardHeader>
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
            <div className="absolute inset-0 gradient-lab opacity-10" />
            <CardContent className="relative p-12 text-center">
              <FlaskConical className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">
                Ready to Start Experimenting?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Trainlytics Lab is currently in beta. Request early access to start your research journey.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="xl" variant="lab">
                  Request Access
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
