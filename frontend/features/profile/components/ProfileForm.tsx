"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { saveProfile } from "../hooks/useProfile";
import type { ProfileResponse } from "../types";

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
  timezone: z.string().max(100, "Timezone must be at most 100 characters").optional(),
  phone: z.string().max(30, "Phone must be at most 30 characters").optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  data: ProfileResponse;
  onSaved: (updated: ProfileResponse) => void;
}

export function ProfileForm({ data, onSaved }: ProfileFormProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: data.user.name,
      bio: data.profile.bio ?? "",
      timezone: data.profile.timezone ?? "",
      phone: data.profile.phone ?? "",
    },
  });

  // Sync form values if parent re-fetches data
  useEffect(() => {
    form.reset({
      name: data.user.name,
      bio: data.profile.bio ?? "",
      timezone: data.profile.timezone ?? "",
      phone: data.profile.phone ?? "",
    });
  }, [data, form]);

  async function onSubmit(values: ProfileFormValues) {
    try {
      const { dirtyFields } = form.formState;
      const payload: {
        name: string;
        bio?: string | null;
        timezone?: string | null;
        phone?: string | null;
      } = { name: values.name };
      if (dirtyFields.bio) payload.bio = values.bio || null;
      if (dirtyFields.timezone) payload.timezone = values.timezone || null;
      if (dirtyFields.phone) payload.phone = values.phone || null;
      const updated = await saveProfile(payload);
      onSaved(updated);
      toast({ title: "Profile saved" });
    } catch {
      toast({
        variant: "destructive",
        title: "Save failed",
        description: "Please try again.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={4}
                  placeholder="Tell the community a bit about yourself…"
                  className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Europe/Lisbon" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+351 912 345 678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-1">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
