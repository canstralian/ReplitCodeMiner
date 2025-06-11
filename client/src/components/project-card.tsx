import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, FileCode, Clock, Copy } from "lucide-react";

interface ProjectCardProps {
  project: {
    id: string | number;
    title: string;
    description?: string;
    language?: string;
    url?: string;
    fileCount?: number;
    lastUpdated?: string | Date;
    duplicatesFound?: number;
  };
  isSelected: boolean;
  onSelect: () => void;
  viewMode: "grid" | "list";
}

export default function ProjectCard({ project, isSelected, onSelect, viewMode }: ProjectCardProps) {
  const handleOpenProject = () => {
    if (project.url) {
      window.open(project.url, '_blank');
    }
  };

  if (viewMode === "list") {
    return (
      <Card className="bg-navy-dark border-gray-700 hover:border-replit-orange transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="border-gray-600"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <h3 className="text-white font-medium truncate">{project.title}</h3>
                {project.language && (
                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                    {project.language}
                  </Badge>
                )}
                {project.duplicatesFound && project.duplicatesFound > 0 && (
                  <Badge className="bg-replit-orange text-white">
                    {project.duplicatesFound} duplicates
                  </Badge>
                )}
              </div>
              {project.description && (
                <p className="text-gray-400 text-sm mt-1 truncate">{project.description}</p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                {project.fileCount && (
                  <div className="flex items-center space-x-1">
                    <FileCode className="h-3 w-3" />
                    <span>{project.fileCount} files</span>
                  </div>
                )}
                {project.lastUpdated && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Updated {new Date(project.lastUpdated).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenProject}
              className="text-gray-400 hover:text-white"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-navy-dark border-gray-700 hover:border-replit-orange transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="border-gray-600"
            />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-white text-lg truncate group-hover:text-replit-orange transition-colors">
                {project.title}
              </CardTitle>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenProject}
            className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {project.description && (
          <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
        )}
        
        <div className="space-y-2">
          {project.language && (
            <Badge variant="outline" className="border-gray-600 text-gray-300">
              {project.language}
            </Badge>
          )}
          
          {project.duplicatesFound && project.duplicatesFound > 0 && (
            <Badge className="bg-replit-orange text-white ml-2">
              <Copy className="h-3 w-3 mr-1" />
              {project.duplicatesFound} duplicates
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          {project.fileCount && (
            <div className="flex items-center space-x-1">
              <FileCode className="h-3 w-3" />
              <span>{project.fileCount} files</span>
            </div>
          )}
          {project.lastUpdated && (
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{new Date(project.lastUpdated).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}