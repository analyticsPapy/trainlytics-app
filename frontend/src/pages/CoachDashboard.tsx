import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  Calendar,
  Activity,
  Zap,
  BarChart3,
  UserPlus,
  FileText
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';

export function CoachDashboard() {
  const { user: _user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Fetch coach-specific data here when available
        // For now, we'll just simulate loading
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error('Failed to fetch coach data:', err);
        setError('Failed to load coach data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Layout type="coach">
        <div className="container py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }
  const athletes = [
    {
      id: 1,
      name: 'Sarah Johnson',
      sport: 'Running',
      progress: 92,
      status: 'on-track',
      lastWorkout: '2 hours ago',
      avatar: 'SJ'
    },
    {
      id: 2,
      name: 'Mike Chen',
      sport: 'Cycling',
      progress: 78,
      status: 'on-track',
      lastWorkout: '1 day ago',
      avatar: 'MC'
    },
    {
      id: 3,
      name: 'Emma Williams',
      sport: 'Triathlon',
      progress: 45,
      status: 'needs-attention',
      lastWorkout: '3 days ago',
      avatar: 'EW'
    },
    {
      id: 4,
      name: 'David Brown',
      sport: 'Swimming',
      progress: 88,
      status: 'on-track',
      lastWorkout: '5 hours ago',
      avatar: 'DB'
    }
  ];

  const upcomingSessions = [
    {
      id: 1,
      athlete: 'Sarah Johnson',
      type: 'Interval Training',
      time: 'Today, 4:00 PM',
      duration: '60 min'
    },
    {
      id: 2,
      athlete: 'Mike Chen',
      type: 'Recovery Ride',
      time: 'Tomorrow, 9:00 AM',
      duration: '90 min'
    },
    {
      id: 3,
      athlete: 'Emma Williams',
      type: 'Strength Training',
      time: 'Tomorrow, 2:00 PM',
      duration: '45 min'
    }
  ];

  return (
    <Layout type="coach">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Coach Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your athletes and training programs
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </Button>
            <Button variant="gradient" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Athlete
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Athletes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">24</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">+3</span> this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Programs
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">8</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">+2</span> from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sessions This Week
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">42</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">+8%</span> from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Performance
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">+5%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Athletes Overview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Athletes</CardTitle>
                  <CardDescription>Monitor your athletes' progress</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {athletes.map((athlete, idx) => (
                  <motion.div
                    key={athlete.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                        {athlete.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{athlete.name}</h4>
                          <Badge
                            variant={athlete.status === 'on-track' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {athlete.status === 'on-track' ? 'On Track' : 'Needs Attention'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {athlete.sport} • Last workout: {athlete.lastWorkout}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{athlete.progress}%</div>
                      <p className="text-xs text-muted-foreground">Progress</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Next scheduled trainings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="space-y-2 pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{session.athlete}</h4>
                      <p className="text-sm text-muted-foreground">{session.type}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {session.duration}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {session.time}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Team performance metrics this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Workout Completion</span>
                  <span className="text-sm font-bold">94%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '94%' }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Goal Achievement</span>
                  <span className="text-sm font-bold">87%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '87%' }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Engagement</span>
                  <span className="text-sm font-bold">91%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '91%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium Features Banner */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 gradient-lab opacity-10" />
            <CardContent className="relative flex items-center gap-4 p-6">
              <div className="p-3 rounded-full bg-orange-500/10">
                <BarChart3 className="h-6 w-6 text-orange-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Trainlytics Lab</h3>
                <p className="text-sm text-muted-foreground">
                  Run experiments and analyze training protocols
                </p>
              </div>
              <Button variant="lab">Explore</Button>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 gradient-pro opacity-10" />
            <CardContent className="relative flex items-center gap-4 p-6">
              <div className="p-3 rounded-full bg-purple-500/10">
                <Zap className="h-6 w-6 text-purple-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Trainlytics Pro</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced analytics for professional coaching
                </p>
              </div>
              <Button variant="pro">Upgrade</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
