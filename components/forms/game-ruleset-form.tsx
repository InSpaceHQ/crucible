"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { useForm } from "react-hook-form";
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

const sectionSchema = z.object({
  title: z.string().min(1, "Enter a section title"),
  content: z.string().min(1, "Enter section content"),
});

const formSchema = z.object({
  sections: z.array(sectionSchema).min(1, "At least one section required"),
});

type FormValues = z.infer<typeof formSchema>;

type GameRulesetFormProps = {
  initialSections: FormValues["sections"];
  isLoading: boolean;
  onSubmit: (values: FormValues) => Promise<void>;
};

function GameRulesetForm({
  initialSections,
  isLoading,
  onSubmit,
}: GameRulesetFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { sections: initialSections },
  });

  const sections = form.watch("sections");
  const nextKey = useRef(sections.length);

  const keys = useRef<number[]>(
    Array.from({ length: sections.length }, (_, i) => i),
  );

  if (keys.current.length !== sections.length) {
    keys.current = sections.map((_, i) => keys.current[i] ?? nextKey.current++);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {sections.map((_, index) => (
          <div
            key={keys.current[index]}
            className="space-y-2 border border-border p-3"
          >
            <FormField
              control={form.control}
              name={`sections.${index}.title`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <input
                      data-slot="input"
                      className="border-border text-foreground placeholder:text-muted-foreground flex h-8 w-full rounded-none border bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="e.g. Match Format"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`sections.${index}.content`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <textarea
                      data-slot="input"
                      className="border-border text-foreground placeholder:text-muted-foreground flex h-20 w-full rounded-none border bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                      placeholder="Describe the rule..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const current = form.getValues("sections");
                form.setValue(
                  "sections",
                  current.filter((_, i) => i !== index),
                );
              }}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const current = form.getValues("sections");
            form.setValue("sections", [...current, { title: "", content: "" }]);
          }}
        >
          Add Section
        </Button>
        <Button type="submit" disabled={isLoading} className="ml-2">
          {isLoading ? "Saving..." : "Save Rules"}
        </Button>
      </form>
    </Form>
  );
}

export {
  GameRulesetForm,
  type GameRulesetFormProps,
  formSchema,
  type FormValues,
};
