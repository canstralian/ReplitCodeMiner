import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "../components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Slider } from "../components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { AlertCircle, Save, User, Bell, Settings as SettingsIcon, Shield } from "lucide-react";
import { apiRequest } from "../lib/queryClient";

export default function Settings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSaved, setIsSaved] = useState(false);

  // Fetch user settings
  const { data: userSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['/api/settings'],
    enabled: !!user,
  });

  // Settings state
  const [settings, setSettings] = useState({
    profile: {
      email: '',
      firstName: '',
      lastName: '',
    },
    notifications: {
      emailNotifications: true,
      taskadeIntegration: true,
      analysisComplete: true,
      duplicatesFound: true,
    },
    analysis: {
      autoAnalyze: false,
      duplicateThreshold: [0.8],
      excludePatterns: ['test/', 'node_modules/'],
      includeLanguages: ['javascript', 'python', 'typescript'],
    },
    privacy: {
      profileVisibility: 'private',
      shareAnalytics: false,
      dataRetention: [30],
    }
  });

  // Update settings state when userSettings loads
  useEffect(() => {
    if (userSettings) {
      setSettings({
        profile: {
          email: (userSettings as any)?.profile?.email || '',
          firstName: (userSettings as any)?.profile?.firstName || '',
          lastName: (userSettings as any)?.profile?.lastName || '',
        },
        notifications: {
          emailNotifications: (userSettings as any)?.notifications?.emailNotifications ?? true,
          taskadeIntegration: (userSettings as any)?.notifications?.taskadeIntegration ?? true,
          analysisComplete: (userSettings as any)?.notifications?.analysisComplete ?? true,
          duplicatesFound: (userSettings as any)?.notifications?.duplicatesFound ?? true,
        },
        analysis: {
          autoAnalyze: (userSettings as any)?.analysis?.autoAnalyze ?? false,
          duplicateThreshold: [(userSettings as any)?.analysis?.duplicateThreshold ?? 0.8],
          excludePatterns: (userSettings as any)?.analysis?.excludePatterns ?? ['test/', 'node_modules/'],
          includeLanguages: (userSettings as any)?.analysis?.includeLanguages ?? ['javascript', 'python', 'typescript'],
        },
        privacy: {
          profileVisibility: (userSettings as any)?.privacy?.profileVisibility ?? 'private',
          shareAnalytics: (userSettings as any)?.privacy?.shareAnalytics ?? false,
          dataRetention: [(userSettings as any)?.privacy?.dataRetention ?? 30],
        }
      });
    }
  }, [userSettings]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: typeof settings) => {
      const response = await apiRequest('POST', '/api/settings', newSettings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    },
    onError: (error) => {
      console.error('Failed to save settings:', error);
    }
  });

  const handleSave = async () => {
    saveSettingsMutation.mutate(settings);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-editor-dark flex items-center justify-center">
        <div className="text-white">Please log in to access settings.</div>
      </div>
    );
  }

  if (isLoadingSettings) {
    return (
      <div className="min-h-screen bg-editor-dark flex items-center justify-center">
        <div className="text-white">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-editor-dark">
      <Header />

      <div className="max-w-5xl mx-auto p-6 pt-24">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-400">Manage your account preferences and analysis settings.</p>
          </div>

          <Tabs defaultValue="profile" className="w-full space-y-4">
            <TabsList>
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="analysis">
                <SettingsIcon className="h-4 w-4 mr-2" />
                Analysis
              </TabsTrigger>
              <TabsTrigger value="privacy">
                <Shield className="h-4 w-4 mr-2" />
                Privacy
              </TabsTrigger>
            </TabsList>
            <Separator />

            <TabsContent value="profile" className="space-y-4">
              <Card className="bg-navy-dark border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Profile Information</CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your basic profile information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      value={settings.profile.email}
                      disabled
                      className="bg-editor-dark border-gray-600 text-white"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="firstName" className="text-white">First Name</Label>
                    <Input
                      id="firstName"
                      value={settings.profile.firstName}
                      onChange={(e) => {
                        const value = e.target.value.trim();
                        if (value.length <= 50) {
                          setSettings(prev => ({
                            ...prev,
                            profile: { ...prev.profile, firstName: value }
                          }));
                        }
                      }}
                      className="bg-editor-dark border-gray-600 text-white"
                      maxLength={50}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName" className="text-white">Last Name</Label>
                    <Input
                      id="lastName"
                      value={settings.profile.lastName}
                      onChange={(e) => {
                        const value = e.target.value.trim();
                        if (value.length <= 50) {
                          setSettings(prev => ({
                            ...prev,
                            profile: { ...prev.profile, lastName: value }
                          }));
                        }
                      }}
                      className="bg-editor-dark border-gray-600 text-white"
                      maxLength={50}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card className="bg-navy-dark border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Notification Preferences</CardTitle>
                  <CardDescription className="text-gray-400">
                    Customize your notification settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Email Notifications</Label>
                      <p className="text-sm text-gray-400">Receive important updates via email</p>
                    </div>
                    <Switch
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, emailNotifications: checked }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Taskade Integration</Label>
                      <p className="text-sm text-gray-400">Get notified in Taskade</p>
                    </div>
                    <Switch
                      checked={settings.notifications.taskadeIntegration}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, taskadeIntegration: checked }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Analysis Complete</Label>
                      <p className="text-sm text-gray-400">Get notified when analysis completes</p>
                    </div>
                    <Switch
                      checked={settings.notifications.analysisComplete}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, analysisComplete: checked }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Duplicates Found</Label>
                      <p className="text-sm text-gray-400">Get notified when duplicates are found</p>
                    </div>
                    <Switch
                      checked={settings.notifications.duplicatesFound}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, duplicatesFound: checked }
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <Card className="bg-navy-dark border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Analysis Preferences</CardTitle>
                  <CardDescription className="text-gray-400">
                    Customize code analysis settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Auto Analyze</Label>
                      <p className="text-sm text-gray-400">Automatically analyze new projects</p>
                    </div>
                    <Switch
                      checked={settings.analysis.autoAnalyze}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        analysis: { ...prev.analysis, autoAnalyze: checked }
                      }))}
                    />
                  </div>
                  <div>
                    <Label className="text-white">Duplicate Threshold</Label>
                    <p className="text-sm text-gray-400">Adjust the similarity threshold for duplicate detection</p>
                    <Slider
                      defaultValue={settings.analysis.duplicateThreshold}
                      max={1}
                      step={0.05}
                      onValueChange={(value) => setSettings(prev => ({
                        ...prev,
                        analysis: { ...prev.analysis, duplicateThreshold: value }
                      }))}
                      className="bg-editor-dark border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Exclude Patterns</Label>
                    <p className="text-sm text-gray-400">Define patterns to exclude from analysis (e.g., *.test.js)</p>
                    <Input
                      placeholder="Add pattern"
                      className="bg-editor-dark border-gray-600 text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setSettings(prev => ({
                            ...prev,
                            analysis: { ...prev.analysis, excludePatterns: [...prev.analysis.excludePatterns, (e.target as HTMLInputElement).value] }
                          }));
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {settings.analysis.excludePatterns.map((pattern, index) => (
                        <Badge key={index} variant="secondary">
                          {pattern}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Include Languages</Label>
                    <p className="text-sm text-gray-400">Specify languages to include in analysis</p>
                    <Input
                      placeholder="Add language"
                      className="bg-editor-dark border-gray-600 text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setSettings(prev => ({
                            ...prev,
                            analysis: { ...prev.analysis, includeLanguages: [...prev.analysis.includeLanguages, (e.target as HTMLInputElement).value] }
                          }));
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {settings.analysis.includeLanguages.map((language, index) => (
                        <Badge key={index} variant="secondary">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-4">
              <Card className="bg-navy-dark border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Privacy Settings</CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your privacy preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Share Analytics</Label>
                      <p className="text-sm text-gray-400">Share anonymous usage data to improve the service</p>
                    </div>
                    <Switch
                      checked={settings.privacy.shareAnalytics}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, shareAnalytics: checked }
                      }))}
                    />
                  </div>
                  <div>
                    <Label className="text-white">Profile Visibility</Label>
                    <p className="text-sm text-gray-400">Control who can see your profile</p>
                    <Input
                      placeholder="Profile Visibility"
                      className="bg-editor-dark border-gray-600 text-white"
                      value={settings.privacy.profileVisibility}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, profileVisibility: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label className="text-white">Data Retention</Label>
                    <p className="text-sm text-gray-400">Choose how long to retain your data</p>
                    <Slider
                      defaultValue={settings.privacy.dataRetention}
                      max={365}
                      step={30}
                      onValueChange={(value) => setSettings(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, dataRetention: value }
                      }))}
                      className="bg-editor-dark border-gray-600 text-white"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="flex justify-end">
            {isSaved && (
              <Badge variant="outline" className="mr-2">
                <Save className="h-4 w-4 mr-2" />
                Settings saved!
              </Badge>
            )}
            <Button
              onClick={handleSave}
              disabled={saveSettingsMutation.isPending}
              className="bg-replit-orange hover:bg-orange-600"
            >
              {saveSettingsMutation.isPending ? (
                <>
                  <AlertCircle className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}