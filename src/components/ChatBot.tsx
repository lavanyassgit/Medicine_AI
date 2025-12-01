import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Phone, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { approvedMedicines } from "@/lib/mockData";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  action?: "call" | "alert";
}

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm MediCheck AI Assistant. Ask me about medicine availability, quality checks, or any help you need.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkStock = (medicineName: string) => {
    const medicine = approvedMedicines.find(
      (med) => med.name.toLowerCase().includes(medicineName.toLowerCase())
    );

    if (!medicine) {
      return {
        found: false,
        message: `Medicine "${medicineName}" not found in our database.`,
      };
    }

    if (medicine.stock === 0) {
      return {
        found: true,
        inStock: false,
        message: `⚠️ ${medicine.name} is OUT OF STOCK! Stock quantity: ${medicine.stock} units.`,
        medicine,
      };
    }

    return {
      found: true,
      inStock: true,
      message: `✓ ${medicine.name} is available in stock. Quantity: ${medicine.stock} units.`,
      medicine,
    };
  };

  const handleCall = (number: string) => {
    toast.success(`Initiating call to ${number}`, {
      description: "Government Medicine Call Centre",
      duration: 3000,
    });
    window.open(`tel:${number}`, "_self");
  };

  const processMessage = (input: string) => {
    const lowerInput = input.toLowerCase();

    // Check for stock queries
    if (
      lowerInput.includes("stock") ||
      lowerInput.includes("available") ||
      lowerInput.includes("availability")
    ) {
      const words = input.split(" ");
      const possibleMedicine = words
        .filter((w) => w.length > 3)
        .join(" ");
      
      const stockResult = checkStock(possibleMedicine);
      
      if (stockResult.found) {
        const botMessage: Message = {
          id: Date.now().toString(),
          text: stockResult.message,
          sender: "bot",
          timestamp: new Date(),
          action: !stockResult.inStock ? "alert" : undefined,
        };
        setMessages((prev) => [...prev, botMessage]);

        if (!stockResult.inStock) {
          setTimeout(() => {
            toast.error("Stock Alert", {
              description: `${stockResult.medicine?.name} has finished! Please reorder immediately.`,
              duration: 5000,
            });
          }, 500);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: stockResult.message,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      }
      return;
    }

    // Check for wrong medicine or counterfeit queries
    if (
      lowerInput.includes("wrong") ||
      lowerInput.includes("fake") ||
      lowerInput.includes("counterfeit") ||
      lowerInput.includes("suspicious") ||
      lowerInput.includes("report")
    ) {
      const botMessage: Message = {
        id: Date.now().toString(),
        text: "⚠️ If you suspect a wrong, counterfeit, or low-quality medicine, please contact the Government Medicine Call Centre immediately.",
        sender: "bot",
        timestamp: new Date(),
        action: "call",
      };
      setMessages((prev) => [...prev, botMessage]);
      return;
    }

    // Check for help queries
    if (
      lowerInput.includes("help") ||
      lowerInput.includes("how") ||
      lowerInput.includes("what")
    ) {
      const botMessage: Message = {
        id: Date.now().toString(),
        text: "I can help you with:\n• Check medicine stock availability\n• Report suspicious or wrong medicines\n• Contact government helpline\n• Navigate the system\n\nJust ask me anything!",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      return;
    }

    // Default response - try to search for medicine
    const stockResult = checkStock(input);
    if (stockResult.found) {
      const botMessage: Message = {
        id: Date.now().toString(),
        text: stockResult.message,
        sender: "bot",
        timestamp: new Date(),
        action: !stockResult.inStock ? "alert" : undefined,
      };
      setMessages((prev) => [...prev, botMessage]);

      if (!stockResult.inStock) {
        setTimeout(() => {
          toast.error("Stock Alert", {
            description: `${stockResult.medicine?.name} has finished! Please reorder immediately.`,
            duration: 5000,
          });
        }, 500);
      }
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "I'm here to help! You can ask me about medicine stock, report issues, or get help with the system.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    setTimeout(() => {
      processMessage(inputValue);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col bg-background border-border">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <h3 className="font-semibold">MediCheck AI Assistant</h3>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  
                  {/* Call Action Button */}
                  {message.action === "call" && (
                    <div className="mt-3 space-y-2">
                      <Alert className="bg-destructive/10 border-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Report to authorities immediately
                        </AlertDescription>
                      </Alert>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleCall("1800-11-4000")}
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Call 1800-11-4000
                        </Button>
                        <Button
                          onClick={() => handleCall("1915")}
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Call 1915
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about stock, report issues..."
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};
