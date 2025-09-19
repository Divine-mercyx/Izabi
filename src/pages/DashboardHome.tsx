import React, { useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BASE_URL } from "@/contants/contants.ts";
import { FileText, Brain, Zap, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import PDFUploadSection from "@/components/pdf/PDFUploadSection";
import { PDFSelection, StudyQuestionResponse } from "@/types/pdf";
import { ErrorList } from "@/components/ui/error-display";
import { useApiError } from "@/hooks/useApiError";

const DashboardHome = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [questions, setQuestions] = useState<StudyQuestionResponse[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [pdfSelection, setPdfSelection] = useState<PDFSelection | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const { errors, addError, clearError } = useApiError();
  const userId = localStorage.getItem("userId");

  const handleSelectionComplete = ({ selection, file }: { selection: PDFSelection; file: File }) => {
    setPdfSelection(selection);
    setPdfFile(file);
    console.log("PDF selection completed:", selection);
  };

  const handleRequest = async (endpoint: string, includeQuestions = false) => {
    if (!pdfFile || !userId || !pdfSelection) {
      addError({ message: "Please upload and select a PDF first", type: "validation" });
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("userId", userId);
      if (includeQuestions) {
        formData.append("numberOfQuestions", String(pdfSelection.numberOfQuestions || 5));
      }

      const { data } = await axios.post(`${BASE_URL}/api/study/${endpoint}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.summary) {
        setSummary(data.summary);
        setShowSummary(true);
      }

      let questionsData: StudyQuestionResponse[] = [];
      if (Array.isArray(data)) questionsData = data;
      else if (Array.isArray(data.questions)) questionsData = data.questions;
      else if (Array.isArray(data.studyQuestions)) questionsData = data.studyQuestions;

      if (questionsData.length > 0) {
        setQuestions(questionsData);
        setShowQuestions(true);
      } else if (includeQuestions) {
        setQuestions([]);
        setShowQuestions(false);
      }
    } catch (err) {
      addError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "hard": return "text-red-600";
      default: return "text-muted-foreground";
    }
  };

  const getQuestionTypeIcon = (questionType: string) => {
    switch (questionType?.toLowerCase()) {
      case "multiple_choice":
      case "multiple choice": return "🔘";
      case "true_false":
      case "true false": return "✓/✗";
      case "short_answer":
      case "short answer": return "✍️";
      default: return "❓";
    }
  };

  return (
      <div className="space-y-6">
        <ErrorList errors={errors} onDismiss={clearError} />

        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">
            Upload your PDFs and let AI transform them into personalized study materials
          </p>
        </div>

        <PDFUploadSection onSelectionComplete={handleSelectionComplete} />

        {pdfSelection && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span>AI Study Tools</span>
                </CardTitle>
                <CardDescription>
                  Generate personalized study materials from your selected content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                      onClick={() => handleRequest("summarize")}
                      disabled={isProcessing}
                      variant="hero"
                      className="h-20 flex-col space-y-2"
                  >
                    <Brain className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-medium">Smart Summary</div>
                      <div className="text-xs opacity-75">Key concepts & insights</div>
                    </div>
                  </Button>

                  <Button
                      onClick={() => handleRequest("generate-questions", true)}
                      disabled={isProcessing}
                      variant="secondary"
                      className="h-20 flex-col space-y-2"
                  >
                    <Zap className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-medium">Practice Quiz</div>
                      <div className="text-xs opacity-75">Test your knowledge</div>
                    </div>
                  </Button>

                  <Button
                      onClick={() => handleRequest("generate-study-material", true)}
                      disabled={isProcessing}
                      variant="outline"
                      className="h-20 flex-col space-y-2"
                  >
                    <FileText className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-medium">Study Guide</div>
                      <div className="text-xs opacity-75">Complete materials</div>
                    </div>
                  </Button>
                </div>

                {isProcessing && (
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                        <span className="text-sm">Processing your content with AI...</span>
                      </div>
                    </div>
                )}
              </CardContent>
            </Card>
        )}

        {(summary || questions.length > 0) && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Generated Content</h2>

              {summary && (
                  <Collapsible open={showSummary} onOpenChange={setShowSummary}>
                    <Card>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Brain className="h-5 w-5 text-learning-blue" />
                              <span>AI Summary</span>
                            </div>
                            {showSummary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </CardTitle>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent>
                          <div className="prose max-w-none">
                            <p className="text-foreground leading-relaxed">{summary}</p>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
              )}

              {questions.length > 0 && (
                  <Collapsible open={showQuestions} onOpenChange={setShowQuestions}>
                    <Card>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Zap className="h-5 w-5 text-learning-green" />
                              <span>Generated Questions ({questions.length})</span>
                            </div>
                            {showQuestions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </CardTitle>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent>
                          <div className="space-y-4">
                            {questions.map((q, index) => (
                                <div key={index} className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                                  <p className="font-bold text-lg">{index + 1}. {q.question}</p>
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                    {q.options.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            className="p-2 bg-purple-100 hover:bg-purple-200 rounded shadow text-left"
                                        >
                                          {String.fromCharCode(65 + idx)}. {opt}
                                        </button>
                                    ))}
                                  </div>
                                  <div className="mt-2 text-sm text-muted-foreground">
                                    Difficulty: <span className={getDifficultyColor(q.difficulty)}>{q.difficulty}</span> | Type: {q.questionType.replace('_', ' ')}
                                  </div>
                                </div>
                            ))}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
              )}
            </div>
        )}
      </div>
  );
};

export default DashboardHome;
