
import React from 'react';
import { Textarea } from "@/components/ui/textarea";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export const Editor: React.FC<EditorProps> = ({ 
  value, 
  onChange, 
  placeholder,
  className = "",
  minHeight = "200px"
}) => {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${className} min-h-[${minHeight}]`}
    />
  );
};
