
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Code, 
  Copy, 
  FileText, 
  Clock,
  Target,
  AlertTriangle
} from "lucide-react";

interface AnalyticsDashboardProps {
  className?: string;
}

export default function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedMetric, setSelectedMetric] = useState("duplicates");

  // Mock data - replace with actual API calls
  const mockAnalyticsData = {
    overview: {
      totalProjects: 24,
      duplicatesFound: 156,
      codePatterns: 423,
      lastScan: "2 hours ago",
      duplicatePercentage: 12.4,
      trend: "+2.3%"
    },
    duplicatesByLanguage: [
      { name: 'JavaScript', value: 45, color: '#f7df1e' },
      { name: 'Python', value: 32, color: '#3776ab' },
      { name: 'TypeScript', value: 28, color: '#3178c6' },
      { name: 'HTML/CSS', value: 18, color: '#e34f26' },
      { name: 'Other', value: 12, color: '#6b7280' }
    ],
    patternTypes: [
      { name: 'Functions', count: 89, percentage: 35 },
      { name: 'Components', count: 67, percentage: 27 },
      { name: 'Imports', count: 45, percentage: 18 },
      { name: 'Styles', count: 34, percentage: 13 },
      { name: 'Config', count: 18, percentage: 7 }
    ],
    timeSeriesData: [
      { date: '2024-01-01', duplicates: 23, patterns: 67 },
      { date: '2024-01-02', duplicates: 29, patterns: 78 },
      { date: '2024-01-03', duplicates: 35, patterns: 89 },
      { date: '2024-01-04', duplicates: 42, patterns: 95 },
      { date: '2024-01-05', duplicates: 38, patterns: 102 },
      { date: '2024-01-06', duplicates: 45, patterns: 118 },
      { date: '2024-01-07', duplicates: 51, patterns: 134 }
    ],
    topDuplicateProjects: [
      { name: 'E-commerce App', duplicates: 23, severity: 'high' },
      { name: 'Blog Platform', duplicates: 18, severity: 'medium' },
      { name: 'Dashboard UI', duplicates: 15, severity: 'medium' },
      { name: 'API Service', duplicates: 12, severity: 'low' },
      { name: 'Mobile App', duplicates: 9, severity: 'low' }
    ]
  };

  const { data: analytics = mockAnalyticsData } = useQuery({
    queryKey: ["/api/analytics", timeRange],
    enabled: false // Using mock data for now
  });

  const StatCard = ({ title, value, icon: Icon, trend, color = "text-white" }: any) => (
    <Card className="bg-editor-dark border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {trend && (
              <div className="flex items-center mt-1">
                {trend.startsWith('+') ? (
                  <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400 mr-1" />
                )}
                <span className={`text-sm ${trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {trend}
                </span>
              </div>
            )}
          </div>
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-gray-400">Comprehensive analysis of your code patterns and duplicates</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32 bg-editor-dark border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Projects"
          value={analytics.overview.totalProjects}
          icon={FileText}
          color="text-replit-orange"
        />
        <StatCard
          title="Duplicates Found"
          value={analytics.overview.duplicatesFound}
          icon={Copy}
          trend={analytics.overview.trend}
          color="text-yellow-400"
        />
        <StatCard
          title="Code Patterns"
          value={analytics.overview.codePatterns}
          icon={Code}
          color="text-blue-400"
        />
        <StatCard
          title="Duplicate Rate"
          value={`${analytics.overview.duplicatePercentage}%`}
          icon={Target}
          color="text-purple-400"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-editor-dark">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="projects">Project Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Duplicates by Language */}
            <Card className="bg-editor-dark border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Duplicates by Language</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.duplicatesByLanguage}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {analytics.duplicatesByLanguage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Pattern Types */}
            <Card className="bg-editor-dark border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Pattern Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.patternTypes.map((pattern, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300 text-sm">{pattern.name}</span>
                        <span className="text-white font-medium">{pattern.count}</span>
                      </div>
                      <Progress 
                        value={pattern.percentage} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <Card className="bg-editor-dark border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Pattern Analysis Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="patterns"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="duplicates"
                      stackId="2"
                      stroke="#F59E0B"
                      fill="#F59E0B"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="bg-editor-dark border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Duplicate Detection Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="duplicates"
                      stroke="#F59E0B"
                      strokeWidth={3}
                      dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card className="bg-editor-dark border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Top Projects with Duplicates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topDuplicateProjects.map((project, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-navy-dark rounded-lg border border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-gray-300 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{project.name}</h4>
                        <p className="text-gray-400 text-sm">{project.duplicates} duplicates found</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={
                          project.severity === 'high' 
                            ? 'border-red-400 text-red-400'
                            : project.severity === 'medium'
                            ? 'border-yellow-400 text-yellow-400'
                            : 'border-green-400 text-green-400'
                        }
                      >
                        {project.severity}
                      </Badge>
                      {project.severity === 'high' && (
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
