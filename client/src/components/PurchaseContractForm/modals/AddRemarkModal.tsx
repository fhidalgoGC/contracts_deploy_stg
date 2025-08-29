import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';

interface AddRemarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRemark: (remarkType: string, content: string) => void;
  currentRemarks: string[];
}

const REMARK_TYPES = [
  { value: 'contact', label: 'Contact' },
  { value: 'shipment', label: 'Shipment' },
  { value: 'routing', label: 'Routing' },
  { value: 'prem_disc', label: 'Prem/Disc' },
  { value: 'terms', label: 'Terms' },
  { value: 'remarks', label: 'Remarks' },
];

export function AddRemarkModal({ isOpen, onClose, onAddRemark, currentRemarks }: AddRemarkModalProps) {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<string>('');
  const [remarkContent, setRemarkContent] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Extract already used remark types from current remarks
  const usedRemarkTypes = (currentRemarks || [])
    .filter(remark => !remark.startsWith('COMMENT:'))
    .map(remark => {
      // Extract the label from remarks that have the format "Label:content" or just "Label"
      if (remark.includes(':')) {
        return remark.split(':')[0];
      }
      return remark;
    });

  const availableRemarkTypes = REMARK_TYPES.filter(type => 
    !usedRemarkTypes.includes(type.label)
  );

  const filteredRemarkTypes = availableRemarkTypes.filter(type =>
    type.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    if (selectedType) {
      const selectedRemarkType = REMARK_TYPES.find(type => type.value === selectedType);
      onAddRemark(selectedType, selectedRemarkType?.label || selectedType);
      
      // Reset form
      setSelectedType('');
      setRemarkContent('');
      setSearchTerm('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedType('');
    setRemarkContent('');
    setSearchTerm('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Add Remark
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Remark Type Select */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              Remark Type <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="h-10 border-gray-300 focus:border-green-500">
                <SelectValue placeholder="Select remark type" />
              </SelectTrigger>
              <SelectContent>
                {availableRemarkTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleAdd}
            disabled={!selectedType}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Remark
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}