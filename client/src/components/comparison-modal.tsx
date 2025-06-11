import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Copy, ExternalLink } from "lucide-react";

interface ComparisonModalProps {
  projectIds: string[];
  onClose: () => void;
}

export default function ComparisonModal({ projectIds, onClose }: ComparisonModalProps) {
  // Mock comparison data
  const comparisonData = {
    similarities: [
      {
        type: "Function",
        name: "calculateTotal",
        similarity: 95,
        projects: ["Project A", "Project B"],
        description: "Similar function for calculating totals"
      },
      {
        type: "Component",
        name: "UserCard",
        similarity: 87,
        projects: ["Project A", "Project C"],
        description: "React component with similar structure"
      }
    ]
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-navy-dark border-gray-700 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl text-white">
              Project Comparison ({projectIds.length} projects)
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Comparison Results */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Similar Patterns Found</h3>
            
            {comparisonData.similarities.map((similarity, index) => (
              <div key={index} className="p-4 bg-editor-dark rounded-lg border border-gray-600">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Copy className="h-5 w-5 text-replit-orange" />
                    <div>
                      <h4 className="text-white font-medium">{similarity.name}</h4>
                      <p className="text-gray-400 text-sm">{similarity.description}</p>
                    </div>
                  </div>
                  <Badge className="bg-replit-orange text-white">
                    {similarity.similarity}% match
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">Found in:</span>
                    {similarity.projects.map((project, idx) => (
                      <Badge key={idx} variant="outline" className="border-gray-600 text-gray-300">
                        {project}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-accent-blue hover:text-blue-400"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="p-4 bg-editor-dark rounded-lg border border-gray-600">
            <h3 className="text-white font-medium mb-2">Comparison Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Similar patterns:</span>
                <span className="text-replit-orange ml-2">{comparisonData.similarities.length}</span>
              </div>
              <div>
                <span className="text-gray-400">Average similarity:</span>
                <span className="text-success-green ml-2">
                  {Math.round(comparisonData.similarities.reduce((acc, s) => acc + s.similarity, 0) / comparisonData.similarities.length)}%
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} className="border-gray-600">
              Close
            </Button>
            <Button className="bg-replit-orange hover:bg-orange-600">
              Export Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}