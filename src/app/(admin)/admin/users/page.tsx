import { Suspense } from "react";
import UsersTable from "./UsersTable";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import LoadingLogo from "@/components/ui/LoadingLogo";
import { Users as UsersIcon } from "lucide-react";

export default function AdminUsersPage() {
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

			<div className="hidden md:block">
				<Suspense
					fallback={
						<div className="relative">
							<TableSkeleton />
							<div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
								<div className="scale-75 opacity-80">
									<LoadingLogo />
								</div>
							</div>
						</div>
					}
				>
					<UsersTable />
				</Suspense>
			</div>

			<div className="md:hidden mt-12 flex flex-col items-center justify-center text-center px-4">
				<div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
					<UsersIcon size={24} />
				</div>
				<p className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-2">Desktop/Tablet Required</p>
				<p className="text-xs font-medium text-slate-500 max-w-[250px]">
					The user directory is optimized for larger screens. Please access this portal on a tablet or desktop to manage users.
				</p>
			</div>
		</div>
	);
}
