/**
 * Profile Create Form Component
 * Inline form for creating new API profiles with model mapping
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCreateProfile } from '@/hooks/use-profiles';
import {
  ArrowLeft,
  Loader2,
  Plus,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_MODEL = 'claude-sonnet-4-5-20250929';

const schema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .regex(/^[a-zA-Z][a-zA-Z0-9._-]*$/, 'Must start with letter, only letters/numbers/.-_'),
  baseUrl: z.string().url('Invalid URL format'),
  apiKey: z.string().min(10, 'API key must be at least 10 characters'),
  model: z.string().optional(),
  opusModel: z.string().optional(),
  sonnetModel: z.string().optional(),
  haikuModel: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ProfileCreateFormProps {
  onSuccess: (name: string) => void;
  onCancel: () => void;
}

// Common URL mistakes to warn about
const PROBLEMATIC_PATHS = ['/chat/completions', '/v1/messages', '/messages', '/completions'];

export function ProfileCreateForm({ onSuccess, onCancel }: ProfileCreateFormProps) {
  const createMutation = useCreateProfile();
  const [showModelMapping, setShowModelMapping] = useState(false);
  const [urlWarning, setUrlWarning] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      model: '',
      opusModel: '',
      sonnetModel: '',
      haikuModel: '',
    },
  });

  const modelValue = watch('model');
  const baseUrlValue = watch('baseUrl');

  // Auto-expand model mapping when custom model is entered
  useEffect(() => {
    if (modelValue && modelValue !== DEFAULT_MODEL && modelValue.trim() !== '') {
      setShowModelMapping(true);
    }
  }, [modelValue]);

  // Check for common URL mistakes
  useEffect(() => {
    if (baseUrlValue) {
      const lowerUrl = baseUrlValue.toLowerCase();
      for (const path of PROBLEMATIC_PATHS) {
        if (lowerUrl.endsWith(path)) {
          const suggestedUrl = baseUrlValue.replace(new RegExp(path + '$', 'i'), '');
          setUrlWarning(
            `URL ends with "${path}" - Claude appends this automatically. You likely want: ${suggestedUrl}`
          );
          return;
        }
      }
    }
    setUrlWarning(null);
  }, [baseUrlValue]);

  const onSubmit = async (data: FormData) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success(`Profile "${data.name}" created`);
      onSuccess(data.name);
    } catch (error) {
      toast.error((error as Error).message || 'Failed to create profile');
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-background flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold">Create API Profile</h2>
          <p className="text-xs text-muted-foreground">Configure a new custom API endpoint</p>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 max-w-2xl">
          <div className="space-y-6">
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Information</CardTitle>
                <CardDescription>Profile name and API connection details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name">Profile Name</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="my-api"
                    className="font-mono"
                  />
                  {errors.name ? (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Used as: <code className="bg-muted px-1 rounded">ccs my-api "prompt"</code>
                    </p>
                  )}
                </div>

                {/* Base URL */}
                <div className="space-y-1.5">
                  <Label htmlFor="baseUrl">API Base URL</Label>
                  <Input
                    id="baseUrl"
                    {...register('baseUrl')}
                    placeholder="https://api.example.com/v1"
                  />
                  {errors.baseUrl ? (
                    <p className="text-xs text-destructive">{errors.baseUrl.message}</p>
                  ) : urlWarning ? (
                    <div className="flex items-start gap-2 text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{urlWarning}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Base URL without /chat/completions (Claude adds this)
                    </p>
                  )}
                </div>

                {/* API Key */}
                <div className="space-y-1.5">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    {...register('apiKey')}
                    placeholder="••••••••••••••••"
                  />
                  {errors.apiKey && (
                    <p className="text-xs text-destructive">{errors.apiKey.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Model Configuration Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Model Configuration</CardTitle>
                <CardDescription>Configure which models to use with this API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Default Model */}
                <div className="space-y-1.5">
                  <Label htmlFor="model">
                    Default Model
                    <Badge variant="outline" className="ml-2 text-[10px]">
                      ANTHROPIC_MODEL
                    </Badge>
                  </Label>
                  <Input
                    id="model"
                    {...register('model')}
                    placeholder={DEFAULT_MODEL}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank to use: {DEFAULT_MODEL}
                  </p>
                </div>

                {/* Model Mapping Expander */}
                <div className="border rounded-md">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-3 text-sm hover:bg-muted/50 transition-colors"
                    onClick={() => setShowModelMapping(!showModelMapping)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Model Mapping</span>
                      <Badge variant="secondary" className="text-[10px]">
                        Opus / Sonnet / Haiku
                      </Badge>
                    </div>
                    {showModelMapping ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>

                  {showModelMapping && (
                    <div className="p-4 pt-0 space-y-4 border-t bg-muted/30">
                      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-background p-2 rounded">
                        <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>
                          Configure different model IDs for each tier. Useful for API proxies that
                          route Opus/Sonnet/Haiku to different backends.
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="opusModel" className="text-sm">
                          Opus Model
                          <Badge variant="outline" className="ml-2 text-[10px]">
                            ANTHROPIC_DEFAULT_OPUS_MODEL
                          </Badge>
                        </Label>
                        <Input
                          id="opusModel"
                          {...register('opusModel')}
                          placeholder={modelValue || DEFAULT_MODEL}
                          className="font-mono text-sm h-9"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="sonnetModel" className="text-sm">
                          Sonnet Model
                          <Badge variant="outline" className="ml-2 text-[10px]">
                            ANTHROPIC_DEFAULT_SONNET_MODEL
                          </Badge>
                        </Label>
                        <Input
                          id="sonnetModel"
                          {...register('sonnetModel')}
                          placeholder={modelValue || DEFAULT_MODEL}
                          className="font-mono text-sm h-9"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="haikuModel" className="text-sm">
                          Haiku Model
                          <Badge variant="outline" className="ml-2 text-[10px]">
                            ANTHROPIC_DEFAULT_HAIKU_MODEL
                          </Badge>
                        </Label>
                        <Input
                          id="haikuModel"
                          {...register('haikuModel')}
                          placeholder={modelValue || DEFAULT_MODEL}
                          className="font-mono text-sm h-9"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Profile
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </ScrollArea>
    </div>
  );
}
