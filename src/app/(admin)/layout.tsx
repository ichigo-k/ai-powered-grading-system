import { redirect } from "next/navigation";
import AdminNavbar from "@/components/layout/AdminNavbar";
import { getSession } from "@/lib/session";
import StudentFooter from "@/components/layout/StudentFooter";

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
		<div className="min-h-screen flex flex-col bg-white">
			<AdminNavbar userName={session.user.name} />
			<main className="flex-1 mx-auto w-full max-w-7xl p-4 md:p-6 xl:p-8">{children}</main>
			<StudentFooter />
		</div>
	);
}




