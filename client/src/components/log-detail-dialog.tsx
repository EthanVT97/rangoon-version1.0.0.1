import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, AlertCircle, Clock, FileText, Database, Activity } from "lucide-react";
import type { ApiLog } from "@shared/schema";

interface LogDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: ApiLog | null;
}

export default function LogDetailDialog({ open, onOpenChange, log }: LogDetailDialogProps) {
  if (!log) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-success";
      case "failed":
        return "text-destructive";
      case "processing":
        return "text-primary";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case "processing":
        return <Activity className="w-5 h-5 text-primary animate-pulse" />;
      default:
        return <FileText className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getStatusIcon(log.status)}
            <span className="font-myanmar">Import Log Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">File Name</p>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">{log.filename}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Module</p>
              <p className="text-sm font-semibold text-foreground">{log.module}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className={`text-sm font-semibold ${getStatusColor(log.status)} capitalize`}>
                {log.status}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Total Records</p>
              <p className="text-2xl font-bold text-foreground">{log.recordCount ?? 0}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Successful</p>
              <p className="text-2xl font-bold text-success">{log.successCount ?? 0}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold text-destructive">{log.failureCount ?? 0}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Database className="w-4 h-4" />
              API Endpoint
            </p>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm font-mono text-foreground">
                {log.method} {log.endpoint}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Response Time</p>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm font-semibold text-foreground">{log.responseTime}ms</p>
            </div>
          </div>

          {log.erpnextResponse && typeof log.erpnextResponse === 'object' && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">ERPNext Response</p>
              <div className="bg-muted/50 rounded-lg p-4 max-h-60 overflow-y-auto">
                <pre className="text-xs font-mono text-foreground whitespace-pre-wrap">
                  {JSON.stringify(log.erpnextResponse, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {log.errors && typeof log.errors === 'object' && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Errors
              </p>
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 max-h-60 overflow-y-auto">
                <pre className="text-xs font-mono text-destructive whitespace-pre-wrap">
                  {JSON.stringify(log.errors, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
      }
