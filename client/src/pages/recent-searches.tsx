import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import { useIsMobile } from "../hooks/use-mobile";
import { 
  Search, 
  Clock, 
  Trash2,
  ExternalLink,
  Filter,
  Calendar
} from "lucide-react";

export default function RecentSearches() {
  const [filter, setFilter] = useState("all");
  const isMobile = useIsMobile();

  const { data: recentSearches = [], refetch } = useQuery({
    queryKey: ["recent-searches"],
    queryFn: async () => {
      const response = await fetch("/api/recent-searches");
      if (!response.ok) throw new Error("Failed to fetch recent searches");
      return response.json();
    },
  });

  const clearSearch = async (searchId: string) => {
    try {
      await fetch(`/api/recent-searches/${searchId}`, {
        method: "DELETE"
      });
      refetch();
    } catch (error) {
      console.error("Failed to delete search:", error);
    }
  };

  const clearAllSearches = async () => {
    try {
      await fetch("/api/recent-searches", {
        method: "DELETE"
      });
      refetch();
    } catch (error) {
      console.error("Failed to clear searches:", error);
    }
  };

  const filteredSearches = recentSearches.filter((search: any) => {
    if (filter === "all") return true;
    if (filter === "today") {
      const today = new Date().toDateString();
      return new Date(search.timestamp).toDateString() === today;
    }
    if (filter === "week") {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return new Date(search.timestamp) > weekAgo;
    }
    return search.type === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        {!isMobile && <Sidebar onRefresh={() => refetch()} />}

        <main className="flex-1 p-4 md:p-6 lg:p-8" role="main">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Recent Searches</h1>
                <p className="text-gray-600 mt-1">
                  View and manage your search history
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={clearAllSearches}
                  disabled={recentSearches.length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="card-feature mb-6">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  All Searches
                </Button>
                <Button
                  variant={filter === "today" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("today")}
                >
                  Today
                </Button>
                <Button
                  variant={filter === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("week")}
                >
                  This Week
                </Button>
                <Button
                  variant={filter === "code" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("code")}
                >
                  Code Searches
                </Button>
                <Button
                  variant={filter === "pattern" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("pattern")}
                >
                  Pattern Searches
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search History */}
          {filteredSearches.length === 0 ? (
            <Card className="card-feature">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filter === "all" ? "No search history" : `No ${filter} searches`}
                </h3>
                <p className="text-gray-600 mb-6">
                  {filter === "all" 
                    ? "Start searching to see your history here"
                    : "Try adjusting your filter or perform some searches"
                  }
                </p>
                <Button className="btn-primary" onClick={() => window.location.href = "/search"}>
                  <Search className="w-4 h-4 mr-2" />
                  Start Searching
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {filteredSearches.length} search{filteredSearches.length !== 1 ? 'es' : ''}
                </h3>
              </div>

              {filteredSearches.map((search: any, index: number) => (
                <Card key={search.id || index} className="card-feature">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Search className="w-5 h-5 text-accent-blue mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">{search.query}</h4>
                            <Badge variant="outline">{search.type || "code"}</Badge>
                            {search.results && (
                              <Badge variant="secondary">
                                {search.results} results
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(search.timestamp).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(search.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                          {search.filters && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-500">
                                Filters: {Object.entries(search.filters).map(([key, value]) => `${key}: ${value}`).join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.location.href = `/search?q=${encodeURIComponent(search.query)}&type=${search.type}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => clearSearch(search.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}