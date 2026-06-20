import { z } from "zod";

const teamMemberSchema = z.object({
  name: z.string().min(2, "Team member name is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  phone: z.string().optional(),
  collegeName: z.string().optional(),
  department: z.string().optional(),
  yearOrSemester: z.string().optional(),
  role: z.string().optional(),
});

export const registrationSchema = z.object({
  participantName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  collegeName: z.string().optional(),
  department: z.string().optional(),
  yearOrSemester: z.string().optional(),
  teamName: z.string().optional(),
  teamMembers: z.array(teamMemberSchema).optional(),
  paymentReference: z.string().optional(),
  notes: z.string().optional(),
}).passthrough();

export type RegistrationFormData = z.infer<typeof registrationSchema>;
