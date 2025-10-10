import { GenerationParameters } from '../services/TrellisNimService';

export function validateGenerationRequest(params: GenerationParameters): string | null {
  // Validate mesh format
  if (params.meshFormat && !['glb', 'obj', 'ply'].includes(params.meshFormat.toLowerCase())) {
    return 'Invalid mesh format. Supported formats: glb, obj, ply';
  }

  // Validate texture format
  if (params.textureFormat && !['png', 'jpg', 'jpeg'].includes(params.textureFormat.toLowerCase())) {
    return 'Invalid texture format. Supported formats: png, jpg, jpeg';
  }

  // Validate seed
  if (params.seed !== undefined && (params.seed < 0 || params.seed > 2147483647)) {
    return 'Seed must be between 0 and 2147483647';
  }

  // Validate SLAT CFG Scale
  if (params.slatCfgScale !== undefined && (params.slatCfgScale < 1 || params.slatCfgScale > 10)) {
    return 'SLAT CFG Scale must be between 1 and 10';
  }

  // Validate SS CFG Scale
  if (params.ssCfgScale !== undefined && (params.ssCfgScale < 1 || params.ssCfgScale > 15)) {
    return 'SS CFG Scale must be between 1 and 15';
  }

  // Validate SLAT Sampling Steps
  if (params.slatSamplingSteps !== undefined && (params.slatSamplingSteps < 10 || params.slatSamplingSteps > 50)) {
    return 'SLAT Sampling Steps must be between 10 and 50';
  }

  // Validate SS Sampling Steps
  if (params.ssSamplingSteps !== undefined && (params.ssSamplingSteps < 10 || params.ssSamplingSteps > 50)) {
    return 'SS Sampling Steps must be between 10 and 50';
  }

  return null; // No validation errors
}

export function validateImageFile(file: Express.Multer.File): string | null {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return `File ${file.originalname} is too large. Maximum size is 10MB.`;
  }

  // Check file type
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    return `File ${file.originalname} has invalid type. Allowed types: PNG, JPEG, JPG, WEBP.`;
  }

  return null; // No validation errors
}

export function validateBase64Image(base64String: string): string | null {
  // Check if it's a valid base64 data URL
  const base64Regex = /^data:image\/(png|jpeg|jpg|webp);base64,/;
  if (!base64Regex.test(base64String)) {
    return 'Invalid base64 image format. Must be a data URL with PNG, JPEG, JPG, or WEBP format.';
  }

  // Extract the base64 data (after the comma)
  const base64Data = base64String.split(',')[1];
  if (!base64Data) {
    return 'Invalid base64 image data.';
  }

  // Check base64 length (approximate size check - 10MB limit)
  const approximateSize = (base64Data.length * 3) / 4; // Base64 to bytes approximation
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (approximateSize > maxSize) {
    return 'Base64 image is too large. Maximum size is approximately 10MB.';
  }

  return null; // No validation errors
}
