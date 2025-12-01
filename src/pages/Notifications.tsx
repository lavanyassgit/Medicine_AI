import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

interface NewsAlert {
  id: string;
  title: string;
  description: string;
  source: string;
  published_at: string;
  category: string;
  severity: string;
}

const Notifications = () => {
  const [alerts, setAlerts] = useState<NewsAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("news_alerts")
        .select("*")
        .order("published_at", { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertCircle className="h-5 w-5" />;
      case "medium":
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">News & Alerts</h1>
        <p className="text-muted-foreground mt-1">
          Latest updates on counterfeit medicines and quality issues
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-center">Loading alerts...</p>
          </CardContent>
        </Card>
      ) : alerts.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-center">No alerts available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Alert
              key={alert.id}
              variant={getSeverityVariant(alert.severity) as any}
            >
              <div className="flex items-start gap-3">
                {getSeverityIcon(alert.severity)}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <AlertTitle>{alert.title}</AlertTitle>
                    <Badge variant={getSeverityVariant(alert.severity) as any}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <AlertDescription>{alert.description}</AlertDescription>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{alert.source}</span>
                    <span>•</span>
                    <span>
                      {new Date(alert.published_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
