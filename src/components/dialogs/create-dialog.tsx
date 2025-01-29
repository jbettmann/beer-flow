import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { ReactNode } from "react";

interface CreateDialogProps {
  triggerAction: ReactNode;
  title: string;
  description: string;
  content: ReactNode;
  footerAction: ReactNode;
}

export function CreateDialog({
  triggerAction,
  title,
  description,
  content,
  footerAction,
}: CreateDialogProps) {
  return (
    <Dialog>
      <DialogTrigger>{triggerAction}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {content}
        <DialogFooter>{footerAction}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
