import JSZip from 'jszip';
import { nanoid } from 'nanoid';

/**
 * Extract images from a Word document (.docx)
 * Returns a map of image reference IDs to base64 data URIs
 */
export async function extractImages(buffer: Buffer): Promise<Record<string, string>> {
  try {
    const zip = await JSZip.loadAsync(buffer);
    const imageMap: Record<string, string> = {};
    
    // Find all files in the word/media directory (where images are stored)
    const mediaFiles = Object.keys(zip.files).filter(
      name => name.startsWith('word/media/')
    );
    
    // Extract each image and convert to base64
    for (const filePath of mediaFiles) {
      const fileData = await zip.files[filePath].async('base64');
      const mimeType = getMimeType(filePath);
      const imageId = nanoid(); // Generate a unique ID for this image
      
      // Store as a data URI
      imageMap[imageId] = `data:${mimeType};base64,${fileData}`;
    }
    
    return imageMap;
  } catch (error) {
    console.error('Error extracting images:', error);
    return {};
  }
}

/**
 * Get the MIME type based on file extension
 */
function getMimeType(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}
