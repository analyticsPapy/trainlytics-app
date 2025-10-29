/**
 * Connect Page - Manage OAuth Connections
 * Allows users to connect and manage third-party integrations
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Link as LinkIcon,
  CheckCircle2,
  RefreshCw,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { ProviderType, ConnectionPublic, ApiError } from '../types/api';

interface Integration {
  provider: ProviderType;
  name: string;
  logo: string;
  description: string;
  category: string;
}

export function ConnectPage() {
  const { user: _user } = useAuth();
  const [searchParams] = useSearchParams();
  const [connections, setConnections] = useState<ConnectionPublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectingProvider, setConnectingProvider] = useState<ProviderType | null>(null);

  const integrations: Integration[] = [
    {
      provider: ProviderType.GARMIN,
      name: 'Garmin',
      logo: '⌚',
      description: 'Connect your Garmin devices for automatic workout sync',
      category: 'Devices',
    },
    {
      provider: ProviderType.STRAVA,
      name: 'Strava',
      logo: '🚴',
      description: 'Sync your rides, runs, and activities automatically',
      category: 'Social & Tracking',
    },
    {
      provider: ProviderType.POLAR,
      name: 'Polar',
      logo: '🏃',
      description: 'Import training data from Polar Flow',
      category: 'Devices',
    },
    {
      provider: ProviderType.WAHOO,
      name: 'Wahoo',
      logo: '📱',
      description: 'Connect Wahoo devices and sensors',
      category: 'Devices',
    },
    {
      provider: ProviderType.COROS,
      name: 'Coros',
      logo: '⌚',
      description: 'Sync activities from Coros watches',
      category: 'Devices',
    },
    {
      provider: ProviderType.FITBIT,
      name: 'Fitbit',
      logo: '❤️',
      description: 'Integrate with Fitbit devices and app',
      category: 'Health Platforms',
    },
  ];

  // Load connections on mount
  useEffect(() => {
    fetchConnections();
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      setError(`OAuth error: ${error}`);
      return;
    }

    if (code && state) {
      handleOAuthCallback(code, state);
    }
  }, [searchParams]);

  /**
   * Fetch user's connections
   */
  const fetchConnections = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.connections.getConnections();
      setConnections(data);
    } catch (err) {
      console.error('Failed to fetch connections:', err);
      setError('Failed to load connections');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle OAuth callback
   */
  const handleOAuthCallback = async (code: string, state: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.oauth.handleCallback({ code, state });

      if (response.success) {
        // Refresh connections list
        await fetchConnections();

        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        setError(response.message || 'Failed to connect');
      }
    } catch (err) {
      console.error('OAuth callback error:', err);
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to complete connection';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Initiate OAuth connection
   */
  const handleConnect = async (provider: ProviderType) => {
    try {
      setConnectingProvider(provider);
      setError(null);

      const response = await api.oauth.initOAuth({
        provider,
        redirect_uri: `${window.location.origin}/connect`,
      });

      // Redirect to OAuth authorization URL
      window.location.href = response.authorization_url;
    } catch (err) {
      console.error('Failed to initiate OAuth:', err);
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to start connection';
      setError(errorMessage);
      setConnectingProvider(null);
    }
  };

  /**
   * Disconnect a connection
   */
  const handleDisconnect = async (connectionId: string) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) {
      return;
    }

    try {
      setError(null);
      await api.connections.deleteConnection(connectionId);
      await fetchConnections();
    } catch (err) {
      console.error('Failed to disconnect:', err);
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to disconnect';
      setError(errorMessage);
    }
  };

  /**
   * Sync a connection
   */
  const handleSync = async (connectionId: string) => {
    try {
      setError(null);
      await api.connections.syncConnection(connectionId);
      await fetchConnections();
    } catch (err) {
      console.error('Failed to sync:', err);
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to sync';
      setError(errorMessage);
    }
  };

  /**
   * Check if provider is connected
   */
  const isConnected = (provider: ProviderType): ConnectionPublic | undefined => {
    return connections.find((conn) => conn.provider === provider && conn.is_active);
  };

  return (
    <Layout type="athlete">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Connected Services</h1>
            <p className="text-muted-foreground">
              Connect your favorite fitness platforms and devices to sync your training data automatically
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && !error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Loading connections...</p>
            </div>
          </div>
        )}

        {/* Integrations Grid */}
        {!isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => {
              const connection = isConnected(integration.provider);
              const isConnecting = connectingProvider === integration.provider;

              return (
                <motion.div
                  key={integration.provider}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="relative h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl">{integration.logo}</div>
                          <div>
                            <CardTitle className="text-lg">{integration.name}</CardTitle>
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {integration.category}
                            </Badge>
                          </div>
                        </div>
                        {connection && (
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">
                        {integration.description}
                      </CardDescription>

                      {connection ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Last synced:</span>
                            <span>
                              {connection.last_sync_at
                                ? new Date(connection.last_sync_at).toLocaleDateString()
                                : 'Never'}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSync(connection.id)}
                              className="flex-1 gap-2"
                            >
                              <RefreshCw className="h-4 w-4" />
                              Sync
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDisconnect(connection.id)}
                              className="gap-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                              Disconnect
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="gradient"
                          className="w-full gap-2"
                          onClick={() => handleConnect(integration.provider)}
                          disabled={isConnecting}
                        >
                          {isConnecting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Connecting...
                            </>
                          ) : (
                            <>
                              <LinkIcon className="h-4 w-4" />
                              Connect
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Info Section */}
        <Card>
          <CardHeader>
            <CardTitle>About Connections</CardTitle>
            <CardDescription>
              How connected services work with Trainlytics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-medium mb-2">Secure & Private</h3>
                <p className="text-sm text-muted-foreground">
                  All connections use secure OAuth authentication. We never store your passwords.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Automatic Sync</h3>
                <p className="text-sm text-muted-foreground">
                  Once connected, your activities are automatically synced in real-time.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Disconnect Anytime</h3>
                <p className="text-sm text-muted-foreground">
                  You can disconnect any service at any time. Your data remains safe.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Multiple Devices</h3>
                <p className="text-sm text-muted-foreground">
                  Connect as many devices and services as you want.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
