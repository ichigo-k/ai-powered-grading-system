"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { BookPlus } from "lucide-react";

export default function AddCourseButton() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("add", "true");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <button 
      onClick={handleClick}
      className="flex items-center gap-2 rounded-xl bg-[#002388] px-5 py-2.5 text-sm font-normal text-white transition-all hover:bg-[#0B4DBB] shadow-lg shadow-blue-900/10"
    >
      <BookPlus size={18} />
      Add New Course
    </button>
  );
}
