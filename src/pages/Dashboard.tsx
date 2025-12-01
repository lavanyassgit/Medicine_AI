import { useState, useEffect } from "react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ReportCard } from "@/components/reports/ReportCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface Medicine {
  id: string;
  medicine_name: string;
  batch_number: string | null;
  manufacturer: string | null;
  scan_date: string | null;
  quality_score: number | null;
  is_approved: boolean | null;
}

const Dashboard = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const { toast } = useToast();

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("medicines")
        .select("*")
        .eq("user_id", user.id)
        .order("scan_date", { ascending: false });

      if (dateRange.from) {
        query = query.gte("scan_date", dateRange.from.toISOString());
      }
      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        query = query.lte("scan_date", toDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setMedicines(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [dateRange]);

  const getStatus = (score: number | null, isApproved: boolean | null): "passed" | "warning" | "failed" => {
    if (score === null) return "warning";
    if (isApproved === false) return "failed";
    if (score >= 80) return "passed";
    if (score >= 60) return "warning";
    return "failed";
  };

  const stats = {
    totalScans: medicines.length,
    passedScans: medicines.filter((m) => getStatus(m.quality_score, m.is_approved) === "passed").length,
    warningScans: medicines.filter((m) => getStatus(m.quality_score, m.is_approved) === "warning").length,
    failedScans: medicines.filter((m) => getStatus(m.quality_score, m.is_approved) === "failed").length,
  };

  const recentScans = medicines.slice(0, 3);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("medicines").delete().eq("id", id);
      if (error) throw error;
      toast({
        title: "Scan deleted",
        description: "The scan has been removed successfully",
      });
      fetchMedicines();
    } catch (error: any) {
      toast({
        title: "Error deleting scan",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Medicine quality monitoring and analytics
          </p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "MMM dd, yyyy")
                )
              ) : (
                "Select date range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => setDateRange(range || {})}
              numberOfMonths={2}
            />
            {(dateRange.from || dateRange.to) && (
              <div className="p-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setDateRange({})}
                >
                  Clear dates
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Scans"
          value={stats.totalScans}
          icon={ScanLine}
          trend={{ value: `${stats.totalScans} scans`, positive: true }}
        />
        <StatsCard
          title="Passed"
          value={stats.passedScans}
          icon={CheckCircle2}
          variant="success"
          trend={{
            value: `${stats.totalScans > 0 ? Math.round((stats.passedScans / stats.totalScans) * 100) : 0}% pass rate`,
            positive: true,
          }}
        />
        <StatsCard
          title="Warnings"
          value={stats.warningScans}
          icon={AlertTriangle}
          variant="warning"
          trend={{
            value: `${stats.totalScans > 0 ? Math.round((stats.warningScans / stats.totalScans) * 100) : 0}% of total`,
            positive: false,
          }}
        />
        <StatsCard
          title="Failed"
          value={stats.failedScans}
          icon={XCircle}
          variant="destructive"
          trend={{
            value: `${stats.totalScans > 0 ? Math.round((stats.failedScans / stats.totalScans) * 100) : 0}% rejection rate`,
            positive: stats.failedScans === 0,
          }}
        />
      </div>

      {!loading && medicines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quality Trend Analysis</CardTitle>
            <CardDescription>
              Quality scores categorized by status over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={medicines.slice(0, 15).reverse().map(med => ({
                ...med,
                passed: med.quality_score && med.quality_score >= 80 && med.is_approved !== false ? med.quality_score : null,
                warning: med.quality_score && med.quality_score >= 60 && med.quality_score < 80 && med.is_approved !== false ? med.quality_score : null,
                failed: (med.quality_score && med.quality_score < 60) || med.is_approved === false ? med.quality_score : null,
                total: med.quality_score
              }))}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="scan_date" 
                  tickFormatter={(date) => format(new Date(date), "MMM dd")}
                  className="text-xs"
                />
                <YAxis 
                  domain={[0, 100]} 
                  label={{ value: 'Quality Score', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  labelFormatter={(date) => format(new Date(date), "MMM dd, yyyy")}
                  formatter={(value: number) => value ? [`${value}%`] : ['-']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="passed" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="Passed"
                  dot={{ fill: "#22c55e", r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="warning" 
                  stroke="#eab308" 
                  strokeWidth={2}
                  name="Warning"
                  dot={{ fill: "#eab308", r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="failed" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Failed"
                  dot={{ fill: "#ef4444", r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Total"
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  activeDot={{ r: 6 }}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {!loading && recentScans.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Recent Scans
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentScans.map((med) => (
              <ReportCard key={med.id} medicine={med} onDelete={() => handleDelete(med.id)} />
            ))}
          </div>
        </div>
      )}

      {!loading && medicines.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No scans found. Start by scanning a medicine!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
