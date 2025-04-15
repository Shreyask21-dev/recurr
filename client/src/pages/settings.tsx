import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bell, UserCog, Mail, Lock, Shield } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveSettings = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
      });
    }, 1000);
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and application preferences</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-primary" />
                  <CardTitle>Profile Information</CardTitle>
                </div>
                <CardDescription>
                  Update your account details and personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue="Alex Johnson" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="admin@renewaltrack.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" defaultValue="+91 98765 43210" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" defaultValue="Administrator" disabled />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" defaultValue="RenewalTrack Systems" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" defaultValue="123 Business Avenue, Tech Park, Bangalore, Karnataka, 560001" />
                </div>
              </CardContent>
              <CardFooter className="justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button 
                  onClick={handleSaveSettings}
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <CardTitle>Email Settings</CardTitle>
                </div>
                <CardDescription>
                  Configure your outgoing email settings for notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="smtp_server">SMTP Server</Label>
                    <Input id="smtp_server" defaultValue="smtp.example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp_port">SMTP Port</Label>
                    <Input id="smtp_port" defaultValue="587" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp_user">SMTP Username</Label>
                    <Input id="smtp_user" defaultValue="notifications@renewaltrack.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp_password">SMTP Password</Label>
                    <Input id="smtp_password" type="password" defaultValue="**********" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from_email">From Email</Label>
                  <Input id="from_email" type="email" defaultValue="notifications@renewaltrack.com" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="use_ssl" defaultChecked />
                  <Label htmlFor="use_ssl">Use SSL/TLS</Label>
                </div>
              </CardContent>
              <CardFooter className="justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSaveSettings} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle>Notification Preferences</CardTitle>
                </div>
                <CardDescription>
                  Configure when and how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Renewal Reminders</h3>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notify_30_days">30 days before expiry</Label>
                        <p className="text-xs text-gray-500">Send a reminder 30 days before renewal is due</p>
                      </div>
                      <Switch id="notify_30_days" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notify_15_days">15 days before expiry</Label>
                        <p className="text-xs text-gray-500">Send a reminder 15 days before renewal is due</p>
                      </div>
                      <Switch id="notify_15_days" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notify_7_days">7 days before expiry</Label>
                        <p className="text-xs text-gray-500">Send a reminder 7 days before renewal is due</p>
                      </div>
                      <Switch id="notify_7_days" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notify_overdue">Overdue renewals</Label>
                        <p className="text-xs text-gray-500">Send reminders for overdue renewals</p>
                      </div>
                      <Switch id="notify_overdue" defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Notification Methods</h3>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notify_email">Email Notifications</Label>
                        <p className="text-xs text-gray-500">Receive notifications via email</p>
                      </div>
                      <Switch id="notify_email" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notify_dashboard">Dashboard Notifications</Label>
                        <p className="text-xs text-gray-500">Show notifications in the dashboard</p>
                      </div>
                      <Switch id="notify_dashboard" defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Other Notifications</h3>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notify_payment">Payment Received</Label>
                        <p className="text-xs text-gray-500">Notify when a payment is recorded</p>
                      </div>
                      <Switch id="notify_payment" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notify_client">New Client Added</Label>
                        <p className="text-xs text-gray-500">Notify when a new client is added</p>
                      </div>
                      <Switch id="notify_client" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button onClick={handleSaveSettings} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <CardTitle>Password Settings</CardTitle>
                </div>
                <CardDescription>
                  Update your password and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password">Current Password</Label>
                  <Input id="current_password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input id="new_password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <Input id="confirm_password" type="password" />
                </div>
              </CardContent>
              <CardFooter className="justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSaveSettings} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Change Password
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Access Control</CardTitle>
                </div>
                <CardDescription>
                  Manage security and access settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two_factor">Two-Factor Authentication</Label>
                    <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <Switch id="two_factor" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="session_timeout">Session Timeout</Label>
                    <p className="text-xs text-gray-500">Automatically log out after inactivity</p>
                  </div>
                  <Switch id="session_timeout" defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeout_duration">Timeout Duration (minutes)</Label>
                  <Input id="timeout_duration" type="number" defaultValue="30" min="5" max="120" />
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button onClick={handleSaveSettings} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </>
  );
}
