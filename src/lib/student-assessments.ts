export type AssessmentType = "exam" | "quiz" | "test";
export type AssessmentStatus = "upcoming" | "ongoing" | "completed" | "missed";

export interface StudentAssessment {
	id: number;
	title: string;
	course: string;
	courseCode: string;
	courseColor: string;
	type: AssessmentType;
	status: AssessmentStatus;
	date: string;
	time: string;
	duration: string;
	venue: string;
	note?: string;
	score?: number;
	total?: number;
	grade?: string;
}

export const studentAssessments: StudentAssessment[] = [
	{
		id: 1,
		title: "Mid Semester Examination",
		course: "Introduction to Computing",
		courseCode: "CS101",
		courseColor: "#1967D2",
		type: "exam",
		status: "upcoming",
		date: "2026-04-25",
		time: "09:00 AM",
		duration: "2 hrs",
		venue: "Hall A",
		note: "Arrive 30 minutes early with your student ID.",
	},
	{
		id: 2,
		title: "Quiz 3",
		course: "Calculus I",
		courseCode: "MATH201",
		courseColor: "#7C3AED",
		type: "quiz",
		status: "upcoming",
		date: "2026-04-28",
		time: "02:00 PM",
		duration: "45 min",
		venue: "Room 204",
		note: "Calculator allowed. No formula sheet.",
	},
	{
		id: 3,
		title: "Database Systems Timed Test",
		course: "Database Systems",
		courseCode: "CS315",
		courseColor: "#0F766E",
		type: "test",
		status: "ongoing",
		date: "2026-04-22",
		time: "11:30 AM",
		duration: "1 hr",
		venue: "Lab 3",
		note: "Submission closes automatically at the end of the timer.",
	},
	{
		id: 4,
		title: "Practical Test",
		course: "Data Structures",
		courseCode: "CS301",
		courseColor: "#0891B2",
		type: "test",
		status: "upcoming",
		date: "2026-05-03",
		time: "10:00 AM",
		duration: "1.5 hrs",
		venue: "Lab 2",
	},
	{
		id: 5,
		title: "End of Semester Examination",
		course: "Technical Writing",
		courseCode: "ENG101",
		courseColor: "#059669",
		type: "exam",
		status: "upcoming",
		date: "2026-05-10",
		time: "08:00 AM",
		duration: "2 hrs",
		venue: "Hall B",
	},
	{
		id: 6,
		title: "Quiz 2",
		course: "Introduction to Computing",
		courseCode: "CS101",
		courseColor: "#1967D2",
		type: "quiz",
		status: "completed",
		date: "2026-04-14",
		time: "09:00 AM",
		duration: "45 min",
		venue: "Room 101",
		score: 88,
		total: 100,
		grade: "A",
	},
	{
		id: 7,
		title: "Quiz 1",
		course: "Calculus I",
		courseCode: "MATH201",
		courseColor: "#7C3AED",
		type: "quiz",
		status: "completed",
		date: "2026-04-10",
		time: "02:00 PM",
		duration: "45 min",
		venue: "Room 204",
		score: 74,
		total: 100,
		grade: "B+",
	},
	{
		id: 8,
		title: "Lab Test 1",
		course: "Data Structures",
		courseCode: "CS301",
		courseColor: "#0891B2",
		type: "test",
		status: "completed",
		date: "2026-04-07",
		time: "10:00 AM",
		duration: "1 hr",
		venue: "Lab 2",
		score: 92,
		total: 100,
		grade: "A+",
	},
	{
		id: 9,
		title: "Short Test 1",
		course: "Computer Networks",
		courseCode: "NET101",
		courseColor: "#D97706",
		type: "test",
		status: "missed",
		date: "2026-04-03",
		time: "01:00 PM",
		duration: "30 min",
		venue: "Room 118",
		note: "Contact your lecturer if you had an approved excuse.",
	},
];

export const studentAlerts = [
	{
		id: 1,
		title: "Venue updated",
		detail: "CS101 mid semester exam moved from Hall C to Hall A.",
	},
	{
		id: 2,
		title: "Result published",
		detail: "Your Data Structures lab test score is now available.",
	},
	{
		id: 3,
		title: "Live now",
		detail: "Database Systems timed test is currently open.",
	},
];

export const typeStyles: Record<AssessmentType, { bg: string; text: string }> =
{
	exam: { bg: "#FEE2E2", text: "#DC2626" },
	quiz: { bg: "#FEF3C7", text: "#D97706" },
	test: { bg: "#EDE9FE", text: "#7C3AED" },
};

export const statusStyles: Record<
	AssessmentStatus,
	{ bg: string; text: string }
> = {
	upcoming: { bg: "#EFF6FF", text: "#1967D2" },
	ongoing: { bg: "#DCFCE7", text: "#16A34A" },
	completed: { bg: "#F1F5F9", text: "#475569" },
	missed: { bg: "#FEF2F2", text: "#DC2626" },
};

export function gradeColor(grade: string) {
	if (grade.startsWith("A")) {
		return { bg: "#DCFCE7", text: "#16A34A" };
	}
	if (grade.startsWith("B")) {
		return { bg: "#DBEAFE", text: "#1967D2" };
	}
	return { bg: "#FEF3C7", text: "#D97706" };
}

export function formatAssessmentDate(
	date: string,
	format: "short" | "long" = "short",
) {
	return new Intl.DateTimeFormat("en-US", {
		month: format === "long" ? "long" : "short",
		day: "numeric",
		year: format === "long" ? "numeric" : undefined,
	}).format(new Date(`${date}T00:00:00`));
}

export function getRelativeLabel(date: string) {
	const today = new Date("2026-04-22T00:00:00");
	const target = new Date(`${date}T00:00:00`);
	const diff = Math.round((target.getTime() - today.getTime()) / 86400000);

	if (diff === 0) return "Today";
	if (diff === 1) return "Tomorrow";
	if (diff > 1) return `In ${diff} days`;
	if (diff === -1) return "Yesterday";
	return `${Math.abs(diff)} days ago`;
}

export function getDayNumber(date: string) {
	return new Date(`${date}T00:00:00`).getDate();
}

export function getMonthLabel(date: string) {
	return new Intl.DateTimeFormat("en-US", {
		month: "long",
		year: "numeric",
	}).format(new Date(`${date}T00:00:00`));
}

export const studentCourses = Array.from(
	new Map(
		studentAssessments.map((assessment) => [
			assessment.courseCode,
			{
				code: assessment.courseCode,
				title: assessment.course,
				color: assessment.courseColor,
			},
		]),
	).values(),
);
