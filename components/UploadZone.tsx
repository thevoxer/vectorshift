import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { ImageFile } from '../types';

interface UploadZoneProps {
  onImageSelected: (image: ImageFile) => void;
  disabled?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onImageSelected, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Please upload a valid image file (PNG, JPG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Extract base64 data only (remove data:image/png;base64, prefix)
      const base64 = result.split(',')[1];
      onImageSelected({
        file,
        preview: result,
        base64,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative group cursor-pointer 
        border-2 border-dashed rounded-2xl p-8 
        transition-all duration-300 ease-out
        flex flex-col items-center justify-center text-center
        h-64 sm:h-80
        ${disabled ? 'opacity-50 cursor-not-allowed border-slate-700 bg-slate-800/50' : ''}
        ${isDragging 
          ? 'border-brand-400 bg-brand-500/10 scale-[1.02]' 
          : 'border-slate-700 hover:border-brand-500/50 hover:bg-slate-800'
        }
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg"
        className="hidden"
        disabled={disabled}
      />

      <div className={`p-4 rounded-full bg-slate-800 mb-4 transition-transform duration-300 ${isDragging ? 'scale-110' : 'group-hover:scale-110'}`}>
        <Upload className={`w-8 h-8 ${isDragging ? 'text-brand-400' : 'text-slate-400'}`} />
      </div>

      <h3 className="text-xl font-semibold text-slate-200 mb-2">
        Upload PNG Image
      </h3>
      <p className="text-slate-400 text-sm max-w-xs mx-auto">
        Drag & drop or click to browse. 
        <br />
        <span className="text-xs opacity-70">Supports PNG, JPG</span>
      </p>

      {/* Decorative gradient blur */}
      <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-lg -z-10" />
    </div>
  );
};
