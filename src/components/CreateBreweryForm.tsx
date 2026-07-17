"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBreweryContext } from "@/context/brewery-beer";
import { useToast } from "@/context/toast";
import createBrewery from "@/lib/createBrewery";
import saveImage from "@/lib/supabase/saveImage";
import { deleteImage } from "@/lib/supabase/deleteImage";
import { ImagePlus, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_NAME_LENGTH = 80;

type Props = { onClose: () => void };

export default function CreateBreweryForm({ onClose }: Props) {
  const [companyName, setCompanyName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ companyName?: string; image?: string; submit?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session, update } = useSession();
  const { selectBrewery } = useBreweryContext();
  const { addToast } = useToast();

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const chooseImage = (file: File | null) => {
    setErrors((current) => ({ ...current, image: undefined, submit: undefined }));
    if (!file) return;
    const rejectFile = (message: string) => {
      if (preview) URL.revokeObjectURL(preview);
      setImage(null);
      setPreview(null);
      setErrors((current) => ({ ...current, image: message }));
    };
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return rejectFile("Choose a JPG, PNG, WebP, or GIF image.");
    }
    if (file.size === 0) return rejectFile("Choose a non-empty image file.");
    if (file.size > MAX_IMAGE_SIZE) return rejectFile("Image must be smaller than 5 MB.");
    if (preview) URL.revokeObjectURL(preview);
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    const trimmedName = companyName.trim();
    if (trimmedName.length < 2 || trimmedName.length > MAX_NAME_LENGTH) {
      setErrors((current) => ({ ...current, companyName: `Brewery name must be between 2 and ${MAX_NAME_LENGTH} characters.` }));
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    let uploadedImage: string | null | undefined;
    try {
      uploadedImage = image ? await saveImage({ file: image }) : undefined;
      if (image && !uploadedImage) throw new Error("The logo could not be uploaded. Please try again.");
      const response = (await createBrewery({
        brewery: { companyName: trimmedName, image: uploadedImage ?? undefined },
        accessToken: session?.user?.accessToken as string,
      })) as any;
      if (!response?.savedBrewery?._id) throw new Error("The brewery could not be created.");

      await update({ newBreweryId: response.savedBrewery._id });
      await selectBrewery(response.savedBrewery, {
        route: `/dashboard/breweries/${response.savedBrewery._id}`,
      });
      addToast(`${response.savedBrewery.companyName} successfully created!`, "success");
      onClose();
    } catch (error) {
      if (uploadedImage) await deleteImage(uploadedImage);
      const message = error instanceof Error ? error.message : "Unable to create brewery.";
      setErrors((current) => ({ ...current, submit: message }));
      addToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-col gap-5 text-foreground" noValidate>
      <div className="flex flex-col items-center gap-3">
        <Label htmlFor="brewery-image" className="cursor-pointer rounded-full focus-within:ring-2 focus-within:ring-ring">
          <span className="relative flex size-28 items-center justify-center overflow-hidden rounded-full border bg-muted">
            {preview ? <Image src={preview} alt="New brewery logo preview" fill className="object-cover" /> : <ImagePlus className="size-10 text-muted-foreground" aria-hidden="true" />}
          </span>
          <span className="mt-2 block text-center text-sm font-medium">Choose logo</span>
        </Label>
        <Input id="brewery-image" type="file" accept={ALLOWED_IMAGE_TYPES.join(",")} className="sr-only" onChange={(event) => chooseImage(event.target.files?.[0] ?? null)} />
        {errors.image ? <p className="text-sm text-destructive" role="alert">{errors.image}</p> : <p className="text-xs text-muted-foreground">JPG, PNG, WebP, or GIF. Up to 5 MB.</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="brewery-name">Brewery name</Label>
        <Input id="brewery-name" value={companyName} maxLength={MAX_NAME_LENGTH + 1} autoFocus autoComplete="organization" aria-invalid={!!errors.companyName} aria-describedby={errors.companyName ? "brewery-name-error" : undefined} onChange={(event) => { setCompanyName(event.target.value); setErrors((current) => ({ ...current, companyName: undefined, submit: undefined })); }} placeholder="e.g. North Shore Brewing" />
        {errors.companyName && <p id="brewery-name-error" className="text-sm text-destructive" role="alert">{errors.companyName}</p>}
      </div>

      {errors.submit && <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" role="alert">{errors.submit}</div>}

      <div className="sticky bottom-0 flex flex-col-reverse gap-2 bg-background pb-[max(0px,env(safe-area-inset-bottom))] pt-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="size-4 animate-spin" />}Create brewery</Button>
      </div>
    </form>
  );
}
