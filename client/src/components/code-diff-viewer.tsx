
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";

interface CodePattern {
  id: number;
  filePath: string;
  codeSnippet: string;
  lineStart: number;
  lineEnd: number;
  patternType: string;
  projectTitle?: string;
}

interface DuplicateGroup {
  id: number;
  similarityScore: number;
  patternType: string;
  description: string;
  patterns: CodePattern[];
}

interface CodeDiffViewerProps {
  duplicateGroup: DuplicateGroup;
  onClose: () => void;
}

export default function CodeDiffViewer({ duplicateGroup, onClose }: CodeDiffViewerProps) {
  const [selectedPatterns, setSelectedPatterns] = useState<number[]>([0, 1]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handlePatternSelect = (index: number) => {
    if (selectedPatterns.includes(index)) {
      setSelectedPatterns(selectedPatterns.filter(i => i !== index));
    } else if (selectedPatterns.length < 2) {
      setSelectedPatterns([...selectedPatterns, index]);
    } else {
      setSelectedPatterns([selectedPatterns[1], index]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportDiff = () => {
    const patterns = selectedPatterns.map(i => duplicateGroup.patterns[i]);
    const diffReport = `
Duplicate Code Analysis Report
============================

Similarity Score: ${duplicateGroup.similarityScore}%
Pattern Type: ${duplicateGroup.patternType}
Description: ${duplicateGroup.description}

${patterns.map((pattern, idx) => `
File ${idx + 1}: ${pattern.filePath}
Lines: ${pattern.lineStart}-${pattern.lineEnd}
Project: ${pattern.projectTitle || 'Unknown'}

\`\`\`
${pattern.codeSnippet}
\`\`\`
`).join('\n')}
    `;
    
    const blob = new Blob([diffReport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `duplicate-analysis-${duplicateGroup.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-navy-dark rounded-lg border border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Code Similarity Analysis</h2>
            <p className="text-gray-400 text-sm">
              {duplicateGroup.patterns.length} similar patterns found
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-yellow-400 text-yellow-400">
              {duplicateGroup.similarityScore}% similarity
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={exportDiff}
              className="border-gray-600"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={onClose} variant="outline" className="border-gray-600">
              Close
            </Button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Left Panel - Pattern List */}
          <div className="w-1/3 border-r border-gray-700 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-medium text-white mb-3">Similar Patterns</h3>
              <div className="space-y-2">
                {duplicateGroup.patterns.map((pattern, index) => (
                  <div
                    key={pattern.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedPatterns.includes(index)
                        ? 'border-replit-orange bg-orange-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => handlePatternSelect(index)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {pattern.patternType}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        Lines {pattern.lineStart}-{pattern.lineEnd}
                      </span>
                    </div>
                    <p className="text-sm text-white font-mono truncate">
                      {pattern.filePath}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {pattern.projectTitle || 'Unknown Project'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Code Comparison */}
          <div className="flex-1 overflow-y-auto">
            <Tabs defaultValue="side-by-side" className="h-full">
              <div className="border-b border-gray-700 px-4">
                <TabsList className="bg-editor-dark">
                  <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
                  <TabsTrigger value="unified">Unified Diff</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="side-by-side" className="p-4 space-y-4">
                {selectedPatterns.length === 2 ? (
                  <div className="grid grid-cols-2 gap-4 h-full">
                    {selectedPatterns.map((patternIndex, idx) => {
                      const pattern = duplicateGroup.patterns[patternIndex];
                      return (
                        <Card key={pattern.id} className="bg-editor-dark border-gray-700">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm text-white truncate">
                                {pattern.filePath}
                              </CardTitle>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(pattern.codeSnippet)}
                                className="text-gray-400 hover:text-white"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-xs text-gray-400">
                              {pattern.projectTitle} • Lines {pattern.lineStart}-{pattern.lineEnd}
                            </p>
                          </CardHeader>
                          <CardContent>
                            <pre className="text-xs text-gray-300 overflow-x-auto bg-black/20 p-3 rounded border border-gray-700">
                              <code>{pattern.codeSnippet}</code>
                            </pre>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-12">
                    <p>Select exactly 2 patterns to compare side by side</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="unified" className="p-4">
                <Card className="bg-editor-dark border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Unified Diff View</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs text-gray-300 overflow-x-auto bg-black/20 p-3 rounded border border-gray-700">
                      {selectedPatterns.length === 2 ? (
                        <code>
                          {`--- ${duplicateGroup.patterns[selectedPatterns[0]].filePath}\n`}
                          {`+++ ${duplicateGroup.patterns[selectedPatterns[1]].filePath}\n`}
                          {`@@ -${duplicateGroup.patterns[selectedPatterns[0]].lineStart},${duplicateGroup.patterns[selectedPatterns[0]].lineEnd - duplicateGroup.patterns[selectedPatterns[0]].lineStart} +${duplicateGroup.patterns[selectedPatterns[1]].lineStart},${duplicateGroup.patterns[selectedPatterns[1]].lineEnd - duplicateGroup.patterns[selectedPatterns[1]].lineStart} @@\n`}
                          {duplicateGroup.patterns[selectedPatterns[0]].codeSnippet.split('\n').map(line => `-${line}`).join('\n')}
                          {'\n'}
                          {duplicateGroup.patterns[selectedPatterns[1]].codeSnippet.split('\n').map(line => `+${line}`).join('\n')}
                        </code>
                      ) : (
                        'Select exactly 2 patterns to see unified diff'
                      )}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="p-4 space-y-4">
                <div className="space-y-4">
                  <Card className="bg-editor-dark border-gray-700">
                    <CardHeader>
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => toggleSection('overview')}
                      >
                        {expandedSections.has('overview') ? 
                          <ChevronDown className="h-4 w-4 mr-2" /> : 
                          <ChevronRight className="h-4 w-4 mr-2" />
                        }
                        <CardTitle className="text-white">Analysis Overview</CardTitle>
                      </div>
                    </CardHeader>
                    {expandedSections.has('overview') && (
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Similarity Score:</span>
                            <span className="text-yellow-400 font-medium">{duplicateGroup.similarityScore}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Pattern Type:</span>
                            <Badge variant="outline">{duplicateGroup.patternType}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Total Patterns:</span>
                            <span className="text-white">{duplicateGroup.patterns.length}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Description:</span>
                            <p className="text-white mt-1">{duplicateGroup.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  <Card className="bg-editor-dark border-gray-700">
                    <CardHeader>
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => toggleSection('suggestions')}
                      >
                        {expandedSections.has('suggestions') ? 
                          <ChevronDown className="h-4 w-4 mr-2" /> : 
                          <ChevronRight className="h-4 w-4 mr-2" />
                        }
                        <CardTitle className="text-white">Refactoring Suggestions</CardTitle>
                      </div>
                    </CardHeader>
                    {expandedSections.has('suggestions') && (
                      <CardContent>
                        <div className="space-y-3 text-sm">
                          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                            <h4 className="text-blue-400 font-medium mb-2">Extract Common Function</h4>
                            <p className="text-gray-300">
                              Consider extracting this repeated code into a reusable utility function 
                              to reduce duplication and improve maintainability.
                            </p>
                          </div>
                          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded">
                            <h4 className="text-green-400 font-medium mb-2">Create Shared Module</h4>
                            <p className="text-gray-300">
                              These patterns could be consolidated into a shared module that 
                              multiple projects can import and use.
                            </p>
                          </div>
                          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                            <h4 className="text-yellow-400 font-medium mb-2">Template Opportunity</h4>
                            <p className="text-gray-300">
                              This pattern appears frequently and could be turned into a 
                              project template or code snippet for future use.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
