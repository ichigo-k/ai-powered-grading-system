import { redirect } from "next/navigation";
import AdminNavbar from "@/components/layout/AdminNavbar";
import { getSession } from "@/lib/session";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getSession();

	if (!session || session.user.role !== "ADMIN") {
		redirect("/");
	}

	return (
		<div className="min-h-screen bg-white">
			<AdminNavbar userName={session.user.name} />
			<main className="mx-auto max-w-7xl p-4 md:p-6 xl:p-8">{children}</main>
		</div>
	);
}




