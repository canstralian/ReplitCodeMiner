import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Copy, CheckCircle, AlertTriangle, Clock } from "lucide-react";

interface Project {
  id: number;
  title: string;
  description?: string;
  language: string;
  url: string;
  fileCount: number;
  lastUpdated: string;
  duplicateStatus?: "none" | "potential" | "high";
  similarPatterns?: number;
}

interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  onSelect: () => void;
  viewMode: "grid" | "list";
}

export default function ProjectCard({ project, isSelected, onSelect, viewMode }: ProjectCardProps) {
  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      javascript: "bg-yellow-500",
      typescript: "bg-blue-500",
      python: "bg-green-500",
      html: "bg-orange-500",
      css: "bg-purple-500",
      react: "bg-cyan-500",
    };
    return colors[language?.toLowerCase()] || "bg-gray-500";
  };

  const getDuplicateStatusIcon = () => {
    switch (project.duplicateStatus) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case "potential":
        return <Copy className="h-4 w-4 text-orange-400" />;
      case "none":
        return <CheckCircle className="h-4 w-4 text-success-green" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getDuplicateStatusText = () => {
    switch (project.duplicateStatus) {
      case "high":
        return "High similarity detected";
      case "potential":
        return "Potential duplicate";
      case "none":
        return "No duplicates found";
      default:
        return "Analysis pending";
    }
  };

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  if (viewMode === "list") {
    return (
      <Card className={`bg-navy-dark border-gray-700 hover:border-replit-orange transition-all duration-200 ${
        isSelected ? "border-replit-orange" : ""
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="border-gray-600 data-[state=checked]:bg-replit-orange data-[state=checked]:border-replit-orange"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-white truncate">{project.title}</h3>
                <Badge variant="secondary" className={`${getLanguageColor(project.language)} text-white text-xs`}>
                  {project.language}
                </Badge>
              </div>
              <p className="text-gray-400 text-sm truncate">{project.description || "No description"}</p>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{project.fileCount} files</span>
              <span>{formatLastUpdated(project.lastUpdated)}</span>
              <div className="flex items-center space-x-1">
                {getDuplicateStatusIcon()}
                <span className="hidden lg:inline">{getDuplicateStatusText()}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 hover:bg-gray-600"
                onClick={() => window.open(project.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-navy-dark border-gray-700 overflow-hidden hover:border-replit-orange transition-all duration-200 group ${
      isSelected ? "border-replit-orange" : ""
    }`}>
      {/* Project Preview */}
      <div className="h-32 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="absolute top-2 left-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="border-white data-[state=checked]:bg-replit-orange data-[state=checked]:border-replit-orange"
          />
        </div>
        <div className="absolute top-2 right-2">
          <Badge className={`${getLanguageColor(project.language)} text-white text-xs`}>
            {project.language}
          </Badge>
        </div>
        <div className="absolute bottom-2 left-2 right-2">
          <div className="flex items-center space-x-1 text-xs text-gray-300">
            {getDuplicateStatusIcon()}
            <span>{getDuplicateStatusText()}</span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-white group-hover:text-replit-orange transition-colors line-clamp-1">
            {project.title}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white transition-colors p-1"
            onClick={() => window.open(project.url, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
          {project.description || "No description available"}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{formatLastUpdated(project.lastUpdated)}</span>
          <span>{project.fileCount} files</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-gray-600 hover:bg-gray-600 text-gray-300"
          >
            View Details
          </Button>
          <Button
            size="sm"
            className="bg-replit-orange hover:bg-orange-600"
          >
            Analyze
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
