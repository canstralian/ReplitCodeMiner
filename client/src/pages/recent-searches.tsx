import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Search, Clock, X, Code, FileCode, Hash, Filter, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

interface SearchItem {
  id: string;
  query: string;
  type: "pattern" | "function" | "class" | "import" | "filename";
  timestamp: Date;
  resultsCount: number;
  projects?: string[];
}

export default function RecentSearches() {
  // Mock data for recent searches - in a real app, this would come from the backend
  const [searches, setSearches] = useState<SearchItem[]>([
    {
      id: "1",
      query: "useState",
      type: "function",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      resultsCount: 23,
      projects: ["my-react-app", "dashboard-ui", "portfolio-site"]
    },
    {
      id: "2",
      query: "express.Router()",
      type: "pattern",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      resultsCount: 8,
      projects: ["api-server", "backend-service"]
    },
    {
      id: "3",
      query: "import axios",
      type: "import",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      resultsCount: 15,
      projects: ["weather-app", "data-fetcher", "api-client"]
    },
    {
      id: "4",
      query: "class Component",
      type: "class",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      resultsCount: 12,
      projects: ["legacy-app", "old-dashboard"]
    },
    {
      id: "5",
      query: "auth.service.ts",
      type: "filename",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      resultsCount: 3,
      projects: ["auth-module", "user-service", "admin-panel"]
    }
  ]);

  const [searchFilter, setSearchFilter] = useState("");

  const getTypeIcon = (type: SearchItem["type"]) => {
    switch (type) {
      case "function":
        return <Code className="h-4 w-4" />;
      case "class":
        return <FileCode className="h-4 w-4" />;
      case "import":
        return <Hash className="h-4 w-4" />;
      case "pattern":
        return <Search className="h-4 w-4" />;
      case "filename":
        return <FileCode className="h-4 w-4" />;
      default:
        return <Code className="h-4 w-4" />;
    }
  };

  const getTypeBadgeVariant = (type: SearchItem["type"]) => {
    switch (type) {
      case "function":
        return "default";
      case "class":
        return "secondary";
      case "import":
        return "outline";
      case "pattern":
        return "default";
      case "filename":
        return "secondary";
      default:
        return "default";
    }
  };

  const handleDeleteSearch = (id: string) => {
    setSearches(searches.filter(search => search.id !== id));
  };

  const handleRerunSearch = (query: string) => {
    // In a real app, this would navigate to the main dashboard with the search query
    console.log("Rerunning search:", query);
  };

  const handleClearAll = () => {
    setSearches([]);
  };

  const filteredSearches = searches.filter(search =>
    search.query.toLowerCase().includes(searchFilter.toLowerCase()) ||
    search.type.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Recent Searches</h1>
              <p className="text-gray-400 mt-1">View and manage your search history</p>
            </div>
          </div>
          {searches.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="border-gray-700 text-gray-300 hover:bg-editor-dark"
            >
              Clear All
            </Button>
          )}
        </div>

        {searches.length === 0 ? (
          <Card className="bg-navy-dark border-gray-700">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No Recent Searches</h3>
              <p className="text-sm text-gray-500 text-center max-w-md">
                Your search history will appear here. Start by searching for code patterns, functions, or files in your projects.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Filter searches..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-10 bg-editor-dark border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
              <Button variant="outline" size="icon" className="border-gray-700 text-gray-300 hover:bg-editor-dark">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4">
              {filteredSearches.map((search) => (
                <Card key={search.id} className="bg-navy-dark border-gray-700 hover:border-gray-600 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(search.type)}
                            <h3 className="text-lg font-medium text-white">{search.query}</h3>
                          </div>
                          <Badge variant={getTypeBadgeVariant(search.type)} className="capitalize">
                            {search.type}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{format(search.timestamp, "MMM d, h:mm a")}</span>
                          </div>
                          <span>•</span>
                          <span>{search.resultsCount} results</span>
                          {search.projects && search.projects.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{search.projects.length} projects</span>
                            </>
                          )}
                        </div>

                        {search.projects && search.projects.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {search.projects.slice(0, 3).map((project) => (
                              <Badge key={project} variant="outline" className="border-gray-600 text-gray-300 text-xs">
                                {project}
                              </Badge>
                            ))}
                            {search.projects.length > 3 && (
                              <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                                +{search.projects.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRerunSearch(search.query)}
                          className="text-gray-300 hover:text-white hover:bg-editor-dark"
                        >
                          <Search className="h-4 w-4 mr-1" />
                          Search Again
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSearch(search.id)}
                          className="text-gray-400 hover:text-error-red hover:bg-editor-dark"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}