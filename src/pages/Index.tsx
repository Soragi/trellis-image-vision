import { useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Upload } from "lucide-react";
import { toast } from "sonner";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  base64: string;
}

const Index = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Connect to NIM backend via Edge Function
      const base64Images = images.map((img) => img.base64);
      
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      toast.success("Images processed successfully!");
      console.log("Base64 images:", base64Images);
    } catch (error) {
      toast.error("Error processing images");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary">
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <header className="text-center mb-16 space-y-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              NVIDIA Trellis NIM
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Transform your images into stunning 3D assets with AI-powered generation technology
          </p>
          <div className="flex flex-wrap gap-4 justify-center items-center text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Lightning Fast
            </span>
            <span>•</span>
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              AI-Powered
            </span>
            <span>•</span>
            <span>Multi-Image Support</span>
          </div>
        </header>

        {/* Upload Section */}
        <section className="max-w-6xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold mb-6">Upload Images</h2>
          <ImageUploader onImagesChange={setImages} />
        </section>

        {/* Action Section */}
        {images.length > 0 && (
          <section className="max-w-6xl mx-auto text-center">
            <Button
              size="lg"
              onClick={handleProcess}
              disabled={isProcessing}
              className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 text-lg px-8 py-6 glow-primary"
            >
              {isProcessing ? (
                <>Processing {images.length} Image(s)...</>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate 3D Assets
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              {images.length} image(s) ready for processing
            </p>
          </section>
        )}

        {/* Features Section */}
        <section className="max-w-6xl mx-auto mt-24 grid md:grid-cols-3 gap-8">
          <article className="glass rounded-xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Easy Upload</h3>
            <p className="text-muted-foreground">
              Drag and drop multiple images or click to select from your device
            </p>
          </article>

          <article className="glass rounded-xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Fast Processing</h3>
            <p className="text-muted-foreground">
              Powered by NVIDIA NIM for lightning-fast 3D asset generation
            </p>
          </article>

          <article className="glass rounded-xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">AI-Powered</h3>
            <p className="text-muted-foreground">
              Advanced AI technology transforms 2D images into detailed 3D models
            </p>
          </article>
        </section>
      </main>
    </div>
  );
};

export default Index;
