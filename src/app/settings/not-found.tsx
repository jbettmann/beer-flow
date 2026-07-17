import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// default name and page for not found dynamic page
export default function NotFound() {
  return (
    <Card><CardHeader><CardTitle>Setting not found</CardTitle><CardDescription>This settings page does not exist or is no longer available.</CardDescription></CardHeader><CardContent><Button asChild variant="outline"><Link href="/settings/profile">Back to settings</Link></Button></CardContent></Card>
  );
}
