"use client";

import { FileUploader } from "@/components/file-uploader";
import { MultiSelect } from "@/components/selects/multi-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useBreweryContext } from "@/context/brewery-beer";
import createBeer from "@/lib/createBeer";
import { onFormError } from "@/lib/handle-error";
import updateBeer from "@/lib/PUT/updateBeer";
import { hopSuggestions, maltSuggestions } from "@/lib/suggestionsDB";
import saveImage from "@/lib/supabase/saveImage";
import { updateImage } from "@/lib/supabase/updateImage";
import { Beer, NewBeer } from "@/types/beer";
import BeerFormSchema from "@/zod/beer-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Beer as BeerIcon,
  Hop,
  LayoutGrid,
  Percent,
  Tag,
  Wheat,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

type BeerSchemaValues = z.infer<typeof BeerFormSchema>;

export default function BeerForm({
  initialData,
  pageTitle,
}: {
  initialData: Beer | null;
  pageTitle: string;
}) {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const { selectedBrewery, mutateBeers, mutateBrewery } = useBreweryContext();
  const [beerImage, setBeerImage] = useState<File | string | null>(
    initialData?.image || null
  );

  const defaultValues: BeerSchemaValues = {
    _id: initialData?._id || undefined,
    name: initialData?.name || "",
    abv: initialData?.abv ?? undefined,
    ibu: initialData?.ibu ?? undefined,
    style: initialData?.style || "",
    malt: initialData?.malt || [],
    hops: initialData?.hops || [],
    description: initialData?.description || "",
    category: initialData?.category || [],
    nameSake: initialData?.nameSake || "",
    notes: initialData?.notes || "",
    image: initialData?.image || undefined,
    releasedOn: initialData?.releasedOn
      ? new Date(initialData.releasedOn)
      : null,
    archived: initialData?.archived ?? false,
  };
  const form = useForm<BeerSchemaValues>({
    resolver: zodResolver(BeerFormSchema),
    defaultValues: defaultValues,
  });

  async function onSubmit(values: BeerSchemaValues) {
    try {
      let beer = values as Beer | NewBeer;
      if (selectedBrewery && session?.user) {
        if (beerImage && beerImage instanceof File) {
          // Save the image to the database and create link
          const beerImg = initialData?.image
            ? await updateImage(initialData.image, beerImage)
            : await saveImage({ file: beerImage });

          if (!beerImg) {
            return toast.error("Failed to upload image, try again.");
          }
          beer.image = beerImg;
        }
        console.log({ initialData, beer });
        const beerRes = await (initialData?._id
          ? updateBeer(beer as Beer)
          : createBeer(beer as NewBeer));

        if (!beerRes) {
          return toast.error(
            `Failed to ${pageTitle.toLowerCase()}, try again. ${beerRes}`
          );
        }

        mutateBeers();
        mutateBrewery();
        toast.success(
          `${beerRes.name} successfully ${initialData?._id ? "edited" : "created"}!`
        );
        router.push(`/dashboard/breweries/${selectedBrewery._id}/beers`);
      }
    } catch (err: string | any) {
      console.error(err);
      toast.error(`Something went wrong, please try again. ${err}`);
    }
  }
  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onFormError)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <div className="space-y-6">
                  <FormItem className="w-full">
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <FileUploader
                        value={field.value as File | string | undefined}
                        onValueChange={field.onChange}
                        setUploadedFile={setBeerImage}
                        maxFiles={4}
                        maxSize={4 * 1024 * 1024}
                        // disabled={loading}
                        // progresses={progresses}
                        // pass the onUpload function here for direct upload
                        // onUpload={uploadFiles}
                        // disabled={isUploading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beer Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          placeholder="Enter beer name"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter price"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Style</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <BeerIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          placeholder="Enter style of beer"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="abv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ABV</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Percent className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="number"
                          className="pl-10"
                          placeholder="Enter abv"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <div className="relative ">
                      <LayoutGrid className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <MultiSelect
                        options={
                          selectedBrewery?.categories?.map((cat) => ({
                            label: cat.name,
                            value: cat._id as string,
                          })) || []
                        }
                        onValueChange={(values) => field.onChange(values)}
                        defaultValue={field.value.map((cat: any) => cat._id)}
                        placeholder="Select Category"
                        className="pl-10 w-popover-full"
                        variant="default"
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="ibu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IBU</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 w-5 -translate-y-1/2 text-muted-foreground text-xs font-bold">
                          IBU
                        </div>
                        <Input
                          type="number"
                          className="pl-10"
                          placeholder="Enter ibu"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="releasedOn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Release Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        placeholder="Enter release date"
                        {...field}
                        value={
                          field.value instanceof Date
                            ? field.value.toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? new Date(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter product description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="hops"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hops</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Hop className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                        <MultiSelect
                          options={
                            hopSuggestions?.map((hop) => ({
                              label: hop.name,
                              value: hop.name,
                            })) || []
                          }
                          onValueChange={(values) => field.onChange(values)}
                          defaultValue={field.value.map((hop: any) => hop)}
                          placeholder="Select hops "
                          className="pl-10 w-popover-full"
                          variant="default"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="malt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Malts</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Wheat className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <MultiSelect
                          options={
                            maltSuggestions?.map((malt) => ({
                              label: malt.name,
                              value: malt.name,
                            })) || []
                          }
                          onValueChange={(values) => field.onChange(values)}
                          defaultValue={field.value.map((malt: any) => malt)}
                          placeholder="Select malts "
                          className="pl-10 w-popover-full"
                          variant="default"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="nameSake"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name Details</FormLabel>
                  <FormDescription>
                    Details on the naming choice, why, story, etc.
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="Details on the naming choice"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormDescription>
                    Any additional notes about the beer
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="Add additional notes"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Archive */}
            <FormField
              control={form.control}
              name="archived"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Archive</FormLabel>
                    <FormDescription>Add beer to archive</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-full flex flex-col sm:flex-row items-center justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {pageTitle.includes("Edit") ? "Save" : "Add Product"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
