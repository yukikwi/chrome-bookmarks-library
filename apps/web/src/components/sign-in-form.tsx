"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import Loader from "./loader";
import { Button } from "./ui/button";

export default function SignInForm() {
  const router = useRouter();
  const { isPending } = authClient.useSession();

  const login = async () => {
    await authClient.signIn.social(
      {
        provider: "yuki2th",
      },
      {
        onSuccess: () => {
          router.push("/dashboard");
          toast.success("Sign in successful");
        },
        onError: (error) => {
          toast.error(error.error.message || error.error.statusText);
        },
      },
    );
  };

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-md p-6">
      <h1 className="mb-6 text-center font-bold text-3xl">Welcome Back</h1>

      <Button className="w-full" onClick={login}>
        Sign In via Yuki2th
      </Button>
    </div>
  );
}
