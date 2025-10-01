import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface APILog {
  id: number;
  method: string;
  endpoint: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  requestBody?: any;
  responseBody?: any;
  errorMessage?: string;
  userId?: number;
}

interface LogStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;
  requestsPerMinute: number;
}

export default function APILogs() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  const { data: logsData, isLoading, refetch } = useQuery<{
    logs: APILog[];
    total: number;
    stats: LogStats;
  }>({
    queryKey: ["/api/logs", currentPage, searchQuery, statusFilter, methodFilter],
    refetchInterval: 5000,
  });

  const getStatusBadge = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return (
        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
          {statusCode}
        </Badge>
      );
    } else if (statusCode >= 400 && statusCode < 500) {
      return (
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
          {statusCode}
        </Badge>
      );
    } else if (statusCode >= 500) {
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
          {statusCode}
        </Badge>
      );
    }
    return <Badge variant="outline">{statusCode}</Badge>;
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      GET: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      POST: "bg-green-500/10 text-green-500 border-green-500/20",
      PUT: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
      PATCH: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    };

    return (
      <Badge 
        variant="outline" 
        className={colors[method as keyof typeof colors] || ""}
      >
        {method}
      </Badge>
    );
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 100) return <span className="text-success">{ms}ms</span>;
    if (ms < 500) return <span className="text-warning">{ms}ms</span>;
    return <span className="text-destructive">{ms}ms</span>;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isMobileOpen={isMobileSidebarOpen} setIsMobileOpen={setIsMobileSidebarOpen} />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-gradient-to-r from-card to-card/80 border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm bg-card/95">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground font-myanmar bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  API Logs & Monitoring
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5 font-myanmar">
                  Real-time API request tracking နှင့် performance monitoring
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="font-myanmar"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
          {/* Stats Overview */}
          {logsData?.stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs font-myanmar">Total Requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{logsData.stats.totalRequests}</div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-success">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs font-myanmar">Successful</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-success">
                      {logsData.stats.successfulRequests}
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-success opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-destructive">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs font-myanmar">Failed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-destructive">
                      {logsData.stats.failedRequests}
                    </div>
                    <XCircle className="w-8 h-8 text-destructive opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-warning">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs font-myanmar">Avg Response Time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {logsData.stats.avgResponseTime.toFixed(0)}ms
                    </div>
                    <Clock className="w-8 h-8 text-warning opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs font-myanmar">Requests/Min</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {logsData.stats.requestsPerMinute.toFixed(1)}
                    </div>
                    <TrendingUp className="w-8 h-8 text-primary opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by endpoint..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <div className="flex gap-1">
                    {["all", "GET", "POST", "PUT", "DELETE"].map((method) => (
                      <Button
                        key={method}
                        variant={methodFilter === method ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMethodFilter(method)}
                      >
                        {method}
                      </Button>
                    ))}
                  </div>

                  <div className="flex gap-1 border-l pl-2">
                    <Button
                      variant={statusFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("all")}
                    >
                      All
                    </Button>
                    <Button
                      variant={statusFilter === "success" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("success")}
                      className="text-success"
                    >
                      2xx
                    </Button>
                    <Button
                      variant={statusFilter === "error" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("error")}
                      className="text-destructive"
                    >
                      4xx/5xx
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle className="font-myanmar">Request Logs</CardTitle>
              <CardDescription className="font-myanmar">
                {logsData?.total || 0} total requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : logsData && logsData.logs.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                            Time
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                            Method
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                            Endpoint
                          </th>
                          <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">
                            Status
                          </th>
                          <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">
                            Response Time
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                            Error
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {logsData.logs.map((log) => (
                          <tr 
                            key={log.id}
                            className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                              {format(new Date(log.timestamp), "HH:mm:ss")}
                            </td>
                            <td className="py-3 px-4">
                              {getMethodBadge(log.method)}
                            </td>
                            <td className="py-3 px-4">
                              <code className="text-xs font-mono">{log.endpoint}</code>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {getStatusBadge(log.statusCode)}
                            </td>
                            <td className="py-3 px-4 text-right text-sm font-medium">
                              {formatResponseTime(log.responseTime)}
                            </td>
                            <td className="py-3 px-4">
                              {log.errorMessage && (
                                <div className="flex items-center gap-2 text-xs text-destructive">
                                  <AlertTriangle className="w-4 h-4" />
                                  <span className="truncate max-w-xs">
                                    {log.errorMessage}
                                  </span>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {logsData.total > pageSize && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, logsData.total)} of {logsData.total}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => prev + 1)}
                          disabled={currentPage * pageSize >= logsData.total}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <Activity className="w-16 h-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <p className="text-lg font-medium text-muted-foreground font-myanmar mb-2">
                    No API logs found
                  </p>
                  <p className="text-sm text-muted-foreground font-myanmar">
                    {searchQuery || statusFilter !== "all" || methodFilter !== "all"
                      ? "Try adjusting your filters"
                      : "API logs will appear here as requests are made"
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
                        }
