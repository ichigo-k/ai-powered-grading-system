import { prisma } from '@/lib/prisma'

/**
 * If a PUBLISHED assessment's endsAt has passed, close it in the DB and
 * return "CLOSED". Otherwise return the status unchanged.
 *
 * Call this whenever an assessment is fetched for display so the status
 * stays accurate without needing a background job.
 */
export async function autoCloseIfExpired(assessment: {
  id: number
  status: string
  endsAt: Date
}): Promise<string> {
  if (assessment.status === 'PUBLISHED' && new Date() > assessment.endsAt) {
    await prisma.assessment.update({
      where: { id: assessment.id },
      data: { status: 'CLOSED' },
    })
    return 'CLOSED'
  }
  return assessment.status
}

/**
 * Bulk version — closes all PUBLISHED assessments whose endsAt has passed
 * for a given lecturer. Returns the number of assessments closed.
 * Call this when rendering the assessments list.
 */
export async function autoCloseExpiredForLecturer(lecturerId: number): Promise<number> {
  const result = await prisma.assessment.updateMany({
    where: {
      lecturerId,
      status: 'PUBLISHED',
      endsAt: { lt: new Date() },
    },
    data: { status: 'CLOSED' },
  })
  return result.count
}
