import { Suspense } from "react";
import CoursesClient from "./CoursesClient";
import { getCoursesWithDetails, getClasses } from "@/lib/admin-classes";
import { getLecturers } from "@/lib/admin-users";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import LoadingLogo from "@/components/ui/LoadingLogo";
import { BookOpen } from "lucide-react";
import AddCourseButton from "./AddCourseButton";

async function CoursesDataWrapper() {
  const [courses, classes, lecturers] = await Promise.all([
    getCoursesWithDetails(),
    getClasses(),
    getLecturers(),
  ]);

  return <CoursesClient courses={courses} classes={classes} lecturers={lecturers} />;
}

export default function AdminCoursesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-8">
      {/* Static Header - Renders Immediately */}
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <BookOpen className="text-[#002388]" size={28} />
            Course Catalog
          </h1>
          <p className="text-sm text-slate-500">
            Manage academic courses, lecturer assignments, and class linkages.
          </p>
        </div>
        <AddCourseButton />
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
          <CoursesDataWrapper />
        </Suspense>
      </div>

      <div className="md:hidden mt-12 flex flex-col items-center justify-center text-center px-4">
        <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <BookOpen size={24} />
        </div>
        <p className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-2">Desktop/Tablet Required</p>
        <p className="text-xs font-medium text-slate-500 max-w-[250px]">
          The course catalog is optimized for larger screens. Please access this portal on a tablet or desktop to manage courses.
        </p>
      </div>
    </div>
  );
}
