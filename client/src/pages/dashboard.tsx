import { Bell, Menu } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import StatsCards from "@/components/stats-cards";
import UploadSection from "@/components/upload-section";
import ProcessingStatus from "@/components/processing-status";
import ImportLogs from "@/components/import-logs";
import APIMonitoring from "@/components/api-monitoring";
import LiveChatWidget from "@/components/live-chat-widget";

interface HealthStatus {
  success: boolean;
  error?: string;
}

export default function Dashboard() {
  const { data: health } = useQuery<HealthStatus>({
    queryKey: ["/api/health/erpnext"],
    refetchInterval: 30000,
  });

  const isConnected = health?.success;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-gradient-to-r from-card to-card/80 border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm bg-card/95">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground font-myanmar bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Excel Import Dashboard
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5 font-myanmar flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  ERPNePOS မှ ERPNext သို့ Real-Time Data Flow
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                  isConnected 
                    ? "bg-success/10 text-success border-success/20 shadow-sm shadow-success/5" 
                    : "bg-destructive/10 text-destructive border-destructive/20"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-success animate-pulse" : "bg-destructive"}`} />
                  <span className="text-sm font-medium font-myanmar">
                    {isConnected ? "ERPNext Connected" : "ERPNext Disconnected"}
                  </span>
                </div>

                <button className="p-2.5 hover:bg-muted/80 rounded-lg transition-all hover:shadow-sm relative group" data-testid="button-notifications">
                  <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full animate-pulse" />
                </button>

                <button className="lg:hidden p-2.5 hover:bg-muted/80 rounded-lg transition-all hover:shadow-sm" data-testid="button-menu">
                  <Menu className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
          <StatsCards />
          <UploadSection />
          <ProcessingStatus />
          <ImportLogs />
          <APIMonitoring />
        </div>

        <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm mt-auto relative z-10">
          <div className="max-w-[1600px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground font-myanmar">
                  All rights reserved © Rangoon, Under Development
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/20 text-success">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span className="text-xs font-medium font-myanmar">
                    Live Chat Widget - Active
                  </span>
                </div>
                <div className="text-xs text-muted-foreground font-myanmar">
                  Click bottom-right to chat
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Live Chat Widget */}
      <LiveChatWidget />
    </div>
  );
}
