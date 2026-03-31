import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../auth/hooks/use-auth";
import { getSpacesErrorMessage, useCreateSpace } from "../hooks/use-spaces";

const createSpaceSchema = z.object({
  name: z.string().min(2, "Space name should be at least 2 characters."),
  label: z.string().max(50, "Keep the label short.").optional(),
  focusNote: z.string().max(160, "Keep the focus note concise.").optional(),
});

type CreateSpaceValues = z.infer<typeof createSpaceSchema>;

type CreateSpaceFormProps = {
  compact?: boolean;
};

export function CreateSpaceForm({ compact = false }: CreateSpaceFormProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(!compact);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const createSpace = useCreateSpace();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateSpaceValues>({
    resolver: zodResolver(createSpaceSchema),
    defaultValues: { name: "", label: "", focusNote: "" },
  });

  const onSubmit = async (values: CreateSpaceValues) => {
    if (!user) {
      setServerMessage("You need to be logged in to create a space.");
      return;
    }

    setServerMessage(null);

    try {
      await createSpace.mutateAsync({
        userId: user.id,
        name: values.name,
        label: values.label,
        focusNote: values.focusNote,
      });
      reset();
      if (compact) setOpen(false);
    } catch (error) {
      setServerMessage(getSpacesErrorMessage(error));
    }
  };

  if (compact && !open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Plus className="mr-2 size-4" />
        Create space
      </Button>
    );
  }

  return (
    <div className="rounded-[24px] border border-[#122117]/10 bg-white/82 p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[#122117]">Create a new space</h3>
          <p className="mt-1 text-sm text-[#586254]">Use spaces for semesters, exam phases, or focused revision tracks.</p>
        </div>
        {compact ? (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-[#122117]/10 p-2 text-[#586254] transition hover:bg-[#f6f0e4]"
            aria-label="Close create space form"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#122117]">Space name</span>
          <input
            type="text"
            {...register("name")}
            className="w-full rounded-2xl border border-[#122117]/10 bg-white/80 px-4 py-3 outline-none transition focus:border-[#122117]/25"
            placeholder="Semester 4"
          />
          {errors.name ? <span className="mt-2 block text-sm text-[#b44830]">{errors.name.message}</span> : null}
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#122117]">Short label</span>
            <input
              type="text"
              {...register("label")}
              className="w-full rounded-2xl border border-[#122117]/10 bg-white/80 px-4 py-3 outline-none transition focus:border-[#122117]/25"
              placeholder="Current term workspace"
            />
            {errors.label ? <span className="mt-2 block text-sm text-[#b44830]">{errors.label.message}</span> : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#122117]">Focus note</span>
            <input
              type="text"
              {...register("focusNote")}
              className="w-full rounded-2xl border border-[#122117]/10 bg-white/80 px-4 py-3 outline-none transition focus:border-[#122117]/25"
              placeholder="DBMS and OS need attention"
            />
            {errors.focusNote ? <span className="mt-2 block text-sm text-[#b44830]">{errors.focusNote.message}</span> : null}
          </label>
        </div>

        {serverMessage ? <div className="rounded-2xl bg-[#fff4e9] px-4 py-3 text-sm text-[#8c4f29]">{serverMessage}</div> : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSubmitting || createSpace.isPending}>
            {isSubmitting || createSpace.isPending ? "Creating..." : "Save space"}
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