/**
 * RECOMMENDATION: BOL/POD Document Upload
 * Drag-and-drop file upload for trucking documents
 */
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, Loader2, CheckCircle, FileText, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadedDocument {
  url: string;
  loadId: string;
  type: string;
  fileName: string;
}

interface DocumentUploadProps {
  loadId: string;
  documentType: 'BOL' | 'POD' | 'RATE_CONFIRMATION';
  onUploadComplete?: (doc: UploadedDocument) => void;
}

export function DocumentUpload({ loadId, documentType, onUploadComplete }: DocumentUploadProps) {
  const [files, setFiles] = useState<Array<{
    file: File;
    progress: number;
    status: 'uploading' | 'done' | 'error';
    url?: string;
  }>>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // Upload each file
    newFiles.forEach((fileObj, index) => {
      uploadFile(fileObj.file, files.length + index);
    });
  }, [loadId, documentType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const uploadFile = async (file: File, index: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('loadId', loadId);
    formData.append('type', documentType);

    try {
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(r => setTimeout(r, 100));
        setFiles(prev => prev.map((f, idx) => 
          idx === index ? { ...f, progress: i } : f
        ));
      }

      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      const data: UploadedDocument = await response.json();

      setFiles(prev => prev.map((f, idx) => 
        idx === index ? { ...f, status: 'done', url: data.url } : f
      ));

      onUploadComplete?.(data);
    } catch (error) {
      setFiles(prev => prev.map((f, idx) => 
        idx === index ? { ...f, status: 'error' } : f
      ));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const typeLabels = {
    BOL: 'Bill of Lading',
    POD: 'Proof of Delivery',
    RATE_CONFIRMATION: 'Rate Confirmation',
  };

  const typeIcons = {
    BOL: <FileText className="h-5 w-5" />,
    POD: <Camera className="h-5 w-5" />,
    RATE_CONFIRMATION: <File className="h-5 w-5" />,
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        role="button"
        tabIndex={0}
        aria-label={`Upload ${typeLabels[documentType]} — drag and drop or press Enter to browse files`}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ${
          isDragActive
            ? 'border-red-600 bg-red-600/5'
            : 'border-infamous-border bg-infamous-card/50 hover:border-zinc-500'
        }`}
      >
        <input {...getInputProps()} />
        <Upload aria-hidden="true" className="h-10 w-10 text-[#B88989]/70 mx-auto mb-3" />
        <p className="text-[#F5E8E8] font-medium">
          {isDragActive ? 'Drop files here' : `Upload ${typeLabels[documentType]}`}
        </p>
        <p className="text-sm text-[#B88989] mt-1">
          Drag & drop or click to browse. PDF, PNG, JPG up to 10MB.
        </p>
      </div>

      {/* File List */}
      <AnimatePresence>
        {files.map((file, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 p-3 rounded-lg border border-infamous-border bg-infamous-card/50"
          >
            <div className="text-red-500">
              {typeIcons[documentType]}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#F5E8E8] truncate">{file.file.name}</p>
              <div className="flex items-center gap-2 mt-1">
                {file.status === 'uploading' && (
                  <>
                    <div className="flex-1 h-1.5 rounded-full bg-infamous-panel overflow-hidden">
                      <motion.div
                        className="h-full bg-red-600"
                        animate={{ width: `${file.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#B88989]">{file.progress}%</span>
                  </>
                )}
                {file.status === 'done' && (
                  <span className="flex items-center gap-1 text-xs text-[#36D399]">
                    <CheckCircle className="h-3 w-3" />
                    Uploaded
                  </span>
                )}
                {file.status === 'error' && (
                  <span className="text-xs text-red-400">Upload failed</span>
                )}
              </div>
            </div>

            <button
              onClick={() => removeFile(index)}
              aria-label={`Remove ${file.file.name}`}
              className="text-[#B88989]/70 hover:text-[#F5E8E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
