import { SignIn } from "@clerk/nextjs";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030014]">
      <SignIn routing="hash" />
    </div>
  );
}
