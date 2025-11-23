"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CreateContentButtonProps {
  type: 'stream' | 'task';
  onClick: () => void;
  className?: string;
}

export default function CreateContentButton({ type, onClick, className }: CreateContentButtonProps) {
  return (
    <Button onClick={onClick} className={className}>
      <Plus className="h-4 w-4 mr-2" />
      Create {type === 'stream' ? 'Stream' : 'Task'}
    </Button>
  );
}