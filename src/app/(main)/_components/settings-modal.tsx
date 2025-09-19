'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

type SettingsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Theme = 'light' | 'dark';
type SnippetLanguage = 'JavaScript' | 'TypeScript' | 'Node.js' | 'Python' | 'Go' | 'Java' | 'C#' | 'Ruby';

const DEFAULTS = {
  theme: 'dark' as Theme,
  snippetLanguage: 'JavaScript' as SnippetLanguage,
  bearerToken: '',
  aiCreativity: 0.5,
  requestTimeout: 30000,
  sslVerification: true,
};

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { toast } = useToast();

  // Local state for the form
  const [theme, setTheme] = useState<Theme>(DEFAULTS.theme);
  const [snippetLanguage, setSnippetLanguage] = useState<SnippetLanguage>(DEFAULTS.snippetLanguage);
  const [bearerToken, setBearerToken] = useState(DEFAULTS.bearerToken);
  const [creativity, setCreativity] = useState([DEFAULTS.aiCreativity]);
  const [requestTimeout, setRequestTimeout] = useState(DEFAULTS.requestTimeout);
  const [sslVerification, setSslVerification] = useState(DEFAULTS.sslVerification);

  const [isMounted, setIsMounted] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    setTheme((localStorage.getItem('theme') as Theme) || DEFAULTS.theme);
    setSnippetLanguage((localStorage.getItem('snippetLanguage') as SnippetLanguage) || DEFAULTS.snippetLanguage);
    setBearerToken(localStorage.getItem('bearerToken') || DEFAULTS.bearerToken);
    setCreativity([parseFloat(localStorage.getItem('aiCreativity') || DEFAULTS.aiCreativity.toString())]);
    setRequestTimeout(parseInt(localStorage.getItem('requestTimeout') || DEFAULTS.requestTimeout.toString(), 10));
    setSslVerification(localStorage.getItem('sslVerification') !== 'false');
  }, []);

  const handleSave = () => {
    try {
      // Apply theme immediately
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      document.documentElement.style.colorScheme = theme;

      // Save all settings to localStorage
      localStorage.setItem('theme', theme);
      localStorage.setItem('snippetLanguage', snippetLanguage);
      localStorage.setItem('bearerToken', bearerToken);
      localStorage.setItem('aiCreativity', creativity[0].toString());
      localStorage.setItem('requestTimeout', requestTimeout.toString());
      localStorage.setItem('sslVerification', sslVerification.toString());
      
      toast({ title: 'Success', description: 'Settings saved successfully.' });
      onOpenChange(false);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings.' });
    }
  };

  const handleReset = () => {
    setTheme(DEFAULTS.theme);
    setSnippetLanguage(DEFAULTS.snippetLanguage);
    setBearerToken(DEFAULTS.bearerToken);
    setCreativity([DEFAULTS.aiCreativity]);
    setRequestTimeout(DEFAULTS.requestTimeout);
    setSslVerification(DEFAULTS.sslVerification);
    
    toast({ title: 'Settings Reset', description: 'Settings have been reset to default. Click Save to apply.' });
  };
  
  const handleClearHistory = () => {
    localStorage.removeItem('requestHistory');
    toast({ title: 'History Cleared', description: 'Your API request history has been cleared.' });
    // This requires a page reload for the component to pick up the change
    window.location.reload();
  };

  if (!isMounted) {
    return null; // Don't render on the server
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize the look, feel, and behavior of the application.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-8 max-h-[70vh] overflow-y-auto pr-4">
          {/* General Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">General</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme-select" className="flex flex-col space-y-1">
                  <span>Theme</span>
                  <span className="text-xs font-normal text-muted-foreground">Select the application theme.</span>
                </Label>
                <Select
                  value={theme}
                  onValueChange={(value: string) => setTheme(value as Theme)}
                >
                  <SelectTrigger id="theme-select" className="w-[180px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Separator />
          
           {/* API & Network Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">API & Network</h3>
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                <Label htmlFor="timeout-input" className="flex flex-col space-y-1">
                  <span>Request Timeout (ms)</span>
                  <span className="text-xs font-normal text-muted-foreground">Max time to wait for a response.</span>
                </Label>
                <Input
                  id="timeout-input"
                  type="number"
                  value={requestTimeout}
                  onChange={(e) => setRequestTimeout(parseInt(e.target.value, 10))}
                  placeholder="e.g., 30000"
                  className="w-[180px]"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="ssl-switch" className="flex flex-col space-y-1">
                  <span>SSL Certificate Verification</span>
                  <span className="text-xs font-normal text-muted-foreground">Verify SSL certificates for requests.</span>
                </Label>
                <Switch
                  id="ssl-switch"
                  checked={sslVerification}
                  onCheckedChange={setSslVerification}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auth-vault-bearer" className="flex flex-col space-y-1">
                  <span>Authentication Vault</span>
                   <span className="text-xs font-normal text-muted-foreground">Securely store API keys and tokens.</span>
                </Label>
                 <Input
                  id="auth-vault-bearer"
                  type="password"
                  value={bearerToken}
                  onChange={(e) => setBearerToken(e.target.value)}
                  placeholder="Bearer Token"
                  className="w-[180px]"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* AI Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">AI & Code Generation</h3>
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                <Label htmlFor="creativity-slider" className="flex flex-col space-y-1">
                  <span>AI Creativity Level</span>
                   <span className="text-xs font-normal text-muted-foreground">Controls the randomness of the AI's responses.</span>
                </Label>
                <div className="w-[180px] flex items-center gap-2">
                  <Slider id="creativity-slider" value={creativity} onValueChange={setCreativity} max={1} step={0.1} />
                  <span className="text-sm font-medium w-8 text-right">{creativity[0].toFixed(1)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="snippet-lang-select" className="flex flex-col space-y-1">
                  <span>Default Snippet Language</span>
                   <span className="text-xs font-normal text-muted-foreground">Set the default language for generated code snippets.</span>
                </Label>
                <Select
                  value={snippetLanguage}
                  onValueChange={(value: string) => setSnippetLanguage(value as SnippetLanguage)}
                >
                  <SelectTrigger id="snippet-lang-select" className="w-[180px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JavaScript">JavaScript</SelectItem>
                    <SelectItem value="TypeScript">TypeScript</SelectItem>
                    <SelectItem value="Node.js">Node.js</SelectItem>
                    <SelectItem value="Python">Python</SelectItem>
                    <SelectItem value="Go">Go</SelectItem>
                    <SelectItem value="Java">Java</SelectItem>
                    <SelectItem value="C#">C#</SelectItem>
                    <SelectItem value="Ruby">Ruby</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Data Management */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Data Management</h3>
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                <Label className="flex flex-col space-y-1">
                  <span>Clear Request History</span>
                   <span className="text-xs font-normal text-muted-foreground">Permanently delete all saved requests.</span>
                </Label>
                <Button variant="destructive" size="sm" onClick={handleClearHistory}>Clear History</Button>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="pt-4">
            <Button variant="ghost" onClick={handleReset}>Reset to Default</Button>
            <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    