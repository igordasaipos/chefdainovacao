import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EventSelector } from "@/components/EventSelector";
const TOTEM_CONTEXT_KEY = "totem_context";
export function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isTotemRoute = location.pathname === "/totem";
  const isKanbanRoute = location.pathname === "/kanban";

  // Gerenciar contexto do totem
  useEffect(() => {
    if (isTotemRoute) {
      sessionStorage.setItem(TOTEM_CONTEXT_KEY, "true");
    } else if (location.pathname === "/votar") {
      sessionStorage.removeItem(TOTEM_CONTEXT_KEY);
    }
  }, [location.pathname, isTotemRoute]);
  const isActive = (path: string) => {
    if (path === "/votar") {
      return location.pathname === "/votar" || location.pathname === "/totem";
    }
    return location.pathname === path;
  };
  const getVotarLink = () => {
    if (isTotemRoute) return "/totem";
    if (isKanbanRoute && sessionStorage.getItem(TOTEM_CONTEXT_KEY)) return "/totem";
    return "/votar";
  };
  const getKanbanLink = () => {
    if (isTotemRoute) {
      sessionStorage.setItem(TOTEM_CONTEXT_KEY, "true");
    }
    return "/kanban";
  };
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  return <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* Left side - Navigation */}
        <div className="flex items-center gap-6">
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to={getVotarLink()}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      isActive("/votar") ? "bg-accent text-accent-foreground" : ""
                    )}
                  >
                    Votar
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to={getKanbanLink()}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      isActive("/kanban") ? "bg-accent text-accent-foreground" : ""
                    )}
                  >
                    Acompanhar
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side - Event Selector and Mobile Menu */}
        <div className="flex items-center gap-4">
          {/* Event Selector - hidden on mobile */}
          <div className="hidden md:block">
            <EventSelector />
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <div className="container py-4 space-y-2 safe-area-padding">
            <Link to={getVotarLink()} onClick={() => setIsMobileMenuOpen(false)} className={cn("block w-full px-4 py-3 text-left font-medium rounded-md transition-colors", "touch-target flex items-center active:bg-accent/70", isActive("/votar") ? "bg-primary/10 text-primary border-l-4 border-primary" : "hover:bg-accent/50")} data-qa="navbar-mobile-link-votar">
              Votar
            </Link>
            <Link to={getKanbanLink()} onClick={() => setIsMobileMenuOpen(false)} className={cn("block w-full px-4 py-3 text-left font-medium rounded-md transition-colors", "touch-target flex items-center active:bg-accent/70", isActive("/kanban") ? "bg-primary/10 text-primary border-l-4 border-primary" : "hover:bg-accent/50")} data-qa="navbar-mobile-link-acompanhar">
              Acompanhar
            </Link>
            {/* Event Selector for mobile */}
            <div className="px-4 py-2">
              <EventSelector />
            </div>
          </div>
        </div>}
    </header>;
}