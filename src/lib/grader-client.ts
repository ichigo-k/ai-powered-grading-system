/**
 * HTTP client for the Django grader microservice.
 *
 * All calls require the X-API-Key header. Both GRADER_URL and GRADER_API_KEY
 * are read from process.env at call time so that tests can override them via
 * environment variables without module-level caching issues.
 */

function getGraderConfig(): { graderUrl: string; graderApiKey: string } {
	const graderUrl = process.env.GRADER_URL;
	if (!graderUrl) {
		throw new Error("GRADER_URL environment variable is not set");
	}

	const graderApiKey = process.env.GRADER_API_KEY;
	if (!graderApiKey) {
		throw new Error("GRADER_API_KEY environment variable is not set");
	}

	return { graderUrl, graderApiKey };
}

/**
 * Calls POST <GRADER_URL>/api/grade/assessment/{assessmentId}/
 *
 * Batch-grades all eligible attempts for the given assessment.
 * Returns the raw Response so callers can inspect status and body.
 */
export async function callGraderBatch(assessmentId: number): Promise<Response> {
	const { graderUrl, graderApiKey } = getGraderConfig();

	return fetch(`${graderUrl}/api/grade/assessment/${assessmentId}/`, {
		method: "POST",
		headers: {
			"X-API-Key": graderApiKey,
		},
	});
}

/**
 * Calls POST <GRADER_URL>/api/grade/attempt/{attemptId}/
 *
 * Grades a single attempt. Returns the raw Response so callers can inspect
 * status and body.
 */
export async function callGraderSingle(attemptId: number): Promise<Response> {
	const { graderUrl, graderApiKey } = getGraderConfig();

	return fetch(`${graderUrl}/api/grade/attempt/${attemptId}/`, {
		method: "POST",
		headers: {
			"X-API-Key": graderApiKey,
		},
	});
}
