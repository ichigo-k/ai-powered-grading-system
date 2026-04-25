import { getUsersWithProfiles } from "@/lib/admin-users";
import UsersClient from "./UsersClient";
import { Users as UsersIcon } from "lucide-react";

export default async function AdminUsersPage() {
	const users = await getUsersWithProfiles();

	return (
		<div className="mx-auto max-w-6xl space-y-8 pb-8">
			<header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-1">
					<h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
						<UsersIcon className="text-[#002388]" size={28} />
						User Directory
					</h1>
					<p className="text-sm text-slate-500">
						Manage students, lecturers, and administrative staff from a central directory.
					</p>
				</div>
			</header>

			<UsersClient users={users} />
		</div>
	);
}
