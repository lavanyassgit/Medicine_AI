import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, QrCode, Camera, CheckCircle2, AlertCircle, AlertTriangle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Scan = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [batchNumber, setBatchNumber] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [dosage, setDosage] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        toast.error("Please login to scan medicines");
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
      stopCamera();
    };
  }, [navigate]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        toast.success("Camera activated! Point at barcode/QR code");
      }
    } catch (error) {
      toast.error("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const handleCameraClick = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const validFiles = newFiles.filter(file => {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Max 10MB.`);
          return false;
        }
        return true;
      });

      setUploadedImages(prev => [...prev, ...validFiles]);
      
      // Create preview URLs
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviewUrls(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });

      toast.success(`${validFiles.length} image(s) uploaded`);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleScan = async () => {
    if (!user) {
      toast.error("Please login to scan medicines");
      navigate("/auth");
      return;
    }

    setIsScanning(true);
    stopCamera();
    
    // Simulate AI analysis
    setTimeout(async () => {
      const qualityScore = Math.floor(Math.random() * (100 - 70) + 70);
      const isApproved = qualityScore >= 80;
      
      const result = {
        qualityScore,
        isApproved,
        batchNumber: batchNumber || `BATCH-${Date.now()}`,
        medicineName: medicineName || "Sample Medicine",
        manufacturer: manufacturer || "Unknown",
        dosage: dosage || "N/A",
        checks: {
          packaging: qualityScore > 75,
          labeling: qualityScore > 80,
          physicalAttributes: qualityScore > 85,
          authentication: qualityScore > 70,
        },
        issues: qualityScore < 80 ? ["Minor packaging inconsistencies detected"] : [],
      };

      setAnalysisResult(result);
      
      // Save to database
      try {
        const { error } = await supabase.from("medicines").insert({
          user_id: user.id,
          batch_number: result.batchNumber,
          medicine_name: result.medicineName,
          manufacturer: result.manufacturer,
          dosage: result.dosage,
          expiry_date: expiryDate || null,
          quality_score: qualityScore,
          analysis_details: result,
          is_approved: isApproved,
        });

        if (error) throw error;
      } catch (error) {
        console.error("Error saving scan:", error);
      }

      setIsScanning(false);
      setScanComplete(true);
      toast.success("Medicine scanned successfully!", {
        description: `Quality score: ${qualityScore}/100`,
      });
    }, 3000);
  };

  const handleClearForm = () => {
    setBatchNumber("");
    setMedicineName("");
    setManufacturer("");
    setDosage("");
    setExpiryDate("");
    setScanComplete(false);
    setAnalysisResult(null);
    setUploadedImages([]);
    setImagePreviewUrls([]);
    stopCamera();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Scan Medicine</h1>
        <p className="text-muted-foreground mt-1">
          Upload images or scan barcodes for AI-powered quality analysis
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Barcode/QR Scan
            </CardTitle>
            <CardDescription>
              Scan medicine barcode or QR code to retrieve batch information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="border-2 border-dashed border-border rounded-lg overflow-hidden text-center hover:border-primary transition-colors cursor-pointer relative"
              onClick={handleCameraClick}
            >
              {isCameraActive ? (
                <div className="relative">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-32 border-2 border-primary rounded-lg opacity-70" />
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="absolute top-2 right-2"
                    onClick={(e) => { e.stopPropagation(); stopCamera(); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="p-12">
                  <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Click to activate camera for scanning
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch">Or enter batch number manually</Label>
              <Input
                id="batch"
                placeholder="e.g., AMX2024-Q1-001"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Image Upload
            </CardTitle>
            <CardDescription>
              Upload medicine images for AI visual analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <div 
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreviewUrls.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img src={url} alt={`Upload ${index + 1}`} className="w-full h-16 object-cover rounded" />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-5 w-5"
                        onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drop images here or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG up to 10MB
                  </p>
                </>
              )}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Upload clear images of tablets/capsules</p>
              <p>• Include label and packaging photos</p>
              <p>• Ensure good lighting for best results</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>
            Optional fields to enhance analysis accuracy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="medicine-name">Medicine Name</Label>
              <Input
                id="medicine-name"
                placeholder="e.g., Amoxicillin"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                placeholder="e.g., PharmaCorp Ltd"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                placeholder="e.g., 500mg"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={handleClearForm}>
          Clear Form
        </Button>
        <Button
          onClick={handleScan}
          disabled={isScanning}
          className="gap-2"
        >
          {isScanning ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Analyzing...
            </>
          ) : scanComplete ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Scan Complete
            </>
          ) : (
            "Start Analysis"
          )}
        </Button>
      </div>

      {scanComplete && analysisResult && (
        <Card className={analysisResult.isApproved ? "border-success bg-success/5" : "border-warning bg-warning/5"}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {analysisResult.isApproved ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-warning" />
                )}
                Analysis Complete
              </CardTitle>
              <Badge variant={analysisResult.isApproved ? "default" : "secondary"}>
                Score: {analysisResult.qualityScore}/100
              </Badge>
            </div>
            <CardDescription>
              {analysisResult.isApproved 
                ? "Medicine passed quality checks" 
                : "Quality concerns detected"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Batch Number:</span>
                <span className="font-medium">{analysisResult.batchNumber}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Medicine:</span>
                <span className="font-medium">{analysisResult.medicineName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Manufacturer:</span>
                <span className="font-medium">{analysisResult.manufacturer}</span>
              </div>
              {analysisResult.dosage && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Dosage:</span>
                  <span className="font-medium">{analysisResult.dosage}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Verification Checks:</h4>
              <div className="grid gap-2">
                {Object.entries(analysisResult.checks).map(([key, passed]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    {passed ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </div>
                ))}
              </div>
            </div>

            {analysisResult.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-warning">Issues Detected:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {analysisResult.issues.map((issue: string, index: number) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Scan;
