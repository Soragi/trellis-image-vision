import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  base64: string;
}

interface ImageUploaderProps {
  onImagesChange: (images: ImageFile[]) => void;
}

export const ImageUploader = ({ onImagesChange }: ImageUploaderProps) => {
  const [images, setImages] = useState<ImageFile[]>([]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const newImages = await Promise.all(
        acceptedFiles.map(async (file) => {
          const base64 = await convertToBase64(file);
          return {
            id: Math.random().toString(36).substr(2, 9),
            file,
            preview: URL.createObjectURL(file),
            base64,
          };
        })
      );

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesChange(updatedImages);
      toast.success(`${acceptedFiles.length} image(s) uploaded successfully`);
    } catch (error) {
      toast.error("Error uploading images");
      console.error(error);
    }
  }, [images, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    multiple: true,
  });

  const removeImage = (id: string) => {
    const updatedImages = images.filter((img) => img.id !== id);
    setImages(updatedImages);
    onImagesChange(updatedImages);
    toast.success("Image removed");
  };

  return (
    <div className="w-full space-y-6">
      <div
        {...getRootProps()}
        className={`glass rounded-lg border-2 border-dashed p-12 text-center cursor-pointer transition-smooth hover:border-primary hover:glow-primary ${
          isDragActive ? "border-primary glow-primary" : "border-border"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-lg text-primary">Drop the images here...</p>
        ) : (
          <div>
            <p className="text-lg mb-2">
              Drag & drop images here, or click to select
            </p>
            <p className="text-sm text-muted-foreground">
              Supports PNG, JPG, JPEG, WEBP
            </p>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group glass rounded-lg overflow-hidden aspect-square"
            >
              <img
                src={image.preview}
                alt={image.file.name}
                className="w-full h-full object-cover"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-smooth"
                onClick={() => removeImage(image.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
