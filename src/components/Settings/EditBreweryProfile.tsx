"use client";

import ImageDisplay from "@/components/ImageDisplay/ImageDisplay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBreweryContext } from "@/context/brewery-beer";
import { useToast } from "@/context/toast";
import getSingleBrewery from "@/lib/getSingleBrewery";
import updateBreweryInfo from "@/lib/PUT/updateBreweryInfo";
import saveImage from "@/lib/supabase/saveImage";
import { deleteImage } from "@/lib/supabase/deleteImage";
import { getInitials } from "@/lib/utils";
import { Brewery } from "@/types/brewery";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import useSWR from "swr";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_NAME_LENGTH = 80;

export default function EditBreweryProfile({ brewery, onClose }: { brewery: Brewery; onClose: () => void }) {
  const [companyName, setCompanyName] = useState(brewery.companyName ?? "");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ companyName?: string; image?: string; submit?: string }>({});
  const [saving, setSaving] = useState(false);
  const { data: session } = useSession();
  const { addToast } = useToast();
  const { setSelectedBrewery } = useBreweryContext();
  const { mutate } = useSWR([`https://beer-bible-api.vercel.app/breweries/${brewery._id}`], getSingleBrewery);

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
    if (!IMAGE_TYPES.includes(file.type)) return rejectFile("Choose a JPG, PNG, WebP, or GIF image.");
    if (file.size === 0) return rejectFile("Choose a non-empty image file.");
    if (file.size > MAX_IMAGE_SIZE) return rejectFile("Image must be smaller than 5 MB.");
    if (preview) URL.revokeObjectURL(preview);
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const trimmedName = companyName.trim();
    if (trimmedName.length < 2 || trimmedName.length > MAX_NAME_LENGTH) return setErrors((current) => ({ ...current, companyName: `Brewery name must be between 2 and ${MAX_NAME_LENGTH} characters.` }));
    const changed = trimmedName !== brewery.companyName || !!image;
    if (!changed) return onClose();

    setSaving(true);
    setErrors({});
    let uploadedImage: string | null | undefined;
    let updateCommitted = false;
    try {
      const updatedBrewery = { ...brewery, companyName: trimmedName };
      if (image) {
        uploadedImage = await saveImage({ file: image });
        if (!uploadedImage) throw new Error("The logo could not be uploaded. Please try again.");
        updatedBrewery.image = uploadedImage;
      }
      const saved = await updateBreweryInfo({ breweryId: brewery._id, updatedBrewery, accessToken: session?.user.accessToken });
      if (!saved) throw new Error("The brewery could not be updated.");
      updateCommitted = true;
      if (uploadedImage && brewery.image) await deleteImage(brewery.image);
      await mutate(saved, false);
      setSelectedBrewery(saved);
      addToast("Brewery info updated", "success");
      onClose();
    } catch (error) {
      if (uploadedImage && !updateCommitted) await deleteImage(uploadedImage);
      const message = error instanceof Error ? error.message : "Unable to update brewery.";
      setErrors((current) => ({ ...current, submit: message }));
      addToast(message, "error");
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="flex flex-col items-center gap-3">
        <div className="relative size-28 overflow-hidden rounded-full border bg-muted">
          {preview ? <Image src={preview} alt="New brewery logo preview" fill className="object-cover" /> : brewery.image ? <ImageDisplay item={brewery} className="size-28 object-cover" /> : <span className="flex size-full items-center justify-center text-2xl font-semibold">{getInitials(companyName)}</span>}
        </div>
        <Label htmlFor="edit-brewery-image" className="cursor-pointer rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent">Change logo</Label>
        <Input id="edit-brewery-image" className="sr-only" type="file" accept={IMAGE_TYPES.join(",")} onChange={(event) => chooseImage(event.target.files?.[0] ?? null)} />
        {errors.image && <p className="text-sm text-destructive" role="alert">{errors.image}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-brewery-name">Brewery name</Label>
        <Input id="edit-brewery-name" value={companyName} maxLength={MAX_NAME_LENGTH + 1} autoComplete="organization" aria-invalid={!!errors.companyName} onChange={(event) => { setCompanyName(event.target.value); setErrors((current) => ({ ...current, companyName: undefined, submit: undefined })); }} />
        {errors.companyName && <p className="text-sm text-destructive" role="alert">{errors.companyName}</p>}
      </div>
      {errors.submit && <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" role="alert">{errors.submit}</div>}
      <div className="sticky bottom-0 flex flex-col-reverse gap-2 bg-background pb-[max(0px,env(safe-area-inset-bottom))] pt-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving && <Loader2 className="size-4 animate-spin" />}Save changes</Button>
      </div>
    </form>
  );
}
