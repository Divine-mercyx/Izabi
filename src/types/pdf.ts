export interface PDFSelection {
  selectedPages: number[]; // Pages user selected
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
  estimatedTime: number; // in minutes
  previewImage?: string;
  questionCount: number;
  createdAt: string; // ISO date string
}

// Optional: API response types for study questions
export interface StudyQuestionResponse {
  question: string;
  options: string[];
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionType: 'multiple_choice' | 'true_false' | 'short_answer' | string;
}
