"use client";

import { CrossIcon, UploadIcon, X } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import Dropzone, {
  type DropzoneProps,
  type FileRejection,
} from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import ImageDisplay from "./ImageDisplay/ImageDisplay";

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string | File;
  onValueChange?: (file: string | null) => void;
  onUpload?: (file: string) => Promise<void>;
  setUploadedFile?: (files: File) => void;
  progresses?: Record<string, number>;
  accept?: DropzoneProps["accept"];
  maxSize?: DropzoneProps["maxSize"];
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
}

export function FileUploader(props: FileUploaderProps) {
  const {
    value,
    onValueChange,
    setUploadedFile,
    onUpload,
    progresses,
    accept = { "image/*": [] },
    maxSize = 1024 * 1024 * 2,
    maxFiles = 1,
    multiple = false,
    disabled = false,
    className,
    ...dropzoneProps
  } = props;

  const [fileName, setFileName] = React.useState<string | null>(null);
  const isSingleString = typeof value === "string";

  const onDrop = (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (acceptedFiles.length !== 1) {
      toast.error("Please upload a single image file");
      return;
    }

    const file = acceptedFiles[0];
    setUploadedFile?.(file);
    const fileURL = URL.createObjectURL(file);
    setFileName(file.name);
    onValueChange?.(fileURL);

    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file }) => {
        toast.error(`File ${file.name} was rejected`);
      });
    }

    if (onUpload) {
      toast.promise(onUpload(fileURL), {
        loading: "Uploading file...",
        success: "Upload successful!",
        error: "Failed to upload file",
      });
    }
  };

  function onRemove() {
    onValueChange?.(null);
  }

  return (
    <div className="relative flex flex-col gap-6 overflow-hidden">
      <Dropzone
        onDrop={onDrop}
        accept={accept}
        maxSize={maxSize}
        maxFiles={1}
        multiple={false}
        disabled={disabled}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div
            {...getRootProps()}
            className={cn(
              "group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25",
              "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isDragActive && "border-muted-foreground/50",
              disabled && "pointer-events-none opacity-60",
              className
            )}
            {...dropzoneProps}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                <div className="rounded-full border border-dashed p-3">
                  <UploadIcon
                    className="size-7 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <p className="font-medium text-muted-foreground">
                  Drop the file here
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                <div className="rounded-full border border-dashed p-3">
                  <UploadIcon
                    className="size-7 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <p className="font-medium text-muted-foreground">
                  Drag & drop an image here, or click to select
                </p>
              </div>
            )}
          </div>
        )}
      </Dropzone>

      <ScrollArea className="h-fit w-full px-3">
        <div className="max-h-48 space-y-4">
          {isSingleString && (
            <FileCard
              file={value}
              fileName={fileName}
              onRemove={onRemove}
              progress={progresses?.[value]}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface FileCardProps {
  file: string | File;
  fileName: string | null;
  onRemove: () => void;
  progress?: number;
}

function FileCard({ file, fileName, progress, onRemove }: FileCardProps) {
  function extractFileName(filePath: string | null): string {
    if (filePath) return filePath;

    const parts = (file as string).split("_");
    return parts.length > 1 ? parts[1] : (file as string);
  }

  return (
    <div className="relative flex items-center space-x-4">
      <div className="flex w-full flex-col gap-2">
        <div className=" flex flex-1 items-center gap-2">
          <Image
            src={file as string}
            alt="Uploaded Image"
            width={50}
            height={50}
            loading="lazy"
            className="aspect-square shrink-0 rounded-md object-cover"
          />
          <p className="line-clamp-1 text-sm font-medium text-foreground/80 ">
            {extractFileName(fileName)}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          {progress ? <Progress value={progress} /> : null}
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-7"
        onClick={onRemove}
      >
        <X className="size-4" aria-hidden="true" />
        <span className="sr-only">Remove file</span>
      </Button>
    </div>
  );
}
