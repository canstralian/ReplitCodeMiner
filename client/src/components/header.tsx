import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../lib/utils";
import { 
  Code2, 
  Settings, 
  LogOut, 
  User, 
  Menu, 
  X,
  Search,
  Bell,
  HelpCircle
} from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { href: "/", label: "Dashboard", icon: Code2 },
    { href: "/search", label: "Search", icon: Search },
    { href: "/recent-searches", label: "Recent", icon: Search },
  ];

  const isActive = (path: string) => location === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="banner">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <span className="font-bold text-lg">DuplicateDetector</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6" aria-label="Main navigation">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive(item.href) ? "default" : "ghost"}
                className={cn(
                  "nav-link",
                  isActive(item.href) && "nav-link-active"
                )}
              >
                <item.icon className="w-4 h-4 mr-2" aria-hidden="true" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Desktop User Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" size="icon" aria-label="Help">
            <HelpCircle className="w-5 h-5" />
          </Button>

          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="w-5 h-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name || "User avatar"} />
                  <AvatarFallback className="bg-replit-orange text-white">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.name || "User"}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="flex items-center text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-t bg-background">
          <nav className="container px-4 py-4 space-y-2" aria-label="Mobile navigation">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <item.icon className="w-4 h-4 mr-2" aria-hidden="true" />
                  {item.label}
                </Button>
              </Link>
            ))}

            <div className="pt-4 border-t space-y-2">
              <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" aria-hidden="true" />
                  Profile
                </Button>
              </Link>
              <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" aria-hidden="true" />
                  Settings
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-600"
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
              >
                <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
                Log out
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}