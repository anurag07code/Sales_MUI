import { NavLink, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
const TopNavigation = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const navLinks = [{
    to: "/",
    label: "Home"
  }, {
    to: "/brand-analysis",
    label: "Brand Analysis"
  }, {
    to: "/rfp-lifecycle",
    label: "RFP Lifecycle"
  }, {
    to: "/contracts",
    label: "Contracts"
  }, {
    to: "/deals",
    label: "Deals"
  }];
  return <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", isScrolled ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm" : "bg-background/80 backdrop-blur-sm")}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group transition-transform duration-300 hover:scale-105">
            <div className="relative">
              <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{
              backgroundColor: '#3B82F6'
            }}>
                <span className="font-bold text-lg" style={{
                color: '#FFFFFF'
              }}>S</span>
              </div>
              <div className="absolute inset-0 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
              backgroundColor: 'rgba(59, 130, 246, 0.3)'
            }} />
            </div>
            <span className="text-xl md:text-2xl font-bold transition-colors" onMouseEnter={e => {
            e.currentTarget.style.color = '#3B82F6';
          }} onMouseLeave={e => {
            e.currentTarget.style.color = '';
          }}>
              SalesFirst
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => <NavLink key={link.to} to={link.to} className={({
            isActive
          }) => cn("relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg", "hover:bg-accent/50 hover:text-foreground", "group", isActive ? "text-foreground font-semibold" : "text-muted-foreground")}>
                {link.label}
                <span className={cn("absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 transition-all duration-300", location.pathname === link.to ? "w-3/4" : "w-0 group-hover:w-3/4")} style={{
              backgroundColor: '#3B82F6'
            }} />
              </NavLink>)}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              <div className="transition-all duration-300 hover:scale-110">
                <ThemeToggle />
              </div>
              <Button variant="ghost" className="text-sm font-medium transition-all duration-300 hover:bg-accent/50 hover:scale-105">
                Login
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" className="lg:hidden transition-all duration-300 hover:scale-110" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && <div className="lg:hidden pb-4 border-t border-border animate-in slide-in-from-top duration-300">
            <div className="flex flex-col gap-2 pt-4">
              {navLinks.map(link => <NavLink key={link.to} to={link.to} onClick={() => setIsMobileMenuOpen(false)} className={({
            isActive
          }) => cn("px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300", "hover:bg-accent/50 hover:translate-x-2", isActive ? "bg-accent text-foreground font-semibold" : "text-muted-foreground")}>
                  {link.label}
                </NavLink>)}
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                <Button variant="ghost" className="justify-start text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                  Login
                </Button>
              </div>
            </div>
          </div>}
      </nav>
    </header>;
};
export default TopNavigation;