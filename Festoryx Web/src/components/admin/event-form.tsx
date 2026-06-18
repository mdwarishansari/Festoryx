"use client";

import { useState, useEffect, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema, type EventFormData } from "@/schemas/event.schema";
import { slugify } from "@/lib/utils";
import { Loader2, ArrowLeft, Save, Sparkles, Upload, ImageIcon, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface EventFormProps {
  initialData?: any; // Event from DB
  onSubmit: (data: any) => Promise<{ success: boolean; error?: string }>;
  title: string;
  description: string;
}

const DEFAULT_FORM_FIELDS = [
  { fieldName: "participantName", label: "Full Name", type: "text", isRequired: true, isVisible: true, sortOrder: 0 },
  { fieldName: "email", label: "Email Address", type: "email", isRequired: true, isVisible: true, sortOrder: 1 },
  { fieldName: "phone", label: "Phone Number", type: "tel", isRequired: true, isVisible: true, sortOrder: 2 },
  { fieldName: "collegeName", label: "College / University", type: "text", isRequired: true, isVisible: true, sortOrder: 3 },
  { fieldName: "department", label: "Branch / Department", type: "text", isRequired: false, isVisible: true, sortOrder: 4 },
  { fieldName: "yearOrSemester", label: "Year / Semester", type: "text", isRequired: false, isVisible: true, sortOrder: 5 },
  { fieldName: "github", label: "GitHub Profile", type: "url", isRequired: false, isVisible: false, sortOrder: 6 },
  { fieldName: "linkedin", label: "LinkedIn Profile", type: "url", isRequired: false, isVisible: false, sortOrder: 7 },
  { fieldName: "resume", label: "Resume Link", type: "url", isRequired: false, isVisible: false, sortOrder: 8 },
  { fieldName: "state", label: "State", type: "text", isRequired: false, isVisible: false, sortOrder: 9 },
  { fieldName: "city", label: "City", type: "text", isRequired: false, isVisible: false, sortOrder: 10 },
];

const mergeFormFields = (dbFields: any[]) => {
  const merged = [...DEFAULT_FORM_FIELDS];
  if (!dbFields || dbFields.length === 0) return merged;
  
  // Update fields already in DEFAULT_FORM_FIELDS with DB values
  merged.forEach((def, idx) => {
    const dbMatch = dbFields.find((f) => f.fieldName === def.fieldName);
    if (dbMatch) {
      merged[idx] = {
        ...def,
        isRequired: dbMatch.isRequired,
        isVisible: dbMatch.isVisible,
        sortOrder: dbMatch.sortOrder ?? def.sortOrder,
      };
    }
  });

  // Keep any other custom fields that the user created
  dbFields.forEach((dbField) => {
    if (!DEFAULT_FORM_FIELDS.find((f) => f.fieldName === dbField.fieldName)) {
      merged.push({
        fieldName: dbField.fieldName,
        label: dbField.label,
        type: dbField.type,
        isRequired: dbField.isRequired,
        isVisible: dbField.isVisible,
        sortOrder: dbField.sortOrder ?? merged.length,
      });
    }
  });

  return merged;
};

export function EventForm({ initialData, onSubmit, title, description }: EventFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [step, setStep] = useState(1);

  // Helper to format Date to YYYY-MM-DD for date inputs
  const formatDateInput = (dateVal: any) => {
    if (!dateVal) return "";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  };

  // Helper to format Date to YYYY-MM-DDTHH:MM for datetime-local inputs
  const formatDateTimeInput = (dateVal: any) => {
    if (!dateVal) return "";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    trigger,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(eventSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          registrationFee: initialData.registrationFee ? Number(initialData.registrationFee) : 0,
          eventDate: formatDateInput(initialData.eventDate),
          lastRegistrationDate: formatDateTimeInput(initialData.lastRegistrationDate),
          problemReleaseTime: formatDateTimeInput(initialData.problemReleaseTime),
          visibility: initialData.visibility || "PUBLIC",
          modules: initialData.modules ? initialData.modules.map((m: any) => m.module) : ["REGISTRATION"],
          formFields: mergeFormFields(initialData.formFields),
        }
      : {
          name: "",
          slug: "",
          shortDescription: "",
          description: "",
          rules: "",
          eligibility: "",
          format: "",
          participationType: "SOLO",
          minTeamSize: 1,
          maxTeamSize: 1,
          prizeDetails: "",
          venue: "",
          schedule: "",
          bannerUrl: "",
          registrationFee: 0,
          lastRegistrationDate: "",
          eventDate: "",
          problemSummary: "",
          problemStatement: "",
          problemReleaseTime: "",
          isPublished: false,
          isRegistrationOpen: true,
          isSubmissionOpen: false,
          sortOrder: 0,
          visibility: "PUBLIC",
          modules: ["REGISTRATION", "PAYMENT"],
          formFields: DEFAULT_FORM_FIELDS,
        },
  });

  const { fields: formFieldItems } = useFieldArray({
    control,
    name: "formFields",
  });

  const nameValue = watch("name");
  const participationTypeValue = watch("participationType");
  const watchBanner = watch("bannerUrl");

  // Auto-generate slug from name
  useEffect(() => {
    if (nameValue && !initialData) {
      setValue("slug", slugify(nameValue), { shouldValidate: true });
    }
  }, [nameValue, setValue, initialData]);

  const onFormSubmit = (data: any) => {
    setError(null);
    startTransition(async () => {
      const res = await onSubmit(data);
      if (!res.success) {
        setError(res.error || "An error occurred");
      } else {
        toast.success("Event saved successfully!");
      }
    });
  };

  const onFormError = (errors: any) => {
    console.error("Validation errors:", errors);
    const firstError = Object.values(errors)[0] as any;
    if (firstError?.message) {
      toast.error(firstError.message);
    } else {
      toast.error("Please correct the errors in the form before saving.");
    }
  };

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Banner must be under 5MB");
      return;
    }
    setBannerUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", `festoryx/events/${watch("slug") || "default"}`);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setValue("bannerUrl", data.url, { shouldValidate: true });
      toast.success("Banner uploaded successfully!");
    } catch {
      toast.error("Failed to upload banner.");
    } finally {
      setBannerUploading(false);
      e.target.value = "";
    }
  }

  const handleNext = async () => {
    let fieldsToValidate: string[] = [];
    if (step === 1) {
      fieldsToValidate = [
        "name",
        "slug",
        "shortDescription",
        "description",
        "eventDate",
        "lastRegistrationDate",
        "bannerUrl",
        "venue",
        "format",
        "rules",
        "eligibility",
        "prizeDetails",
        "schedule",
        "problemSummary",
        "problemReleaseTime",
        "problemStatement",
      ];
    } else if (step === 2) {
      fieldsToValidate = ["visibility", "isRegistrationOpen", "isSubmissionOpen"];
    } else if (step === 3) {
      fieldsToValidate = ["modules"];
    } else if (step === 4) {
      fieldsToValidate = ["participationType", "minTeamSize", "maxTeamSize", "registrationFee", "sortOrder"];
    } else if (step === 5) {
      fieldsToValidate = ["formFields"];
    }

    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setStep((prev) => prev + 1);
    } else {
      toast.error("Please correct the errors in this step before proceeding.");
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const steps = [
    { num: 1, label: "Basic Info" },
    { num: 2, label: "Visibility" },
    { num: 3, label: "Modules" },
    { num: 4, label: "Participation" },
    { num: 5, label: "Field Library" },
    { num: 6, label: "Publish" },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-white/10 pb-6">
        <Link
          href="/dashboard/events"
          className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-gray-400 hover:text-white transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">{title}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{description}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-400">
          {error}
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        {steps.map((s, index) => (
          <div key={s.num} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300 ${
                  step === s.num
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/35"
                    : step > s.num
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-white/5 border-white/10 text-gray-500"
                }`}
              >
                {step > s.num ? <CheckCircle className="h-5 w-5" /> : s.num}
              </div>
              <span
                className={`mt-2 text-xs font-medium tracking-wide uppercase ${
                  step === s.num ? "text-indigo-400" : "text-gray-500"
                }`}
              >
                {s.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-4 h-0.5 flex-1 rounded-full ${
                  step > s.num ? "bg-emerald-500/30" : "bg-white/5"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onFormSubmit, onFormError)} className="space-y-6">
        {/* STEP 1: Basic Information & Challenge Details */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-6">
              <h3 className="font-heading text-lg font-semibold text-white border-b border-white/5 pb-2">
                Basic Information
              </h3>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Event Name</label>
                  <input
                    type="text"
                    {...register("name")}
                    className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Fast Coding Battle"
                  />
                  {errors.name?.message && <p className="mt-1 text-xs text-rose-400">{errors.name.message as string}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">URL Slug</label>
                  <input
                    type="text"
                    {...register("slug")}
                    className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    placeholder="fast-coding-battle"
                  />
                  {errors.slug?.message && <p className="mt-1 text-xs text-rose-400">{errors.slug.message as string}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Short Description</label>
                <input
                  type="text"
                  {...register("shortDescription")}
                  className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder="A brief one-line highlight of the competition."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Detailed Description</label>
                <textarea
                  rows={5}
                  {...register("description")}
                  className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Describe the target audience, format, technologies, etc."
                />
                {errors.description?.message && <p className="mt-1 text-xs text-rose-400">{errors.description.message as string}</p>}
              </div>
            </div>

            {/* Format and Guidelines */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-6">
              <h3 className="font-heading text-lg font-semibold text-white border-b border-white/5 pb-2">
                Guidelines & Structure
              </h3>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Format</label>
                  <input
                    type="text"
                    {...register("format")}
                    className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Online / Offline Hackathon"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Venue</label>
                  <input
                    type="text"
                    {...register("venue")}
                    className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Lab 3, CS Department"
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Rules & Regulations</label>
                  <textarea
                    rows={4}
                    {...register("rules")}
                    className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    placeholder="List down all rules..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Eligibility Criteria</label>
                  <textarea
                    rows={4}
                    {...register("eligibility")}
                    className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Who can apply..."
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Prize Details</label>
                  <textarea
                    rows={3}
                    {...register("prizeDetails")}
                    className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    placeholder="First Prize: ₹10,000, etc..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Schedule Details</label>
                  <textarea
                    rows={3}
                    {...register("schedule")}
                    className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Day 1: Round 1, Day 2: Finals..."
                  />
                </div>
              </div>
            </div>

            {/* Event Dates */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-6">
              <h3 className="font-heading text-lg font-semibold text-white border-b border-white/5 pb-2">
                Event Schedule & Deadlines
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Event Date</label>
                  <input
                    type="date"
                    {...register("eventDate")}
                    className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Registration Deadline</label>
                  <input
                    type="datetime-local"
                    {...register("lastRegistrationDate")}
                    className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Problem Statement */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-6">
              <h3 className="font-heading text-lg font-semibold text-white border-b border-white/5 pb-2">
                Challenge / Problem Statement (Time-locked)
              </h3>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Problem Summary (Public preview)</label>
                  <textarea
                    rows={3}
                    {...register("problemSummary")}
                    className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    placeholder="A high level overview or instructions."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Problem Statement Release Time</label>
                  <input
                    type="datetime-local"
                    {...register("problemReleaseTime")}
                    className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Detailed Problem Statement (Markdown / Text)</label>
                <textarea
                  rows={6}
                  {...register("problemStatement")}
                  className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder="This will be revealed only when release time passes..."
                />
              </div>
            </div>

            {/* Banner Upload */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-6">
              <h3 className="font-heading text-lg font-semibold text-white border-b border-white/5 pb-2">
                Event Banner Image
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    {...register("bannerUrl")}
                    className="flex-1 rounded-xl border border-white/10 bg-[#16213e] px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    placeholder="https://res.cloudinary.com/... or paste URL"
                  />
                  <label className="flex h-10 cursor-pointer items-center gap-2 justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-white hover:bg-white/10 transition-all whitespace-nowrap">
                    {bannerUploading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
                    ) : (
                      <><Upload className="h-4 w-4" /> Upload Image</>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      disabled={bannerUploading}
                      className="hidden"
                    />
                  </label>
                </div>
                {watchBanner ? (
                  <div className="relative">
                    <img
                      src={watchBanner}
                      alt="Banner preview"
                      className="w-full h-48 object-cover rounded-xl border border-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => setValue("bannerUrl", "", { shouldValidate: true })}
                      className="absolute top-2 right-2 rounded-lg bg-black/60 border border-white/20 px-3 py-1 text-xs text-white hover:bg-red-500/20 hover:border-red-400 transition-all"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-white/10 text-gray-500 gap-2">
                    <ImageIcon className="h-8 w-8" />
                    <p className="text-xs">No banner uploaded yet</p>
                  </div>
                )}
                <p className="text-xs text-gray-500">Recommended size: 1200×630px. Max 5MB.</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Visibility & Settings */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-6">
              <h3 className="font-heading text-lg font-semibold text-white border-b border-white/5 pb-2">
                Visibility Settings
              </h3>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Visibility</label>
                  <select
                    {...register("visibility")}
                    className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="PUBLIC">Public (Visible on events marketplace)</option>
                    <option value="UNLISTED">Unlisted (Accessible via direct link only)</option>
                    <option value="PRIVATE">Private (Only organization members)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-8 pt-4 border-t border-white/5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("isRegistrationOpen")}
                    className="h-5 w-5 rounded border-white/10 bg-[#16213e] text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="block text-sm font-medium text-white">Registration Open</span>
                    <span className="text-xs text-gray-500">Allow participants to register</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("isSubmissionOpen")}
                    className="h-5 w-5 rounded border-white/10 bg-[#16213e] text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="block text-sm font-medium text-white">Submission Form Enabled</span>
                    <span className="text-xs text-gray-500">Allow participants to submit project links</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Enabled Event Modules */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-6">
              <h3 className="font-heading text-lg font-semibold text-white border-b border-white/5 pb-2">
                Event Modules
              </h3>
              <p className="text-xs text-gray-400">
                Toggle the platform modules that will be integrated into this event.
              </p>

              <div className="space-y-4 pt-2">
                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-white/5 bg-[#16213e]/40 hover:bg-[#16213e]/70 transition-all">
                  <input
                    type="checkbox"
                    value="REGISTRATION"
                    {...register("modules")}
                    className="h-5 w-5 rounded border-white/10 bg-[#16213e] text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="block text-sm font-medium text-white">Form Registration</span>
                    <span className="text-xs text-gray-500">Enable default/custom input fields library registration</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-white/5 bg-[#16213e]/40 hover:bg-[#16213e]/70 transition-all">
                  <input
                    type="checkbox"
                    value="PAYMENT"
                    {...register("modules")}
                    className="h-5 w-5 rounded border-white/10 bg-[#16213e] text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="block text-sm font-medium text-white">UPI/QR Payments</span>
                    <span className="text-xs text-gray-500">Collect fees offline and verify transaction references</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-white/5 bg-[#16213e]/40 hover:bg-[#16213e]/70 transition-all">
                  <input
                    type="checkbox"
                    value="SUBMISSION"
                    {...register("modules")}
                    className="h-5 w-5 rounded border-white/10 bg-[#16213e] text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="block text-sm font-medium text-white">Project Submission</span>
                    <span className="text-xs text-gray-500">Provide an entry portal for final project URLs/submissions</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-white/5 bg-[#16213e]/40 hover:bg-[#16213e]/70 transition-all">
                  <input
                    type="checkbox"
                    value="QUIZ_ARENA"
                    {...register("modules")}
                    className="h-5 w-5 rounded border-white/10 bg-[#16213e] text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="block text-sm font-medium text-white">Live Quiz Arena</span>
                    <span className="text-xs text-gray-500">Integrate real-time multiple choice multiplayer quiz room console</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-white/5 bg-[#16213e]/40 hover:bg-[#16213e]/70 transition-all">
                  <input
                    type="checkbox"
                    value="TEAM_SUPPORT"
                    {...register("modules")}
                    className="h-5 w-5 rounded border-white/10 bg-[#16213e] text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="block text-sm font-medium text-white">Team Participation Support</span>
                    <span className="text-xs text-gray-500">Allow users to form teams and register teammates</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Registration Configuration */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-6">
              <h3 className="font-heading text-lg font-semibold text-white border-b border-white/5 pb-2">
                Participation Rules & Pricing
              </h3>

              <div className="grid gap-6 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Participation Type</label>
                  <select
                    {...register("participationType")}
                    className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="SOLO">Solo (Individual)</option>
                    <option value="TEAM">Team Only</option>
                    <option value="BOTH">Solo or Team</option>
                  </select>
                </div>

                {participationTypeValue !== "SOLO" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Min Team Size</label>
                      <input
                        type="number"
                        min={1}
                        {...register("minTeamSize", { valueAsNumber: true })}
                        className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Max Team Size</label>
                      <input
                        type="number"
                        min={1}
                        {...register("maxTeamSize", { valueAsNumber: true })}
                        className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Registration Fee (₹)</label>
                  <input
                    type="number"
                    min={0}
                    {...register("registrationFee", { valueAsNumber: true })}
                    className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    placeholder="0 for Free"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Marketplace Sort Order</label>
                  <input
                    type="number"
                    {...register("sortOrder", { valueAsNumber: true })}
                    className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Field Library */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-6">
              <h3 className="font-heading text-lg font-semibold text-white border-b border-white/5 pb-2">
                Participant Registration Fields
              </h3>
              <p className="text-xs text-gray-400">
                Choose which fields are visible on the registration form, and whether they are required.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {formFieldItems.map((field: any, idx) => (
                  <div key={field.id} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-[#16213e] backdrop-blur-md">
                    <div>
                      <span className="block text-sm font-semibold text-white">{field.label}</span>
                      <span className="text-xs text-gray-500 font-mono">{field.fieldName}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register(`formFields.${idx}.isVisible` as const)}
                          className="h-4 w-4 rounded border-white/10 bg-black/20 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs text-gray-300">Visible</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register(`formFields.${idx}.isRequired` as const)}
                          disabled={!watch(`formFields.${idx}.isVisible`)}
                          className="h-4 w-4 rounded border-white/10 bg-black/20 text-indigo-600 focus:ring-indigo-500 disabled:opacity-40"
                        />
                        <span className="text-xs text-gray-300">Required</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Review & Publish */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-6">
              <h3 className="font-heading text-lg font-semibold text-white border-b border-white/5 pb-2">
                Review & Publish Competition
              </h3>

              <div className="grid gap-6 sm:grid-cols-2 text-sm text-gray-300">
                <div>
                  <span className="block text-xs text-gray-500">Event Name</span>
                  <span className="font-semibold text-white">{watch("name")}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">URL Slug</span>
                  <span className="font-semibold text-white">{watch("slug")}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">Date</span>
                  <span className="font-semibold text-white">{watch("eventDate") || "Not scheduled"}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">Fee</span>
                  <span className="font-semibold text-white">₹{watch("registrationFee")}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">Participation</span>
                  <span className="font-semibold text-white">{watch("participationType")}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">Visibility Mode</span>
                  <span className="font-semibold text-white">{watch("visibility")}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("isPublished")}
                    className="h-5 w-5 rounded border-white/10 bg-[#16213e] text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="block text-sm font-medium text-white">Publish Event Globally</span>
                    <span className="text-xs text-gray-500">If checked, participants will immediately see this event on the public marketplace.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex justify-between items-center pt-6 border-t border-white/10">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isPending}
              className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-semibold text-gray-300 hover:text-white transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-4">
            <Link
              href="/dashboard/events"
              className="flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-semibold text-gray-300 hover:text-white transition-all"
            >
              Cancel
            </Link>

            {step < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-500"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isPending}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-8 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:from-emerald-500 hover:to-teal-400"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Competition</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
