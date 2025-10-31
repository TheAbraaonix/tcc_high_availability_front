import { useState, useRef } from 'react';
import './ImageUploader.css';

interface ImageUploaderProps {
  onImagesLoaded: (files: File[]) => void;
  disabled?: boolean;
}

export function ImageUploader({ onImagesLoaded, disabled = false }: ImageUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    const fileArray = Array.from(files);

    try {
      // Simulate loading progress for visual feedback
      const loadedFiles: File[] = [];

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];

        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`Skipping ${file.name}: Not an image file`);
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`Skipping ${file.name}: File too large (max 10MB)`);
          continue;
        }

        loadedFiles.push(file);
        setProgress({ loaded: i + 1, total: fileArray.length });

        // Small delay for visual feedback
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      setSelectedFiles(loadedFiles);
      onImagesLoaded(loadedFiles);
    } catch (error) {
      console.error('Error loading files:', error);
      alert('Error loading some files. Check console for details.');
    } finally {
      setIsLoading(false);
      setProgress({ loaded: 0, total: 0 });
    }
  };

  const handleClearFiles = () => {
    setSelectedFiles([]);
    onImagesLoaded([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-uploader">
      <h3>Upload Images</h3>
      <p className="subtitle">Select multiple image files from your computer</p>

      <div className="upload-area">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={disabled || isLoading}
          style={{ display: 'none' }}
        />

        <button
          type="button"
          onClick={handleButtonClick}
          disabled={disabled || isLoading}
          className="btn-upload"
        >
          {isLoading ? 'Loading...' : 'Choose Images'}
        </button>

        {selectedFiles.length > 0 && (
          <button
            type="button"
            onClick={handleClearFiles}
            disabled={disabled || isLoading}
            className="btn-clear"
          >
            Clear All
          </button>
        )}
      </div>

      {isLoading && progress.total > 0 && (
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(progress.loaded / progress.total) * 100}%` }}
            />
          </div>
          <span className="progress-text">
            Loading {progress.loaded} of {progress.total} files...
          </span>
        </div>
      )}

      {selectedFiles.length > 0 && !isLoading && (
        <div className="files-summary">
          <p className="files-count">
            <strong>{selectedFiles.length}</strong> image{selectedFiles.length !== 1 ? 's' : ''} ready
          </p>
          <ul className="files-list">
            {selectedFiles.map((file, index) => (
              <li key={`${file.name}-${index}`}>
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
