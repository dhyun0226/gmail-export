import { processBlNumbers, generateStatistics } from '../../utils/kpi/dataProcessor'
import { matchDelayReason } from '../../utils/kpi/delayReasonMatcher'
import type { ImportProcessRequest, ImportKpiProcessResultExtended } from '../../utils/kpi/types'
import { applyMailDelayReason } from '../../../utils/kpiMailList'

export default defineEventHandler(async (event) => {
  const accessToken = getCookie(event, 'access_token')
  if (!accessToken) throw createError({ statusCode: 401, statusMessage: 'Unauthorized - Please login first' })

  try {
    const body = await readBody<ImportProcessRequest>(event)
    const { blNumbers, blYear, amatWeek, amatMonth, reasonMap, mailTimeMap } = body
    if (!blNumbers?.length) throw createError({ statusCode: 400, statusMessage: 'BL numbers are required' })

    const year = blYear || new Date().getFullYear().toString()
    const { results } = await processBlNumbers(blNumbers, year, mailTimeMap || {})
    const extendedResults: ImportKpiProcessResultExtended[] = results.map((result) => {
      const remarkText = reasonMap?.[result.blNumber] || ''
      const matchedDelay = matchDelayReason(remarkText, result)
      const delayMatch = applyMailDelayReason(matchedDelay, Boolean(result.mailReceiveTime))

      let diffTime: number | null = null
      if (result.importAcceptTime && result.lowerDeclAcceptTime) {
        const end = new Date(result.importAcceptTime)
        const start = new Date(result.lowerDeclAcceptTime)
        if (!Number.isNaN(end.getTime()) && !Number.isNaN(start.getTime())) {
          diffTime = Math.round((((end.getTime() - start.getTime()) / 86400000) - 0.2) * 100) / 100
        }
      }
      let gross = ''
      if (diffTime !== null) gross = diffTime > 0 ? 'N' : 'Y'
      let net = gross
      if (delayMatch?.controllable === 'Uncontrollable') net = 'Y'

      let dhlDiffTime: number | null = null
      if (result.importAcceptTime && result.mailReceiveTime) {
        const end = new Date(result.importAcceptTime)
        const start = new Date(result.mailReceiveTime)
        if (!Number.isNaN(end.getTime()) && !Number.isNaN(start.getTime())) {
          dhlDiffTime = Math.round(((end.getTime() - start.getTime()) / 86400000) * 100) / 100
        }
      }
      const dhlKpiDiff = dhlDiffTime === null ? null : Math.round((dhlDiffTime - 0.2) * 100) / 100

      return {
        ...result,
        amatWeek: amatWeek || '',
        amatMonth: amatMonth || '',
        delayReason: delayMatch?.reason || '',
        controllable: delayMatch?.controllable || '',
        gross,
        net,
        dhlDiffTime,
        dhlKpiDiff,
      }
    })

    return {
      success: true,
      results: extendedResults,
      statistics: generateStatistics(results),
      progress: {
        total: blNumbers.length,
        processed: results.length,
        phase: 'complete',
        message: `처리 완료: ${results.length}개 BL`,
      },
    }
  } catch (error: any) {
    console.error('[KPI Process] Error:', error)
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.statusMessage || error?.message || 'Processing failed',
    })
  }
})
