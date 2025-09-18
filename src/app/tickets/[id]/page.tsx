import { getTicketById } from "@/actions/ticket.actions";
import { logEvent } from "@/utils/sentry";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPriorityClass } from "@/utils/UI";

const TicketDetailsPage = async (props: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await props.params;
  const ticket = await getTicketById(id);

  if (!ticket) {
    notFound();
  }

  logEvent("View ticket details", "ticket", { ticket: ticket.id }, "info");

  return (
    <div className="min-h-screen bg-bue-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded0lg border border-gray-200 p-8 space-y-6">
        <h1 className="text-3xl font-bold text-blue-600">{ticket.subject}</h1>

        <div className="text-gray-700">
          <h2 className="text-lg font-semibold mb-2">Priotiy</h2>
          <p className={getPriorityClass(ticket.priority)}>{ticket.priority}</p>
        </div>

        <div className="text-gray-700">
          <h2 className="text-lg font-semibold mb-2">Created At</h2>
          <p>{new Date(ticket.createdAt).toLocaleString()}</p>
        </div>

        <Link
          href="/tickets"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Back to Tickets
        </Link>
      </div>
    </div>
  );
};

export default TicketDetailsPage;
