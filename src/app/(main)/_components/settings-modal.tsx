'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

type SettingsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Theme = 'light' | 'dark';
type SnippetLanguage = 'JavaScript' | 'TypeScript' | 'Node.js' | 'Python' | 'Go' | 'Java' | 'C#' | 'Ruby';

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [snippetLanguage, setSnippetLanguage] = useState<SnippetLanguage>('JavaScript');
  const [bearerToken, setBearerToken] = useState('');
  const [creativity, setCreativity] = useState([0.5]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }

    const storedSnippetLang = localStorage.getItem('snippetLanguage') as SnippetLanguage | null;
    if (storedSnippetLang) setSnippetLanguage(storedSnippetLang);
    
    const storedBearerToken = localStorage.getItem('bearerToken');
    if (storedBearerToken) setBearerToken(storedBearerToken);
    
    const storedCreativity = localStorage.getItem('aiCreativity');
    if (storedCreativity) setCreativity([parseFloat(storedCreativity)]);

  }, []);

  useEffect(() => {
    if (isMounted) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      document.documentElement.style.colorScheme = theme;
      localStorage.setItem('theme', theme);
    }
  }, [theme, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('snippetLanguage', snippetLanguage);
    }
  }, [snippetLanguage, isMounted]);
  
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('bearerToken', bearerToken);
    }
  }, [bearerToken, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('aiCreativity', creativity[0].toString());
    }
  }, [creativity, isMounted]);


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
        </div>
      </DialogContent>
    </Dialog>
  );
}
