import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, FileCode, Copy, AlertTriangle } from "lucide-react";

interface SidebarProps {
  stats?: {
    totalProjects: number;
    duplicatesFound: number;
    similarPatterns: number;
    languages: Record<string, number>;
  };
  duplicates?: any[];
  onRefresh: () => void;
}

export default function Sidebar({ stats, duplicates = [], onRefresh }: SidebarProps) {
  return (
    <div className="w-80 bg-navy-dark border-r border-gray-700 p-4 overflow-y-auto">
      {/* Stats Overview */}
      <Card className="bg-editor-dark border-gray-600 mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center justify-between">
            Overview
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileCode className="h-4 w-4 text-accent-blue" />
              <span className="text-gray-300 text-sm">Projects</span>
            </div>
            <Badge variant="secondary" className="bg-accent-blue text-white">
              {stats?.totalProjects || 0}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Copy className="h-4 w-4 text-replit-orange" />
              <span className="text-gray-300 text-sm">Duplicates</span>
            </div>
            <Badge variant="secondary" className="bg-replit-orange text-white">
              {stats?.duplicatesFound || 0}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <span className="text-gray-300 text-sm">Patterns</span>
            </div>
            <Badge variant="secondary" className="bg-yellow-400 text-black">
              {stats?.similarPatterns || 0}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      {stats?.languages && Object.keys(stats.languages).length > 0 && (
        <Card className="bg-editor-dark border-gray-600 mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Languages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(stats.languages).map(([lang, count]) => (
              <div key={lang} className="flex items-center justify-between">
                <span className="text-gray-300 text-sm capitalize">{lang}</span>
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  {count}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Duplicates */}
      {duplicates.length > 0 && (
        <Card className="bg-editor-dark border-gray-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Recent Duplicates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {duplicates.slice(0, 5).map((duplicate: any, index: number) => (
              <div key={index} className="p-3 bg-navy-dark rounded border border-gray-600">
                <div className="text-sm text-gray-300 mb-1">
                  {duplicate.patternType}
                </div>
                <div className="text-xs text-gray-500">
                  {duplicate.patterns?.length || 0} matches
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}