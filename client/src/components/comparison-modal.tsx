import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  duplicate: {
    id: string;
    files: Array<{
      path: string;
      content: string;
      similarity: number;
    }>;
    type: string;
    description: string;
  } | null;
}

export default function ComparisonModal({ isOpen, onClose, duplicate }: ComparisonModalProps) {
  const isMobile = useIsMobile();

  if (!duplicate) return null;

  const MobileLayout = () => (
    <Tabs defaultValue="file-0" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-gray-800">
        {duplicate.files.slice(0, 2).map((file, index) => (
          <TabsTrigger 
            key={index} 
            value={`file-${index}`} 
            className="text-xs truncate max-w-full"
          >
            {file.path.split('/').pop() || `File ${index + 1}`}
          </TabsTrigger>
        ))}
      </TabsList>

      {duplicate.files.slice(0, 2).map((file, index) => (
        <TabsContent key={index} value={`file-${index}`} className="mt-3">
          <div className="mb-2">
            <div className="flex flex-col space-y-1">
              <h3 className="text-xs font-medium text-gray-300 truncate">
                {file.path}
              </h3>
              <Badge className="bg-replit-orange text-white text-xs w-fit">
                {Math.round(file.similarity)}% similar
              </Badge>
            </div>
          </div>

          <ScrollArea className="h-[50vh] bg-editor-dark rounded border border-gray-600">
            <pre className="p-3 text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
              {file.content}
            </pre>
          </ScrollArea>
        </TabsContent>
      ))}
    </Tabs>
  );

  const DesktopLayout = () => (
    <div className="grid grid-cols-2 gap-4 h-[70vh]">
      {duplicate.files.slice(0, 2).map((file, index) => (
        <div key={index} className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-300 truncate">
              {file.path}
            </h3>
            <Badge className="bg-replit-orange text-white text-xs">
              {Math.round(file.similarity)}% similar
            </Badge>
          </div>

          <ScrollArea className="flex-1 bg-editor-dark rounded border border-gray-600">
            <pre className="p-4 text-xs text-gray-300 font-mono whitespace-pre-wrap">
              {file.content}
            </pre>
          </ScrollArea>
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[95vh]' : 'max-w-6xl max-h-[90vh]'} bg-navy-dark border-gray-700`}>
        <DialogHeader className="pb-2">
          <DialogTitle className="text-white flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
            <span className="text-sm sm:text-base">Code Comparison</span>
            <Badge variant="secondary" className="bg-gray-700 text-gray-300 w-fit">
              {duplicate.type}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {isMobile ? <MobileLayout /> : <DesktopLayout />}

        <div className={`${isMobile ? 'mt-3' : 'mt-4'}`}>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{duplicate.description}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}