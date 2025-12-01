import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, Building2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Medicine {
  id: string;
  medicine_name: string;
  batch_number: string | null;
  manufacturer: string | null;
  scan_date: string | null;
  quality_score: number | null;
  is_approved: boolean | null;
}

interface ReportCardProps {
  medicine: Medicine;
  onDelete: () => void;
}

export const ReportCard = ({ medicine, onDelete }: ReportCardProps) => {
  const navigate = useNavigate();

  const getStatus = (score: number | null, isApproved: boolean | null): "passed" | "warning" | "failed" => {
    if (score === null) return "warning";
    if (isApproved === false) return "failed";
    if (score >= 80) return "passed";
    if (score >= 60) return "warning";
    return "failed";
  };

  const status = getStatus(medicine.quality_score, medicine.is_approved);

  const statusVariants = {
    passed: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    failed: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const scoreColor =
    (medicine.quality_score ?? 0) >= 80
      ? "text-success"
      : (medicine.quality_score ?? 0) >= 60
      ? "text-warning"
      : "text-destructive";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg text-foreground">
                {medicine.medicine_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Batch: {medicine.batch_number || "N/A"}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn("font-semibold", statusVariants[status])}
            >
              {status.toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4" />
              <span>{medicine.manufacturer || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>
                {medicine.scan_date
                  ? new Date(medicine.scan_date).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Quality Score</p>
              <p className={cn("text-2xl font-bold", scoreColor)}>
                {medicine.quality_score ?? 0}/100
              </p>
            </div>
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete scan</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this scan? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                onClick={() => navigate(`/reports/${medicine.id}`)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                View Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
