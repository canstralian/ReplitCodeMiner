import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import ProjectCard from "@/components/project-card";
import ComparisonModal from "@/components/comparison-modal";
import CodeDiffViewer from "@/components/code-diff-viewer";
import AnalyticsDashboard from "@/components/analytics-dashboard";
import AdvancedSearch from "@/components/advanced-search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, Grid3X3, List, BarChart3, Brain } from "lucide-react";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedDuplicateGroup, setSelectedDuplicateGroup] = useState<any>(null);
  const [showDiffViewer, setShowDiffViewer] = useState(false);
  const [activeTab, setActiveTab] = useState("projects");

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading, refetch: refetchProjects } = useQuery({
    queryKey: ["/api/projects"],
  });

  // Fetch project stats
  const { data: stats } = useQuery({
    queryKey: ["/api/projects/stats"],
  });

  // Fetch duplicates
  const { data: duplicates = [] } = useQuery({
    queryKey: ["/api/duplicates"],
  });

  const handleRefreshProjects = async () => {
    await refetchProjects();
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleCompareProjects = () => {
    if (selectedProjects.length >= 2) {
      setShowComparison(true);
    }
  };

  const filteredProjects = projects.filter((project: any) => {
    const matchesSearch = !searchQuery || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLanguage = selectedLanguage === "all" || 
      project.language?.toLowerCase() === selectedLanguage.toLowerCase();

    return matchesSearch && matchesLanguage;
  });

  return (
    <div className="min-h-screen bg-editor-dark">
      <Header />

      <div className="flex h-screen pt-16">
        <Sidebar 
          stats={stats}
          duplicates={duplicates}
          onRefresh={handleRefreshProjects}
        />

        <main className="flex-1 overflow-hidden">
          {/* Main Navigation Tabs */}
          <div className="bg-navy-dark border-b border-gray-700">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-4 py-2">
                <TabsList className="bg-editor-dark">
                  <TabsTrigger value="projects" className="flex items-center">
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    Projects
                  </TabsTrigger>
                  <TabsTrigger value="search" className="flex items-center">
                    <Search className="h-4 w-4 mr-2" />
                    Advanced Search
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto">
                <TabsContent value="projects" className="p-6 space-y-6 mt-0">
                  {/* Search Header */}
                  <div className="bg-navy-dark border border-gray-700 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          type="text"
                          placeholder="Search for code patterns, function names, or themes..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-editor-dark border-gray-600 text-white placeholder-gray-400 focus:ring-replit-orange focus:border-replit-orange"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                          <SelectTrigger className="w-40 bg-editor-dark border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Languages</SelectItem>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="html">HTML/CSS</SelectItem>
                            <SelectItem value="typescript">TypeScript</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button className="bg-replit-orange hover:bg-orange-600">
                          <SlidersHorizontal className="h-4 w-4 mr-2" />
                          Filters
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Results Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold mb-1 text-white">Your Projects</h2>
                      <p className="text-gray-400">
                        Found <span className="text-replit-orange font-medium">{filteredProjects.length}</span> projects
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className={viewMode === "grid" ? "bg-replit-orange" : "border-gray-600"}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className={viewMode === "list" ? "bg-replit-orange" : "border-gray-600"}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Selected Projects Actions */}
                  {selectedProjects.length > 0 && (
                    <div className="p-4 bg-navy-dark rounded-lg border border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">
                          {selectedProjects.length} project{selectedProjects.length !== 1 ? 's' : ''} selected
                        </span>
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleCompareProjects}
                            disabled={selectedProjects.length < 2}
                            className="bg-accent-blue hover:bg-blue-500"
                          >
                            Compare Selected
                          </Button>
                          <Button
                            onClick={() => setSelectedProjects([])}
                            variant="outline"
                            className="border-gray-600"
                          >
                            Clear Selection
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Projects Grid */}
                  {projectsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-navy-dark rounded-xl border border-gray-700 p-4">
                          <div className="animate-pulse">
                            <div className="h-32 bg-gray-700 rounded mb-4"></div>
                            <div className="h-4 bg-gray-700 rounded mb-2"></div>
                            <div className="h-3 bg-gray-700 rounded mb-4"></div>
                            <div className="flex space-x-2">
                              <div className="h-8 bg-gray-700 rounded flex-1"></div>
                              <div className="h-8 bg-gray-700 rounded w-20"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={viewMode === "grid" 
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                      : "space-y-4"
                    }>
                      {filteredProjects.map((project: any) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          isSelected={selectedProjects.includes(project.id.toString())}
                          onSelect={() => handleProjectSelect(project.id.toString())}
                          viewMode={viewMode}
                        />
                      ))}
                    </div>
                  )}

                  {filteredProjects.length === 0 && !projectsLoading && (
                    <div className="text-center py-12">
                      <Search className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-300 mb-2">No projects found</h3>
                      <p className="text-gray-500">
                        {searchQuery ? "Try adjusting your search criteria" : "Connect to Replit to load your projects"}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="search" className="p-6 mt-0">
                  <AdvancedSearch 
                    onResultSelect={(result) => {
                      console.log('Selected search result:', result);
                      // Handle result selection - could open diff viewer, navigate to code, etc.
                    }}
                  />
                </TabsContent>

                <TabsContent value="analytics" className="p-6 mt-0">
                  <AnalyticsDashboard />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Comparison Modal */}
      {showComparison && (
        <ComparisonModal
          projectIds={selectedProjects}
          onClose={() => setShowComparison(false)}
        />
      )}

      {/* Code Diff Viewer */}
      {showDiffViewer && selectedDuplicateGroup && (
        <CodeDiffViewer
          duplicateGroup={selectedDuplicateGroup}
          onClose={() => {
            setShowDiffViewer(false);
            setSelectedDuplicateGroup(null);
          }}
        />
      )}
    </div>
  );
}