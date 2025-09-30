import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function StatsCards() {
  const { data: stats } = useQuery({
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
            className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground font-myanmar">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                {stat.subtitle && (
                  <p className={`text-xs mt-2 font-myanmar ${stat.subtitleColor || "text-success"}`}>
                    {stat.change || stat.subtitle}
                  </p>
                )}
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${stat.iconColor} ${stat.spin ? "animate-spin" : ""}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
