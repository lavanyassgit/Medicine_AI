import { useState, useEffect } from "react";
import { approvedMedicines } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Database as DatabaseIcon, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const getDailyCode = () => {
  const today = new Date().toDateString();
  const stored = localStorage.getItem("dailyDatabaseCode");
  
  if (stored) {
    const { date, code } = JSON.parse(stored);
    if (date === today) {
      return code;
    }
  }
  
  const newCode = Math.floor(10000000 + Math.random() * 90000000).toString();
  localStorage.setItem("dailyDatabaseCode", JSON.stringify({ date: today, code: newCode }));
  return newCode;
};

const Database = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const { toast } = useToast();
  const dailyCode = getDailyCode();

  useEffect(() => {
    const unlocked = sessionStorage.getItem("databaseUnlocked");
    if (unlocked === "true") {
      setIsUnlocked(true);
    }
  }, []);

  const handleUnlock = () => {
    if (codeInput === dailyCode) {
      setIsUnlocked(true);
      sessionStorage.setItem("databaseUnlocked", "true");
      toast({
        title: "Access granted",
        description: "You can now view the medicine database",
      });
    } else {
      toast({
        title: "Invalid code",
        description: "Please enter the correct 8-digit code",
        variant: "destructive",
      });
    }
  };

  const filteredMedicines = approvedMedicines.filter(
    (med) =>
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.regulatoryId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isUnlocked) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Database Access Required</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Enter the 8-digit daily access code to view the medicine database
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Today's code: <span className="font-mono font-bold">{dailyCode}</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="text"
              placeholder="Enter 8-digit code"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 8))}
              maxLength={8}
              className="text-center text-lg font-mono tracking-wider"
            />
            <Button 
              onClick={handleUnlock} 
              className="w-full"
              disabled={codeInput.length !== 8}
            >
              Unlock Database
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Medicine Database</h1>
        <p className="text-muted-foreground mt-1">
          Reference database of approved medicines and regulatory information
        </p>
      </div>

      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, generic name, manufacturer, or regulatory ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine Name</TableHead>
                  <TableHead>Generic Name</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Dosage Forms</TableHead>
                  <TableHead>Regulatory ID</TableHead>
                  <TableHead>Approval Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicines.map((med) => (
                  <TableRow key={med.id}>
                    <TableCell className="font-medium">{med.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {med.genericName}
                    </TableCell>
                    <TableCell>{med.manufacturer}</TableCell>
                    <TableCell className="text-sm">{med.dosage}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {med.regulatoryId}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(med.approvalDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {filteredMedicines.length === 0 && (
        <div className="text-center py-12">
          <DatabaseIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            No medicines found matching your search
          </p>
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        Showing {filteredMedicines.length} of {approvedMedicines.length} approved
        medicines
      </div>
    </div>
  );
};

export default Database;
