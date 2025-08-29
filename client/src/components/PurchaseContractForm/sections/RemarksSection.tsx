import React, { useState, useEffect, useRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, MessageSquare, Search } from 'lucide-react';
import type { PurchaseSaleContract } from '@/types/purchaseSaleContract.types';
import { AddRemarkModal } from '../modals/AddRemarkModal';
import { RemarkListModal } from '../modals/RemarkListModal';

interface RemarksSectionProps {
  addRemark: () => void;
  removeRemark: (index: number) => void;
  updateRemark: (index: number, value: string) => void;
  addComment: () => void;
}

export function RemarksSection({ 
  addRemark, 
  removeRemark, 
  updateRemark,
  addComment 
}: RemarksSectionProps) {
  const { t } = useTranslation();
  const { watch, setValue, control } = useFormContext<PurchaseSaleContract>();
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [isRemarkListModalOpen, setIsRemarkListModalOpen] = useState(false);
  const [selectedRemarkType, setSelectedRemarkType] = useState<string>('');
  const [currentRemarkIndex, setCurrentRemarkIndex] = useState<number>(-1);
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  
  const remarks = watch('remarks') || [];

  // Function to auto-resize textarea
  const autoResizeTextarea = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${Math.max(48, element.scrollHeight)}px`;
  };

  // Effect to resize textareas when content changes
  useEffect(() => {
    textareaRefs.current.forEach((textarea) => {
      if (textarea) {
        autoResizeTextarea(textarea);
      }
    });
  }, [remarks]);
  
  // Check if there's already a comment
  const hasComment = remarks.some(remark => remark.startsWith('COMMENT:'));

  const handleAddRemark = (remarkType: string, content: string) => {
    addRemark();
    const currentRemarks = watch('remarks') || [];
    const newIndex = currentRemarks.length - 1;
    updateRemark(newIndex, content);
  };

  const handleAddComment = () => {
    const currentRemarks = watch('remarks') || [];
    const newComment = 'COMMENT:';
    setValue('remarks', [...currentRemarks, newComment]);
  };

  const handleOpenRemarkList = (index: number) => {
    // Extract remark type from the remark content
    const remarkContent = remarks[index] || '';
    let remarkType = 'general';
    
    // Map the remark label to the correct type value for the modal
    const typeMapping: Record<string, string> = {
      'Delivery Instructions': 'delivery',
      'Quality Requirements': 'quality',
      'Payment Terms': 'payment',
      'Inspection Requirements': 'inspection',
      'Shipping Instructions': 'shipping',
      'Storage Requirements': 'storage',
      'Grading Specifications': 'grading',
      'Contract Conditions': 'contract',
      'General Notes': 'general',
      'Special Instructions': 'special'
    };
    
    // Find the correct type based on the remark label
    remarkType = typeMapping[remarkContent] || 'general';
    
    setSelectedRemarkType(remarkType);
    setCurrentRemarkIndex(index);
    setIsRemarkListModalOpen(true);
  };

  const handleSelectFromList = (remarkContent: string) => {
    if (currentRemarkIndex >= 0) {
      const currentRemark = remarks[currentRemarkIndex];
      let remarkLabel = currentRemark;
      
      // Extract just the label if there's already content
      if (currentRemark.includes(':')) {
        remarkLabel = currentRemark.split(':')[0];
      }
      
      // Replace completely with the new selected content
      updateRemark(currentRemarkIndex, `${remarkLabel}:${remarkContent}`);
      
      // Auto-resize textarea after content update
      setTimeout(() => {
        const textarea = textareaRefs.current[currentRemarkIndex];
        if (textarea) {
          autoResizeTextarea(textarea);
        }
      }, 0);
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <MessageSquare className="w-5 h-5" />
          {t('remarks')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('remarks')}
          </Label>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setIsRemarkModalOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Remarks
            </Button>
            {!hasComment && (
              <Button
                type="button"
                onClick={handleAddComment}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Comentario
              </Button>
            )}
          </div>
        </div>

{(() => {
          // Separate remarks and comments with their original indices
          const remarksWithIndex = remarks
            .map((remark, index) => ({ remark, originalIndex: index }))
            .filter(item => !item.remark.startsWith('COMMENT:'));
          
          const commentsWithIndex = remarks
            .map((remark, index) => ({ remark, originalIndex: index }))
            .filter(item => item.remark.startsWith('COMMENT:'));
          
          // Combine them with remarks first, then comments
          const orderedItems = [...remarksWithIndex, ...commentsWithIndex];
          
          return orderedItems.map(({ remark, originalIndex }) => {
            const isComment = remark.startsWith('COMMENT:');
            
            let displayValue = '';
            let remarkLabel = 'Remark';
            
            if (isComment) {
              displayValue = remark.replace('COMMENT:', '');
            } else {
              // For remarks, check if it has content after the colon
              if (remark.includes(':')) {
                const parts = remark.split(':');
                remarkLabel = parts[0];
                displayValue = parts.slice(1).join(':'); // In case content has colons
              } else {
                // No content yet, just the label
                remarkLabel = remark;
                displayValue = '';
              }
            }
            
            return (
              <div key={`remark-${originalIndex}`} className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  {isComment ? 'Comentario' : `(${remarkLabel})`}
                </Label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    {isComment ? (
                      <textarea
                        value={displayValue}
                        onChange={(e) => updateRemark(originalIndex, `COMMENT:${e.target.value}`)}
                        className="w-full h-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm resize-none focus:border-green-500 focus:outline-none dark:bg-gray-800 dark:text-white"
                        placeholder={`Enter your comment here...`}
                      />
                    ) : (
                      <textarea
                        ref={(el) => textareaRefs.current[originalIndex] = el}
                        value={displayValue}
                        onChange={(e) => updateRemark(originalIndex, `${remarkLabel}:${e.target.value}`)}
                        className="w-full min-h-[3rem] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm resize-none focus:border-green-500 focus:outline-none dark:bg-gray-800 dark:text-white"
                        placeholder={`Enter ${remarkLabel.toLowerCase()} details...`}
                        rows={2}
                        style={{
                          height: 'auto',
                          minHeight: '3rem'
                        }}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          autoResizeTextarea(target);
                        }}
                      />
                    )}
                  </div>
                  {!isComment && (
                    <Button
                      type="button"
                      onClick={() => handleOpenRemarkList(originalIndex)}
                      variant="outline"
                      size="sm"
                      className="text-gray-600 hover:text-gray-700 border-gray-300 mt-0"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={() => removeRemark(originalIndex)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 mt-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          });
        })()}

        {remarks.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>{t('noRemarksYet')}. {t('clickAddRemark')}.</p>
          </div>
        )}

        <AddRemarkModal
          isOpen={isRemarkModalOpen}
          onClose={() => setIsRemarkModalOpen(false)}
          onAddRemark={handleAddRemark}
          currentRemarks={remarks}
        />

        <RemarkListModal
          isOpen={isRemarkListModalOpen}
          onClose={() => setIsRemarkListModalOpen(false)}
          onSelectRemark={handleSelectFromList}
          remarkType={selectedRemarkType}
        />
      </CardContent>
    </Card>
  );
}