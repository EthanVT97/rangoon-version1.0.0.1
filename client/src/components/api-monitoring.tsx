import { useQuery } from "@tanstack/react-query";
import { CheckCircle, XCircle, AlertCircle, Activity, Database, Wifi } from "lucide-react";
import type { ApiLog } from "@shared/schema";
import { useState, useEffect, useMemo } from "react";

interface HealthStatus {
  success: boolean;
  error?: string;
  responseTime?: number;
  statusCode?: number;
}

interface EndpointHealth {
  name: string;
  avgTime: string;
  status: "healthy" | "slow" | "unresponsive";
}

export default function APIMonitoring() {
  const { data: healthStatus, refetch } = useQuery<HealthStatus>({
    queryKey: ["/api/health/erpnext"],
    refetchInterval: 30000, // Check every 30 seconds
  });

  const { data: logs } = useQuery<ApiLog[]>({
    queryKey: ["/api/logs"],
    refetchInterval: 10000, // Refresh logs every 10 seconds
  });

  const [lastCheck, setLastCheck] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastCheck(new Date());
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const endpointHealthData: EndpointHealth[] = useMemo(() => {
    if (!logs || logs.length === 0) return [];

    const endpointMap: { [key: string]: { totalTime: number; count: number; failedCount: number } } = {};

    logs.forEach(log => {
      // Filter out overall import logs, focus on individual endpoint calls
      // recordCount is notNull() and has a default of 0 according to schema, so direct comparison is fine.
      if (!log.endpoint || log.recordCount > 1) return; 

      if (!endpointMap[log.endpoint]) {
        endpointMap[log.endpoint] = { totalTime: 0, count: 0, failedCount: 0 };
      }
      endpointMap[log.endpoint].totalTime += log.responseTime; // responseTime is notNull()
      endpointMap[log.endpoint].count += 1;
      if (log.status === 'failed') {
        endpointMap[log.endpoint].failedCount += 1;
      }
    });

    return Object.entries(endpointMap).map(([endpoint, stats]) => {
      const avgTimeMs = stats.count > 0 ? stats.totalTime / stats.count : 0;
      let status: EndpointHealth['status'] = 'healthy';
      if (avgTimeMs > 400) status = 'slow'; // Threshold for "slow"
      if (stats.failedCount > 0 && stats.failedCount === stats.count) status = 'unresponsive'; // All failed
      if (stats.count === 0) status = 'unresponsive'; // No calls

      return {
        name: endpoint,
        avgTime: `${Math.round(avgTimeMs)}ms`,
        status: status,
      };
    }).sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically for consistency
  }, [logs]);


  const isConnected = healthStatus?.success || false;
  const responseTime = healthStatus?.responseTime || 0; // healthStatus?.responseTime can be undefined

  const totalLogs = logs?.length || 0;
  const successCountLogs = logs?.filter((log) => log.status === "success" || log.status === "completed").length || 0;
  const successRate = totalLogs > 0 ? (successCountLogs / totalLogs) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-gradient-to-br from-card to-card/80 border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <h3 className="text-lg font-semibold text-foreground font-myanmar">ERPNext API Status</h3>
          <p className="text-sm text-muted-foreground mt-1">Real-time API health monitoring</p>
        </div>

        <div className="p-6 space-y-4">
          <div className={`flex items-center justify-between p-4 rounded-lg ${
            isConnected 
              ? "bg-success/5 border border-success/20" 
              : "bg-destructive/5 border border-destructive/20"
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isConnected ? "bg-success/10" : "bg-destructive/10"
              }`}>
                {isConnected ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground font-myanmar">
                  {isConnected ? "API Connected" : "API Disconnected"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {healthStatus?.error || "ERPNext API Ready"}
                </p>
              </div>
            </div>
            <span className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-success" : "bg-destructive"
            }`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Response Time</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{responseTime}ms</p>
              <p className="text-xs text-muted-foreground">
                {isConnected ? "Last check successful" : "Connection failed"}
              </p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Wifi className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Last Check</span>
              </div>
              <p className="text-sm font-bold text-foreground">
                {lastCheck.toLocaleTimeString()}
              </p>
              <p className="text-xs text-muted-foreground">Auto-refresh: 30s</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium text-foreground font-myanmar">API Success Rate</span>
            <span className="text-sm font-semibold text-success">{successRate.toFixed(1)}%</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium text-foreground font-myanmar">Requests Today</span>
            <span className="text-sm font-semibold text-foreground">{totalLogs}</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-card to-card/80 border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <h3 className="text-lg font-semibold text-foreground font-myanmar">Endpoint Health</h3>
          <p className="text-sm text-muted-foreground mt-1">Individual ERPNext endpoint monitoring</p>
        </div>

        <div className="p-6 space-y-3">
          {endpointHealthData.length > 0 ? (
            endpointHealthData.map((endpoint) => (
              <div
                key={endpoint.name}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      endpoint.status === "healthy" ? "bg-success" :
                      endpoint.status === "slow" ? "bg-warning" : "bg-destructive"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{endpoint.name}</p>
                    <p className="text-xs text-muted-foreground">{endpoint.avgTime} avg</p>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium ${
                    endpoint.status === "healthy" ? "text-success" :
                    endpoint.status === "slow" ? "text-warning" : "text-destructive"
                  }`}
                >
                  {endpoint.status === "healthy" ? "Healthy" :
                   endpoint.status === "slow" ? "Slow" : "Unresponsive"}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground font-myanmar">
              No endpoint data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
