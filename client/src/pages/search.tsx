
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import { useIsMobile } from "../hooks/use-mobile";
import { 
  Search as SearchIcon, 
  Filter, 
  Code2, 
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  Zap,
  Copy,
  ExternalLink
} from "lucide-react";

interface SearchResult {
  id: string;
  projectName: string;
  fileName: string;
  lineNumber: number;
  content: string;
  similarityScore: number;
  patternType: string;
  duplicateWith?: {
    projectName: string;
    fileName: string;
    lineNumber: number;
  };
}

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("code");
  const [filterType, setFilterType] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const isMobile = useIsMobile();

  const { data: recentSearches = [] } = useQuery({
    queryKey: ["recent-searches"],
    queryFn: async () => {
      const response = await fetch("/api/recent-searches");
      if (!response.ok) throw new Error("Failed to fetch recent searches");
      return response.json();
    },
  });

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchTerm,
          type: searchType,
          filter: filterType
        })
      });
      
      if (!response.ok) throw new Error("Search failed");
      
      const results = await response.json();
      setSearchResults(results);
      
      // Save to recent searches
      await fetch("/api/recent-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchTerm, type: searchType })
      });
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const copyCode = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        {!isMobile && <Sidebar onRefresh={() => {}} />}
        
        <main className="flex-1 p-4 md:p-6 lg:p-8" role="main">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Code Search</h1>
            <p className="text-gray-600 mt-1">
              Search for code patterns, duplicates, and similar functions across all your projects
            </p>
          </div>

          {/* Search Interface */}
          <Card className="card-feature mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SearchIcon className="w-5 h-5 text-accent-blue" />
                Search Query
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search for code patterns, function names, or keywords..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-10 form-input"
                      aria-label="Search query"
                    />
                  </div>
                  <Button 
                    onClick={handleSearch}
                    disabled={isSearching || !searchTerm.trim()}
                    className="btn-primary"
                  >
                    {isSearching ? (
                      <>
                        <Zap className="w-4 h-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <SearchIcon className="w-4 h-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Search type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="code">Code Content</SelectItem>
                      <SelectItem value="function">Function Names</SelectItem>
                      <SelectItem value="comment">Comments</SelectItem>
                      <SelectItem value="pattern">Code Patterns</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full md:w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter results" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Results</SelectItem>
                      <SelectItem value="duplicates">Duplicates Only</SelectItem>
                      <SelectItem value="similar">Similar Code</SelectItem>
                      <SelectItem value="exact">Exact Matches</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="results" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-fit">
              <TabsTrigger value="results" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Search Results
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent Searches
              </TabsTrigger>
            </TabsList>

            {/* Search Results */}
            <TabsContent value="results" className="space-y-6">
              {searchResults.length === 0 ? (
                <Card className="card-feature">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <SearchIcon className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm ? "No results found" : "Start your search"}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm 
                        ? "Try adjusting your search terms or filters" 
                        : "Enter a search query to find code patterns and duplicates"
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Found {searchResults.length} results for "{searchTerm}"
                    </h3>
                  </div>

                  {searchResults.map((result) => (
                    <Card key={result.id} className="card-feature">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Code2 className="w-5 h-5 text-accent-blue" />
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {result.projectName} / {result.fileName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Line {result.lineNumber}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={result.similarityScore > 0.9 ? "destructive" : "secondary"}>
                              {Math.round(result.similarityScore * 100)}% similarity
                            </Badge>
                            <Badge variant="outline">
                              {result.patternType}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="bg-gray-900 rounded-lg p-4 relative">
                            <pre className="text-sm text-gray-100 overflow-x-auto">
                              <code>{result.content}</code>
                            </pre>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyCode(result.content)}
                              className="absolute top-2 right-2 text-gray-400 hover:text-white"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>

                          {result.duplicateWith && (
                            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                              <AlertTriangle className="w-4 h-4 text-orange-600" />
                              <span className="text-sm text-orange-800">
                                Duplicate found in {result.duplicateWith.projectName} / {result.duplicateWith.fileName} 
                                at line {result.duplicateWith.lineNumber}
                              </span>
                              <Button size="sm" variant="ghost" className="ml-auto">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Recent Searches */}
            <TabsContent value="recent" className="space-y-6">
              {recentSearches.length === 0 ? (
                <Card className="card-feature">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Clock className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No recent searches</h3>
                    <p className="text-gray-600">
                      Your search history will appear here after you perform some searches
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Searches</h3>
                  {recentSearches.slice(0, 10).map((search: any, index: number) => (
                    <Card key={index} className="card-feature hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => {
                            setSearchTerm(search.query);
                            setSearchType(search.type || "code");
                          }}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <SearchIcon className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{search.query}</p>
                            <p className="text-sm text-gray-600">{search.type} search</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {new Date(search.timestamp).toLocaleDateString()}
                          </span>
                          <Button size="sm" variant="ghost">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
