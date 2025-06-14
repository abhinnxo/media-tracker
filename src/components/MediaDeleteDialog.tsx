
import React from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";

interface MediaDeleteDialogProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export const MediaDeleteDialog: React.FC<MediaDeleteDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title = "Delete item?",
  description = "Are you sure? This action cannot be undone.",
  isLoading = false,
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} disabled={isLoading} className="bg-destructive">
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
