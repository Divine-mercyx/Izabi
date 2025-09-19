export interface PDFSelection {
  file: File;
  selectedPages: number[];
  selectedText: Array<{
    text: string;
    page: number;
    startIndex: number;
    endIndex: number;
  }>;
  selectionType: 'pages' | 'text' | 'both';
  metadata: {
    totalPages: number;
    fileName: string;
    fileSize: number;
  };
}

export interface ErrorType {
  id: string;
  type: 'validation' | 'backend' | 'network';
  message: string;
  details?: string;
  timestamp: number;
}

export interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  previewImage?: string;
  questionCount: number;
  createdAt: string;
}