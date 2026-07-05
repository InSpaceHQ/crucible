"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const formSchema = z.object({
  name: z.string().min(1, "Enter a competition name"),
  gameId: z.string().min(1, "Select a game"),
});

type FormValues = z.infer<typeof formSchema>;

const defaultFormState: FormValues = {
  name: "",
  gameId: "",
};

type Game = {
  _id: string;
  name: string;
  displayName: string;
};

type CreateCompetitionFormProps = {
  games: Game[];
  initialFormData?: FormValues;
  isLoading: boolean;
  onSubmit: (values: FormValues) => Promise<void>;
};

function CreateCompetitionForm({
  games,
  initialFormData,
  isLoading,
  onSubmit,
}: CreateCompetitionFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialFormData ?? defaultFormState,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <input
                  data-slot="input"
                  className="border-border text-foreground placeholder:text-muted-foreground flex h-8 w-full rounded-none border bg-transparent px-3 py-1 text-sm outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="e.g. Crucible Season 2"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gameId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Game</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a game" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {games.map((game) => (
                    <SelectItem key={game._id} value={game._id}>
                      {game.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Competition"}
        </Button>
      </form>
    </Form>
  );
}

export {
  CreateCompetitionForm,
  type CreateCompetitionFormProps,
  defaultFormState,
  type FormValues,
  formSchema,
};
