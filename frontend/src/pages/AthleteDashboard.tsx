import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  Calendar,
  Trophy,
  Heart,
  Zap,
  Target,
  Clock,
  Flame
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { Activity as ActivityType, ConnectionPublic } from '../types/api';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ElementType;
  gradient?: string;
}

function StatCard({ title, value, change, trend, icon: Icon, gradient }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      {gradient && <div className={`absolute top-0 left-0 right-0 h-1 ${gradient}`} />}
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
            {change}
          </span>{' '}
          from last week
        </p>
      </CardContent>
    </Card>
  );
}

export function AthleteDashboard() {
  const { user: _user } = useAuth();
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [_connections, setConnections] = useState<ConnectionPublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch recent activities
        const activitiesData = await api.activities.getActivities({
          limit: 10,
        });
        setActivities(activitiesData);

        // Fetch connections
        const connectionsData = await api.connections.getConnections();
        setConnections(connectionsData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats from activities
  const stats = {
    totalDistance: activities.reduce((sum, act) => sum + (act.distance || 0), 0) / 1000, // Convert to km
    totalDuration: activities.reduce((sum, act) => sum + (act.duration || 0), 0) / 60, // Convert to minutes
    totalCalories: activities.reduce((sum, act) => sum + (act.calories || 0), 0),
    avgHeartRate: activities.length > 0
      ? Math.round(activities.reduce((sum, act) => sum + (act.avg_heart_rate || 0), 0) / activities.length)
      : 0,
  };

  // Format recent workouts for display
  const recentWorkouts = activities.slice(0, 3).map(activity => ({
    id: activity.id,
    type: activity.activity_type,
    duration: activity.duration ? `${Math.round(activity.duration / 60)} min` : '-',
    distance: activity.distance ? `${(activity.distance / 1000).toFixed(1)} km` : '-',
    calories: activity.calories || 0,
    date: new Date(activity.start_time).toLocaleDateString(),
    intensity: activity.avg_heart_rate && activity.avg_heart_rate > 150 ? 'high' : 'medium'
  }));

  const weeklyGoals = [
    { name: 'Distance', current: Math.round(stats.totalDistance), target: 50, unit: 'km' },
    { name: 'Duration', current: Math.round(stats.totalDuration), target: 240, unit: 'min' },
    { name: 'Workouts', current: activities.length, target: 5, unit: 'sessions' }
  ];

  if (isLoading) {
    return (
      <Layout type="athlete">
        <div className="container py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout type="athlete">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Athlete Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your training overview
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </Button>
            <Button variant="gradient" className="gap-2">
              <Activity className="h-4 w-4" />
              Log Workout
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Distance"
            value={`${stats.totalDistance.toFixed(1)} km`}
            change="+12%"
            trend="up"
            icon={TrendingUp}
            gradient="gradient-primary"
          />
          <StatCard
            title="Active Time"
            value={`${Math.floor(stats.totalDuration / 60)}h ${Math.round(stats.totalDuration % 60)}m`}
            change="+8%"
            trend="up"
            icon={Clock}
            gradient="gradient-primary"
          />
          <StatCard
            title="Calories Burned"
            value={stats.totalCalories.toLocaleString()}
            change="+15%"
            trend="up"
            icon={Flame}
            gradient="gradient-primary"
          />
          <StatCard
            title="Avg Heart Rate"
            value={stats.avgHeartRate > 0 ? `${stats.avgHeartRate} bpm` : 'N/A'}
            change="-3%"
            trend="down"
            icon={Heart}
            gradient="gradient-primary"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Weekly Goals */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Weekly Goals</CardTitle>
                  <CardDescription>Track your progress this week</CardDescription>
                </div>
                <Target className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {weeklyGoals.map((goal, idx) => {
                const percentage = (goal.current / goal.target) * 100;
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{goal.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: idx * 0.2 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Shortcuts to common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Activity className="h-4 w-4" />
                Start Workout
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Calendar className="h-4 w-4" />
                View Calendar
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Trophy className="h-4 w-4" />
                View Achievements
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Zap className="h-4 w-4" />
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Workouts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Workouts</CardTitle>
                <CardDescription>Your latest training sessions</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentWorkouts.map((workout, index) => (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{workout.type}</h4>
                        <Badge
                          variant={workout.intensity === 'high' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {workout.intensity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {workout.duration} " {workout.distance} " {workout.calories} cal
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{workout.date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Premium Upgrade Banner */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 gradient-pro opacity-10" />
          <CardContent className="relative flex flex-col md:flex-row items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-500/10">
                <Zap className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Upgrade to Trainlytics Pro</h3>
                <p className="text-sm text-muted-foreground">
                  Unlock advanced analytics, AI coaching, and more
                </p>
              </div>
            </div>
            <Button variant="pro" size="lg">
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
