import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, XCircle, Database, Link as LinkIcon } from "lucide-react";
import Sidebar from "@/components/sidebar";

interface ERPNextConfig {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
}

interface HealthStatus {
  success: boolean;
  error?: string;
  responseTime?: number;
}

export default function Settings() {
  const { toast } = useToast();
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");

  const { data: config } = useQuery<ERPNextConfig>({
    queryKey: ["/api/config/erpnext"],
  });

  useEffect(() => {
    if (config) {
      setBaseUrl(config.baseUrl || "");
      setApiKey(config.apiKey || "");
      setApiSecret(config.apiSecret || "");
    }
  }, [config]);

  const { data: healthStatus, refetch: refetchHealth, isLoading: healthLoading } = useQuery<HealthStatus>({
    queryKey: ["/api/health/erpnext"],
    enabled: false,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: ERPNextConfig) => {
      const res = await apiRequest("POST", "/api/config/erpnext", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config/erpnext"] });
      toast({
        title: "Settings saved",
        description: "ERPNext API configuration has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!baseUrl || !apiKey || !apiSecret) {
      toast({
        title: "Validation error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate({ baseUrl, apiKey, apiSecret });
  };

  const handleTestConnection = () => {
    refetchHealth();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-6 py-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground font-myanmar">Settings</h2>
              <p className="text-sm text-muted-foreground mt-1 font-myanmar">
                Configure your ERPNext API connection
              </p>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-4xl">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  ERPNext API Configuration
                </CardTitle>
                <CardDescription>
                  Configure your ERPNext instance connection details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="baseUrl">Base URL</Label>
                  <Input
                    id="baseUrl"
                    type="url"
                    placeholder="https://your-erpnext-instance.com"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    data-testid="input-erpnext-url"
                  />
                  <p className="text-xs text-muted-foreground">
                    The base URL of your ERPNext instance (without /api)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="text"
                    placeholder="Enter your API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    data-testid="input-api-key"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiSecret">API Secret</Label>
                  <Input
                    id="apiSecret"
                    type="password"
                    placeholder="Enter your API secret"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    data-testid="input-api-secret"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    data-testid="button-save-config"
                  >
                    {saveMutation.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Save Configuration
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={healthLoading || !baseUrl || !apiKey || !apiSecret}
                    data-testid="button-test-connection"
                  >
                    {healthLoading && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Test Connection
                  </Button>
                </div>

                {healthStatus && (
                  <div
                    className={`flex items-center gap-2 p-4 rounded-lg ${
                      healthStatus.success
                        ? "bg-success/10 text-success border border-success/20"
                        : "bg-destructive/10 text-destructive border border-destructive/20"
                    }`}
                  >
                    {healthStatus.success ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <div>
                          <p className="font-medium">Connection successful</p>
                          <p className="text-sm opacity-80">
                            Response time: {healthStatus.responseTime}ms
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        <div>
                          <p className="font-medium">Connection failed</p>
                          <p className="text-sm opacity-80">{healthStatus.error}</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database Configuration
                </CardTitle>
                <CardDescription>
                  Supabase PostgreSQL database connection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 p-4 bg-success/10 text-success rounded-lg border border-success/20">
                  <CheckCircle2 className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Database Connected</p>
                    <p className="text-sm opacity-80">
                      Using Supabase PostgreSQL (via DATABASE_URL)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
