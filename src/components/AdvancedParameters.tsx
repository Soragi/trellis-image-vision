import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export interface AdvancedParams {
  seed: number;
  noTexture: boolean;
  slatCfgScale: number;
  ssCfgScale: number;
  slatSamplingSteps: number;
  ssSamplingSteps: number;
}

interface AdvancedParametersProps {
  params: AdvancedParams;
  onChange: (params: AdvancedParams) => void;
}

export const AdvancedParameters = ({ params, onChange }: AdvancedParametersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateParam = <K extends keyof AdvancedParams>(
    key: K,
    value: AdvancedParams[K]
  ) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="glass rounded-lg p-4">
      <CollapsibleTrigger className="flex items-center justify-between w-full">
        <h3 className="text-lg font-semibold">Advanced Parameters</h3>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-4 space-y-6">
        {/* Seed */}
        <div className="space-y-2">
          <Label htmlFor="seed" className="text-sm font-medium">
            Seed (0 for random)
          </Label>
          <Input
            id="seed"
            type="number"
            min={0}
            value={params.seed}
            onChange={(e) => updateParam("seed", parseInt(e.target.value) || 0)}
            className="bg-background/50"
          />
          <p className="text-xs text-muted-foreground">
            Controls randomness. Use the same seed for reproducible results.
          </p>
        </div>

        {/* No Texture Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="no-texture" className="text-sm font-medium">
              Skip Texture Baking
            </Label>
            <p className="text-xs text-muted-foreground">
              Generate geometry only, without textures
            </p>
          </div>
          <Switch
            id="no-texture"
            checked={params.noTexture}
            onCheckedChange={(checked) => updateParam("noTexture", checked)}
          />
        </div>

        {/* SLAT CFG Scale */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm font-medium">
              Structured Latent CFG Scale
            </Label>
            <span className="text-sm text-muted-foreground">{params.slatCfgScale}</span>
          </div>
          <Slider
            value={[params.slatCfgScale]}
            onValueChange={([value]) => updateParam("slatCfgScale", value)}
            min={1}
            max={10}
            step={0.5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            How strictly the model adheres to input in structured latent diffusion (default: 3)
          </p>
        </div>

        {/* SS CFG Scale */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm font-medium">
              Sparse Structure CFG Scale
            </Label>
            <span className="text-sm text-muted-foreground">{params.ssCfgScale}</span>
          </div>
          <Slider
            value={[params.ssCfgScale]}
            onValueChange={([value]) => updateParam("ssCfgScale", value)}
            min={1}
            max={15}
            step={0.5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            How strictly the model adheres to input in sparse structure diffusion (default: 7.5)
          </p>
        </div>

        {/* SLAT Sampling Steps */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm font-medium">
              Structured Latent Sampling Steps
            </Label>
            <span className="text-sm text-muted-foreground">{params.slatSamplingSteps}</span>
          </div>
          <Slider
            value={[params.slatSamplingSteps]}
            onValueChange={([value]) => updateParam("slatSamplingSteps", value)}
            min={10}
            max={50}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Number of diffusion steps for structured latent generation (default: 25)
          </p>
        </div>

        {/* SS Sampling Steps */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm font-medium">
              Sparse Structure Sampling Steps
            </Label>
            <span className="text-sm text-muted-foreground">{params.ssSamplingSteps}</span>
          </div>
          <Slider
            value={[params.ssSamplingSteps]}
            onValueChange={([value]) => updateParam("ssSamplingSteps", value)}
            min={10}
            max={50}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Number of diffusion steps for sparse structure generation (default: 25)
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
