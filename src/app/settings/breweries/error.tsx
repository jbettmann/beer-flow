"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
export default function Error({ reset }: { error: Error; reset: () => void }) { return <Card><CardHeader><CardTitle>Couldn’t load brewery settings</CardTitle><CardDescription>Check your connection and try again.</CardDescription></CardHeader><CardContent><Button type="button" onClick={reset}>Try again</Button></CardContent></Card>; }
