
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, CheckCircle, AlertTriangle, Zap } from "lucide-react";

interface AutoFixStrategy {
  description: string;
  pattern: string;
}

interface AutoFixStats {
  strategies: AutoFixStrategy[];
  totalStrategies: number;
}

export default function AutoFixMonitor() {
  const { data: autoFixStats } = useQuery<AutoFixStats>({
    queryKey: ["/api/autofix/strategies"],
    refetchInterval: 60000, // Refresh every minute
  });

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="w-5 h-5" />
          Auto-Fix System
        </CardTitle>
        <CardDescription>
          Automated error detection and resolution
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Active Strategies</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {autoFixStats?.totalStrategies || 0}
            </p>
            <p className="text-xs text-muted-foreground">
              Auto-fix patterns loaded
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-sm font-medium">System Status</span>
            </div>
            <p className="text-sm font-bold text-success">Active</p>
            <p className="text-xs text-muted-foreground">
              Monitoring all imports
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground font-myanmar">Available Fixes</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {autoFixStats?.strategies.map((strategy, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="text-sm text-foreground">{strategy.description}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  Pattern
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Smart Recovery</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Automatically detects and fixes common ERPNext integration errors
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
