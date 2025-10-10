import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Settings2 } from "lucide-react";

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
  const updateParam = <K extends keyof AdvancedParams>(
    key: K,
    value: AdvancedParams[K]
  ) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="glass rounded-xl p-6 space-y-6 h-full">
      <div className="flex items-center gap-2 mb-2">
        <Settings2 className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-semibold">Generation Parameters</h3>
      </div>

      {/* Seed */}
      <div className="space-y-3">
        <Label htmlFor="seed" className="text-sm font-medium">
          Seed
        </Label>
        <Input
          id="seed"
          type="number"
          min={0}
          value={params.seed}
          onChange={(e) => updateParam("seed", parseInt(e.target.value) || 0)}
          className="bg-background/50"
          placeholder="0 for random"
        />
        <p className="text-xs text-muted-foreground">
          Use 0 for random generation or set a specific value for reproducible results
        </p>
      </div>

      {/* No Texture Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-background/30">
        <div className="space-y-1 flex-1">
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
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">
            Structured Latent CFG
          </Label>
          <span className="text-sm font-mono bg-primary/10 px-2 py-1 rounded">
            {params.slatCfgScale}
          </span>
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
          Adherence strength in structured latent diffusion (default: 3)
        </p>
      </div>

      {/* SS CFG Scale */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">
            Sparse Structure CFG
          </Label>
          <span className="text-sm font-mono bg-primary/10 px-2 py-1 rounded">
            {params.ssCfgScale}
          </span>
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
          Adherence strength in sparse structure diffusion (default: 7.5)
        </p>
      </div>

      {/* SLAT Sampling Steps */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">
            Structured Latent Steps
          </Label>
          <span className="text-sm font-mono bg-primary/10 px-2 py-1 rounded">
            {params.slatSamplingSteps}
          </span>
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
          Diffusion steps for quality (default: 25, higher = better quality + slower)
        </p>
      </div>

      {/* SS Sampling Steps */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">
            Sparse Structure Steps
          </Label>
          <span className="text-sm font-mono bg-primary/10 px-2 py-1 rounded">
            {params.ssSamplingSteps}
          </span>
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
          Diffusion steps for structure (default: 25, higher = better quality + slower)
        </p>
      </div>
    </div>
  );
};
