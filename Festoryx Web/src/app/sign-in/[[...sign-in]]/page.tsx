import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030014]">
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}
