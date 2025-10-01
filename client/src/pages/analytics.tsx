import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Activity,
  PieChart,
  LineChart as LineChartIcon
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";

interface AnalyticsData {
  dailyImports: Array<{ date: string; success: number; failed: number; pending: number }>;
  hourlyDistribution: Array<{ hour: string; count: number }>;
  statusBreakdown: Array<{ name: string; value: number }>;
  performanceMetrics: Array<{ date: string; avgResponseTime: number; throughput: number }>;
}

const COLORS = {
  primary: "hsl(var(--primary))",
  success: "hsl(var(--success))",
  destructive: "hsl(var(--destructive))",
  warning: "hsl(var(--warning))",
  muted: "hsl(var(--muted))",
};

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("7days");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", timeRange],
    refetchInterval: 60000,
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isMobileOpen={isMobileSidebarOpen} setIsMobileOpen={setIsMobileSidebarOpen} />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-gradient-to-r from-card to-card/80 border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm bg-card/95">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground font-myanmar bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Analytics & Insights
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5 font-myanmar">
                  Import လုပ်ငန်းများ၏ အသေးစိတ် ခွဲခြမ်းစိတ်ဖြာမှုများ
                </p>
              </div>

              <div className="flex items-center gap-2">
                {["24h", "7d", "30d", "90d"].map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range.replace("h", "hours").replace("d", "days") ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange(range.replace("h", "hours").replace("d", "days"))}
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-1/3" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : analytics ? (
            <>
              {/* Daily Imports Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-myanmar">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    နေ့စဉ် Import Trend
                  </CardTitle>
                  <CardDescription className="font-myanmar">
                    အောင်မြင်မှု၊ မအောင်မြင်မှု နှင့် ဆောင်ရွက်ဆဲ imports များ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics.dailyImports}>
                      <defs>
                        <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.destructive} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={COLORS.destructive} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.muted} opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="success"
                        stroke={COLORS.success}
                        fill="url(#successGradient)"
                        strokeWidth={2}
                        name="Successful"
                      />
                      <Area
                        type="monotone"
                        dataKey="failed"
                        stroke={COLORS.destructive}
                        fill="url(#failedGradient)"
                        strokeWidth={2}
                        name="Failed"
                      />
                      <Area
                        type="monotone"
                        dataKey="pending"
                        stroke={COLORS.warning}
                        fill="transparent"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Pending"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hourly Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-myanmar">
                      <Activity className="w-5 h-5 text-primary" />
                      နာရီအလိုက် Import Distribution
                    </CardTitle>
                    <CardDescription className="font-myanmar">
                      တစ်နေ့အတွင်း import လုပ်ငန်းများ၏ ပုံစံ
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.hourlyDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.muted} opacity={0.3} />
                        <XAxis 
                          dataKey="hour" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px"
                          }}
                        />
                        <Bar 
                          dataKey="count" 
                          fill={COLORS.primary}
                          radius={[8, 8, 0, 0]}
                          name="Import Count"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Status Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-myanmar">
                      <PieChart className="w-5 h-5 text-primary" />
                      Status ခွဲခြားမှု
                    </CardTitle>
                    <CardDescription className="font-myanmar">
                      Import status များ၏ အချိုးအစား
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPie>
                        <Pie
                          data={analytics.statusBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analytics.statusBreakdown.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={
                                entry.name === "Success" ? COLORS.success :
                                entry.name === "Failed" ? COLORS.destructive :
                                COLORS.warning
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px"
                          }}
                        />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-myanmar">
                    <LineChartIcon className="w-5 h-5 text-primary" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription className="font-myanmar">
                    Response time နှင့် throughput measurements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.performanceMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.muted} opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        yAxisId="left"
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12}
                        label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12}
                        label={{ value: 'Throughput', angle: 90, position: 'insideRight' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="avgResponseTime"
                        stroke={COLORS.primary}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name="Avg Response Time (ms)"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="throughput"
                        stroke={COLORS.success}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name="Throughput"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <p className="text-muted-foreground font-myanmar">
                  Analytics data မရရှိနိုင်ပါ
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
