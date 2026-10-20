import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import * as XLSX from 'xlsx/xlsx.mjs';
import {
  parseMailListWorkbook,
  parseUpsWorkbook,
  parseMissingWorkbook,
  parseMailDate,
  parseUpsDate,
  calculateNextMissingTag
} from '../server/utils/milestoneProcessor.js';

describe('Milestone Processor Tests', () => {
  it('should parse mail date correctly', () => {
    const res = parseMailDate('20261019080145');
    assert.strictEqual(res.date, '20261019');
    assert.strictEqual(res.time, '8:01');
    assert.strictEqual(res.display, '2026-10-19 08:01');
  });

  it('should parse UPS excel date correctly', () => {
    // 46314.58466435185 is 2026-10-19 14:01:55
    const res = parseUpsDate(46314.58466435185);
    assert.strictEqual(res.date, '20261019');
    assert.strictEqual(res.time, '14:01');
    assert.strictEqual(res.display, '2026-10-19 14:01');
  });

  it('should parse real mail list file', () => {
    const buf = fs.readFileSync('docs/1020/마일스톤 메일목록.xls');
    const wb = XLSX.read(buf, { type: 'buffer' });
    const shipments = parseMailListWorkbook(wb, true);

    assert.ok(shipments.length > 0, 'Shipments should not be empty');
    assert.strictEqual(shipments.length, 37, 'Should extract 37 unique BL shipments');

    const first = shipments.find(s => s.blNumber === '9797583611');
    assert.ok(first, 'BL 9797583611 should exist');
    assert.strictEqual(first?.emailDate, '20261019');
    assert.strictEqual(first?.emailTime, '8:01');
  });

  it('should parse real UPS upload file', () => {
    const buf = fs.readFileSync('docs/1020/UPS 업로드파일.xlsx');
    const wb = XLSX.read(buf, { type: 'buffer' });
    const shipments = parseUpsWorkbook(wb);

    assert.strictEqual(shipments.length, 2, 'Should extract 2 shipments from UPS file');
    assert.strictEqual(shipments[0].blNumber, '8459V5CV7DY');
    assert.strictEqual(shipments[0].trackingNumber, '1Z8459V56731125101');
    assert.strictEqual(shipments[0].emailDate, '20261019');
    assert.strictEqual(shipments[0].emailTime, '14:01');

    assert.strictEqual(shipments[1].blNumber, '04867X9RV9C');
    assert.strictEqual(shipments[1].trackingNumber, '1Z04867X6721585783');
  });

  describe('Missing Milestone & Re-fetch Tag Calculation', () => {
    it('identifies new item missing both SC and CT as SC,CT', () => {
      const tag = calculateNextMissingTag({
        reFetchTag: '',
        acceptanceDate: '',
        acceptanceTime: '',
        clearanceDate: '',
        clearanceTime: ''
      });
      assert.strictEqual(tag, 'SC,CT');
    });

    it('identifies new item with SC but missing CT as CT', () => {
      const tag = calculateNextMissingTag({
        reFetchTag: '',
        acceptanceDate: '20261019',
        acceptanceTime: '10:07',
        clearanceDate: '',
        clearanceTime: ''
      });
      assert.strictEqual(tag, 'CT');
    });

    it('identifies new item with both SC and CT as completed (null)', () => {
      const tag = calculateNextMissingTag({
        reFetchTag: '',
        acceptanceDate: '20261019',
        acceptanceTime: '10:07',
        clearanceDate: '20261019',
        clearanceTime: '11:07'
      });
      assert.strictEqual(tag, null);
    });

    it('updates previous SC,CT tag to CT when SC is obtained today but CT is still missing', () => {
      const tag = calculateNextMissingTag({
        reFetchTag: 'SC,CT',
        acceptanceDate: '20261020',
        acceptanceTime: '09:30',
        clearanceDate: '',
        clearanceTime: ''
      });
      assert.strictEqual(tag, 'CT');
    });

    it('marks previous CT tag as completed (null) when CT is obtained today', () => {
      const tag = calculateNextMissingTag({
        reFetchTag: 'CT',
        acceptanceDate: '20261019', // already had SC
        acceptanceTime: '10:07',
        clearanceDate: '20261020',
        clearanceTime: '14:00'
      });
      assert.strictEqual(tag, null);
    });

    it('parses missing milestones workbook correctly', () => {
      const sampleRows = [
        ['B/L 번호', '누락항목', '누락 상세', 'Tracking 번호', '메일 수신일시', '구분', '메일 제목'],
        ['BL123456', 'SC,CT', '신고/수리 누락', '', '20261019080000', '일반', 'Test Mail 1'],
        ['BL789012', 'CT', '수리 누락', '1Z999999', '20261019140000', 'UPS', 'UPS Mail 2']
      ];
      const ws = XLSX.utils.aoa_to_sheet(sampleRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Missing');

      const parsed = parseMissingWorkbook(wb);
      assert.strictEqual(parsed.length, 2);

      assert.strictEqual(parsed[0].blNumber, 'BL123456');
      assert.strictEqual(parsed[0].reFetchTag, 'SC,CT');
      assert.strictEqual(parsed[0].isUps, false);

      assert.strictEqual(parsed[1].blNumber, 'BL789012');
      assert.strictEqual(parsed[1].reFetchTag, 'CT');
      assert.strictEqual(parsed[1].isUps, true);
      assert.strictEqual(parsed[1].trackingNumber, '1Z999999');
    });
  });
});
