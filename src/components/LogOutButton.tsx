"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logOutUser } from "@/actions/auth.actions";
import { toast } from "sonner";
import { LuLogOut } from "react-icons/lu";

const LogOutButton = () => {
  const router = useRouter();

  const initialState = {
    success: false,
    message: "",
  };

  const [state, formAction, isPending] = useActionState(
    logOutUser,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Log out successful");
      router.push("/login");
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);
  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={isPending}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
      >
        {isPending ? "Logging out" : "Logout"}
      </button>
    </form>
  );
};

export default LogOutButton;
