/**
 * Profile Editor Component
 * Inline editor for API profile settings with tabs for Environment/Raw JSON/Info
 */

import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MaskedInput } from '@/components/ui/masked-input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import {
  Save,
  Loader2,
  Code2,
  Settings,
  Info,
  Terminal,
  Trash2,
  RefreshCw,
  Plus,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

// Lazy load CodeEditor to reduce initial bundle size
const CodeEditor = lazy(() =>
  import('@/components/code-editor').then((m) => ({ default: m.CodeEditor }))
);

interface Settings {
  env?: Record<string, string>;
}

interface SettingsResponse {
  profile: string;
  settings: Settings;
  mtime: number;
  path: string;
}

interface ProfileEditorProps {
  profileName: string;
  onDelete?: () => void;
}

export function ProfileEditor({ profileName, onDelete }: ProfileEditorProps) {
  const [localEdits, setLocalEdits] = useState<Record<string, string>>({});
  const [conflictDialog, setConflictDialog] = useState(false);
  const [rawJsonEdits, setRawJsonEdits] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('env');
  const [newEnvKey, setNewEnvKey] = useState('');
  const queryClient = useQueryClient();

  // Fetch settings for selected profile
  const { data, isLoading, refetch } = useQuery<SettingsResponse>({
    queryKey: ['settings', profileName],
    queryFn: () => fetch(`/api/settings/${profileName}/raw`).then((r) => r.json()),
  });

  // Derive raw JSON content
  const settings = data?.settings;
  const rawJsonContent = useMemo(() => {
    if (rawJsonEdits !== null) {
      return rawJsonEdits;
    }
    if (settings) {
      return JSON.stringify(settings, null, 2);
    }
    return '';
  }, [rawJsonEdits, settings]);

  const handleRawJsonChange = useCallback((value: string) => {
    setRawJsonEdits(value);
  }, []);

  // Derive current settings by merging original data with local edits
  const currentSettings = useMemo((): Settings | undefined => {
    if (!settings) return undefined;
    return {
      ...settings,
      env: {
        ...settings.env,
        ...localEdits,
      },
    };
  }, [settings, localEdits]);

  // Check if raw JSON is valid
  const isRawJsonValid = useMemo(() => {
    try {
      JSON.parse(rawJsonContent);
      return true;
    } catch {
      return false;
    }
  }, [rawJsonContent]);

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    if (activeTab === 'raw') {
      return rawJsonEdits !== null;
    }
    return Object.keys(localEdits).length > 0;
  }, [activeTab, rawJsonEdits, localEdits]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      let settingsToSave: Settings;

      if (activeTab === 'raw') {
        try {
          settingsToSave = JSON.parse(rawJsonContent);
        } catch {
          throw new Error('Invalid JSON');
        }
      } else {
        settingsToSave = {
          ...data?.settings,
          env: {
            ...data?.settings?.env,
            ...localEdits,
          },
        };
      }

      const res = await fetch(`/api/settings/${profileName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: settingsToSave,
          expectedMtime: data?.mtime,
        }),
      });

      if (res.status === 409) {
        throw new Error('CONFLICT');
      }

      if (!res.ok) {
        throw new Error('Failed to save');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', profileName] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      setLocalEdits({});
      setRawJsonEdits(null);
      toast.success('Settings saved');
    },
    onError: (error: Error) => {
      if (error.message === 'CONFLICT') {
        setConflictDialog(true);
      } else {
        toast.error(error.message);
      }
    },
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  const handleConflictResolve = async (overwrite: boolean) => {
    setConflictDialog(false);
    if (overwrite) {
      await refetch();
      saveMutation.mutate();
    } else {
      setLocalEdits({});
      setRawJsonEdits(null);
    }
  };

  const updateEnvValue = (key: string, value: string) => {
    setLocalEdits((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const addNewEnvVar = () => {
    if (!newEnvKey.trim()) return;
    setLocalEdits((prev) => ({
      ...prev,
      [newEnvKey.trim()]: '',
    }));
    setNewEnvKey('');
  };

  const isSensitiveKey = (key: string): boolean => {
    const sensitivePatterns = [
      /^ANTHROPIC_AUTH_TOKEN$/,
      /_API_KEY$/,
      /_AUTH_TOKEN$/,
      /^API_KEY$/,
      /^AUTH_TOKEN$/,
      /_SECRET$/,
      /^SECRET$/,
    ];
    return sensitivePatterns.some((pattern) => pattern.test(key));
  };

  // Reset state when profile changes
  const profileKey = profileName;

  return (
    <div key={profileKey} className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-background flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{profileName}</h2>
            {data && (
              <Badge variant="outline" className="text-xs">
                {data.path.replace(/^.*\//, '')}
              </Badge>
            )}
          </div>
          {data && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Last modified: {new Date(data.mtime).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={
              saveMutation.isPending || !hasChanges || (activeTab === 'raw' && !isRawJsonValid)
            }
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Loading settings...</span>
        </div>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-6 pt-4">
            <TabsList className="w-full justify-start bg-muted/50">
              <TabsTrigger value="env" className="gap-1.5">
                <Settings className="w-4 h-4" />
                Environment
              </TabsTrigger>
              <TabsTrigger value="raw" className="gap-1.5">
                <Code2 className="w-4 h-4" />
                Raw JSON
              </TabsTrigger>
              <TabsTrigger value="usage" className="gap-1.5">
                <Terminal className="w-4 h-4" />
                Usage
              </TabsTrigger>
              <TabsTrigger value="info" className="gap-1.5">
                <Info className="w-4 h-4" />
                Info
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Environment Tab */}
          <TabsContent value="env" className="flex-1 overflow-hidden px-6 pb-6 mt-0">
            <ScrollArea className="h-full">
              <div className="space-y-6 py-4">
                {currentSettings?.env && Object.keys(currentSettings.env).length > 0 ? (
                  <>
                    {Object.entries(currentSettings.env).map(([key, value]) => (
                      <div key={key} className="space-y-1.5">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          {key}
                          {isSensitiveKey(key) && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              sensitive
                            </Badge>
                          )}
                        </Label>
                        {isSensitiveKey(key) ? (
                          <MaskedInput
                            value={value}
                            onChange={(e) => updateEnvValue(key, e.target.value)}
                            className="font-mono text-sm"
                          />
                        ) : (
                          <Input
                            value={value}
                            onChange={(e) => updateEnvValue(key, e.target.value)}
                            className="font-mono text-sm"
                          />
                        )}
                      </div>
                    ))}

                    {/* Add new env var */}
                    <div className="pt-4 border-t">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Add Environment Variable
                      </Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="VARIABLE_NAME"
                          value={newEnvKey}
                          onChange={(e) => setNewEnvKey(e.target.value.toUpperCase())}
                          className="font-mono text-sm"
                          onKeyDown={(e) => e.key === 'Enter' && addNewEnvVar()}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addNewEnvVar}
                          disabled={!newEnvKey.trim()}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                    <p>No environment variables configured.</p>
                    <p className="text-xs mt-1">
                      Add variables using the Raw JSON tab or the form below.
                    </p>
                    <div className="flex gap-2 mt-4 justify-center">
                      <Input
                        placeholder="VARIABLE_NAME"
                        value={newEnvKey}
                        onChange={(e) => setNewEnvKey(e.target.value.toUpperCase())}
                        className="font-mono text-sm max-w-xs"
                        onKeyDown={(e) => e.key === 'Enter' && addNewEnvVar()}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addNewEnvVar}
                        disabled={!newEnvKey.trim()}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Raw JSON Tab */}
          <TabsContent value="raw" className="flex-1 overflow-hidden px-6 pb-6 mt-0">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading editor...</span>
                </div>
              }
            >
              <div className="h-full flex flex-col">
                {!isRawJsonValid && rawJsonEdits !== null && (
                  <div className="mb-2 px-3 py-2 bg-destructive/10 text-destructive text-sm rounded-md flex items-center gap-2">
                    <X className="w-4 h-4" />
                    Invalid JSON syntax
                  </div>
                )}
                <div className="flex-1 border rounded-md overflow-hidden">
                  <CodeEditor
                    value={rawJsonContent}
                    onChange={handleRawJsonChange}
                    language="json"
                    minHeight="100%"
                  />
                </div>
              </div>
            </Suspense>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="flex-1 overflow-hidden px-6 pb-6 mt-0">
            <ScrollArea className="h-full">
              <div className="py-4 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">CLI Usage</CardTitle>
                    <CardDescription>Use this profile from the command line</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Run Claude with this profile
                      </Label>
                      <code className="block mt-1 p-3 bg-muted rounded-md text-sm font-mono">
                        ccs {profileName} "your prompt here"
                      </code>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Start interactive session
                      </Label>
                      <code className="block mt-1 p-3 bg-muted rounded-md text-sm font-mono">
                        ccs {profileName}
                      </code>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Set as default</Label>
                      <code className="block mt-1 p-3 bg-muted rounded-md text-sm font-mono">
                        ccs default {profileName}
                      </code>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Environment Variables</CardTitle>
                    <CardDescription>Variables set when using this profile</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {currentSettings?.env && Object.keys(currentSettings.env).length > 0 ? (
                        Object.entries(currentSettings.env).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" className="font-mono text-xs">
                              {key}
                            </Badge>
                            <span className="text-muted-foreground font-mono truncate">
                              {isSensitiveKey(key) ? '••••••••' : value}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No environment variables set
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Info Tab */}
          <TabsContent value="info" className="flex-1 overflow-hidden px-6 pb-6 mt-0">
            <ScrollArea className="h-full">
              <div className="py-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Profile Information</CardTitle>
                    <CardDescription>Details about this configuration file</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {data && (
                      <>
                        <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                          <span className="font-medium text-muted-foreground">Profile Name</span>
                          <span className="font-mono">{data.profile}</span>
                        </div>
                        <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                          <span className="font-medium text-muted-foreground">File Path</span>
                          <code className="bg-muted p-1 rounded text-xs break-all">
                            {data.path}
                          </code>
                        </div>
                        <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                          <span className="font-medium text-muted-foreground">Last Modified</span>
                          <span>{new Date(data.mtime).toLocaleString()}</span>
                        </div>
                        <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                          <span className="font-medium text-muted-foreground">Variables</span>
                          <span>{Object.keys(currentSettings?.env || {}).length} configured</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}

      <ConfirmDialog
        open={conflictDialog}
        title="File Modified Externally"
        description="This settings file was modified by another process. Overwrite with your changes or discard?"
        confirmText="Overwrite"
        variant="destructive"
        onConfirm={() => handleConflictResolve(true)}
        onCancel={() => handleConflictResolve(false)}
      />
    </div>
  );
}
