import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Download, Lightbulb } from "lucide-react";

interface ComparisonModalProps {
  projectIds: string[];
  onClose: () => void;
}

export default function ComparisonModal({ projectIds, onClose }: ComparisonModalProps) {
  // Mock data for demonstration - in real app this would fetch comparison data
  const mockComparison = {
    projects: [
      {
        id: projectIds[0],
        name: "E-commerce Dashboard",
        filePath: "src/components/Dashboard.jsx",
        code: `import React from 'react';
import { Chart, Line } from 'chart.js';

const Dashboard = () => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetchAnalytics()
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Analytics Dashboard</h1>
      <Chart data={data} />
    </div>
  );
};`
      },
      {
        id: projectIds[1] || projectIds[0],
        name: "Social Media App",
        filePath: "src/pages/Analytics.jsx",
        code: `import React from 'react';
import { Chart, Bar } from 'chart.js';

const Analytics = () => {
  const [analytics, setAnalytics] = useState([]);
  
  useEffect(() => {
    getAnalyticsData()
      .then(setAnalytics)
      .catch(console.error);
  }, []);

  return (
    <div className="analytics-page">
      <h2>User Analytics</h2>
      <Chart data={analytics} />
    </div>
  );
};`
      }
    ],
    similarityScore: 87,
    commonPatterns: ["Chart.js usage", "useEffect pattern", "State management"]
  };

  const highlightSyntax = (code: string) => {
    return code
      .replace(/\b(import|const|let|var|function|return|if|else|for|while)\b/g, '<span class="text-purple-400">$1</span>')
      .replace(/\b(React|useState|useEffect)\b/g, '<span class="text-yellow-300">$1</span>')
      .replace(/'([^']*)'/g, '<span class="text-green-400">\'$1\'</span>')
      .replace(/"([^"]*)"/g, '<span class="text-green-400">"$1"</span>')
      .replace(/\/\/.*$/gm, '<span class="text-gray-500">$&</span>')
      .replace(/&lt;(\/?[a-zA-Z][^&gt;]*)&gt;/g, '<span class="text-red-400">&lt;$1&gt;</span>');
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] bg-editor-dark border-gray-700">
        <DialogHeader className="bg-navy-dark p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-white">Code Comparison</DialogTitle>
              <p className="text-gray-400 text-sm">Side-by-side analysis of similar patterns</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Comparison Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel */}
          <div className="flex-1 border-r border-gray-700">
            <div className="p-4 bg-navy-dark border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-replit-orange rounded-full"></div>
                <span className="font-medium text-white">{mockComparison.projects[0].name}</span>
                <span className="text-sm text-gray-400">{mockComparison.projects[0].filePath}</span>
              </div>
            </div>
            <div className="p-4 h-full overflow-y-auto">
              <pre className="font-jetbrains text-sm text-gray-300 bg-gray-900 p-4 rounded-lg overflow-x-auto">
                <code 
                  dangerouslySetInnerHTML={{ 
                    __html: highlightSyntax(mockComparison.projects[0].code.replace(/</g, '&lt;').replace(/>/g, '&gt;'))
                  }}
                />
              </pre>
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex-1">
            <div className="p-4 bg-navy-dark border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-accent-blue rounded-full"></div>
                <span className="font-medium text-white">{mockComparison.projects[1].name}</span>
                <span className="text-sm text-gray-400">{mockComparison.projects[1].filePath}</span>
              </div>
            </div>
            <div className="p-4 h-full overflow-y-auto">
              <pre className="font-jetbrains text-sm text-gray-300 bg-gray-900 p-4 rounded-lg overflow-x-auto">
                <code 
                  dangerouslySetInnerHTML={{ 
                    __html: highlightSyntax(mockComparison.projects[1].code.replace(/</g, '&lt;').replace(/>/g, '&gt;'))
                  }}
                />
              </pre>
            </div>
          </div>
        </div>

        {/* Similarity Analysis Footer */}
        <div className="bg-navy-dark p-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Similarity Score:</span>
                <Badge className="bg-replit-orange text-white">
                  {mockComparison.similarityScore}%
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Common Patterns:</span>
                <div className="flex space-x-1">
                  {mockComparison.commonPatterns.map((pattern, index) => (
                    <Badge key={index} variant="secondary" className="bg-accent-blue text-white text-xs">
                      {pattern}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" className="border-gray-600 text-gray-300">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button className="bg-replit-orange hover:bg-orange-600">
                <Lightbulb className="h-4 w-4 mr-2" />
                Refactor Suggestions
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
