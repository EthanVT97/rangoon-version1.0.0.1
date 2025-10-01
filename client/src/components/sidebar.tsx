import { Link, useLocation } from "wouter";
import {
  Upload,
  History,
  BarChart3,
  Settings,
  Package,
  Users,
  FileText,
  Receipt,
  CreditCard,
  X, // Added X icon for closing mobile sidebar
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet"; // Import Sheet components

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export default function Sidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Excel Import", icon: Upload, myanmar: "Excel Import" },
    { path: "/history", label: "Import History", icon: History, myanmar: "Import History" },
    { path: "/analytics", label: "Analytics", icon: BarChart3, myanmar: "Analytics" },
    { path: "/settings", label: "Settings", icon: Settings, myanmar: "Settings" },
  ];

  const erpnextModules = [
    { path: "/items", label: "Items", icon: Package, myanmar: "Items" },
    { path: "/customers", label: "Customers", icon: Users, myanmar: "Customers" },
    { path: "/sales-orders", label: "Sales Orders", icon: FileText, myanmar: "Sales Orders" },
    { path: "/invoices", label: "Invoices", icon: Receipt, myanmar: "Invoices" },
    { path: "/payments", label: "Payments", icon: CreditCard, myanmar: "Payments" },
  ];

  // Common sidebar content for both desktop and mobile
  const sidebarContent = (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">ERPNePOS</h1>
            <p className="text-xs text-muted-foreground">Data Integration</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={() => setIsMobileOpen(false)} // Close sidebar on nav item click
            >
              <Icon className="w-5 h-5" />
              <span className="font-myanmar">{item.myanmar}</span>
            </Link>
          );
        })}

        <div className="pt-4 border-t border-border mt-4">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 font-myanmar">
            ERPNext Modules
          </h3>

          {erpnextModules.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => setIsMobileOpen(false)} // Close sidebar on nav item click
              >
                <Icon className="w-4 h-4" />
                <span className="font-myanmar">{item.myanmar}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-muted cursor-pointer transition-colors">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
            MK
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate font-myanmar">Min Khant</p>
            <p className="text-xs text-muted-foreground truncate">admin@erpnepos.com</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex-shrink-0 hidden lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar (Sheet component) */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-64"> {/* Adjust width as needed */}
          <SheetHeader className="absolute right-4 top-4">
            <SheetClose>
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </SheetHeader>
          <SheetTitle className="sr-only">Main Navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Navigation links for the application modules.
          </SheetDescription>
          {sidebarContent}
        </SheetContent>
      </Sheet>
    </>
  );
        }
