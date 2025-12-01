import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ChatBot } from "@/components/ChatBot";
import { Outlet } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <main className="ml-64 mt-16 p-6">
        <Outlet />
      </main>
      <ChatBot />
    </div>
  );
};

export default Index;
