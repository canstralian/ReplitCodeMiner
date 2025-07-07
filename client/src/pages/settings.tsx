
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import Header from "../components/header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Save, User, Bell, Shield, Trash2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface UserSettings {
  notifications: {
    analysisComplete: boolean;
    duplicatesFound: boolean;
    taskadeIntegration: boolean;
  };
  analysis: {
    similarityThreshold: number;
    excludePatterns: string[];
    autoAnalyze: boolean;
  };
  privacy: {
    shareAnalytics: boolean;
    publicProfile: boolean;
  };
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      analysisComplete: true,
      duplicatesFound: true,
      taskadeIntegration: false,
    },
    analysis: {
      similarityThreshold: 0.8,
      excludePatterns: [],
      autoAnalyze: false,
    },
    privacy: {
      shareAnalytics: true,
      publicProfile: false,
    },
  });

  const [newExcludePattern, setNewExcludePattern] = useState("");

  // Fetch user settings
  const { data: userSettings } = useQuery({
    queryKey: ["/api/settings"],
    enabled: !!user,
  });

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: UserSettings) => {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) throw new Error("Failed to save settings");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(settings);
  };

  const addExcludePattern = () => {
    if (newExcludePattern.trim()) {
      setSettings(prev => ({
        ...prev,
        analysis: {
          ...prev.analysis,
          excludePatterns: [...prev.analysis.excludePatterns, newExcludePattern.trim()]
        }
      }));
      setNewExcludePattern("");
    }
  };

  const removeExcludePattern = (index: number) => {
    setSettings(prev => ({
      ...prev,
      analysis: {
        ...prev.analysis,
        excludePatterns: prev.analysis.excludePatterns.filter((_, i) => i !== index)
      }
    }));
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-editor-dark">
      <Header />
      
      <div className="max-w-4xl mx-auto p-6 pt-24">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-400">Manage your account preferences and analysis settings.</p>
          </div>

          {/* Profile Settings */}
          <Card className="bg-navy-dark border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.profileImageUrl} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback className="bg-replit-orange text-white text-lg">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium text-white">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-gray-400">{user.email}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Profile information is managed through your Replit account.
              </p>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-navy-dark border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Analysis Complete</Label>
                  <p className="text-sm text-gray-400">Get notified when project analysis finishes</p>
                </div>
                <Switch
                  checked={settings.notifications.analysisComplete}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, analysisComplete: checked }
                    }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Duplicates Found</Label>
                  <p className="text-sm text-gray-400">Get notified when duplicates are detected</p>
                </div>
                <Switch
                  checked={settings.notifications.duplicatesFound}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, duplicatesFound: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Taskade Integration</Label>
                  <p className="text-sm text-gray-400">Send notifications to Taskade</p>
                </div>
                <Switch
                  checked={settings.notifications.taskadeIntegration}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, taskadeIntegration: checked }
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Analysis Settings */}
          <Card className="bg-navy-dark border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Analysis Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Similarity Threshold</Label>
                <p className="text-sm text-gray-400 mb-2">
                  Minimum similarity score to consider code as duplicate (0.1 - 1.0)
                </p>
                <Input
                  type="number"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={settings.analysis.similarityThreshold}
                  onChange={(e) =>
                    setSettings(prev => ({
                      ...prev,
                      analysis: { ...prev.analysis, similarityThreshold: parseFloat(e.target.value) }
                    }))
                  }
                  className="bg-editor-dark border-gray-600 text-white"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Auto-analyze New Projects</Label>
                  <p className="text-sm text-gray-400">Automatically analyze projects when they're added</p>
                </div>
                <Switch
                  checked={settings.analysis.autoAnalyze}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      analysis: { ...prev.analysis, autoAnalyze: checked }
                    }))
                  }
                />
              </div>

              <div>
                <Label className="text-white">Exclude Patterns</Label>
                <p className="text-sm text-gray-400 mb-2">
                  File patterns to exclude from analysis (e.g., *.test.js, node_modules/*)
                </p>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={newExcludePattern}
                    onChange={(e) => setNewExcludePattern(e.target.value)}
                    placeholder="*.test.js"
                    className="bg-editor-dark border-gray-600 text-white"
                    onKeyPress={(e) => e.key === 'Enter' && addExcludePattern()}
                  />
                  <Button onClick={addExcludePattern} className="bg-replit-orange hover:bg-orange-600">
                    Add
                  </Button>
                </div>
                <div className="space-y-1">
                  {settings.analysis.excludePatterns.map((pattern, index) => (
                    <div key={index} className="flex items-center justify-between bg-editor-dark rounded px-3 py-2">
                      <code className="text-sm text-gray-300">{pattern}</code>
                      <Button
                        onClick={() => removeExcludePattern(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-navy-dark border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Privacy & Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Share Analytics</Label>
                  <p className="text-sm text-gray-400">Help improve the service by sharing anonymous usage data</p>
                </div>
                <Switch
                  checked={settings.privacy.shareAnalytics}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, shareAnalytics: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Public Profile</Label>
                  <p className="text-sm text-gray-400">Allow others to see your public analysis statistics</p>
                </div>
                <Switch
                  checked={settings.privacy.publicProfile}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, publicProfile: checked }
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveSettings}
              disabled={saveSettingsMutation.isPending}
              className="bg-replit-orange hover:bg-orange-600"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveSettingsMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
