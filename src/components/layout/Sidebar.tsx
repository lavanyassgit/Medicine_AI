import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ScanLine,
  ClipboardList,
  Database,
  Activity,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const allNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["user", "admin"] },
  { name: "Scan Medicine", href: "/scan", icon: ScanLine, roles: ["user", "admin"] },
  { name: "Quality Reports", href: "/reports", icon: ClipboardList, roles: ["admin"] },
  { name: "Medicine Database", href: "/database", icon: Database, roles: ["admin"] },
];

export const Sidebar = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();
        
        if (!error && data) {
          setUserRole(data.role);
        }
      }
      setLoading(false);
    };

    fetchUserRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  const navigation = allNavigation.filter((item) => 
    userRole && item.roles.includes(userRole)
  );

  if (loading) {
    return (
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-card">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <Activity className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-lg font-bold text-foreground">MediCheck AI</h1>
            <p className="text-xs text-muted-foreground">Quality Assurance System</p>
          </div>
        </div>
        <nav className="space-y-1 p-4">
          <div className="h-10 bg-muted animate-pulse rounded-lg" />
          <div className="h-10 bg-muted animate-pulse rounded-lg" />
        </nav>
      </aside>
    );
  }

  // Show all navigation items (filtered by role if available, otherwise show all)
  const displayNavigation = navigation.length > 0 ? navigation : allNavigation;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-card">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <Activity className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-lg font-bold text-foreground">MediCheck AI</h1>
          <p className="text-xs text-muted-foreground">Quality Assurance System</p>
        </div>
      </div>
      <nav className="space-y-1 p-4">
        {displayNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
            activeClassName="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
