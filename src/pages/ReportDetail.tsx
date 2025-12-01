import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Package,
  FileText,
  Download,
  Printer,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Medicine {
  id: string;
  medicine_name: string;
  batch_number: string | null;
  manufacturer: string | null;
  scan_date: string | null;
  quality_score: number | null;
  expiry_date: string | null;
  dosage: string | null;
  analysis_details: any;
  is_approved: boolean | null;
}

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        const { data, error } = await supabase
          .from("medicines")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setMedicine(data);
      } catch (error: any) {
        toast({
          title: "Error loading report",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMedicine();
  }, [id]);

  const handleDownload = () => {
    if (!medicine) return;
    
    const reportData = {
      medicine_name: medicine.medicine_name,
      batch_number: medicine.batch_number,
      manufacturer: medicine.manufacturer,
      quality_score: medicine.quality_score,
      scan_date: medicine.scan_date,
      expiry_date: medicine.expiry_date,
      dosage: medicine.dosage,
      analysis_details: medicine.analysis_details,
      is_approved: medicine.is_approved,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${medicine.medicine_name}-${medicine.batch_number}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report downloaded",
      description: "The report has been downloaded successfully",
    });
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Print dialog opened",
      description: "Use your browser's print function to print the report",
    });
  };

  const handleMarkReviewed = async () => {
    if (!medicine) return;

    try {
      const { error } = await supabase
        .from("medicines")
        .update({ is_approved: true })
        .eq("id", medicine.id);

      if (error) throw error;

      setMedicine({ ...medicine, is_approved: true });
      toast({
        title: "Marked as reviewed",
        description: "The report has been marked as reviewed",
      });
    } catch (error: any) {
      toast({
        title: "Error updating report",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading report...</p>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Report not found</p>
        <Button onClick={() => navigate("/reports")} className="mt-4">
          Back to Reports
        </Button>
      </div>
    );
  }

  const getStatus = (score: number | null, isApproved: boolean | null): "passed" | "warning" | "failed" => {
    if (score === null) return "warning";
    if (isApproved === false) return "failed";
    if (score >= 80) return "passed";
    if (score >= 60) return "warning";
    return "failed";
  };

  const status = getStatus(medicine.quality_score, medicine.is_approved);

  const statusConfig = {
    passed: {
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10",
      border: "border-success/20",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-warning",
      bg: "bg-warning/10",
      border: "border-warning/20",
    },
    failed: {
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
      border: "border-destructive/20",
    },
  };

  const StatusIcon = statusConfig[status].icon;
  const checks = medicine.analysis_details?.checks || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/reports")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">
            {medicine.medicine_name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Detailed quality analysis report
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "font-semibold px-4 py-2 text-base",
            statusConfig[status].bg,
            statusConfig[status].color,
            statusConfig[status].border
          )}
        >
          <StatusIcon className="h-4 w-4 mr-2" />
          {status.toUpperCase()}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Quality Score</CardTitle>
            <CardDescription>Overall assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div
                className={cn(
                  "text-6xl font-bold",
                  (medicine.quality_score ?? 0) >= 80
                    ? "text-success"
                    : (medicine.quality_score ?? 0) >= 60
                    ? "text-warning"
                    : "text-destructive"
                )}
              >
                {medicine.quality_score ?? 0}
              </div>
              <p className="text-sm text-muted-foreground">out of 100</p>
              <Progress value={medicine.quality_score ?? 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Batch Number</p>
              <p className="font-medium text-foreground">{medicine.batch_number || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Manufacturer</p>
              <p className="font-medium text-foreground">{medicine.manufacturer || "Unknown"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Dosage</p>
              <p className="font-medium text-foreground">{medicine.dosage || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Scan Date</p>
              <p className="font-medium text-foreground">
                {medicine.scan_date ? new Date(medicine.scan_date).toLocaleString() : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Expiry Date</p>
              <p className="font-medium text-foreground">
                {medicine.expiry_date ? new Date(medicine.expiry_date).toLocaleDateString() : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <p className="font-medium text-foreground">
                {medicine.is_approved ? "Approved" : "Pending Review"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {Object.keys(checks).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quality Checks
            </CardTitle>
            <CardDescription>Detailed analysis of all verification tests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(checks).map(([key, check]: [string, any]) => {
              const checkStatus = check.status || "warning";
              const CheckStatusIcon = statusConfig[checkStatus].icon;
              return (
                <div
                  key={key}
                  className={cn(
                    "rounded-lg border p-4",
                    statusConfig[checkStatus].border,
                    statusConfig[checkStatus].bg
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckStatusIcon
                        className={cn("h-5 w-5", statusConfig[checkStatus].color)}
                      />
                      <h3 className="font-semibold text-foreground capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </h3>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        statusConfig[checkStatus].color,
                        statusConfig[checkStatus].border
                      )}
                    >
                      {check.score || 0}/100
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground/80">{check.details || "No details available"}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 justify-end print:hidden">
        <Button variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print Report
        </Button>
        <Button onClick={handleMarkReviewed} disabled={medicine.is_approved === true}>
          <CheckCheck className="h-4 w-4 mr-2" />
          {medicine.is_approved ? "Reviewed" : "Mark as Reviewed"}
        </Button>
      </div>
    </div>
  );
};

export default ReportDetail;
