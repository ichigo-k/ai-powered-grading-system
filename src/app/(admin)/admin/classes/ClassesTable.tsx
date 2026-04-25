import { getClasses, getCourses } from "@/lib/admin-classes";
import ClassesClient from "./ClassesClient";

export default async function ClassesTable() {
  const classes = await getClasses();
  const courses = await getCourses();

  return <ClassesClient initialClasses={classes} courses={courses} />;
}
