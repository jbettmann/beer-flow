const projectId = process.env.SUPABASE_PROJECT_ID || "omlnjbcckhowlpkhorry";

export default function supabaseLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality: number;
}) {
  return `https://${projectId}.supabase.co/storage/v1/object/public/Brett_bucket/${src}?width=${width}&quality=${quality || 90}`;
}
