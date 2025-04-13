import React, { useState, useRef } from 'react';

interface FileUploadProps {
  accept: string;
  onFileChange: (file: File) => void;
  label: string;
  supportText?: string;
  fileType?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  onFileChange,
  label,
  supportText,
  fileType
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileChange(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsHovering(false);
    
    if (event.dataTransfer.files.length) {
      const file = event.dataTransfer.files[0];
      if (file) {
        setFileName(file.name);
        onFileChange(file);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsHovering(false);
  };

  const clickFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-8">
      <label className="block mb-2 text-sm font-medium text-neutral-700">{label}</label>
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
          ${isHovering ? 'bg-primary-50 border-primary-200' : 'bg-neutral-50 border-neutral-300 hover:border-primary-500'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!fileName ? clickFileInput : undefined}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFile}
          className="hidden"
          ref={fileInputRef}
        />
        
        {!fileName ? (
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            
            <p className="mt-4 text-sm text-neutral-600">
              Drag and drop your {fileType || 'file'} here, or{' '}
              <button type="button" className="text-primary-600 font-medium hover:text-primary-500">
                browse files
              </button>
            </p>
            <p className="mt-2 text-xs text-neutral-500">{supportText}</p>
          </div>
        ) : (
          <div className="py-4">
            <div className="flex items-center justify-center space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="text-left">
                <p className="text-sm font-medium text-neutral-800">{fileName}</p>
                <p className="text-xs text-neutral-500">Ready to process</p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="mt-4 text-sm text-neutral-600 hover:text-neutral-800"
            >
              Choose another file
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
