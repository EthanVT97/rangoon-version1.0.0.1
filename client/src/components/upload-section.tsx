import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Download, FileText, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function UploadSection() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [module, setModule] = useState("Item");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/upload-excel", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Upload failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload Successful",
        description: `${data.recordCount} records are being processed`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      setSelectedFile(null);
    },
    onError: (error: any) => {
      const errorData = error.message;
      toast({
        title: "Upload Failed",
        description: errorData,
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const handleUpload = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("module", module);

    uploadMutation.mutate(formData);
  };

  const downloadTemplate = async () => {
    try {
      const res = await fetch(`/api/template/${module}`);
      if (!res.ok) throw new Error("Template not found");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${module}_template.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Template not found",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-gradient-to-br from-card to-card/80 border border-border/50 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
            <h3 className="text-lg font-semibold text-foreground font-myanmar flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Excel File Upload
            </h3>
            <p className="text-sm text-muted-foreground mt-1.5 font-myanmar">
              Excel file များကို ဤနေရာတွင် drag & drop လုပ်ပါ သို့မဟုတ် နှိပ်၍ ရွေးချယ်ပါ
            </p>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2 font-myanmar">Module</label>
              <select
                value={module}
                onChange={(e) => setModule(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                data-testid="select-module"
              >
                <option value="Item">Item</option>
                <option value="Customer">Customer</option>
                <option value="Sales Order">Sales Order</option>
                <option value="Sales Invoice">Sales Invoice</option>
                <option value="Payment Entry">Payment Entry</option>
              </select>
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <input {...getInputProps()} />
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-base font-semibold text-foreground mb-2 font-myanmar">
                File များကို ဤနေရာတွင် ချပါ
              </h4>
              <p className="text-sm text-muted-foreground mb-4 font-myanmar">
                သို့မဟုတ် <span className="text-primary font-medium">browse</span> နှိပ်၍ ရွေးချယ်ပါ
              </p>
              <p className="text-xs text-muted-foreground font-myanmar">
                Supported: .xlsx, .xls (Max 10MB)
              </p>
            </div>

            {selectedFile && (
              <div className="mt-6">
                <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedFile(null)}
                    data-testid="button-remove-file"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploadMutation.isPending}
                className="flex-1 min-w-[200px] font-myanmar"
                data-testid="button-upload"
              >
                <Upload className="w-5 h-5 mr-2" />
                {uploadMutation.isPending ? "Uploading..." : "Upload & Process"}
              </Button>

              <Button
                variant="secondary"
                onClick={downloadTemplate}
                className="font-myanmar"
                data-testid="button-download-template"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Template
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-card to-card/80 border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <h3 className="text-lg font-semibold text-foreground font-myanmar flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            အသုံးပြုပုံ လမ်းညွှန်
          </h3>
        </div>

        <div className="p-6 space-y-4">
          {[
            { num: 1, title: "Template Download", desc: "မှန်ကန်သော format ရရှိရန် template ကို download လုပ်ပါ" },
            { num: 2, title: "Data Entry", desc: "Template တွင် data များကို ထည့်သွင်းပါ (item_code, qty, etc.)" },
            { num: 3, title: "Upload File", desc: "Excel file ကို drag & drop သို့မဟုတ် browse ပြုလုပ်ပါ" },
            { num: 4, title: "Validation & Process", desc: "Data များကို validate လုပ်ပြီး ERPNext သို့ ပို့ဆောင်မည်" },
          ].map((step) => (
            <div key={step.num} className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">{step.num}</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground font-myanmar">{step.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 font-myanmar">{step.desc}</p>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-border">
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-medium text-warning font-myanmar">သတိပြုရန်</h5>
                  <p className="text-xs text-muted-foreground mt-1 font-myanmar">
                    Required fields များမပါဝင်ပါက validation error ဖြစ်နိုင်ပါသည်
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}