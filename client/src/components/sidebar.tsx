import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { RefreshCw, Code, Copy, Search, CheckCircle } from "lucide-react";
import { Link, useLocation } from "wouter";

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

export default function Sidebar({ stats, duplicates, onRefresh }: SidebarProps) {
  const projectTypes = [
    { name: "React", count: stats?.languages?.javascript || 0, color: "text-accent-blue" },
    { name: "Node.js", count: stats?.languages?.javascript || 0, color: "text-success-green" },
    { name: "Python", count: stats?.languages?.python || 0, color: "text-yellow-400" },
    { name: "HTML/CSS", count: stats?.languages?.html || 0, color: "text-orange-400" },
  ];

  return (
    <aside className="w-64 bg-navy-dark border-r border-gray-700 flex-shrink-0 overflow-y-auto">
      <div className="p-4">
        <div className="space-y-6">
          {/* Projects Overview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Overview</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="text-gray-400 hover:text-white p-1"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-editor-dark">
                <span className="text-sm text-gray-300">Total Projects</span>
                <span className="text-replit-orange font-semibold">
                  {stats?.totalProjects || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-editor-dark">
                <span className="text-sm text-gray-300">Duplicates Found</span>
                <span className="text-yellow-400 font-semibold">
                  {stats?.duplicatesFound || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-editor-dark">
                <span className="text-sm text-gray-300">Similar Patterns</span>
                <span className="text-accent-blue font-semibold">
                  {stats?.similarPatterns || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Quick Filters</h3>
            <div className="space-y-2">
              <Link href="/">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left p-2 rounded-lg hover:bg-editor-dark transition-colors"
                >
                  <Code className="h-4 w-4 mr-2 text-accent-blue" />
                  <span className="text-sm text-gray-300">All Projects</span>
                </Button>
              </Link>
              <Link href="/?filter=duplicates">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left p-2 rounded-lg hover:bg-editor-dark transition-colors"
                >
                  <Copy className="h-4 w-4 mr-2 text-yellow-400" />
                  <span className="text-sm text-gray-300">Potential Duplicates</span>
                </Button>
              </Link>
              <Link href="/recent-searches">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left p-2 rounded-lg hover:bg-editor-dark transition-colors"
                >
                  <Search className="h-4 w-4 mr-2 text-success-green" />
                  <span className="text-sm text-gray-300">Recent Searches</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Project Types */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Project Types</h3>
            <div className="space-y-2">
              {projectTypes.map((type) => (
                <div key={type.name} className="flex items-center space-x-2 p-1">
                  <Checkbox className="border-gray-600 data-[state=checked]:bg-replit-orange data-[state=checked]:border-replit-orange" />
                  <span className="text-sm text-gray-300 flex-1">{type.name}</span>
                  <span className="text-xs text-gray-400">({type.count})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Duplicates */}
          {duplicates && duplicates.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Recent Duplicates</h3>
              <div className="space-y-2">
                {duplicates.slice(0, 5).map((duplicate: any) => (
                  <div key={duplicate.id} className="p-2 rounded-lg bg-editor-dark">
                    <div className="flex items-center space-x-2 mb-1">
                      <Copy className="h-3 w-3 text-yellow-400" />
                      <span className="text-xs text-gray-300 truncate">
                        {duplicate.description || 'Similar patterns found'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {duplicate.similarityScore}% similarity
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Status */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Analysis Status</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-editor-dark">
                <CheckCircle className="h-4 w-4 text-success-green" />
                <div className="flex-1">
                  <div className="text-sm text-gray-300">Last Scan</div>
                  <div className="text-xs text-gray-500">2 hours ago</div>
                </div>
              </div>
              <Button className="w-full bg-replit-orange hover:bg-orange-600 text-sm">
                Run Full Analysis
              </Button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
