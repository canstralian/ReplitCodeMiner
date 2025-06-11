import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Copy, FileCode } from "lucide-react";

interface CodeDiffViewerProps {
  duplicateGroup: any;
  onClose: () => void;
}

export default function CodeDiffViewer({ duplicateGroup, onClose }: CodeDiffViewerProps) {
  // Mock code diff data
  const diffData = {
    leftCode: `function calculateTotal(items) {
  let total = 0;
  for (let item of items) {
    total += item.price * item.quantity;
  }
  return total;
}`,
    rightCode: `function calculateTotal(products) {
  let sum = 0;
  for (let product of products) {
    sum += product.price * product.qty;
  }
  return sum;
}`
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl bg-navy-dark border-gray-700 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl text-white flex items-center">
              <FileCode className="h-5 w-5 mr-2" />
              Code Comparison
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

        <div className="space-y-4">
          {/* Similarity Score */}
          <div className="flex items-center justify-between p-3 bg-editor-dark rounded-lg">
            <div className="flex items-center space-x-3">
              <Copy className="h-5 w-5 text-replit-orange" />
              <span className="text-white">Similarity Score</span>
            </div>
            <Badge className="bg-replit-orange text-white">95% Match</Badge>
          </div>

          {/* Code Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Code */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium">File A: utils.js</h3>
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  Project Alpha
                </Badge>
              </div>
              <div className="bg-editor-dark rounded-lg p-4 font-mono text-sm">
                <pre className="text-gray-300 whitespace-pre-wrap">
                  {diffData.leftCode}
                </pre>
              </div>
            </div>

            {/* Right Code */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium">File B: calculations.js</h3>
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  Project Beta
                </Badge>
              </div>
              <div className="bg-editor-dark rounded-lg p-4 font-mono text-sm">
                <pre className="text-gray-300 whitespace-pre-wrap">
                  {diffData.rightCode}
                </pre>
              </div>
            </div>
          </div>

          {/* Analysis */}
          <div className="p-4 bg-editor-dark rounded-lg">
            <h3 className="text-white font-medium mb-3">Analysis</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-success-green"></div>
                <span className="text-gray-300">Function structure is identical</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <span className="text-gray-300">Variable names differ (items vs products, total vs sum)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <span className="text-gray-300">Property names differ (quantity vs qty)</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} className="border-gray-600">
              Close
            </Button>
            <Button className="bg-accent-blue hover:bg-blue-500">
              Create Refactoring Suggestion
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}