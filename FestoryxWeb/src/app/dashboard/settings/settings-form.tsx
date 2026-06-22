"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema, type SettingsFormData } from "@/schemas/settings.schema";
import { updateSettings, resetCountdownDate } from "@/actions/settings.actions";
import { requestOrgDeletionOTP, confirmOrgDeletion } from "@/actions/organization.actions";
import { toast } from "sonner";
import { Loader2, Save, Info, Image, CreditCard, Mail, Upload, Lock, XCircle, Trash2, AlertTriangle } from "lucide-react";
import { cn, formatToISTInputString } from "@/lib/utils";

interface SettingsFormProps {
  settings: any; // Settings object from DB
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [isPending, startTransition] = useTransition();
  const [uploads, setUploads] = useState<Record<string, boolean>>({});

  const [deleteOtp, setDeleteOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);



  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings
      ? {
          siteName: settings.siteName || "",
          aboutContent: settings.aboutContent || "",
          contactEmail: settings.contactEmail || "",
          contactPhone: settings.contactPhone || "",
          paymentInstructions: settings.paymentInstructions || "",
          logoUrl: settings.logoUrl || "",
          paymentQrCodeUrl: settings.paymentQrCodeUrl || "",
          showQuiz: settings.showQuiz ?? false,
          instagramUrl: settings.instagramUrl || "",
          githubUrl: settings.githubUrl || "",
          twitterUrl: settings.twitterUrl || "",
          linkedinUrl: settings.linkedinUrl || "",
          youtubeUrl: settings.youtubeUrl || "",
        }
      : {
          siteName: "",
          aboutContent: "",
          contactEmail: "",
          contactPhone: "",
          paymentInstructions: "",
          logoUrl: "",
          paymentQrCodeUrl: "",
          showQuiz: false,
          instagramUrl: "",
          githubUrl: "",
          twitterUrl: "",
          linkedinUrl: "",
          youtubeUrl: "",
        },
  });

  const watchLogo = watch("logoUrl");
  const watchQrCode = watch("paymentQrCodeUrl");

  // File Upload Helper
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof SettingsFormData, folder: string) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be under 2MB");
      return;
    }

    setUploads((prev) => ({ ...prev, [fieldName]: true }));
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setValue(fieldName, data.url, { shouldValidate: true });
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image.");
    } finally {
      setUploads((prev) => ({ ...prev, [fieldName]: false }));
    }
  }

  function onSubmit(data: SettingsFormData) {
    startTransition(async () => {
      try {
        const res = await updateSettings(data);
        if (res.success) {
          toast.success("Site settings updated successfully!");
          router.refresh();
        } else {
          toast.error(res.error || "Failed to update settings");
        }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong");
      }
    });
  }

  const onFormError = (errors: any) => {
    console.error("Validation errors:", errors);
    const firstError = Object.values(errors)[0] as any;
    if (firstError?.message) {
      toast.error(firstError.message);
    } else {
      toast.error("Please correct the errors in the settings form before saving.");
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: Info },
    { id: "branding", label: "Branding", icon: Image },
    { id: "payment", label: "Payment & QR", icon: CreditCard },
    { id: "contact", label: "Contact & Socials", icon: Mail },
    { id: "danger", label: "Danger Zone", icon: XCircle },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 border-b-2 py-3 px-4 text-sm font-semibold tracking-wide whitespace-nowrap transition-all duration-200 focus:outline-none",
              activeTab === tab.id
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-gray-400 hover:text-white"
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab !== "danger" && (
        <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-6">
        {/* GENERAL TAB */}
        {activeTab === "general" && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-6">
            <h3 className="font-heading text-lg font-semibold text-white border-b border-white/5 pb-2">
              Organization Settings
            </h3>

            <div className="grid gap-6 sm:grid-cols-1">
              <div>
                <label className="block text-sm font-medium text-gray-300">Organization Name</label>
                <input
                  type="text"
                  {...register("siteName")}
                  className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. Science Club"
                />
                {errors.siteName && (
                  <p className="mt-1 text-xs text-rose-400">{errors.siteName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Organization Description (Markdown / HTML)</label>
              <textarea
                rows={6}
                {...register("aboutContent")}
                className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Introduce your organization..."
              />
            </div>

            <div className="flex items-center gap-3 border-t border-white/5 pt-4">
              <input
                id="showQuiz"
                type="checkbox"
                {...register("showQuiz")}
                className="h-4 w-4 rounded border-white/10 bg-[#16213e] text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div>
                <label htmlFor="showQuiz" className="block text-sm font-medium text-gray-300 cursor-pointer select-none">
                  Enable Quiz Arena
                </label>
                <p className="text-xs text-gray-400">If enabled, a Quiz Arena tab will appear on your public microsite.</p>
              </div>
            </div>
          </div>
        )}

        {/* BRANDING TAB */}
        {activeTab === "branding" && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-6">
            <h3 className="font-heading text-lg font-semibold text-white border-b border-white/5 pb-2">
              Branding Assets
            </h3>

            <div className="grid gap-6 sm:grid-cols-1">
              {/* Logo URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300">Logo Image URL</label>
                <div className="mt-2 flex gap-3 max-w-md">
                  <input
                    type="text"
                    {...register("logoUrl")}
                    className="flex-1 rounded-xl border border-white/10 bg-[#16213e] px-4 py-2.5 text-xs text-white focus:outline-none"
                    placeholder="https://cloudinary.com/..."
                  />
                  <label className="flex h-11 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-white hover:bg-white/10 transition-all">
                    {uploads.logoUrl ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "logoUrl", `festoryx/organizations/${settings.slug || "default"}/logo`)}
                      disabled={uploads.logoUrl}
                      className="hidden"
                    />
                  </label>
                </div>
                {watchLogo && (
                  <img
                    src={watchLogo}
                    alt="Logo preview"
                    className="mt-3 rounded-lg border border-white/10 h-12 object-contain bg-black/40 p-1"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* PAYMENT TAB */}
        {activeTab === "payment" && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-6">
            <h3 className="font-heading text-lg font-semibold text-white border-b border-white/5 pb-2">
              Payment Configurations
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-300">Payment QR Code Image</label>
              <div className="mt-2 flex gap-3 max-w-md">
                <input
                  type="text"
                  {...register("paymentQrCodeUrl")}
                  className="flex-1 rounded-xl border border-white/10 bg-[#16213e] px-4 py-2.5 text-xs text-white focus:outline-none"
                  placeholder="https://cloudinary.com/..."
                />
                <label className="flex h-11 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-white hover:bg-white/10 transition-all">
                  {uploads.paymentQrCodeUrl ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "paymentQrCodeUrl", `festoryx/organizations/${settings.slug || "default"}/payment-qr`)}
                    disabled={uploads.paymentQrCodeUrl}
                    className="hidden"
                  />
                </label>
              </div>
              {watchQrCode && (
                <img
                  src={watchQrCode}
                  alt="QR Code preview"
                  className="mt-4 rounded-xl border border-white/10 h-64 w-64 object-contain bg-white p-2"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Payment Instructions</label>
              <textarea
                rows={5}
                {...register("paymentInstructions")}
                className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Include UPI ID, account number, bank details, and step-by-step instructions..."
              />
            </div>
          </div>
        )}

        {/* CONTACT & SOCIAL LINKS */}
        {activeTab === "contact" && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-6">
            <h3 className="font-heading text-lg font-semibold text-white border-b border-white/5 pb-2">
              Contact & Social Links
            </h3>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-300">Contact Email</label>
                <input
                  type="email"
                  {...register("contactEmail")}
                  className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white focus:outline-none"
                  placeholder="contact@organization.com"
                />
                {errors.contactEmail && (
                  <p className="mt-1 text-xs text-rose-400">{errors.contactEmail.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Contact Phone</label>
                <input
                  type="text"
                  {...register("contactPhone")}
                  className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white focus:outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="block text-sm font-medium text-gray-300">Instagram URL</label>
                <input
                  type="text"
                  {...register("instagramUrl")}
                  className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white focus:outline-none"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">GitHub URL</label>
                <input
                  type="text"
                  {...register("githubUrl")}
                  className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white focus:outline-none"
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Twitter URL</label>
                <input
                  type="text"
                  {...register("twitterUrl")}
                  className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white focus:outline-none"
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">LinkedIn URL</label>
                <input
                  type="text"
                  {...register("linkedinUrl")}
                  className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white focus:outline-none"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">YouTube URL</label>
                <input
                  type="text"
                  {...register("youtubeUrl")}
                  className="mt-2 block w-full rounded-xl border border-white/10 bg-[#16213e] px-4 py-3 text-white focus:outline-none"
                  placeholder="https://www.youtube.com/@..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-500"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving settings...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
        </form>
      )}

      {/* DANGER ZONE TAB */}
      {activeTab === "danger" && (
        <div className="rounded-2xl border border-red-500/25 bg-red-950/5 p-6 backdrop-blur-md space-y-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white">Danger Zone</h3>
              <p className="text-xs text-red-400 mt-1">
                Actions performed in this section are highly destructive and cannot be undone. Please proceed with extreme caution.
              </p>
            </div>
          </div>

          <div className="border border-red-500/20 rounded-xl p-4 bg-red-950/10 space-y-4">
            <h4 className="text-sm font-semibold text-white">Delete Organization</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Deleting your organization will immediately and permanently remove the following records and assets:
            </p>
            <ul className="list-disc pl-5 text-xs text-gray-500 space-y-1">
              <li>The organization's details, settings, and team memberships.</li>
              <li>All created events, schedules, eligibility requirements, rules, and banners.</li>
              <li>All participant registrations, team lists, custom forms, and payment details.</li>
              <li>All uploaded files and payment screenshots from Cloudinary storage.</li>
              <li>All linked live Quiz Arena sessions, questions, rounds, and participant histories.</li>
            </ul>

            {!otpSent ? (
              <button
                type="button"
                disabled={isSendingOtp}
                onClick={async () => {
                  if (!confirm("Are you absolutely sure you want to request organization deletion? This will email a one-time passcode (OTP) to confirm deletion.")) {
                    return;
                  }
                  setIsSendingOtp(true);
                  try {
                    const res = await requestOrgDeletionOTP(settings.id);
                    if (res.success) {
                      setOtpSent(true);
                      toast.success("A verification OTP code has been sent to your email.");
                    } else {
                      toast.error("Failed to send OTP.");
                    }
                  } catch (err: any) {
                    toast.error(err.message || "An error occurred.");
                  } finally {
                    setIsSendingOtp(false);
                  }
                }}
                className="h-10 px-6 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending OTP Code...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Request Deletion OTP</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-4 border-t border-red-500/10 pt-4">
                <div className="max-w-xs">
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-red-400 mb-1.5">Enter 6-Digit Deletion OTP *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={deleteOtp}
                    onChange={(e) => setDeleteOtp(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-red-500/30 rounded-lg text-xs text-white placeholder-gray-700 font-mono tracking-widest text-center focus:outline-none focus:border-red-500"
                    placeholder="000000"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={isConfirmingDelete || deleteOtp.length !== 6}
                    onClick={async () => {
                      if (!confirm("FINAL WARNING: Deletion is completely permanent. Click OK to destroy all data and delete this organization.")) {
                        return;
                      }
                      setIsConfirmingDelete(true);
                      try {
                        const res = await confirmOrgDeletion(settings.id, deleteOtp);
                        if (res.success) {
                          toast.success("Organization successfully deleted.");
                          window.location.href = "/";
                        }
                      } catch (err: any) {
                        toast.error(err.message || "Invalid or expired OTP.");
                      } finally {
                        setIsConfirmingDelete(false);
                      }
                    }}
                    className="h-10 px-6 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isConfirmingDelete ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Deleting Permanently...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Confirm & Permanently Delete</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setDeleteOtp("");
                    }}
                    className="h-10 px-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white transition-all"
                  >
                    Cancel Deletion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
