
import React, { Suspense, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { ErrorBoundary } from "./components/error-boundary";
import Router from "./components/router";
import { useGlobalKeyboardShortcuts } from "./hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsDialog } from "./components/keyboard-shortcuts-dialog";

/**
 * Root application component with comprehensive error handling and performance optimization
 */
function AppContent(): JSX.Element {
  const [showShortcuts, setShowShortcuts] = useState(false);
  useGlobalKeyboardShortcuts(() => setShowShortcuts(true));

  return (
    <div className="dark min-h-screen bg-editor-dark text-white">
      <Toaster />
      <KeyboardShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      }>
        <Router />
      </Suspense>
    </div>
  );
}

export default function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
