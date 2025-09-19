import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Eye, Settings } from 'lucide-react';
import PDFPreview from './PDFPreview';
import PageSelector from './PageSelector';
import { ErrorList } from '@/components/ui/error-display';
import { SuccessDisplay } from '@/components/ui/success-display';
import { LoadingSpinner } from '@/components/ui/loading';
import { useApiError } from '@/hooks/useApiError';
import { PDFSelection } from '@/types/pdf';
import { cn } from '@/lib/utils';

interface PDFUploadSectionProps {
  onSelectionComplete?: (data: { selection: PDFSelection; file: File }) => void;
  className?: string;
}

export const PDFUploadSection: React.FC<PDFUploadSectionProps> = ({
                                                                    onSelectionComplete,
                                                                    className
                                                                  }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<string>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const { errors, addError, clearErrors, clearError } = useApiError();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      addError({ message: 'Please select a PDF file', type: 'validation' });
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      addError({ message: 'File size must be less than 10MB', type: 'validation' });
      return;
    }

    clearErrors();
    setUploadedFile(file);
    setSelectedPages([]);
    setActiveTab('preview');
  };

  const handlePDFLoadSuccess = (numPages: number) => {
    setTotalPages(numPages);
    const allPages = Array.from({ length: numPages }, (_, i) => i + 1);
    setSelectedPages(allPages);
  };

  const handlePDFLoadError = (error: Error) => {
    addError(error);
  };

  const handlePageSelect = (pageNumber: number) => {
    setSelectedPages(prev =>
        prev.includes(pageNumber)
            ? prev.filter(p => p !== pageNumber)
            : [...prev, pageNumber].sort((a, b) => a - b)
    );
  };

  const handleProcessSelection = async () => {
    if (!uploadedFile || selectedPages.length === 0) {
      addError({
        message: 'Please select at least one page to process',
        type: 'validation'
      });
      return;
    }

    setIsProcessing(true);
    clearErrors();

    try {
      const selection: PDFSelection = {
        selectedPages,
        selectedText: [],
        selectionType: 'pages',
        metadata: {
          totalPages,
          fileName: uploadedFile.name,
          fileSize: uploadedFile.size
        }
      };

      await new Promise(resolve => setTimeout(resolve, 500));

      onSelectionComplete?.({ selection, file: uploadedFile });
      setSuccess('PDF processed successfully! Ready to generate study materials.');
    } catch (error) {
      addError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setTotalPages(0);
    setSelectedPages([]);
    setActiveTab('upload');
    clearErrors();
    setSuccess(null);
  };

  return (
      <div className={cn('space-y-6', className)}>
        <ErrorList errors={errors} onDismiss={clearError} onRetry={() => window.location.reload()} />

        {success && (
            <SuccessDisplay
                message={success}
                onDismiss={() => setSuccess(null)}
                actions={[
                  { label: 'Upload Another', onClick: resetUpload, variant: 'outline' }
                ]}
            />
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-primary" />
              <span>PDF Upload & Selection</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upload" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Upload</span>
                </TabsTrigger>
                <TabsTrigger value="preview" disabled={!uploadedFile} className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>Preview</span>
                </TabsTrigger>
                <TabsTrigger value="select" disabled={!uploadedFile} className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Select</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" id="pdf-upload" />
                  <label htmlFor="pdf-upload" className="cursor-pointer block">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">
                      {uploadedFile ? uploadedFile.name : 'Choose PDF file'}
                    </p>
                    <p className="text-muted-foreground">
                      {uploadedFile
                          ? `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB - Click to change`
                          : 'Click to browse or drag and drop (Max 10MB)'}
                    </p>
                  </label>
                </div>

                {uploadedFile && (
                    <div className="flex justify-center">
                      <Button onClick={() => setActiveTab('preview')}>Continue to Preview</Button>
                    </div>
                )}
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                {uploadedFile && (
                    <>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">PDF Preview</h3>
                        <Button variant="outline" onClick={() => setActiveTab('select')} disabled={totalPages === 0}>
                          Configure Selection
                        </Button>
                      </div>

                      <PDFPreview
                          file={uploadedFile}
                          onLoadSuccess={handlePDFLoadSuccess}
                          onLoadError={handlePDFLoadError}
                          selectedPages={selectedPages}
                          onPageSelect={handlePageSelect}
                      />
                    </>
                )}
              </TabsContent>

              <TabsContent value="select" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PageSelector
                      totalPages={totalPages}
                      selectedPages={selectedPages}
                      onSelectionChange={setSelectedPages}
                  />

                  <Card>
                    <CardHeader>
                      <CardTitle>Process Selection</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Selected Content</Label>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm">
                            <strong>File:</strong> {uploadedFile?.name}
                          </p>
                          <p className="text-sm">
                            <strong>Pages:</strong> {selectedPages.length} of {totalPages}
                          </p>
                          <p className="text-sm">
                            <strong>Coverage:</strong>{' '}
                            {Math.round((selectedPages.length / totalPages) * 100)}%
                          </p>
                        </div>
                      </div>

                      <Button
                          onClick={handleProcessSelection}
                          disabled={isProcessing || selectedPages.length === 0}
                          className="w-full"
                          variant="hero"
                      >
                        {isProcessing ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-2" />
                              Processing...
                            </>
                        ) : (
                            'Process Selection'
                        )}
                      </Button>

                      <Button variant="outline" onClick={resetUpload} className="w-full">
                        Start Over
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
  );
};

export default PDFUploadSection;
