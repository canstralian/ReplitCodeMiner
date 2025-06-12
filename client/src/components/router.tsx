import { Switch, Route } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Signup from "@/pages/signup";
import NotFound from "@/pages/not-found";

export default function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
      ) : (
        <>
          <Route path="/" element={<Dashboard />} />
        </>
      )}
      <Route path="*" element={<NotFound />} />
    </Switch>
  );
}