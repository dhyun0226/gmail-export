import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import * as XLSX from 'xlsx/xlsx.mjs';
import {
  parseMailListWorkbook,
  parseUpsWorkbook,
  parseMailDate,
  parseUpsDate
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
});
