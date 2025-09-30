import { Bell, Menu } from "lucide-react";
import Sidebar from "@/components/sidebar";
import StatsCards from "@/components/stats-cards";
import UploadSection from "@/components/upload-section";
import ProcessingStatus from "@/components/processing-status";
import ImportLogs from "@/components/import-logs";
import APIMonitoring from "@/components/api-monitoring";

export default function Dashboard() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground font-myanmar">Excel Import Dashboard</h2>
                <p className="text-sm text-muted-foreground mt-1 font-myanmar">
                  ERPNePOS မှ ERPNext သို့ Real-Time Data Flow
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-4 py-2 bg-success/10 text-success rounded-lg border border-success/20">
                  <span className="w-2 h-2 bg-success rounded-full" />
                  <span className="text-sm font-medium font-myanmar">ERPNext Connected</span>
                </div>

                <button className="p-2 hover:bg-muted rounded-lg transition-colors relative" data-testid="button-notifications">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                </button>

                <button className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors" data-testid="button-menu">
                  <Menu className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <StatsCards />
          <UploadSection />
          <ProcessingStatus />
          <ImportLogs />
          <APIMonitoring />
        </div>
      </main>
    </div>
  );
}
