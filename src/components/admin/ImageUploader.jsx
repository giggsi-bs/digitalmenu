
import React, { useState } from 'react';
import { UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Upload, Trash, ImageIcon } from "lucide-react";

export default function ImageUploader({ value, onChange, className, isForm = false }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault(); // Prevent form submission
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('נא לבחור קובץ תמונה בלבד');
      return;
    }

    setUploading(true);
    setError(null);
    
    try {
      // Resize image before upload
      const resizedFile = await resizeImage(file, 800);
      
      // Upload the resized file
      const response = await UploadFile({ file: resizedFile });
      onChange(response.file_url);
    } catch (err) {
      console.error("Upload error:", err);
      setError('שגיאה בהעלאת התמונה');
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = (e) => {
    e.preventDefault(); // Prevent form submission
    document.getElementById('file-upload').click();
  };

  // Helper function to resize images
  const resizeImage = (file, maxSize) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to Blob
          canvas.toBlob((blob) => {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(resizedFile);
          }, file.type);
        };
      };
    });
  };

  const handleClear = (e) => {
    e.preventDefault(); // Prevent form submission
    onChange('');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {value ? (
        <div className="relative">
          <img 
            src={value} 
            alt="Uploaded" 
            className="w-full h-48 object-cover rounded-md"
          />
          <Button 
            variant="destructive" 
            size="icon" 
            className="absolute top-2 right-2"
            onClick={handleClear}
            type="button"  // Explicitly set type to prevent form submission
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex items-center justify-center flex-col">
          <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
          <p className="text-gray-500 mb-2 text-center">
            העלה תמונה בגודל עד 800 פיקסל
          </p>
          <Button 
            variant="outline" 
            onClick={handleButtonClick}
            disabled={uploading}
            type="button"  // Explicitly set type to prevent form submission
          >
            {uploading ? 'מעלה...' : 'בחר תמונה'}
            <Upload className="w-4 h-4 mr-2" />
          </Button>
        </div>
      )}
      
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept="image/*"
        onChange={handleUpload}
      />
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
