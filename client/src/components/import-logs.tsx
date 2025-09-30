import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Download, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import LogDetailDialog from "./log-detail-dialog";
import type { ApiLog } from "@shared/schema";

export default function ImportLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<ApiLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: logs } = useQuery<ApiLog[]>({
    queryKey: ["/api/logs", statusFilter],
    refetchInterval: 5000,
  });

  const filteredLogs = logs?.filter((log) =>
    log.filename.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleViewLog = (log: ApiLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  const handleExport = () => {
    try {
      const dataToExport = filteredLogs.map((log) => ({
        timestamp: new Date(log.timestamp).toISOString(),
        filename: log.filename,
        module: log.module,
        records: log.recordCount,
        successful: log.successCount,
        failed: log.failureCount,
        status: log.status,
        responseTime: log.responseTime,
      }));

      const csv = [
        ["Timestamp", "Filename", "Module", "Records", "Successful", "Failed", "Status", "Response Time (ms)"].join(","),
        ...dataToExport.map((row) =>
          [
            row.timestamp,
            `"${row.filename}"`,
            row.module,
            row.records,
            row.successful,
            row.failed,
            row.status,
            row.responseTime,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `import-logs-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Logs exported to CSV file",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export logs",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
            <span className="w-2 h-2 bg-success rounded-full" />
            <span className="font-myanmar">အောင်မြင်သည်</span>
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
            <span className="w-2 h-2 bg-destructive rounded-full" />
            <span className="font-myanmar">မအောင်မြင်</span>
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="font-myanmar">လုပ်ဆောင်နေသည်</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-br from-card to-card/80 border border-border/50 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground font-myanmar">Import History & Logs</h3>
            <p className="text-sm text-muted-foreground mt-1 font-myanmar">
              Supabase database မှ comprehensive logging
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
                data-testid="input-search-logs"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              data-testid="select-status-filter"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="processing">Processing</option>
            </select>

            <Button variant="ghost" size="sm" onClick={handleExport} data-testid="button-export-logs">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Filename
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-myanmar">
                Module
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Records
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredLogs.map((log: any) => (
              <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{log.filename}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {log.module}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {log.recordCount || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(log.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <Button variant="link" size="sm" onClick={() => handleViewLog(log)} data-testid="button-view-log">
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredLogs.length === 0 && (
        <div className="p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-myanmar">No logs found</p>
        </div>
      )}

      <LogDetailDialog open={dialogOpen} onOpenChange={setDialogOpen} log={selectedLog} />
    </div>
  );
}
