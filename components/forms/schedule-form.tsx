"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

function toLocalDatetime(ts: number) {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalDatetime(str: string) {
  return new Date(str).getTime();
}

const formSchema = z.object({
  timestamp: z.string().min(1, "Select a date and time"),
  activity: z.string().min(1, "Enter an activity name"),
  description: z.string().min(1, "Enter a description"),
  link: z.string().optional(),
  linkLabel: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const defaultFormState: FormValues = {
  timestamp: "",
  activity: "",
  description: "",
  link: "",
  linkLabel: "",
};

type ScheduleFormProps = {
  initialValues?: {
    timestamp: number;
    activity: string;
    description: string;
    link?: string;
    linkLabel?: string;
  };
  submitLabel?: string;
  onSubmit: (values: {
    timestamp: number;
    activity: string;
    description: string;
    link?: string;
    linkLabel?: string;
  }) => Promise<void>;
};

function ScheduleForm({
  initialValues,
  submitLabel = "Create",
  onSubmit,
}: ScheduleFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues
      ? {
          ...initialValues,
          timestamp: toLocalDatetime(initialValues.timestamp),
        }
      : defaultFormState,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (vals) => {
          try {
            await onSubmit({
              ...vals,
              timestamp: fromLocalDatetime(vals.timestamp),
            });
            form.reset();
            toast.success("Schedule item saved");
          } catch (e) {
            toast.error("Failed to save schedule item", {
              description: e instanceof Error ? e.message : "Unknown error",
            });
          }
        })}
        className="space-y-3"
      >
        <FormField
          control={form.control}
          name="timestamp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date & Time</FormLabel>
              <FormControl>
                <input
                  type="datetime-local"
                  data-slot="input"
                  className="border-border text-foreground placeholder:text-muted-foreground flex h-8 w-full rounded-none border bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="activity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Activity</FormLabel>
              <FormControl>
                <input
                  data-slot="input"
                  className="border-border text-foreground placeholder:text-muted-foreground flex h-8 w-full rounded-none border bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="e.g. Opening Ceremony"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea
                  data-slot="input"
                  className="border-border text-foreground placeholder:text-muted-foreground flex h-16 w-full rounded-none border bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                  placeholder="Describe the activity..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link (optional)</FormLabel>
                <FormControl>
                  <input
                    data-slot="input"
                    className="border-border text-foreground placeholder:text-muted-foreground flex h-8 w-full rounded-none border bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="https://..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="linkLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link Label (optional)</FormLabel>
                <FormControl>
                  <input
                    data-slot="input"
                    className="border-border text-foreground placeholder:text-muted-foreground flex h-8 w-full rounded-none border bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="e.g. Watch Live"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? `${submitLabel}...` : submitLabel}
        </Button>
      </form>
    </Form>
  );
}

export {
  ScheduleForm,
  type ScheduleFormProps,
  formSchema,
  defaultFormState,
  type FormValues,
};
