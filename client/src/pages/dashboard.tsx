import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, Search, RefreshCw, AlertCircle, TrendingUp, GitBranch, Users, Clock, Database } from "lucide-react";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading, error: projectsError, refetch: refetchProjects } = useQuery({
    queryKey: ["/api/projects"],
    enabled: isAuthenticated,
  });

  // Fetch project stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/projects/stats"],
    enabled: isAuthenticated,
  });

  // Fetch duplicates
  const { data: duplicates = [], isLoading: duplicatesLoading } = useQuery({
    queryKey: ["/api/duplicates"],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <Code2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in with your Replit account to access the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              Sign In with Replit
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Welcome Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ''}! Analyze your Replit projects for code patterns.
            </p>
          </div>
          <Button onClick={() => refetchProjects()} disabled={projectsLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${projectsLoading ? 'animate-spin' : ''}`} />
            Refresh Projects
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalProjects || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Connected repositories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duplicates Found</CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.duplicatesFound || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Code patterns identified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Similar Patterns</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.similarPatterns || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Potential refactoring opportunities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Languages</CardTitle>
              <Code2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? <Skeleton className="h-8 w-16" /> : Object.keys(stats?.languages || {}).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Programming languages detected
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="projects" className="space-y-4">
          <TabsList>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="duplicates">Duplicates</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Projects</CardTitle>
                <CardDescription>
                  Replit projects connected to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : projectsError ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Failed to load projects</p>
                    <Button variant="outline" onClick={() => refetchProjects()}>
                      Try Again
                    </Button>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-8">
                    <Code2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No projects found</p>
                    <p className="text-sm text-muted-foreground">
                      Connect your Replit account to start analyzing projects
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project: any) => (
                      <Card key={project.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center">
                              <Code2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">{project.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {project.language} • {project.fileCount || 0} files
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">{project.language}</Badge>
                            <Button variant="outline" size="sm">
                              Analyze
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="duplicates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Duplicate Code Patterns</CardTitle>
                <CardDescription>
                  Similar code blocks found across your projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                {duplicatesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : duplicates.length === 0 ? (
                  <div className="text-center py-8">
                    <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No duplicates found yet</p>
                    <p className="text-sm text-muted-foreground">
                      Run analysis on your projects to find duplicate patterns
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {duplicates.map((duplicate: any, index: number) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">
                            {duplicate.similarityScore}% similarity
                          </Badge>
                          <Badge>{duplicate.patternType}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {duplicate.description}
                        </p>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Search Code Patterns</CardTitle>
                <CardDescription>
                  Find specific code patterns across your projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 mb-6">
                  <Input
                    placeholder="Search for functions, classes, or patterns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Enter a search query to find code patterns</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}