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

type SettingsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Theme = 'light' | 'dark';
type Language = 'en' | 'es' | 'fr';
type SnippetLanguage = 'Node.js' | 'Python' | 'Go';

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [uiLanguage, setUiLanguage] = useState<Language>('en');
  const [snippetLanguage, setSnippetLanguage] = useState<SnippetLanguage>('Node.js');
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

    const storedUiLang = localStorage.getItem('uiLanguage') as Language | null;
    if (storedUiLang) setUiLanguage(storedUiLang);

    const storedSnippetLang = localStorage.getItem('snippetLanguage') as SnippetLanguage | null;
    if (storedSnippetLang) setSnippetLanguage(storedSnippetLang);
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
      localStorage.setItem('uiLanguage', uiLanguage);
    }
  }, [uiLanguage, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('snippetLanguage', snippetLanguage);
    }
  }, [snippetLanguage, isMounted]);

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
        <div className="py-4 space-y-8">
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

          {/* AI Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">AI & Code Generation</h3>
            <div className="space-y-6">
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
                    <SelectItem value="Node.js">Node.js</SelectItem>
                    <SelectItem value="Python">Python</SelectItem>
                    <SelectItem value="Go">Go</SelectItem>
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
