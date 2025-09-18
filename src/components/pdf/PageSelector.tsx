import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckSquare, Square, Trash2 } from 'lucide-react';

interface PageSelectorProps {
  totalPages: number;
  selectedPages: number[];
  onSelectionChange: (pages: number[]) => void;
  className?: string;
}

export const PageSelector: React.FC<PageSelectorProps> = ({
  totalPages,
  selectedPages,
  onSelectionChange,
  className
}) => {
  const [rangeStart, setRangeStart] = useState<string>('');
  const [rangeEnd, setRangeEnd] = useState<string>('');
  const [rangeError, setRangeError] = useState<string>('');

  const handleSelectAll = () => {
    const allPages = Array.from({ length: totalPages }, (_, i) => i + 1);
    onSelectionChange(allPages);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const handleRangeSelect = () => {
    const start = parseInt(rangeStart);
    const end = parseInt(rangeEnd);

    // Validation
    if (!start || !end) {
      setRangeError('Please enter both start and end page numbers');
      return;
    }

    if (start < 1 || end > totalPages) {
      setRangeError(`Page numbers must be between 1 and ${totalPages}`);
      return;
    }

    if (start > end) {
      setRangeError('Start page must be less than or equal to end page');
      return;
    }

    setRangeError('');

    // Create range of pages
    const rangePages = Array.from(
      { length: end - start + 1 }, 
      (_, i) => start + i
    );

    // Merge with existing selections (remove duplicates)
    const newSelection = Array.from(
      new Set([...selectedPages, ...rangePages])
    ).sort((a, b) => a - b);

    onSelectionChange(newSelection);
    setRangeStart('');
    setRangeEnd('');
  };

  const handleRemovePage = (pageNumber: number) => {
    const newSelection = selectedPages.filter(page => page !== pageNumber);
    onSelectionChange(newSelection);
  };

  const getSelectionSummary = () => {
    if (selectedPages.length === 0) return 'No pages selected';
    if (selectedPages.length === 1) return `Page ${selectedPages[0]} selected`;
    if (selectedPages.length <= 5) {
      return `Pages ${selectedPages.join(', ')} selected`;
    }
    return `${selectedPages.length} pages selected`;
  };

  const getSelectionPercentage = () => {
    return Math.round((selectedPages.length / totalPages) * 100);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Page Selection</span>
          <Badge variant="secondary">
            {selectedPages.length}/{totalPages} pages
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="flex items-center space-x-2"
          >
            <CheckSquare className="h-4 w-4" />
            <span>Select All</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={selectedPages.length === 0}
            className="flex items-center space-x-2"
          >
            <Square className="h-4 w-4" />
            <span>Clear All</span>
          </Button>
        </div>

        <Separator />

        {/* Range Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Select Page Range</Label>
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <Label htmlFor="range-start" className="text-xs text-muted-foreground">
                From
              </Label>
              <Input
                id="range-start"
                type="number"
                min="1"
                max={totalPages}
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                placeholder="1"
                className="h-8"
              />
            </div>
            <span className="text-muted-foreground pb-2">to</span>
            <div className="flex-1">
              <Label htmlFor="range-end" className="text-xs text-muted-foreground">
                To
              </Label>
              <Input
                id="range-end"
                type="number"
                min="1"
                max={totalPages}
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                placeholder={totalPages.toString()}
                className="h-8"
              />
            </div>
            <Button
              size="sm"
              onClick={handleRangeSelect}
              disabled={!rangeStart || !rangeEnd}
              className="h-8"
            >
              Add Range
            </Button>
          </div>
          {rangeError && (
            <p className="text-sm text-destructive">{rangeError}</p>
          )}
        </div>

        <Separator />

        {/* Selection Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Selection Summary</span>
            <span className="text-sm text-muted-foreground">
              {getSelectionPercentage()}% of document
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {getSelectionSummary()}
          </p>

          {/* Selected Pages List */}
          {selectedPages.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Selected Pages:</Label>
              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                {selectedPages.map((pageNumber) => (
                  <Badge
                    key={pageNumber}
                    variant="secondary"
                    className="flex items-center space-x-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    onClick={() => handleRemovePage(pageNumber)}
                  >
                    <span>{pageNumber}</span>
                    <Trash2 className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Click on a page number to remove it from selection
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PageSelector;