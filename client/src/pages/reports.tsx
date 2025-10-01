import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";

interface ReportStats {
  totalImports: number;
  successfulImports: number;
  failedImports: number;
  pendingImports: number;
  totalRecords: number;
  successRate: number;
}

interface ImportRecord {
  id: number;
  filename: string;
  status: string;
  recordCount: number;
  successCount: number;
  errorCount: number;
  createdAt: string;
}

export default function Reports() {
  const [dateRange, setDateRange] = useState("7days");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<ReportStats>({
    queryKey: ["/api/reports/stats", dateRange],
    refetchInterval: 30000,
  });

  const { data: recentImports, isLoading: importsLoading, refetch: refetchImports } = useQuery<ImportRecord[]>({
    queryKey: ["/api/reports/recent-imports", dateRange],
    refetchInterval: 30000,
  });

  const handleRefresh = () => {
    refetchStats();
    refetchImports();
  };

  const handleExport = async (format: string) => {
    try {
      const response = await fetch(`/api/reports/export?format=${format}&range=${dateRange}`, {
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `import-report-${format}-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
    }
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
                  Import Reports
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5 font-myanmar">
                  Import လုပ်ငန်းများ၏ အသေးစိတ် အစီရင်ခံစာများ
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="font-myanmar"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("csv")}
                  className="font-myanmar"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("xlsx")}
                  className="font-myanmar"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
          {/* Date Range Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <div className="flex gap-2">
                  {["24hours", "7days", "30days", "90days", "all"].map((range) => (
                    <Button
                      key={range}
                      variant={dateRange === range ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDateRange(range)}
                      className="font-myanmar"
                    >
                      {range === "24hours" && "24 Hours"}
                      {range === "7days" && "7 Days"}
                      {range === "30days" && "30 Days"}
                      {range === "90days" && "90 Days"}
                      {range === "all" && "All Time"}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-muted rounded w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <CardDescription className="font-myanmar">စုစုပေါင်း Import</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{stats.totalImports}</div>
                    <FileText className="w-8 h-8 text-primary opacity-20" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 font-myanmar">
                    {stats.totalRecords.toLocaleString()} records
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-success">
                <CardHeader className="pb-3">
                  <CardDescription className="font-myanmar">အောင်မြင်သော Import</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-success">{stats.successfulImports}</div>
                    <CheckCircle2 className="w-8 h-8 text-success opacity-20" />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-xs text-success font-medium">
                      {stats.successRate.toFixed(1)}% success rate
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-destructive">
                <CardHeader className="pb-3">
                  <CardDescription className="font-myanmar">မအောင်မြင်သော Import</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-destructive">{stats.failedImports}</div>
                    <XCircle className="w-8 h-8 text-destructive opacity-20" />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <TrendingDown className="w-4 h-4 text-destructive" />
                    <span className="text-xs text-destructive font-medium">
                      {((stats.failedImports / stats.totalImports) * 100).toFixed(1)}% failed
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-warning">
                <CardHeader className="pb-3">
                  <CardDescription className="font-myanmar">ဆောင်ရွက်ဆဲ Import</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-warning">{stats.pendingImports}</div>
                    <Clock className="w-8 h-8 text-warning opacity-20" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 font-myanmar">
                    Currently processing
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {/* Recent Imports Table */}
          <Card>
            <CardHeader>
              <CardTitle className="font-myanmar">မကြာသေးမီက Import လုပ်ငန်းများ</CardTitle>
              <CardDescription className="font-myanmar">
                အသေးစိတ် import history နှင့် status များ
              </CardDescription>
            </CardHeader>
            <CardContent>
              {importsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : recentImports && recentImports.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-myanmar text-sm font-medium text-muted-foreground">
                          File Name
                        </th>
                        <th className="text-left py-3 px-4 font-myanmar text-sm font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="text-right py-3 px-4 font-myanmar text-sm font-medium text-muted-foreground">
                          Records
                        </th>
                        <th className="text-right py-3 px-4 font-myanmar text-sm font-medium text-muted-foreground">
                          Success
                        </th>
                        <th className="text-right py-3 px-4 font-myanmar text-sm font-medium text-muted-foreground">
                          Errors
                        </th>
                        <th className="text-left py-3 px-4 font-myanmar text-sm font-medium text-muted-foreground">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentImports.map((record) => (
                        <tr key={record.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{record.filename}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              record.status === "completed"
                                ? "bg-success/10 text-success border border-success/20"
                                : record.status === "failed"
                                ? "bg-destructive/10 text-destructive border border-destructive/20"
                                : "bg-warning/10 text-warning border border-warning/20"
                            }`}>
                              {record.status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                              {record.status === "failed" && <XCircle className="w-3 h-3" />}
                              {record.status === "processing" && <Clock className="w-3 h-3" />}
                              {record.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-medium">{record.recordCount}</td>
                          <td className="py-3 px-4 text-right text-success font-medium">{record.successCount}</td>
                          <td className="py-3 px-4 text-right text-destructive font-medium">{record.errorCount}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {format(new Date(record.createdAt), "MMM dd, yyyy HH:mm")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <p className="text-muted-foreground font-myanmar">
                    ရွေးချယ်ထားသော ကာလအတွင်း import records မရှိပါ
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
