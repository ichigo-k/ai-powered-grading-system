import { getClasses, getCourses } from "@/lib/admin-classes";
import ClassesClient from "./ClassesClient";
import { Users as UsersIcon } from "lucide-react";

export default async function AdminClassesPage() {
	const classes = await getClasses();
	const courses = await getCourses();

	return (
		<div className="mx-auto max-w-6xl space-y-8 pb-8">
			<header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-1">
					<h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
						<UsersIcon className="text-[#002388]" size={28} />
						Classes
					</h1>
					<p className="text-sm text-slate-500">
						Manage academic groups, their students, and course assignments.
					</p>
				</div>
			</header>

			<ClassesClient initialClasses={classes} courses={courses} />
		</div>
	);
}

