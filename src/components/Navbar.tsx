
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X } from "lucide-react"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isActive = (path: string) => location.pathname === path

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <Link to="/votar" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <img src="/lovable-uploads/a90576ab-4829-4164-ba8c-928d19fe5bed.png" alt="Logo" className="w-8 h-8" />
            <span className="text-xl font-semibold text-muted-foreground">|</span>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              iFood Move 2025
            </h1>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/votar">
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "h-10 px-4 py-2 text-sm font-medium",
                    isActive("/votar") && "bg-accent text-accent-foreground"
                  )}
                >
                  Votar
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/kanban">
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "h-10 px-4 py-2 text-sm font-medium",
                    isActive("/kanban") && "bg-accent text-accent-foreground"
                  )}
                >
                  Acompanhar
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-10 w-10 touch-target"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <div className="container py-4 space-y-2 safe-area-padding">
            <Link
              to="/votar"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "block w-full px-4 py-3 text-left font-medium rounded-md transition-colors",
                "touch-target flex items-center active:bg-accent/70",
                isActive("/votar") 
                  ? "bg-primary/10 text-primary border-l-4 border-primary" 
                  : "hover:bg-accent/50"
              )}
            >
              Votar
            </Link>
            <Link
              to="/kanban"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "block w-full px-4 py-3 text-left font-medium rounded-md transition-colors",
                "touch-target flex items-center active:bg-accent/70",
                isActive("/kanban") 
                  ? "bg-primary/10 text-primary border-l-4 border-primary" 
                  : "hover:bg-accent/50"
              )}
            >
              Acompanhar
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
