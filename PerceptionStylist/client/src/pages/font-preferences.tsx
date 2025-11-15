import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { FontPreference, InsertFontPreference } from "@shared/schema";

const FONT_FAMILIES = ["Arial", "Verdana", "Georgia", "Times New Roman", "Courier"] as const;
type FontFamily = typeof FONT_FAMILIES[number];

export default function FontPreferences() {
  const { toast } = useToast();
  const [fontFamily, setFontFamily] = useState<FontFamily>("Arial");
  const [fontSize, setFontSize] = useState<number>(16);

  const { data: currentPreference, isLoading } = useQuery<FontPreference>({
    queryKey: ["/api/font-preferences/current"],
    retry: false,
  });

  useEffect(() => {
    if (currentPreference) {
      setFontFamily(currentPreference.fontFamily as FontFamily);
      setFontSize(currentPreference.fontSize);
    }
  }, [currentPreference]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertFontPreference) => {
      return apiRequest("POST", "/api/font-preferences", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/font-preferences/current"] });
      toast({
        title: "Settings Applied",
        description: "Your font preferences have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save font preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertFontPreference> }) => {
      return apiRequest("PUT", `/api/font-preferences/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/font-preferences/current"] });
      toast({
        title: "Settings Updated",
        description: "Your font preferences have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update font preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApply = () => {
    const data = { fontFamily, fontSize };
    
    if (currentPreference) {
      updateMutation.mutate({ id: currentPreference.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleReset = () => {
    setFontFamily("Arial");
    setFontSize(16);
    toast({
      title: "Reset to Default",
      description: "Font preferences have been reset to default values.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Loading preferences...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayFontFamily = currentPreference?.fontFamily || fontFamily;
  const displayFontSize = currentPreference?.fontSize || fontSize;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Font Preferences</CardTitle>
          <CardDescription>
            Customize font style and size for better readability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Font Style</Label>
            <p className="text-sm text-muted-foreground">
              Choose a font family that works best for you
            </p>
            <RadioGroup
              value={fontFamily}
              onValueChange={(value) => setFontFamily(value as FontFamily)}
              className="space-y-2"
              data-testid="radio-group-font-family"
            >
              {FONT_FAMILIES.map((font) => (
                <div
                  key={font}
                  className="flex items-center space-x-3 p-3 rounded-md border hover-elevate active-elevate-2"
                >
                  <RadioGroupItem 
                    value={font} 
                    id={font}
                    data-testid={`radio-font-${font.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                  <Label
                    htmlFor={font}
                    className="flex-1 cursor-pointer text-base"
                    style={{ fontFamily: font }}
                  >
                    {font}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Font Size</Label>
              <span className="text-sm font-medium text-muted-foreground" data-testid="text-font-size-value">
                {fontSize}px
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Adjust the font size between 12px and 24px
            </p>
            <Slider
              value={[fontSize]}
              onValueChange={(value) => setFontSize(value[0])}
              min={12}
              max={24}
              step={1}
              className="py-4"
              data-testid="slider-font-size"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Preview</Label>
            <Card>
              <CardContent className="p-6">
                <p
                  style={{
                    fontFamily: displayFontFamily,
                    fontSize: `${displayFontSize}px`,
                  }}
                  data-testid="text-preview"
                >
                  The quick brown fox jumps over the lazy dog
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleApply}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1"
              data-testid="button-apply"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Applying..."
                : "Apply Settings"}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1"
              data-testid="button-reset"
            >
              Reset to Default
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
