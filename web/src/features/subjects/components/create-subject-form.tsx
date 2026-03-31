import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../auth/hooks/use-auth";
import { getSubjectsErrorMessage, useCreateSubject } from "../hooks/use-subjects";

const createSubjectSchema = z.object({
  name: z.string().min(2, "Subject name should be at least 2 characters."),
  code: z.string().max(24, "Keep the code short.").optional(),
  description: z.string().max(180, "Keep the description concise.").optional(),
});

type CreateSubjectValues = z.infer<typeof createSubjectSchema>;

type CreateSubjectFormProps = {
  spaceId: string;
  compact?: boolean;
};

export function CreateSubjectForm({ spaceId, compact = false }: CreateSubjectFormProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(!compact);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const createSubject = useCreateSubject();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateSubjectValues>({
    resolver: zodResolver(createSubjectSchema),
    defaultValues: { name: "", code: "", description: "" },
  });

  const onSubmit = async (values: CreateSubjectValues) => {
    if (!user) {
      setServerMessage("You need to be logged in to create a subject.");
      return;
    }

    setServerMessage(null);

    try {
      await createSubject.mutateAsync({
        userId: user.id,
        spaceId,
        name: values.name,
        code: values.code,
        description: values.description,
      });
      reset();
      if (compact) setOpen(false);
    } catch (error) {
      setServerMessage(getSubjectsErrorMessage(error));
    }
  };

  if (compact && !open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Plus className="mr-2 size-4" />
        Add subject
      </Button>
    );
  }

  return (
    <div className="rounded-[24px] border border-[#122117]/10 bg-white/82 p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[#122117]">Create a subject</h3>
          <p className="mt-1 text-sm text-[#586254]">Subjects live inside a space and become the parent for topics.</p>
        </div>
        {compact ? (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-[#122117]/10 p-2 text-[#586254] transition hover:bg-[#f6f0e4]"
            aria-label="Close create subject form"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#122117]">Subject name</span>
          <input
            type="text"
            {...register("name")}
            className="w-full rounded-2xl border border-[#122117]/10 bg-white/80 px-4 py-3 outline-none transition focus:border-[#122117]/25"
            placeholder="Database Management Systems"
          />
          {errors.name ? <span className="mt-2 block text-sm text-[#b44830]">{errors.name.message}</span> : null}
        </label>

        <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#122117]">Code</span>
            <input
              type="text"
              {...register("code")}
              className="w-full rounded-2xl border border-[#122117]/10 bg-white/80 px-4 py-3 outline-none transition focus:border-[#122117]/25"
              placeholder="CS402"
            />
            {errors.code ? <span className="mt-2 block text-sm text-[#b44830]">{errors.code.message}</span> : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#122117]">Description</span>
            <input
              type="text"
              {...register("description")}
              className="w-full rounded-2xl border border-[#122117]/10 bg-white/80 px-4 py-3 outline-none transition focus:border-[#122117]/25"
              placeholder="Theory, lab, or exam focus for this subject"
            />
            {errors.description ? <span className="mt-2 block text-sm text-[#b44830]">{errors.description.message}</span> : null}
          </label>
        </div>

        {serverMessage ? <div className="rounded-2xl bg-[#fff4e9] px-4 py-3 text-sm text-[#8c4f29]">{serverMessage}</div> : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSubmitting || createSubject.isPending}>
            {isSubmitting || createSubject.isPending ? "Creating..." : "Save subject"}
          </Button>
          {compact ? (
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
}