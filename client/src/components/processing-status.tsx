import { useQuery } from "@tanstack/react-query";
import { CheckCircle, AlertCircle, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApiLog } from "@shared/schema";

export default function ProcessingStatus() {
  const { data: logs, refetch } = useQuery<ApiLog[]>({
    queryKey: ["/api/logs"],
    refetchInterval: 3000,
  });

  const processingLogs = logs?.filter((log) => log.status === "processing") || [];
  const recentLogs = logs?.slice(0, 3) || [];

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground font-myanmar">Processing Status</h3>
            <p className="text-sm text-muted-foreground mt-1 font-myanmar">
              Real-time upload နှင့် validation status
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="font-myanmar"
            data-testid="button-refresh-status"
          >
            <Loader2 className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {recentLogs.map((log: any) => (
            <div
              key={log.id}
              className={`rounded-lg p-4 border ${
                log.status === "success"
                  ? "bg-success/5 border-success/20"
                  : log.status === "failed"
                  ? "bg-destructive/5 border-destructive/20"
                  : "bg-primary/5 border-primary/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      log.status === "success"
                        ? "bg-success/10"
                        : log.status === "failed"
                        ? "bg-destructive/10"
                        : "bg-primary/10"
                    }`}
                  >
                    {log.status === "success" ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : log.status === "failed" ? (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    ) : (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{log.filename}</p>
                    <p className="text-xs text-muted-foreground font-myanmar">
                      {log.status === "success"
                        ? `${log.successCount} records successfully imported`
                        : log.status === "failed"
                        ? `Validation failed: ${log.failureCount} errors`
                        : "Processing..."}
                    </p>
                  </div>
                </div>
                <Button variant="link" size="sm" className="font-myanmar" data-testid="button-view-details">
                  အသေးစိတ်ကြည့်ရန်
                </Button>
              </div>
            </div>
          ))}

          {recentLogs.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-myanmar">No recent uploads</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
