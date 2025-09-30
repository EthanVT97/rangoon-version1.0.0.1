import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface StatsData {
  totalImports: number;
  successfulImports: number;
  failedImports: number;
  processingImports: number;
  successRate: number;
}

export default function StatsCards() {
  const { data: stats } = useQuery<StatsData>({
    queryKey: ["/api/stats"],
    refetchInterval: 5000,
  });

  const statCards = [
    {
      title: "စုစုပေါင်း Import",
      value: stats?.totalImports || 0,
      change: "+12% from last month",
      icon: Upload,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "အောင်မြင်မှု ရာခိုင်နှုန်း",
      value: `${stats?.successRate || 0}%`,
      subtitle: `${stats?.successfulImports || 0} ခု အောင်မြင်သည်`,
      icon: CheckCircle,
      bgColor: "bg-success/10",
      iconColor: "text-success",
    },
    {
      title: "မအောင်မြင်သော Import",
      value: stats?.failedImports || 0,
      subtitle: "ပြန်လည်စစ်ဆေးရန်",
      icon: AlertCircle,
      bgColor: "bg-destructive/10",
      iconColor: "text-destructive",
      subtitleColor: "text-destructive",
    },
    {
      title: "လုပ်ဆောင်နေသည်",
      value: stats?.processingImports || 0,
      subtitle: "Records လုပ်ဆောင်နေသည်",
      icon: Loader2,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
      spin: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground font-myanmar mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground mt-2 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">{stat.value}</p>
                {stat.subtitle && (
                  <p className={`text-xs mt-2.5 font-myanmar font-medium ${stat.subtitleColor || "text-success"}`}>
                    {stat.change || stat.subtitle}
                  </p>
                )}
              </div>
              <div className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-7 h-7 ${stat.iconColor} ${stat.spin ? "animate-spin" : ""}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
