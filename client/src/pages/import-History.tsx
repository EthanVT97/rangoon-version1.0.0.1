import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImportHistory {
  id: number;
  filename: string;
  originalName: string;
  status: "pending" | "processing" | "completed" | "failed";
  recordCount: number;
  successCount: number;
  errorCount: number;
  errors?: Array<{ row: number; error: string; data: any }>;
  createdAt: string;
  completedAt?: string;
  processingTime?: number;
  uploadedBy?: string;
}

interface PaginationData {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function ImportHistory() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImport, setSelectedImport] = useState<ImportHistory | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: historyData, isLoading } = useQuery<{
    imports: ImportHistory[];
    pagination: PaginationData;
  }>({
    queryKey: ["/api/imports/history", currentPage, searchQuery, statusFilter],
    refetchInterval: 10000,
  });

  const handleViewDetails = (importRecord: ImportHistory) => {
    setSelectedImport(importRecord);
    setIsDetailsOpen(true);
  };

  const handleDownloadErrors = (importRecord: ImportHistory) => {
    if (!importRecord.errors || importRecord.errors.length === 0) return;
    
    const csvContent = [
      ["Row", "Error", "Data"],
      ...importRecord.errors.map(e => [
        e.row,
        e.error,
        JSON.stringify(e.data)
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${importRecord.filename}-errors.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
            <XCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            Processing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
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
                  Import History
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5 font-myanmar">
                  တင်သွင်းခဲ့သော file များ၏ အသေးစိတ် မှတ်တမ်းများ
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by filename..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                    className="font-myanmar"
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === "completed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("completed")}
                    className="font-myanmar"
                  >
                    Completed
                  </Button>
                  <Button
                    variant={statusFilter === "processing" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("processing")}
                    className="font-myanmar"
                  >
                    Processing
                  </Button>
                  <Button
                    variant={statusFilter === "failed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("failed")}
                    className="font-myanmar"
                  >
                    Failed
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History Table */}
          <Card>
            <CardHeader>
              <CardTitle className="font-myanmar">Import Records</CardTitle>
              <CardDescription className="font-myanmar">
                {historyData?.pagination.total || 0} total imports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : historyData && historyData.imports.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-4 px-4 font-myanmar text-sm font-medium text-muted-foreground">
                            File Name
                          </th>
                          <th className="text-center py-4 px-4 font-myanmar text-sm font-medium text-muted-foreground">
                            Status
                          </th>
                          <th className="text-center py-4 px-4 font-myanmar text-sm font-medium text-muted-foreground">
                            Records
                          </th>
                          <th className="text-center py-4 px-4 font-myanmar text-sm font-medium text-muted-foreground">
                            Success
                          </th>
                          <th className="text-center py-4 px-4 font-myanmar text-sm font-medium text-muted-foreground">
                            Errors
                          </th>
                          <th className="text-left py-4 px-4 font-myanmar text-sm font-medium text-muted-foreground">
                            Date
                          </th>
                          <th className="text-center py-4 px-4 font-myanmar text-sm font-medium text-muted-foreground">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyData.imports.map((record) => (
                          <tr 
                            key={record.id} 
                            className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{record.originalName}</p>
                                  <p className="text-xs text-muted-foreground">{record.filename}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              {getStatusBadge(record.status)}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="font-medium">{record.recordCount}</span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="font-medium text-success">{record.successCount}</span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={`font-medium ${record.errorCount > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                {record.errorCount}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(record.createdAt), "MMM dd, yyyy HH:mm")}
                              </div>
                              {record.processingTime && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {(record.processingTime / 1000).toFixed(2)}s processing time
                                </p>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetails(record)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {record.errorCount > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDownloadErrors(record)}
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {historyData.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                      <p className="text-sm text-muted-foreground font-myanmar">
                        Page {historyData.pagination.page} of {historyData.pagination.totalPages}
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
                          onClick={() => setCurrentPage(prev => Math.min(historyData.pagination.totalPages, prev + 1))}
                          disabled={currentPage === historyData.pagination.totalPages}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <FileSpreadsheet className="w-16 h-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <p className="text-lg font-medium text-muted-foreground font-myanmar mb-2">
                    No import history found
                  </p>
                  <p className="text-sm text-muted-foreground font-myanmar">
                    {searchQuery || statusFilter !== "all" 
                      ? "Try adjusting your filters" 
                      : "Start by uploading your first Excel file"
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-myanmar">Import Details</DialogTitle>
            <DialogDescription className="font-myanmar">
              {selectedImport?.originalName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedImport && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-myanmar">Status</p>
                  {getStatusBadge(selectedImport.status)}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-myanmar">Upload Date</p>
                  <p className="text-sm font-medium">
                    {format(new Date(selectedImport.createdAt), "MMM dd, yyyy HH:mm:ss")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-myanmar">Total Records</p>
                  <p className="text-2xl font-bold">{selectedImport.recordCount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-myanmar">Success Rate</p>
                  <p className="text-2xl font-bold text-success">
                    {((selectedImport.successCount / selectedImport.recordCount) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-myanmar">Successful</p>
                  <p className="text-xl font-bold text-success">{selectedImport.successCount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-myanmar">Failed</p>
                  <p className="text-xl font-bold text-destructive">{selectedImport.errorCount}</p>
                </div>
              </div>

              {selectedImport.errors && selectedImport.errors.length > 0 && (
                <div className="space-y-3 mt-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold font-myanmar flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-destructive" />
                      Error Details ({selectedImport.errors.length})
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadErrors(selectedImport)}
                      className="font-myanmar"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Errors
                    </Button>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {selectedImport.errors.slice(0, 10).map((error, idx) => (
                      <div 
                        key={idx}
                        className="p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">Row {error.row}</p>
                            <p className="text-xs text-muted-foreground mt-1">{error.error}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {selectedImport.errors.length > 10 && (
                      <p className="text-xs text-center text-muted-foreground py-2 font-myanmar">
                        Showing 10 of {selectedImport.errors.length} errors. Download CSV to see all.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
