import { useEffect, useRef, useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Upload, Loader2, ExternalLink, FileDown } from "lucide-react";
import { toast } from "sonner";
import {
  NimGenerationResponse,
  pollGenerationJob,
  submitGenerationJob,
} from "@/lib/nim";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  base64: string;
}

const Index = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [result, setResult] = useState<NimGenerationResponse | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleProcess = async () => {
    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setIsProcessing(true);
    setResult(null);
    setStatusMessage("Submitting job to NVIDIA NIM...");

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const base64Images = images.map((img) => img.base64);
      const submission = await submitGenerationJob(
        {
          images: base64Images,
          meshFormat: "glb",
          textureFormat: "png",
        },
        { signal: controller.signal }
      );

      setStatusMessage(
        submission.message ?? "Job submitted. Waiting for completion..."
      );

      const finalResult = await pollGenerationJob(submission.jobId, {
        signal: controller.signal,
        onUpdate: (update) => {
          if (update.message) {
            setStatusMessage(update.message);
          } else {
            setStatusMessage(`Status: ${update.status}`);
          }
        },
      });

      setResult(finalResult);

      if (finalResult.status === "succeeded") {
        toast.success("Images processed successfully!");
      } else {
        toast.error(finalResult.error ?? "NIM job failed");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      const errorMessage =
        error instanceof Error ? error.message : "Error processing images";
      toast.error("Error processing images");
      console.error(error);
      setStatusMessage(errorMessage);
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
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing {images.length} Image(s)...
                </>
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
            {statusMessage && (
              <p className="text-sm text-muted-foreground mt-2">
                {statusMessage}
              </p>
            )}
          </section>
        )}

        {result && (
          <section className="max-w-6xl mx-auto mt-16">
            <div className="glass rounded-xl p-6 md:p-8 space-y-6">
              <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Generation Result</h2>
                  <p className="text-sm text-muted-foreground">
                    Job ID: <span className="font-mono">{result.jobId}</span>
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-4 py-1 text-sm font-medium capitalize ${
                    result.status === "succeeded"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : result.status === "failed"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  Status: {result.status}
                </span>
              </header>

              {result.message && (
                <p className="text-sm text-muted-foreground">{result.message}</p>
              )}

              {result.status === "failed" && result.error && (
                <p className="text-sm text-destructive">{result.error}</p>
              )}

              {result.assets && result.assets.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {result.assets.map((asset) => (
                    <article
                      key={asset.id}
                      className="glass rounded-lg p-4 flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {asset.type.toUpperCase()}
                          </h3>
                          {asset.sizeMB && (
                            <p className="text-xs text-muted-foreground">
                              {asset.sizeMB.toFixed(2)} MB
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button asChild size="sm" variant="outline">
                            <a
                              href={asset.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Open
                            </a>
                          </Button>
                          <Button asChild size="sm">
                            <a
                              href={asset.url}
                              download
                              className="inline-flex items-center gap-2"
                            >
                              <FileDown className="w-4 h-4" />
                              Download
                            </a>
                          </Button>
                        </div>
                      </div>
                      {asset.previewImageUrl && (
                        <img
                          src={asset.previewImageUrl}
                          alt={`${asset.type} preview`}
                          className="rounded-lg border border-border object-cover"
                        />
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No downloadable assets were returned. Check the Edge function
                  response to ensure asset URLs are forwarded correctly.
                </p>
              )}
            </div>
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
