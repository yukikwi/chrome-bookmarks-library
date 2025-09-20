"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// Define form schema
const formSchema = z.object({
  domains: z
    .string()
    .min(1, { message: "Enter at least one domain" })
    .refine((val) => val.split(",").map((s) => s.trim()).filter(Boolean).length > 0, {
      message: "Enter at least one valid domain separated by commas",
    }),
  bookmarkFile: z
    .instanceof(File, { message: "Please upload a file" })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "File size must be less than 5MB",
    })
    .refine((file) => file.type === "application/json" || file.name.endsWith(".html"), {
      message: "Only JSON and HTML files are allowed",
    }),
})

export default function ImportBookmarksPage() {
  const router = useRouter()
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domains: "",
      bookmarkFile: undefined,
    },
  })

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const domains = values.domains
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
        .map((d) => d.replace(/^https?:\/\//, ""))
        .map((d) => (d.endsWith("/") ? d.slice(0, -1) : d))

      const formData = new FormData()
      formData.append("file", values.bookmarkFile)
      formData.append("domains", JSON.stringify(domains))
      
      // Here you would typically send the file to your API
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/import-bookmarks`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      toast.success(`Imported ${data.inserted} books`) 
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Failed to import bookmarks. Please try again.")
    }
  }

  return (
    <div className="container mx-auto py-8 px-2">
      <h1 className="text-3xl font-bold mb-6">Import Bookmarks</h1>
      <p className="text-muted-foreground mb-8">
        Upload your Chrome bookmarks file (bookmarks.html) to import your bookmarks.
      </p>
      
      <div className="max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="domains"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allowed Domains</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="example.com, sub.domain.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Comma-separated list of domains to import. Only bookmarks whose URL hostname matches any of these domains will be imported.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bookmarkFile"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Bookmarks File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".json,.html"
                      {...field}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        onChange(file);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload your Chrome bookmarks file (bookmarks.html) or exported bookmarks JSON file.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center gap-4">
              <Button type="submit">Import Bookmarks</Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push('/library')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
