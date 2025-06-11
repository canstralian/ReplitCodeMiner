import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { Moon, Sun, Code2, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo */}
        <div className="mr-4">
          <Link href="/">
            <Button variant="ghost" className="p-0 text-lg font-bold">
              <Code2 className="h-5 w-5 mr-2" />
              RepliAnalyzer
            </Button>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-6 text-sm font-medium flex-1">
          <Link href="/">
            <Button 
              variant={location === "/" ? "default" : "ghost"} 
              size="sm"
            >
              Home
            </Button>
          </Link>
          {user && (
            <Link href="/dashboard">
              <Button 
                variant={location === "/dashboard" ? "default" : "ghost"} 
                size="sm"
              >
                Dashboard
              </Button>
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User Section */}
          {user ? (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{user.firstName || user.email}</span>
              </Badge>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button size="sm">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}