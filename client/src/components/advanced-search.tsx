import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Code2, FileText } from "lucide-react";

interface AdvancedSearchProps {
  onResultSelect: (result: any) => void;
}

export default function AdvancedSearch({ onResultSelect }: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [patternType, setPatternType] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Simulate search - in real app this would call the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock results for demonstration
      const mockResults = [
        {
          id: 1,
          type: "function",
          name: "calculateTotal",
          description: "Function that calculates totals",
          project: "E-commerce App",
          language: "javascript",
          matches: 3,
          similarity: 95
        },
        {
          id: 2,
          type: "component",
          name: "UserCard",
          description: "React component for displaying user information",
          project: "User Dashboard",
          language: "typescript",
          matches: 2,
          similarity: 87
        }
      ];
      
      setResults(mockResults);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <Card className="bg-navy-dark border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Advanced Code Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                type="text"
                placeholder="Search for functions, variables, patterns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-editor-dark border-gray-600 text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="bg-replit-orange hover:bg-orange-600"
            >
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="bg-editor-dark border-gray-600 text-white">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="html">HTML/CSS</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={patternType} onValueChange={setPatternType}>
              <SelectTrigger className="bg-editor-dark border-gray-600 text-white">
                <SelectValue placeholder="Pattern Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patterns</SelectItem>
                <SelectItem value="function">Functions</SelectItem>
                <SelectItem value="component">Components</SelectItem>
                <SelectItem value="import">Imports</SelectItem>
                <SelectItem value="variable">Variables</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {results.length > 0 && (
        <Card className="bg-navy-dark border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              Search Results ({results.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="p-4 bg-editor-dark rounded-lg border border-gray-600 hover:border-replit-orange transition-colors cursor-pointer"
                  onClick={() => onResultSelect(result)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {result.type === "function" ? (
                          <Code2 className="h-4 w-4 text-accent-blue" />
                        ) : (
                          <FileText className="h-4 w-4 text-success-green" />
                        )}
                        <h3 className="text-white font-medium">{result.name}</h3>
                        <Badge variant="outline" className="border-gray-600 text-gray-300">
                          {result.language}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{result.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Project: {result.project}</span>
                        <span>{result.matches} matches</span>
                        <span className="text-replit-orange">{result.similarity}% similarity</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No results message */}
      {results.length === 0 && !isSearching && searchQuery && (
        <Card className="bg-navy-dark border-gray-700">
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No results found</h3>
            <p className="text-gray-500">Try adjusting your search terms or filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}