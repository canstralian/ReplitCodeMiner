import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, FileCode, Copy, Clock, Languages } from "lucide-react";

export default function AnalyticsDashboard() {
  // Mock analytics data - in real app this would come from API
  const analyticsData = {
    totalProjects: 24,
    duplicatesFound: 127,
    similarPatterns: 89,
    timesSaved: "3.2 hours",
    mostDuplicatedLanguage: "JavaScript",
    averageDuplicatesPerProject: 5.3,
    recentActivity: [
      { action: "Found 12 duplicates", project: "E-commerce App", time: "2 hours ago" },
      { action: "Analyzed project", project: "Portfolio Site", time: "1 day ago" },
      { action: "Found 8 similar patterns", project: "Blog Platform", time: "2 days ago" }
    ],
    languageStats: [
      { language: "JavaScript", projects: 12, duplicates: 45 },
      { language: "TypeScript", projects: 8, duplicates: 32 },
      { language: "Python", projects: 4, duplicates: 18 },
      { language: "HTML/CSS", projects: 15, duplicates: 32 }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-navy-dark border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Projects</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-white">{analyticsData.totalProjects}</p>
                  <Badge className="bg-success-green text-white">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12%
                  </Badge>
                </div>
              </div>
              <FileCode className="h-8 w-8 text-accent-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-navy-dark border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Duplicates Found</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-white">{analyticsData.duplicatesFound}</p>
                  <Badge className="bg-replit-orange text-white">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8%
                  </Badge>
                </div>
              </div>
              <Copy className="h-8 w-8 text-replit-orange" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-navy-dark border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Time Saved</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-white">{analyticsData.timesSaved}</p>
                  <Badge className="bg-success-green text-white">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +15%
                  </Badge>
                </div>
              </div>
              <Clock className="h-8 w-8 text-success-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-navy-dark border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Avg. Duplicates</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-white">{analyticsData.averageDuplicatesPerProject}</p>
                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    -2%
                  </Badge>
                </div>
              </div>
              <Languages className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Language Statistics */}
      <Card className="bg-navy-dark border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Language Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.languageStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-editor-dark rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-replit-orange"></div>
                  <span className="text-white font-medium">{stat.language}</span>
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-400">
                  <div className="text-center">
                    <div className="text-white font-medium">{stat.projects}</div>
                    <div>Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-replit-orange font-medium">{stat.duplicates}</div>
                    <div>Duplicates</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-navy-dark border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-editor-dark rounded-lg">
                <div className="w-2 h-2 rounded-full bg-replit-orange"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.action}</p>
                  <p className="text-gray-400 text-xs">in {activity.project}</p>
                </div>
                <span className="text-gray-500 text-xs">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}