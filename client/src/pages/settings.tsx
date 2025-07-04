import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { useToast } from "../hooks/use-toast";
import { User, Bell, Shield, Palette, Code, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoAnalysis, setAutoAnalysis] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showPrivateProjects, setShowPrivateProjects] = useState(true);

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile settings have been saved successfully.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Settings</h1>
              <p className="text-gray-400 mt-1">Manage your account and application preferences</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="bg-editor-dark border border-gray-700">
            <TabsTrigger value="profile" className="data-[state=active]:bg-navy-dark">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-navy-dark">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-navy-dark">
              <Shield className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-navy-dark">
              <Palette className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-navy-dark">
              <Code className="h-4 w-4 mr-2" />
              Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card className="bg-navy-dark border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Profile Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Update your account information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                    <Input
                      id="firstName"
                      defaultValue={user?.firstName || ""}
                      className="bg-editor-dark border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                    <Input
                      id="lastName"
                      defaultValue={user?.lastName || ""}
                      className="bg-editor-dark border-gray-700 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user?.email || ""}
                    className="bg-editor-dark border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-300">Username</Label>
                  <Input
                    id="username"
                    defaultValue={user?.username || user?.email?.split('@')[0] || ""}
                    disabled
                    className="bg-editor-dark border-gray-700 text-gray-500"
                  />
                </div>
                <Button onClick={handleSaveProfile} className="bg-replit-orange hover:bg-orange-600">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card className="bg-navy-dark border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Notification Preferences</CardTitle>
                <CardDescription className="text-gray-400">
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-gray-300">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive email alerts for duplicate detections</p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                    className="data-[state=checked]:bg-replit-orange"
                  />
                </div>
                <Separator className="bg-gray-700" />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-gray-300">Weekly Summary</Label>
                    <p className="text-sm text-gray-500">Get a weekly summary of your code analysis</p>
                  </div>
                  <Switch className="data-[state=checked]:bg-replit-orange" />
                </div>
                <Separator className="bg-gray-700" />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-gray-300">Critical Alerts Only</Label>
                    <p className="text-sm text-gray-500">Only notify for high-severity duplicates</p>
                  </div>
                  <Switch className="data-[state=checked]:bg-replit-orange" />
                </div>
                <Button onClick={handleSaveNotifications} className="bg-replit-orange hover:bg-orange-600">
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <Card className="bg-navy-dark border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Privacy Settings</CardTitle>
                <CardDescription className="text-gray-400">
                  Control your data and project visibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-gray-300">Show Private Projects</Label>
                    <p className="text-sm text-gray-500">Include private repositories in analysis</p>
                  </div>
                  <Switch
                    checked={showPrivateProjects}
                    onCheckedChange={setShowPrivateProjects}
                    className="data-[state=checked]:bg-replit-orange"
                  />
                </div>
                <Separator className="bg-gray-700" />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-gray-300">Anonymous Usage Analytics</Label>
                    <p className="text-sm text-gray-500">Help improve the app with anonymous data</p>
                  </div>
                  <Switch className="data-[state=checked]:bg-replit-orange" />
                </div>
                <Separator className="bg-gray-700" />
                <div className="space-y-2">
                  <Label className="text-error-red">Danger Zone</Label>
                  <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                  <Button variant="outline" className="border-error-red text-error-red hover:bg-error-red hover:text-white">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card className="bg-navy-dark border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Appearance Settings</CardTitle>
                <CardDescription className="text-gray-400">
                  Customize the look and feel of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-gray-300">Dark Mode</Label>
                    <p className="text-sm text-gray-500">Use dark theme across the application</p>
                  </div>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                    className="data-[state=checked]:bg-replit-orange"
                  />
                </div>
                <Separator className="bg-gray-700" />
                <div className="space-y-2">
                  <Label className="text-gray-300">Code Theme</Label>
                  <select className="w-full p-2 bg-editor-dark border border-gray-700 rounded-md text-white">
                    <option>Replit Dark</option>
                    <option>Dracula</option>
                    <option>Monokai</option>
                    <option>GitHub Dark</option>
                  </select>
                </div>
                <Separator className="bg-gray-700" />
                <div className="space-y-2">
                  <Label className="text-gray-300">Font Size</Label>
                  <select className="w-full p-2 bg-editor-dark border border-gray-700 rounded-md text-white">
                    <option>Small</option>
                    <option>Medium</option>
                    <option>Large</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Card className="bg-navy-dark border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Analysis Settings</CardTitle>
                <CardDescription className="text-gray-400">
                  Configure code analysis behavior and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-gray-300">Auto-Analysis</Label>
                    <p className="text-sm text-gray-500">Automatically analyze new projects</p>
                  </div>
                  <Switch
                    checked={autoAnalysis}
                    onCheckedChange={setAutoAnalysis}
                    className="data-[state=checked]:bg-replit-orange"
                  />
                </div>
                <Separator className="bg-gray-700" />
                <div className="space-y-2">
                  <Label className="text-gray-300">Similarity Threshold</Label>
                  <p className="text-sm text-gray-500">Minimum similarity percentage to flag as duplicate</p>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="range"
                      min="50"
                      max="100"
                      defaultValue="75"
                      className="flex-1"
                    />
                    <span className="text-white w-12 text-right">75%</span>
                  </div>
                </div>
                <Separator className="bg-gray-700" />
                <div className="space-y-2">
                  <Label className="text-gray-300">Ignored Patterns</Label>
                  <p className="text-sm text-gray-500">Patterns to exclude from analysis (one per line)</p>
                  <textarea
                    className="w-full p-2 bg-editor-dark border border-gray-700 rounded-md text-white h-24"
                    placeholder="node_modules/&#10;*.test.js&#10;*.spec.ts"
                  />
                </div>
                <Separator className="bg-gray-700" />
                <div className="space-y-2">
                  <Label className="text-gray-300">File Size Limit</Label>
                  <p className="text-sm text-gray-500">Maximum file size to analyze (in KB)</p>
                  <Input
                    type="number"
                    defaultValue="500"
                    className="bg-editor-dark border-gray-700 text-white"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}