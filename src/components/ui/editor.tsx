
import React from 'react';
import { Textarea } from "@/components/ui/textarea";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange, placeholder }) => {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="min-h-[200px]"
    />
  );
};
