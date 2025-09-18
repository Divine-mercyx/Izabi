import React, { useState, useEffect } from 'react';
import { LoadingSpinner, SkeletonLoader } from '@/components/ui/loading';
import ErrorDisplay from '@/components/ui/error-display';
import { cn } from '@/lib/utils';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Document, Page, pdfjs } from "react-pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PDFPreviewProps {
    file: File;
    onLoadSuccess?: (numPages: number) => void;
    onLoadError?: (error: Error) => void;
    selectedPages?: number[];
    onPageSelect?: (pageNumber: number) => void;
    className?: string;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({
                                                          file,
                                                          onLoadSuccess,
                                                          onLoadError,
                                                          selectedPages = [],
                                                          onPageSelect,
                                                          className
                                                      }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setLoading(false);
        setError(null);
        onLoadSuccess?.(numPages);
    };

    const onDocumentLoadError = (error: Error) => {
        setError(error);
        setLoading(false);
        onLoadError?.(error);
    };

    const onPageLoadSuccess = (pageNumber: number) => {
        setLoadedPages(prev => new Set([...prev, pageNumber]));
    };

    const handlePageClick = (pageNumber: number) => {
        onPageSelect?.(pageNumber);
    };

    if (error) {
        return (
            <ErrorDisplay
                error={{
                    id: 'pdf-preview-error',
                    type: 'validation',
                    message: 'Failed to load PDF preview',
                    details: error.message,
                    timestamp: Date.now()
                }}
            />
        );
    }

    return (
        <div className={cn('w-full', className)}>
            <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={<LoadingSpinner size="lg" text="Loading PDF..." />}
            >
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <SkeletonLoader key={index} variant="image" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {Array.from({ length: numPages }, (_, index) => {
                            const pageNumber = index + 1;
                            const isSelected = selectedPages.includes(pageNumber);
                            const isLoaded = loadedPages.has(pageNumber);

                            return (
                                <div
                                    key={pageNumber}
                                    className={cn(
                                        'relative cursor-pointer transition-all duration-200 rounded-lg overflow-hidden',
                                        'hover:shadow-lg hover:scale-105',
                                        isSelected && 'ring-2 ring-primary shadow-lg scale-105',
                                        onPageSelect && 'hover:ring-1 hover:ring-primary/50'
                                    )}
                                    onClick={() => handlePageClick(pageNumber)}
                                >
                                    <div className="relative bg-white rounded-lg shadow-sm">
                                        <Page
                                            pageNumber={pageNumber}
                                            width={150}
                                            height={200}
                                            onLoadSuccess={() => onPageLoadSuccess(pageNumber)}
                                            loading={<SkeletonLoader variant="image" className="h-[200px]" />}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                        />

                                        {/* Page number overlay */}
                                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                      <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {pageNumber}
                      </span>
                                        </div>

                                        {/* Selection indicator */}
                                        {isSelected && (
                                            <div className="absolute top-2 right-2">
                                                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}

                                        {/* Loading overlay */}
                                        {!isLoaded && (
                                            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                                                <LoadingSpinner size="sm" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Document>
        </div>
    );
};

export default PDFPreview;