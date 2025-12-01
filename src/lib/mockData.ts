export interface MedicineScan {
  id: string;
  medicineName: string;
  batchNumber: string;
  manufacturer: string;
  scanDate: string;
  qualityScore: number;
  status: "passed" | "failed" | "warning";
  imageUrl: string;
  checks: {
    imageAnalysis: CheckResult;
    ocrVerification: CheckResult;
    compositionMatch: CheckResult;
    regulatoryCompliance: CheckResult;
  };
  details: {
    dosage: string;
    composition: string;
    expiryDate: string;
    mfgDate: string;
    packageIntegrity: string;
  };
}

export interface CheckResult {
  status: "passed" | "failed" | "warning";
  score: number;
  details: string;
}

export interface ApprovedMedicine {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  composition: string;
  dosage: string;
  approvalDate: string;
  regulatoryId: string;
  stock: number;
}

export const mockScans: MedicineScan[] = [
  {
    id: "SCN-001",
    medicineName: "Amoxicillin 500mg",
    batchNumber: "AMX2024-Q1-001",
    manufacturer: "PharmaCorp Ltd",
    scanDate: "2024-01-15T10:30:00Z",
    qualityScore: 95,
    status: "passed",
    imageUrl: "/placeholder.svg",
    checks: {
      imageAnalysis: {
        status: "passed",
        score: 98,
        details: "Tablet shape, color, and embossing match approved standards. No visual defects detected.",
      },
      ocrVerification: {
        status: "passed",
        score: 95,
        details: "Label text accurately matches registered data. Expiry date clearly visible.",
      },
      compositionMatch: {
        status: "passed",
        score: 92,
        details: "Chemical composition within acceptable variance (±2%) of approved formula.",
      },
      regulatoryCompliance: {
        status: "passed",
        score: 96,
        details: "Batch approved by FDA. All regulatory certifications valid.",
      },
    },
    details: {
      dosage: "500mg Capsules",
      composition: "Amoxicillin Trihydrate eq. to Amoxicillin 500mg",
      expiryDate: "2025-12-31",
      mfgDate: "2024-01-10",
      packageIntegrity: "Intact, no tampering detected",
    },
  },
  {
    id: "SCN-002",
    medicineName: "Paracetamol 650mg",
    batchNumber: "PCT2024-B2-089",
    manufacturer: "MediHealth Industries",
    scanDate: "2024-01-15T11:45:00Z",
    qualityScore: 72,
    status: "warning",
    imageUrl: "/placeholder.svg",
    checks: {
      imageAnalysis: {
        status: "warning",
        score: 75,
        details: "Minor color variation detected (+5% brightness). Embossing slightly worn but readable.",
      },
      ocrVerification: {
        status: "passed",
        score: 88,
        details: "Label text matches but print quality lower than standard (78% clarity).",
      },
      compositionMatch: {
        status: "warning",
        score: 65,
        details: "Composition variance at upper threshold (+4.8%). Requires additional testing.",
      },
      regulatoryCompliance: {
        status: "passed",
        score: 85,
        details: "Batch approved but manufacturer license renewal pending.",
      },
    },
    details: {
      dosage: "650mg Tablets",
      composition: "Paracetamol IP 650mg",
      expiryDate: "2025-06-30",
      mfgDate: "2023-12-15",
      packageIntegrity: "Minor seal wear, no breach detected",
    },
  },
  {
    id: "SCN-003",
    medicineName: "Metformin 1000mg",
    batchNumber: "MET2024-C3-045",
    manufacturer: "Global Pharma Solutions",
    scanDate: "2024-01-15T14:20:00Z",
    qualityScore: 38,
    status: "failed",
    imageUrl: "/placeholder.svg",
    checks: {
      imageAnalysis: {
        status: "failed",
        score: 35,
        details: "Tablet shape irregular. Color mismatch detected. Logo authentication failed.",
      },
      ocrVerification: {
        status: "failed",
        score: 42,
        details: "Label text inconsistent with registered format. Barcode authentication failed.",
      },
      compositionMatch: {
        status: "failed",
        score: 28,
        details: "Critical variance in composition (-15%). Active ingredient below acceptable threshold.",
      },
      regulatoryCompliance: {
        status: "failed",
        score: 45,
        details: "Batch number not found in regulatory database. Potential counterfeit.",
      },
    },
    details: {
      dosage: "1000mg Tablets",
      composition: "Metformin Hydrochloride (Suspected Counterfeit)",
      expiryDate: "2025-08-31",
      mfgDate: "2024-01-05",
      packageIntegrity: "Tampering detected, seal compromised",
    },
  },
  {
    id: "SCN-004",
    medicineName: "Atorvastatin 20mg",
    batchNumber: "ATV2024-A1-112",
    manufacturer: "CardioMed Pharmaceuticals",
    scanDate: "2024-01-16T09:15:00Z",
    qualityScore: 91,
    status: "passed",
    imageUrl: "/placeholder.svg",
    checks: {
      imageAnalysis: {
        status: "passed",
        score: 94,
        details: "Film coating uniform. Tablet dimensions within specification.",
      },
      ocrVerification: {
        status: "passed",
        score: 92,
        details: "All label information verified against database.",
      },
      compositionMatch: {
        status: "passed",
        score: 89,
        details: "Composition analysis confirms formula accuracy.",
      },
      regulatoryCompliance: {
        status: "passed",
        score: 90,
        details: "Full regulatory compliance confirmed.",
      },
    },
    details: {
      dosage: "20mg Film-coated Tablets",
      composition: "Atorvastatin Calcium eq. to Atorvastatin 20mg",
      expiryDate: "2026-03-31",
      mfgDate: "2024-01-12",
      packageIntegrity: "Excellent condition",
    },
  },
  {
    id: "SCN-005",
    medicineName: "Ciprofloxacin 500mg",
    batchNumber: "CIP2023-D4-278",
    manufacturer: "BioPharm Industries",
    scanDate: "2024-01-16T13:40:00Z",
    qualityScore: 68,
    status: "warning",
    imageUrl: "/placeholder.svg",
    checks: {
      imageAnalysis: {
        status: "passed",
        score: 82,
        details: "Visual inspection acceptable with minor packaging wear.",
      },
      ocrVerification: {
        status: "warning",
        score: 71,
        details: "Expiry date print quality degraded but readable.",
      },
      compositionMatch: {
        status: "warning",
        score: 58,
        details: "Potency at 93% of labeled amount. Below optimal but within limits.",
      },
      regulatoryCompliance: {
        status: "passed",
        score: 88,
        details: "Regulatory approval valid. Manufacturing audit passed.",
      },
    },
    details: {
      dosage: "500mg Tablets",
      composition: "Ciprofloxacin Hydrochloride eq. to Ciprofloxacin 500mg",
      expiryDate: "2025-02-28",
      mfgDate: "2023-10-20",
      packageIntegrity: "Acceptable with age-related wear",
    },
  },
];

export const approvedMedicines: ApprovedMedicine[] = [
  {
    id: "MED-001",
    name: "Amoxicillin",
    genericName: "Amoxicillin Trihydrate",
    manufacturer: "PharmaCorp Ltd",
    composition: "Amoxicillin Trihydrate eq. to Amoxicillin 500mg",
    dosage: "250mg, 500mg Capsules",
    approvalDate: "2020-03-15",
    regulatoryId: "FDA-ANT-2020-0315",
    stock: 0,
  },
  {
    id: "MED-002",
    name: "Paracetamol",
    genericName: "Acetaminophen",
    manufacturer: "Multiple Approved",
    composition: "Paracetamol IP 500mg/650mg",
    dosage: "500mg, 650mg Tablets",
    approvalDate: "2018-01-20",
    regulatoryId: "FDA-ANL-2018-0120",
    stock: 450,
  },
  {
    id: "MED-003",
    name: "Metformin",
    genericName: "Metformin Hydrochloride",
    manufacturer: "Multiple Approved",
    composition: "Metformin Hydrochloride 500mg/850mg/1000mg",
    dosage: "500mg, 850mg, 1000mg Tablets",
    approvalDate: "2019-06-10",
    regulatoryId: "FDA-DIA-2019-0610",
    stock: 320,
  },
  {
    id: "MED-004",
    name: "Atorvastatin",
    genericName: "Atorvastatin Calcium",
    manufacturer: "CardioMed Pharmaceuticals",
    composition: "Atorvastatin Calcium eq. to Atorvastatin 10mg/20mg/40mg",
    dosage: "10mg, 20mg, 40mg Tablets",
    approvalDate: "2021-02-28",
    regulatoryId: "FDA-CAR-2021-0228",
    stock: 180,
  },
  {
    id: "MED-005",
    name: "Ciprofloxacin",
    genericName: "Ciprofloxacin Hydrochloride",
    manufacturer: "BioPharm Industries",
    composition: "Ciprofloxacin Hydrochloride eq. to Ciprofloxacin 250mg/500mg",
    dosage: "250mg, 500mg Tablets",
    approvalDate: "2020-09-15",
    regulatoryId: "FDA-ANT-2020-0915",
    stock: 275,
  },
  {
    id: "MED-006",
    name: "Omeprazole",
    genericName: "Omeprazole",
    manufacturer: "GastroHealth Pharma",
    composition: "Omeprazole 20mg/40mg",
    dosage: "20mg, 40mg Capsules",
    approvalDate: "2019-11-22",
    regulatoryId: "FDA-GAS-2019-1122",
    stock: 0,
  },
];

export const dashboardStats = {
  totalScans: 1247,
  passedScans: 1089,
  warningScans: 103,
  failedScans: 55,
  averageQualityScore: 87,
  scansToday: 23,
  trendsData: [
    { date: "2024-01-09", passed: 42, warning: 5, failed: 2 },
    { date: "2024-01-10", passed: 38, warning: 7, failed: 3 },
    { date: "2024-01-11", passed: 45, warning: 4, failed: 1 },
    { date: "2024-01-12", passed: 41, warning: 6, failed: 2 },
    { date: "2024-01-13", passed: 39, warning: 5, failed: 4 },
    { date: "2024-01-14", passed: 43, warning: 8, failed: 3 },
    { date: "2024-01-15", passed: 44, warning: 6, failed: 2 },
  ],
};
