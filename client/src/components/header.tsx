import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Settings, LogOut, Code2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Header() {
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  // Type guard for user properties
  const safeUser = user as any;

  return (
    <header className="bg-navy-dark border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Code2 className="text-replit-orange text-2xl" />
              <h1 className="text-xl font-semibold text-white">Project Analyzer</h1>
            </div>
            <div className="hidden md:flex items-center space-x-1 bg-editor-dark rounded-lg px-3 py-1">
              <div className="w-2 h-2 bg-success-green rounded-full"></div>
              <span className="text-sm text-gray-300">Connected to Replit</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
              <Settings className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-editor-dark">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={safeUser?.profileImageUrl || ''} alt={`${safeUser?.firstName || ''} ${safeUser?.lastName || ''}`} />
                    <AvatarFallback className="bg-replit-orange text-white">
                      {safeUser?.firstName?.[0] || 'U'}{safeUser?.lastName?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm hidden sm:block text-white">
                    {safeUser?.firstName || ''} {safeUser?.lastName || ''}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-navy-dark border-gray-700">
                <DropdownMenuItem 
                  onClick={() => window.location.href = '/settings'}
                  className="text-gray-300 hover:bg-editor-dark focus:bg-editor-dark"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-gray-300 hover:bg-editor-dark focus:bg-editor-dark"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

export { Header };