import { useState, useEffect } from "react";
import { ReportCard } from "@/components/reports/ReportCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Filter, Calendar as CalendarIcon, Trash2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

const Reports = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const { toast } = useToast();

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to view reports",
          variant: "destructive",
        });
        return;
      }

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
        title: "Error loading reports",
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

  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch =
      med.medicine_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (med.batch_number?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (med.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const status = getStatus(med.quality_score, med.is_approved);
    const matchesStatus = statusFilter === "all" || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

  const handleExport = () => {
    if (filteredMedicines.length === 0) {
      toast({
        title: "No data to export",
        description: "Apply filters to see reports before exporting",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const headers = [
      "Medicine Name",
      "Batch Number",
      "Manufacturer",
      "Scan Date",
      "Quality Score",
      "Status",
      "Expiry Date",
      "Dosage",
      "Approved"
    ];

    const rows = filteredMedicines.map((med) => {
      const status = getStatus(med.quality_score, med.is_approved);
      return [
        med.medicine_name,
        med.batch_number || "N/A",
        med.manufacturer || "N/A",
        med.scan_date ? format(new Date(med.scan_date), "MMM dd, yyyy HH:mm") : "N/A",
        med.quality_score || "N/A",
        status.toUpperCase(),
        med.expiry_date ? format(new Date(med.expiry_date), "MMM dd, yyyy") : "N/A",
        med.dosage || "N/A",
        med.is_approved === false ? "No" : "Yes"
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell}"`).join(",")
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `quality-reports-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `Exported ${filteredMedicines.length} reports to CSV`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quality Reports</h1>
        <p className="text-muted-foreground mt-1">
          Browse and filter all medicine quality scan results
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by medicine name, batch, or manufacturer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto gap-2">
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

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="passed">Passed</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {filteredMedicines.length} of {medicines.length} reports
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={filteredMedicines.length === 0}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMedicines.map((med) => (
              <ReportCard
                key={med.id}
                medicine={med}
                onDelete={() => handleDelete(med.id)}
              />
            ))}
          </div>

          {filteredMedicines.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No reports found matching your criteria
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
