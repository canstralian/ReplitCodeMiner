
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Filter, 
  X, 
  Clock, 
  Code, 
  FileText,
  Sparkles,
  History,
  BookmarkPlus,
  Share
} from "lucide-react";

interface SearchResult {
  id: number;
  type: 'pattern' | 'project' | 'duplicate';
  title: string;
  description: string;
  filePath?: string;
  projectName: string;
  language: string;
  similarity?: number;
  snippet: string;
  lineNumbers?: string;
}

interface AdvancedSearchProps {
  onResultSelect?: (result: SearchResult) => void;
}

export default function AdvancedSearch({ onResultSelect }: AdvancedSearchProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    languages: [] as string[],
    patternTypes: [] as string[],
    projects: [] as string[],
    dateRange: "all",
    similarity: [0, 100] as [number, number]
  });
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<{name: string, query: string, filters: any}[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [naturalLanguageMode, setNaturalLanguageMode] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Mock search suggestions and results
  const mockSuggestions = [
    "Find React components that handle user authentication",
    "Show all duplicate functions in JavaScript projects",
    "Search for API endpoint handlers",
    "Find similar CSS styling patterns",
    "Show functions with high complexity"
  ];

  const mockSearchResults: SearchResult[] = [
    {
      id: 1,
      type: 'pattern',
      title: 'Authentication Handler',
      description: 'User authentication function with JWT token validation',
      filePath: 'src/auth/handler.js',
      projectName: 'E-commerce App',
      language: 'JavaScript',
      snippet: 'async function authenticateUser(token) {\n  const decoded = jwt.verify(token, SECRET);\n  return await User.findById(decoded.id);\n}',
      lineNumbers: '15-20'
    },
    {
      id: 2,
      type: 'duplicate',
      title: 'Similar Authentication Logic',
      description: 'Duplicate authentication pattern found in multiple projects',
      projectName: 'Blog Platform',
      language: 'JavaScript',
      similarity: 89,
      snippet: 'function verifyAuth(authToken) {\n  const user = jwt.decode(authToken, config.secret);\n  return database.getUser(user.userId);\n}',
      lineNumbers: '8-12'
    }
  ];

  const { data: searchResults = mockSearchResults, isLoading } = useQuery({
    queryKey: ["/api/search", query, filters],
    enabled: query.length > 2
  });

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery && !searchHistory.includes(searchQuery)) {
      setSearchHistory(prev => [searchQuery, ...prev.slice(0, 9)]);
    }
  };

  const handleFilterChange = (filterType: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const addLanguageFilter = (language: string) => {
    if (!filters.languages.includes(language)) {
      handleFilterChange('languages', [...filters.languages, language]);
    }
  };

  const removeLanguageFilter = (language: string) => {
    handleFilterChange('languages', filters.languages.filter(l => l !== language));
  };

  const saveCurrentSearch = () => {
    const name = prompt("Enter a name for this search:");
    if (name) {
      setSavedSearches(prev => [...prev, { name, query, filters }]);
    }
  };

  const loadSavedSearch = (savedSearch: {name: string, query: string, filters: any}) => {
    setQuery(savedSearch.query);
    setFilters(savedSearch.filters);
  };

  const parseNaturalLanguage = (nlQuery: string) => {
    // Simple NL parsing - in production, use actual NLP service
    const lowercaseQuery = nlQuery.toLowerCase();
    const detectedFilters: any = { ...filters };

    // Detect languages
    if (lowercaseQuery.includes('javascript') || lowercaseQuery.includes('js')) {
      detectedFilters.languages = ['javascript'];
    }
    if (lowercaseQuery.includes('python')) {
      detectedFilters.languages = ['python'];
    }
    if (lowercaseQuery.includes('react')) {
      detectedFilters.patternTypes = ['component'];
    }

    // Detect pattern types
    if (lowercaseQuery.includes('function') || lowercaseQuery.includes('method')) {
      detectedFilters.patternTypes = ['function'];
    }
    if (lowercaseQuery.includes('component')) {
      detectedFilters.patternTypes = ['component'];
    }

    setFilters(detectedFilters);
    
    // Convert natural language to search terms
    const searchTerms = nlQuery
      .replace(/find|search|show|get/gi, '')
      .replace(/that|with|in|for/gi, '')
      .trim();
    
    return searchTerms;
  };

  const handleNaturalLanguageSearch = (nlQuery: string) => {
    const searchTerms = parseNaturalLanguage(nlQuery);
    handleSearch(searchTerms);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card className="bg-editor-dark border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Advanced Code Search
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNaturalLanguageMode(!naturalLanguageMode)}
                className={`border-gray-600 ${naturalLanguageMode ? 'bg-replit-orange text-white' : ''}`}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {naturalLanguageMode ? 'Natural Language' : 'Keyword Search'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-gray-600"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder={naturalLanguageMode 
                  ? "Try: 'Find React components that handle user authentication'"
                  : "Search code patterns, functions, or duplicates..."
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (naturalLanguageMode) {
                      handleNaturalLanguageSearch(query);
                    } else {
                      handleSearch(query);
                    }
                  }
                }}
                className="pl-10 bg-navy-dark border-gray-600 text-white placeholder-gray-400 focus:ring-replit-orange focus:border-replit-orange"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Quick Suggestions */}
            {!query && naturalLanguageMode && (
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">Try these natural language queries:</p>
                <div className="flex flex-wrap gap-2">
                  {mockSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setQuery(suggestion);
                        handleNaturalLanguageSearch(suggestion);
                      }}
                      className="border-gray-600 text-gray-300 hover:text-white text-xs"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Applied Filters */}
            {(filters.languages.length > 0 || filters.patternTypes.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {filters.languages.map(lang => (
                  <Badge key={lang} variant="outline" className="border-blue-400 text-blue-400">
                    {lang}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLanguageFilter(lang)}
                      className="ml-1 p-0 h-4 w-4 text-blue-400 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                {filters.patternTypes.map(type => (
                  <Badge key={type} variant="outline" className="border-green-400 text-green-400">
                    {type}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFilterChange('patternTypes', filters.patternTypes.filter(t => t !== type))}
                      className="ml-1 p-0 h-4 w-4 text-green-400 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:col-span-1">
            <Card className="bg-editor-dark border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Search Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Language Filters */}
                <div>
                  <h4 className="text-gray-300 text-sm font-medium mb-2">Languages</h4>
                  <div className="space-y-2">
                    {['JavaScript', 'Python', 'TypeScript', 'HTML', 'CSS'].map(lang => (
                      <div key={lang} className="flex items-center space-x-2">
                        <Checkbox
                          id={lang}
                          checked={filters.languages.includes(lang.toLowerCase())}
                          onCheckedChange={(checked) =>
                            checked 
                              ? addLanguageFilter(lang.toLowerCase())
                              : removeLanguageFilter(lang.toLowerCase())
                          }
                        />
                        <label htmlFor={lang} className="text-gray-300 text-sm cursor-pointer">
                          {lang}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pattern Type Filters */}
                <div>
                  <h4 className="text-gray-300 text-sm font-medium mb-2">Pattern Types</h4>
                  <div className="space-y-2">
                    {['Function', 'Component', 'Class', 'Import', 'Config'].map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={filters.patternTypes.includes(type.toLowerCase())}
                          onCheckedChange={(checked) =>
                            handleFilterChange('patternTypes', 
                              checked 
                                ? [...filters.patternTypes, type.toLowerCase()]
                                : filters.patternTypes.filter(t => t !== type.toLowerCase())
                            )
                          }
                        />
                        <label htmlFor={type} className="text-gray-300 text-sm cursor-pointer">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <h4 className="text-gray-300 text-sm font-medium mb-2">Date Range</h4>
                  <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
                    <SelectTrigger className="bg-navy-dark border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Search History */}
            {searchHistory.length > 0 && (
              <Card className="bg-editor-dark border-gray-700 mt-4">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center">
                    <History className="h-4 w-4 mr-2" />
                    Recent Searches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {searchHistory.slice(0, 5).map((historyQuery, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSearch(historyQuery)}
                        className="w-full justify-start text-left text-gray-300 hover:text-white p-2 h-auto"
                      >
                        <Clock className="h-3 w-3 mr-2 flex-shrink-0" />
                        <span className="truncate">{historyQuery}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Search Results */}
        <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
          <div className="space-y-4">
            {/* Results Header */}
            {query && (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">
                    Search Results for "{query}"
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Found {searchResults.length} results
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveCurrentSearch}
                    className="border-gray-600"
                  >
                    <BookmarkPlus className="h-4 w-4 mr-2" />
                    Save Search
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-600"
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            )}

            {/* Results List */}
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="bg-editor-dark border-gray-700">
                    <CardContent className="p-4">
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                        <div className="h-20 bg-gray-700 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map(result => (
                  <Card 
                    key={result.id} 
                    className="bg-editor-dark border-gray-700 hover:border-gray-600 cursor-pointer transition-colors"
                    onClick={() => onResultSelect?.(result)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {result.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {result.language}
                              </Badge>
                              {result.similarity && (
                                <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-400">
                                  {result.similarity}% similar
                                </Badge>
                              )}
                            </div>
                            <h4 className="text-white font-medium">{result.title}</h4>
                            <p className="text-gray-400 text-sm">{result.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{result.projectName}</span>
                              {result.filePath && <span>{result.filePath}</span>}
                              {result.lineNumbers && <span>Lines {result.lineNumbers}</span>}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {result.type === 'pattern' && <Code className="h-4 w-4 text-blue-400" />}
                            {result.type === 'duplicate' && <FileText className="h-4 w-4 text-yellow-400" />}
                            {result.type === 'project' && <FileText className="h-4 w-4 text-green-400" />}
                          </div>
                        </div>
                        
                        <div className="bg-black/20 rounded border border-gray-700 p-3">
                          <pre className="text-xs text-gray-300 overflow-x-auto">
                            <code>{result.snippet}</code>
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {query && searchResults.length === 0 && !isLoading && (
              <Card className="bg-editor-dark border-gray-700">
                <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">No results found</h3>
                  <p className="text-gray-500">
                    Try adjusting your search terms or filters
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
