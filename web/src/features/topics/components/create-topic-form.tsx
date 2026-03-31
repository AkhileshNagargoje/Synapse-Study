import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../auth/hooks/use-auth";
import { getTopicsErrorMessage, useCreateTopic } from "../hooks/use-topics";

const createTopicSchema = z.object({
  title: z.string().min(2, "Topic title should be at least 2 characters."),
  summary: z.string().max(220, "Keep the topic summary concise.").optional(),
});

type CreateTopicValues = z.infer<typeof createTopicSchema>;

type CreateTopicFormProps = { spaceId: string; subjectId: string; compact?: boolean; };

export function CreateTopicForm({ spaceId, subjectId, compact = false }: CreateTopicFormProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(!compact);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const createTopic = useCreateTopic();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateTopicValues>({
    resolver: zodResolver(createTopicSchema),
    defaultValues: { title: "", summary: "" },
  });

  const onSubmit = async (values: CreateTopicValues) => {
    if (!user) { setServerMessage("You need to be logged in to create a topic."); return; }
    setServerMessage(null);
    try {
      await createTopic.mutateAsync({ userId: user.id, spaceId, subjectId, title: values.title, summary: values.summary });
      reset();
      if (compact) setOpen(false);
    } catch (error) {
      setServerMessage(getTopicsErrorMessage(error));
    }
  };

  if (compact && !open) {
    return <Button variant="secondary" onClick={() => setOpen(true)}><Plus className="mr-2 size-4" />Add topic</Button>;
  }

  return (
    <div className="rounded-[24px] border border-[#122117]/10 bg-white/82 p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[#122117]">Create a topic</h3>
          <p className="mt-1 text-sm text-[#586254]">Topics unlock uploads, AI study packs, and focused tutor flow.</p>
        </div>
        {compact ? (
          <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-[#122117]/10 p-2 text-[#586254] transition hover:bg-[#f6f0e4]" aria-label="Close create topic form">
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#122117]">Topic title</span>
          <input type="text" {...register("title")} className="w-full rounded-2xl border border-[#122117]/10 bg-white/80 px-4 py-3 outline-none transition focus:border-[#122117]/25" placeholder="Normalization" />
          {errors.title ? <span className="mt-2 block text-sm text-[#b44830]">{errors.title.message}</span> : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#122117]">Short summary</span>
          <textarea {...register("summary")} rows={3} className="w-full resize-none rounded-2xl border border-[#122117]/10 bg-white/80 px-4 py-3 outline-none transition focus:border-[#122117]/25" placeholder="What should this topic cover at a high level?" />
          {errors.summary ? <span className="mt-2 block text-sm text-[#b44830]">{errors.summary.message}</span> : null}
        </label>

        {serverMessage ? <div className="rounded-2xl bg-[#fff4e9] px-4 py-3 text-sm text-[#8c4f29]">{serverMessage}</div> : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSubmitting || createTopic.isPending}>{isSubmitting || createTopic.isPending ? "Creating..." : "Save topic"}</Button>
          {compact ? <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button> : null}
        </div>
      </form>
    </div>
  );
}