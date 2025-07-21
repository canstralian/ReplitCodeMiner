
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
import ProjectCard from "../components/project-card";
import { useIsMobile } from "../hooks/use-mobile";
import { 
  Search, 
  Filter, 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  Code2, 
  Clock,
  BarChart3,
  Zap,
  RefreshCw
} from "lucide-react";

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterBy, setFilterBy] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const isMobile = useIsMobile();

  const { data: projects = [], isLoading, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await fetch("/api/projects");
      if (!response.ok) throw new Error("Failed to fetch projects");
      return response.json();
    },
  });

  const { data: analytics } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response = await fetch("/api/analytics");
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
  });

  const filteredProjects = projects
    .filter((project: any) => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterBy === "all" || 
        (filterBy === "duplicates" && project.duplicateCount > 0) ||
        (filterBy === "recent" && new Date(project.lastAnalyzed) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
      return matchesSearch && matchesFilter;
    })
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "duplicates":
          return b.duplicateCount - a.duplicateCount;
        case "lastAnalyzed":
          return new Date(b.lastAnalyzed).getTime() - new Date(a.lastAnalyzed).getTime();
        default:
          return 0;
      }
    });

  const stats = {
    totalProjects: projects.length,
    totalDuplicates: projects.reduce((sum: number, p: any) => sum + (p.duplicateCount || 0), 0),
    recentlyAnalyzed: projects.filter((p: any) => 
      new Date(p.lastAnalyzed) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length,
    codeQualityScore: analytics?.averageQualityScore || 85
  };

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
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Monitor your code quality and manage duplicate detection across all projects
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => refetch()}
                  disabled={isLoading}
                  aria-label="Refresh data"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Analyze Project
                </Button>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:w-fit">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="card-feature">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Total Projects
                    </CardTitle>
                    <Code2 className="h-4 w-4 text-accent-blue" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalProjects}</div>
                    <p className="text-xs text-gray-600 mt-1">
                      Across all repositories
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-feature">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Duplicates Found
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-warning-yellow" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalDuplicates}</div>
                    <p className="text-xs text-gray-600 mt-1">
                      Requiring attention
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-feature">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Recently Analyzed
                    </CardTitle>
                    <Clock className="h-4 w-4 text-success-green" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats.recentlyAnalyzed}</div>
                    <p className="text-xs text-gray-600 mt-1">
                      In the last 24 hours
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-feature">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Code Quality Score
                    </CardTitle>
                    <Zap className="h-4 w-4 text-replit-orange" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats.codeQualityScore}%</div>
                    <p className="text-xs text-gray-600 mt-1">
                      Average across projects
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="card-feature">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-replit-orange" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <Plus className="w-6 h-6 text-accent-blue" />
                      <span>Analyze New Project</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <Search className="w-6 h-6 text-success-green" />
                      <span>Search Duplicates</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <BarChart3 className="w-6 h-6 text-replit-orange" />
                      <span>View Reports</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Projects Preview */}
              <Card className="card-feature">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Projects</CardTitle>
                  <Button variant="ghost" onClick={() => setActiveTab("projects")}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="loading-skeleton h-16 rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {projects.slice(0, 3).map((project: any) => (
                        <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div>
                            <h3 className="font-medium text-gray-900">{project.name}</h3>
                            <p className="text-sm text-gray-600">
                              {project.duplicateCount} duplicates found
                            </p>
                          </div>
                          <Badge variant={project.duplicateCount > 0 ? "destructive" : "secondary"}>
                            {project.duplicateCount > 0 ? "Needs Review" : "Clean"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-6">
              {/* Search and Filters */}
              <Card className="card-feature">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 form-input"
                        aria-label="Search projects"
                      />
                    </div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="duplicates">Duplicates</SelectItem>
                        <SelectItem value="lastAnalyzed">Last Analyzed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterBy} onValueChange={setFilterBy}>
                      <SelectTrigger className="w-full md:w-48">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        <SelectItem value="duplicates">Has Duplicates</SelectItem>
                        <SelectItem value="recent">Recently Analyzed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Projects Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="loading-skeleton h-48 rounded-lg" />
                  ))}
                </div>
              ) : filteredProjects.length === 0 ? (
                <Card className="card-feature">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm ? "Try adjusting your search terms" : "Get started by analyzing your first project"}
                    </p>
                    <Button className="btn-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Analyze Project
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project: any) => (
                    <ProjectCard 
                      key={project.id} 
                      project={project}
                      isSelected={false}
                      onSelect={() => {}}
                      viewMode="grid"
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card className="card-feature">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-replit-orange" />
                    Analytics Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Get detailed insights into your code quality, duplicate patterns, and improvement trends.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
