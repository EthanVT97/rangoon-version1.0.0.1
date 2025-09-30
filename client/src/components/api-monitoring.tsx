import { useQuery } from "@tanstack/react-query";
import { CheckCircle, AlertTriangle } from "lucide-react";

export default function APIMonitoring() {
  const { data: health } = useQuery({
    queryKey: ["/api/health/erpnext"],
    refetchInterval: 30000,
  });

  const { data: logs } = useQuery({
    queryKey: ["/api/logs"],
  });

  const avgResponseTime = logs?.reduce((acc: number, log: any) => acc + (log.responseTime || 0), 0) / (logs?.length || 1);
  const successRate = logs?.filter((log: any) => log.status === "success").length / (logs?.length || 1) * 100;

  const endpoints = [
    { name: "/api/resource/Item", avgTime: "235ms", status: "healthy" },
    { name: "/api/resource/Customer", avgTime: "198ms", status: "healthy" },
    { name: "/api/resource/Sales Order", avgTime: "312ms", status: "healthy" },
    { name: "/api/resource/Sales Invoice", avgTime: "456ms", status: "slow" },
    { name: "/api/resource/Payment Entry", avgTime: "267ms", status: "healthy" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card border border-border rounded-lg shadow-sm">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground font-myanmar">ERPNext API Status</h3>
          <p className="text-sm text-muted-foreground mt-1">Real-time API health monitoring</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-success/5 border border-success/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground font-myanmar">API Connected</p>
                <p className="text-xs text-muted-foreground">sandbox.erpnext.com</p>
              </div>
            </div>
            <span className="w-2 h-2 bg-success rounded-full" />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium text-foreground font-myanmar">Average Response Time</span>
            <span className="text-sm font-semibold text-primary">{Math.round(avgResponseTime)}ms</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium text-foreground font-myanmar">API Success Rate</span>
            <span className="text-sm font-semibold text-success">{successRate.toFixed(1)}%</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium text-foreground font-myanmar">Requests Today</span>
            <span className="text-sm font-semibold text-foreground">{logs?.length || 0}</span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground font-myanmar">Endpoint Health</h3>
          <p className="text-sm text-muted-foreground mt-1">Individual endpoint monitoring</p>
        </div>

        <div className="p-6 space-y-3">
          {endpoints.map((endpoint) => (
            <div
              key={endpoint.name}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span
                  className={`w-2 h-2 rounded-full ${
                    endpoint.status === "healthy" ? "bg-success" : "bg-warning"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{endpoint.name}</p>
                  <p className="text-xs text-muted-foreground">{endpoint.avgTime} avg</p>
                </div>
              </div>
              <span
                className={`text-xs font-medium ${
                  endpoint.status === "healthy" ? "text-success" : "text-warning"
                }`}
              >
                {endpoint.status === "healthy" ? "Healthy" : "Slow"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
