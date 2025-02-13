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
  value?: File[] | string;
  onValueChange?: (files: File[] | string | null) => void;
  onUpload?: (files: File[] | string) => Promise<void>;
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

  const isFileArray = Array.isArray(value);
  const isSingleString = typeof value === "string";

  const onDrop = (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (!multiple && maxFiles === 1 && acceptedFiles.length > 1) {
      toast.error("Cannot upload more than 1 file at a time");
      return;
    }

    if (isFileArray && value.length + acceptedFiles.length > maxFiles) {
      toast.error(`Cannot upload more than ${maxFiles} files`);
      return;
    }

    const newFiles = acceptedFiles.map((file) =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );

    const updatedFiles = isFileArray ? [...value, ...newFiles] : newFiles;

    onValueChange?.(updatedFiles);

    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file }) => {
        toast.error(`File ${file.name} was rejected`);
      });
    }

    if (onUpload && updatedFiles.length > 0) {
      toast.promise(onUpload(updatedFiles), {
        loading: `Uploading ${updatedFiles.length} files...`,
        success: "Upload successful!",
        error: "Failed to upload files",
      });
    }
  };

  function onRemove(index: number) {
    if (!isFileArray) return;
    const newFiles = value.filter((_, i) => i !== index);
    onValueChange?.(newFiles.length ? newFiles : null);
  }

  function onRemoveString() {
    onValueChange?.(null);
  }

  return (
    <div className="relative flex flex-col gap-6 overflow-hidden">
      <Dropzone
        onDrop={onDrop}
        accept={accept}
        maxSize={maxSize}
        maxFiles={maxFiles}
        multiple={maxFiles > 1 || multiple}
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
                  Drop the files here
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
                  Drag & drop files here, or click to select
                </p>
              </div>
            )}
          </div>
        )}
      </Dropzone>

      <ScrollArea className="h-fit w-full px-3">
        <div className="max-h-48 space-y-4">
          {isFileArray &&
            value.map((file, index) => (
              <FileCard
                key={index}
                file={file}
                onRemove={() => onRemove(index)}
                progress={progresses?.[file.name]}
              />
            ))}

          {isSingleString && (
            <FileCard
              file={value}
              onRemove={onRemoveString}
              progress={progresses?.[value]}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface FileCardProps {
  file: File | string;
  onRemove: () => void;
  progress?: number;
}

function FileCard({ file, progress, onRemove }: FileCardProps) {
  const isFile = file instanceof File;
  const fileName = isFile ? file.name : extractFileName(file);

  return (
    <div className="relative flex items-center space-x-4">
      <div className="flex flex-1 space-x-4">
        {isFile ? (
          <Image
            src={URL.createObjectURL(file)}
            alt={file.name}
            width={48}
            height={48}
            loading="lazy"
            className="aspect-square shrink-0 rounded-md object-cover"
          />
        ) : null}
        <div className="flex w-full flex-col gap-2">
          <div className=" flex flex-1 items-center gap-2">
            <Image
              src={file as string}
              alt={fileName}
              width={48}
              height={48}
              loading="lazy"
              className="aspect-square shrink-0 rounded-md object-cover "
            />

            <p className="line-clamp-1 text-sm font-medium text-foreground/80">
              {fileName}
            </p>
          </div>
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

function extractFileName(filePath: string): string {
  const parts = filePath.split("_");
  return parts.length > 1 ? parts[1] : filePath;
}
