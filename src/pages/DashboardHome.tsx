import React, { useState } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BASE_URL } from "@/contants/contants.ts";
import { Upload, FileText, Brain, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface StudyQuestionResponse {
  question: string;
  options: string[];
  answer: string;
  difficulty: string;
  questionType: string;
}

const DashboardHome = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [questions, setQuestions] = useState<StudyQuestionResponse[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);

  const userId = localStorage.getItem("userId");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
      console.log("File uploaded:", file.name);
    }
  };

  const handleRequest = async (endpoint: string, includeQuestions = false) => {
    if (!uploadedFile || !userId) return;
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("userId", userId);
      if (includeQuestions) formData.append("numberOfQuestions", "5");

      const { data } = await axios.post(`${BASE_URL}/api/study/${endpoint}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log(`[${endpoint}] response:`, data);

      // Handle summary
      if (data.summary) {
        setSummary(data.summary);
        setShowSummary(true);
      }

      // Handle questions
      let questionsData: StudyQuestionResponse[] = [];

      if (Array.isArray(data)) {
        // backend returns array directly
        questionsData = data;
      } else if (Array.isArray(data.questions)) {
        questionsData = data.questions;
      } else if (Array.isArray(data.studyQuestions)) {
        // in case backend wraps differently
        questionsData = data.studyQuestions;
      }

      if (questionsData.length > 0) {
        setQuestions(questionsData);
        setShowQuestions(true);
      } else if (includeQuestions) {
        console.warn("No questions returned from backend", data);
        setQuestions([]);
        setShowQuestions(false);
      }

    } catch (err) {
      console.error(`Error calling ${endpoint}:`, err);
      alert(`Error: ${err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getQuestionTypeIcon = (questionType: string) => {
    switch (questionType?.toLowerCase()) {
      case 'multiple_choice':
      case 'multiple choice': return '🔘';
      case 'true_false':
      case 'true false': return '✓/✗';
      case 'short_answer':
      case 'short answer': return '✍️';
      default: return '❓';
    }
  };

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">
            Upload your PDFs and let AI transform them into summaries and quizzes
          </p>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-primary" />
              <span>Upload PDF</span>
            </CardTitle>
            <CardDescription>
              Select a PDF file to start your AI-powered learning experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="pdf-upload"
              />
              <label htmlFor="pdf-upload" className="cursor-pointer block">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">
                  {uploadedFile ? uploadedFile.name : "Choose PDF file"}
                </p>
                <p className="text-muted-foreground">
                  {uploadedFile ? "File ready for processing" : "Click to browse or drag and drop"}
                </p>
              </label>
            </div>

            {uploadedFile && (
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  <Button
                      onClick={() => handleRequest("summarize")}
                      disabled={isProcessing}
                      variant="hero"
                      className="flex-1"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    {isProcessing ? "Processing..." : "Generate Summary"}
                  </Button>

                  <Button
                      onClick={() => handleRequest("generate-questions", true)}
                      disabled={isProcessing}
                      variant="secondary"
                      className="flex-1"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {isProcessing ? "Processing..." : "Generate Questions"}
                  </Button>

                  <Button
                      onClick={() => handleRequest("generate-study-material", true)}
                      disabled={isProcessing}
                      variant="outline"
                      className="flex-1"
                  >
                    Generate Study Material
                  </Button>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {(summary || questions.length > 0) && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Generated Content</h2>

              {/* Summary */}
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

              {/* Questions */}
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
                                <div key={index} className="p-4 bg-muted/30 rounded-lg border-l-4 border-primary">
                                  <div className="flex items-start justify-between mb-3">
                                    <p className="font-medium text-foreground flex-1">
                                      {index + 1}. {q.question}
                                    </p>
                                    <div className="flex items-center space-x-2 ml-4">
                                      <span className="text-xs">{getQuestionTypeIcon(q.questionType)}</span>
                                      <span className={`text-xs font-medium ${getDifficultyColor(q.difficulty)}`}>
                                {q.difficulty}
                              </span>
                                    </div>
                                  </div>

                                  <div className="text-xs text-muted-foreground mb-2">
                                    Type: {q.questionType?.replace('_', ' ') || 'Unknown'}
                                  </div>

                                  {q.options?.length > 0 && (
                                      <div className="mb-3">
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Options:</p>
                                        <ul className="space-y-1">
                                          {q.options.map((option, idx) => (
                                              <li key={idx} className="text-sm flex items-center">
                                    <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium mr-2">
                                      {String.fromCharCode(65 + idx)}
                                    </span>
                                                {option}
                                              </li>
                                          ))}
                                        </ul>
                                      </div>
                                  )}

                                  {q.answer && (
                                      <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-2 border-green-500">
                                        <p className="text-sm">
                                          <span className="font-medium text-green-700 dark:text-green-400">Answer: </span>
                                          <span className="text-green-800 dark:text-green-300">{q.answer}</span>
                                        </p>
                                      </div>
                                  )}
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
