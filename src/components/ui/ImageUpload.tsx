"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUpload({ images, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `watches/${fileName}`;

    const { error } = await supabase.storage
      .from("watch-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("watch-images")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (validFiles.length === 0) return;

    setUploading(true);

    const uploadPromises = validFiles.map((file) => uploadFile(file));
    const urls = await Promise.all(uploadPromises);
    const validUrls = urls.filter(Boolean) as string[];

    if (validUrls.length > 0) {
      onChange([...images, ...validUrls]);
    }

    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
          ${
            dragOver
              ? "border-accent-blue bg-accent-blue/5"
              : "border-vault-border hover:border-vault-muted/50 hover:bg-vault-card/50"
          }
          ${uploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <svg
              className="w-8 h-8 text-accent-blue animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-vault-muted text-sm">Uploading...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg
              className="w-8 h-8 text-vault-muted/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-vault-muted text-sm">
              Drop images here or <span className="text-accent-blue">browse</span>
            </span>
            <span className="text-vault-muted/40 text-xs">
              JPG, PNG, WebP — multiple files supported
            </span>
          </div>
        )}
      </div>

      {/* Image preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          <AnimatePresence mode="popLayout">
            {images.map((url, index) => (
              <motion.div
                key={url}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group aspect-square rounded-xl overflow-hidden bg-vault-card border border-vault-border"
              >
                <img
                  src={url}
                  alt={`Watch image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* First image badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-accent-blue/80 text-white text-[10px] font-medium uppercase tracking-wider">
                    Main
                  </div>
                )}
                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white
                             flex items-center justify-center opacity-0 group-hover:opacity-100
                             hover:bg-red-500 transition-all duration-200"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
