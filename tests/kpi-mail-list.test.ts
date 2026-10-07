import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { applyMailDelayReason, buildMailTimeMap, extractDhlBlNumber, normalizeMailReceivedAt } from '../utils/kpiMailList'

describe('KPI unclassified mail list', () => {
  it('extracts the ten-digit BL following DHL', () => {
    assert.equal(extractDhlBlNumber('DHL 1172948383 (AMAT) - 통관 정보'), '1172948383')
    assert.equal(extractDhlBlNumber('Unrelated 1172948383'), undefined)
  })

  it('formats compact receive timestamps', () => {
    assert.equal(normalizeMailReceivedAt('20260920090119'), '2026-09-20 09:01')
  })

  it('keeps the earliest time after subject and BL deduplication', () => {
    assert.deepEqual(buildMailTimeMap([
      { receivedAt: '20260920110000', subject: 'DHL 1172948383 first title' },
      { receivedAt: '20260920090000', subject: 'DHL 1172948383 first title' },
      { receivedAt: '20260920080000', subject: 'DHL 1172948383 another title' },
      { receivedAt: '20260919070000', subject: 'not a DHL title' },
    ]), { '1172948383': '2026-09-20 08:00' })
  })

  it('only replaces blank or out-of-office delay reasons', () => {
    const preAlert = { reason: 'Pre-alert missing by carriers', controllable: 'Uncontrollable' }
    assert.deepEqual(applyMailDelayReason(null, true, 0.01), preAlert)
    assert.deepEqual(applyMailDelayReason({ reason: "Out of broker's office hours", controllable: 'Uncontrollable' }, true, 0.01), preAlert)
    assert.deepEqual(
      applyMailDelayReason({ reason: 'Existing reason', controllable: 'Controllable' }, true, 0.01),
      { reason: 'Existing reason', controllable: 'Controllable' },
    )
  })

  it('leaves reason columns blank for on-time shipments even with matched mail', () => {
    for (const diffTime of [-0.01, 0]) {
      for (const hasMatchedMail of [false, true]) {
        assert.equal(applyMailDelayReason(null, hasMatchedMail, diffTime), null)
        assert.equal(applyMailDelayReason({
          reason: 'Pre-alert missing by carriers', controllable: 'Uncontrollable',
        }, hasMatchedMail, diffTime), null)
      }
    }
  })

  it('preserves delayed shipments without matched mail', () => {
    const existing = { reason: 'Existing reason', controllable: 'Controllable' }
    assert.equal(applyMailDelayReason(existing, false, 0.01), existing)
    assert.equal(applyMailDelayReason(null, false, 0.01), null)
  })

  it('preserves existing handling when diff time cannot be calculated', () => {
    assert.deepEqual(applyMailDelayReason(null, true, null), {
      reason: 'Pre-alert missing by carriers', controllable: 'Uncontrollable',
    })
    assert.equal(applyMailDelayReason(null, false, null), null)
  })
})
