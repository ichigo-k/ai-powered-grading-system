export const adminStats = [
	{
		label: "Students",
		value: "14,208",
		help: "Across all active classes",
		color: "#1967D2",
		bg: "#EFF6FF",
	},
	{
		label: "Lecturers",
		value: "186",
		help: "Assigned and available",
		color: "#0F766E",
		bg: "#ECFDF5",
	},
	{
		label: "Classes",
		value: "64",
		help: "Academic groups configured",
		color: "#7C3AED",
		bg: "#F5F3FF",
	},
	{
		label: "Courses",
		value: "42",
		help: "Visible this semester",
		color: "#D97706",
		bg: "#FFF7ED",
	},
];

export const adminStructuralStats = [
	{
		label: "Suspended Accounts",
		value: "7",
		tone: "#DC2626",
		bg: "#FEF2F2",
	},
	{
		label: "Classes Without Courses",
		value: "3",
		tone: "#D97706",
		bg: "#FFFBEB",
	},
	{
		label: "Courses Without Lecturers",
		value: "5",
		tone: "#1967D2",
		bg: "#EFF6FF",
	},
];

export const recentUsers = [
	{
		name: "Kwame Asante",
		id: "STU-2024-001",
		role: "Student",
		meta: "CS3A / BSc. Computer Science",
		status: "Active",
	},
	{
		name: "Abena Mensah",
		id: "STU-2024-002",
		role: "Student",
		meta: "IT2B / BSc. IT",
		status: "Pending Class",
	},
	{
		name: "Dr. Kofi Boateng",
		id: "LEC-2024-014",
		role: "Lecturer",
		meta: "Department of Computing",
		status: "Active",
	},
	{
		name: "Naa Ofori",
		id: "ADM-2024-006",
		role: "Admin",
		meta: "Academic Affairs",
		status: "Active",
	},
	{
		name: "John Doe",
		id: "STU-2024-099",
		role: "Student",
		meta: "CS1A / BSc. Computer Science",
		status: "Suspended",
	},
];

export const classes = [
	{
		name: "CS3A",
		students: 118,
		courses: 6,
		lead: "Dr. Mensah",
		status: "Ready",
	},
	{
		name: "IT2B",
		students: 94,
		courses: 4,
		lead: "Mrs. Frimpong",
		status: "Needs Courses",
	},
	{
		name: "CS2C",
		students: 101,
		courses: 5,
		lead: "Mr. Darko",
		status: "Ready",
	},
	{
		name: "TEL1A",
		students: 88,
		courses: 0,
		lead: "Unassigned",
		status: "Setup Required",
	},
];

export const courseAssignments = [
	{
		code: "CS301",
		title: "Data Structures",
		lecturer: "Dr. Boateng",
		classes: ["CS3A", "CS3B"],
		status: "Complete",
	},
	{
		code: "MATH201",
		title: "Calculus I",
		lecturer: "Prof. Agyei",
		classes: ["IT2B", "CS2C"],
		status: "Complete",
	},
	{
		code: "NET401",
		title: "Network Security",
		lecturer: "Unassigned",
		classes: ["CS4A"],
		status: "Missing Lecturer",
	},
	{
		code: "ENG101",
		title: "Technical Writing",
		lecturer: "Mrs. Owusu",
		classes: [],
		status: "Missing Classes",
	},
];

export const setupAlerts = [
	"5 courses still need lecturer assignment.",
	"3 classes are active but not linked to any course.",
	"12 students were created but not attached to a class.",
	"2 suspended lecturers are still attached to course records.",
];

export const quickActions = [
	{ label: "Add Student", href: "/admin/users" },
	{ label: "Add Lecturer", href: "/admin/users" },
	{ label: "Create Admin", href: "/admin/users" },
	{ label: "Create Class", href: "/admin/classes" },
	{ label: "Create Course", href: "/admin/courses" },
	{ label: "Assign Lecturer", href: "/admin/courses" },
];
