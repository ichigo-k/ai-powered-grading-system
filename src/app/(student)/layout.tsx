import { redirect } from "next/navigation";
import StudentFooter from "@/components/layout/StudentFooter";
import StudentNavbar from "@/components/layout/StudentNavbar";
import { getSession } from "@/lib/session";

export default async function StudentLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getSession();

	if (!session || session.user.role !== "STUDENT") {
		redirect("/");
	}

	return (
		<div
			className="min-h-screen flex flex-col"
			style={{ backgroundColor: "#F9FBFD" }}
		>
			<StudentNavbar userName={session.user.name} />
			<main className="flex-1 px-4 md:px-8 py-6 animate-in fade-in duration-500">
				{children}
			</main>
			<StudentFooter />
		</div>
	);
}
