import { getUsersWithProfiles } from "@/lib/admin-users";
import { getClasses } from "@/lib/admin-classes";
import UsersClient from "./UsersClient";

export default async function UsersTable() {
  const users = await getUsersWithProfiles();
  const classes = await getClasses();

  return <UsersClient users={users} classes={classes} />;
}
