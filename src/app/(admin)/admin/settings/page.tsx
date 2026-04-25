import { 
	History,
	Settings2,
} from "lucide-react";
import Link from "next/link";
import { getAuditLogs } from "@/lib/audit";
import SystemLogsTable from "./SystemLogsTable";
import SystemSettingsForm from "./SystemSettingsForm";
import { getSystemSettingsAction } from "@/app/actions/admin-settings-server";

export default async function AdminSettingsPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>;
}) {
    const { tab } = await searchParams;
    const activeTab = tab || "system";
    const logs = await getAuditLogs({ limit: 100 });
	const systemSettings = await getSystemSettingsAction();

	return (
		<div className="mx-auto max-w-6xl space-y-12">
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-12">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
					<p className="text-sm font-medium text-slate-500">Manage system-wide configurations and audit trails.</p>
				</div>
                
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 self-start">
                    <Link 
                        href="/admin/settings?tab=system"
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                            activeTab === "system" 
                                ? "bg-white text-[#002388] shadow-sm ring-1 ring-slate-200" 
                                : "text-slate-400 hover:text-slate-600"
                        }`}
                    >
                        <Settings2 size={14} />
                        System Settings
                    </Link>
                    <Link 
                        href="/admin/settings?tab=logs"
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                            activeTab === "logs" 
                                ? "bg-white text-[#002388] shadow-sm ring-1 ring-slate-200" 
                                : "text-slate-400 hover:text-slate-600"
                        }`}
                    >
                        <History size={14} />
                        Audit Logs
                    </Link>
                </div>
			</div>

			{activeTab === "system" ? (
                <div className="max-w-2xl space-y-10">
                    <SystemSettingsForm initialSettings={systemSettings} />
                </div>
            ) : (
                <SystemLogsTable initialLogs={logs as any} />
            )}
		</div>
	);
}

