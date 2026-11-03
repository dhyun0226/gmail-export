import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import * as XLSX from 'xlsx/xlsx.mjs';
import {
  parseExportDataWorkbook,
  parseDailyWorkbook,
  verifyExportForwarders
} from '../server/utils/exportForwarderProcessor.js';

describe('Export Forwarder Processor Tests', () => {
  const path1 = 'C:\\Users\\Osstem\\Documents\\카카오톡 받은 파일\\수출 포워더 검증 DAILY 양식_261102(월요일).xlsx';
  const path2 = 'C:\\Users\\Osstem\\Documents\\카카오톡 받은 파일\\수출데이터 1102.xls';

  it('parses real export data workbook correctly', () => {
    if (!fs.existsSync(path2)) {
      console.log('Skipping real file test: path2 not found');
      return;
    }
    const buf = fs.readFileSync(path2);
    const wb = XLSX.read(buf, { type: 'buffer' });
    const { exportList, formatErrors } = parseExportDataWorkbook(wb);

    assert.strictEqual(exportList.length, 60, 'Should have 60 export items');
    assert.strictEqual(formatErrors.length, 0, 'Should have 0 format errors in sample file');

    const first = exportList[0];
    assert.strictEqual(first.dclNo, '4388426106941X');
    assert.strictEqual(first.invNo, '704271218');
    assert.strictEqual(first.forwarder, 'DHL');
  });

  it('parses real DAILY workbook correctly', () => {
    if (!fs.existsSync(path1)) {
      console.log('Skipping real file test: path1 not found');
      return;
    }
    const buf = fs.readFileSync(path1);
    const wb = XLSX.read(buf, { type: 'buffer' });
    const { dailyMap, dailyCounts } = parseDailyWorkbook(wb);

    assert.strictEqual(dailyCounts['DGF'], 16);
    assert.strictEqual(dailyCounts['DHL'], 40);
    assert.strictEqual(dailyCounts['CNW'], 1);
    assert.strictEqual(dailyCounts['MORRISON'], 0);
    assert.strictEqual(dailyCounts['기타'], 0);
    assert.strictEqual(dailyMap.size, 57);
  });

  it('verifies real files and produces accurate comparison counts', () => {
    if (!fs.existsSync(path1) || !fs.existsSync(path2)) {
      return;
    }
    const wb1 = XLSX.read(fs.readFileSync(path1), { type: 'buffer' });
    const wb2 = XLSX.read(fs.readFileSync(path2), { type: 'buffer' });

    const { exportList, formatErrors } = parseExportDataWorkbook(wb2);
    const { dailyMap, dailyCounts, sheetNames } = parseDailyWorkbook(wb1);

    const result = verifyExportForwarders(exportList, formatErrors, dailyMap, dailyCounts, sheetNames);

    assert.strictEqual(result.totalExportRows, 60);
    assert.strictEqual(result.totalDailyRows, 57);
    assert.strictEqual(result.contractFormatErrors.length, 0);

    // DHL has export=41, daily=40
    const dhl = result.forwarderCounts.find((f) => f.forwarder === 'DHL');
    assert.ok(dhl);
    assert.strictEqual(dhl?.exportCount, 41);
    assert.strictEqual(dhl?.dailyCount, 40);
    assert.strictEqual(dhl?.diff, 1);
    assert.strictEqual(dhl?.isMatch, false);

    // CNW has export=1, daily=1
    const cnw = result.forwarderCounts.find((f) => f.forwarder === 'CNW');
    assert.ok(cnw);
    assert.strictEqual(cnw?.exportCount, 1);
    assert.strictEqual(cnw?.dailyCount, 1);
    assert.strictEqual(cnw?.diff, 0);
    assert.strictEqual(cnw?.isMatch, true);

    // Missing counts
    assert.strictEqual(result.counts.missingInDailyCount, 5);
    assert.strictEqual(result.counts.missingInExportCount, 2);
    assert.strictEqual(result.counts.mismatchCount, 0);
  });

  it('catches contract number format errors correctly', () => {
    // Mock export workbook where BD has no slash or is invalid
    const mockRows = [
      { A: '그룹식별', E: '신고번호', AZ: '인보이스 번호', BD: '계약번호1' },
      { E: '12345678X', AZ: 'INV001', BD: 'DHL/DP04/7057' }, // Valid
      { E: '99999999X', AZ: 'INV002', BD: 'NO_SLASH_HERE' }, // Error
      { E: '88888888X', AZ: 'INV003', BD: '' }, // Error
      { E: '77777777X', AZ: 'INV004', BD: '/ONLY_SLASH' } // Error (empty fwd)
    ];
    const ws = XLSX.utils.json_to_sheet(mockRows, { skipHeader: true });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    const { exportList, formatErrors } = parseExportDataWorkbook(wb);
    assert.strictEqual(exportList.length, 4);
    assert.strictEqual(formatErrors.length, 3);
    assert.strictEqual(formatErrors[0].dclNo, '99999999X');
    assert.strictEqual(formatErrors[1].dclNo, '88888888X');
    assert.strictEqual(formatErrors[2].dclNo, '77777777X');
  });

  it('detects forwarder mismatch between File 1 and File 2', () => {
    const exportList = [
      { row: 2, dclNo: 'DCL001', invNo: 'INV_A', rawContract: 'DHL/123', forwarder: 'DHL' },
      { row: 3, dclNo: 'DCL002', invNo: 'INV_B', rawContract: 'DGF/456', forwarder: 'DGF' }
    ];
    const dailyMap = new Map([
      ['INV_A', { invNo: 'INV_A', forwarder: 'DGF', sheetName: 'DGF', row: 2 }], // MISMATCH!
      ['INV_B', { invNo: 'INV_B', forwarder: 'DGF', sheetName: 'DGF', row: 3 }] // MATCH
    ]);
    const dailyCounts = { DHL: 0, DGF: 2 };

    const result = verifyExportForwarders(exportList, [], dailyMap, dailyCounts, ['DHL', 'DGF']);
    assert.strictEqual(result.counts.mismatchCount, 1);
    const mismatch = result.discrepancies.find((d) => d.type === 'MISMATCH');
    assert.ok(mismatch);
    assert.strictEqual(mismatch?.invNo, 'INV_A');
    assert.strictEqual(mismatch?.exportForwarder, 'DHL');
    assert.strictEqual(mismatch?.dailyForwarder, 'DGF');
  });
});
