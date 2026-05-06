/**
 * Pure cooldown computation utility for re-grade rate limiting.
 *
 * This module is intentionally free of side effects and database calls so that
 * it can be property-tested with fast-check and used in any context without
 * coupling to the request lifecycle.
 */

/**
 * Computes the number of seconds remaining in a re-grade cooldown window.
 *
 * @param gradedAt       - The timestamp when the attempt was last graded.
 * @param cooldownMinutes - The cooldown duration in minutes (typically read
 *                          from REGRADE_COOLDOWN_MINUTES env var by the caller).
 * @param now            - The current time. Defaults to `new Date()`. Pass an
 *                          explicit value in tests to keep the function pure.
 * @returns `null` when the cooldown has expired or does not apply
 *          (elapsed time >= cooldown duration), or a positive integer
 *          (seconds, rounded up with Math.ceil) when still within the window.
 */
export function computeRetryAfterSeconds(
	gradedAt: Date,
	cooldownMinutes: number,
	now: Date = new Date(),
): number | null {
	const cooldownMs = cooldownMinutes * 60 * 1000;
	const expiryMs = gradedAt.getTime() + cooldownMs;
	const remainingMs = expiryMs - now.getTime();

	if (remainingMs <= 0) {
		return null;
	}

	return Math.ceil(remainingMs / 1000);
}
