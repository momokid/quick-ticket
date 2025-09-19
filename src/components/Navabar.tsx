import { getCurrentUser } from "@/lib/current.user";
import Link from "next/link";
import LogOutButton from "./LogOutButton";

const Navbar = async () => {
  const user = await getCurrentUser();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div>
        <Link href="/" className="text-xl font-bold textblue-600">
          QuickTicket
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Link
              href="tickets/new"
              className="hover:underline text-gray-700 transition"
            >
              New Ticket
            </Link>
            <Link
              href="/tickets"
              className="hover:underline text-gray-700 transition"
            >
              My Tickets
            </Link>
            <LogOutButton />
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="hover:underline text-blue-700 transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-white px-4 py-2 rounded bg-blue-700 transition"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
