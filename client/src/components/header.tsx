import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-navy-dark border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center">
            <h1 className="text-lg sm:text-xl font-bold text-replit-orange truncate">
              Code Analyzer
            </h1>
          </div>

          {user && (
            <>
              {/* Desktop Navigation */}
              <div className="hidden sm:flex items-center space-x-3 lg:space-x-4">
                <Avatar className="w-8 h-8 sm:w-9 sm:h-9">
                  <AvatarFallback className="bg-replit-orange text-white text-sm">
                    {user.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  onClick={logout}
                  size="sm"
                  className="text-white border-gray-600 hover:bg-gray-700"
                >
                  Logout
                </Button>
              </div>

              {/* Mobile Navigation */}
              <div className="sm:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-white p-2"
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        {user && isMobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-700 bg-navy-dark">
            <div className="px-2 pt-2 pb-3 space-y-3">
              <div className="flex items-center space-x-3 px-3 py-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-replit-orange text-white text-sm">
                    {user.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-white text-sm truncate">{user.email}</span>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-white border-gray-600 hover:bg-gray-700"
                size="sm"
              >
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}