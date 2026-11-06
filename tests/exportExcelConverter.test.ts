import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import * as XLSX from 'xlsx/xlsx.mjs';
import { convertDgfWorkbookToExportRows } from '../utils/exportExcelConverter.js';

describe('Export Excel Converter Tests', () => {
  const dgfPath = 'C:\\Users\\Osstem\\Documents\\카카오톡 받은 파일\\DGF 704264495(옵스팀).xlsx';

  it('converts real DGF excel file accurately and skips summary rows', () => {
    if (!fs.existsSync(dgfPath)) {
      console.log('Skipping real file test: dgfPath not found');
      return;
    }

    const buf = fs.readFileSync(dgfPath);
    const wb = XLSX.read(buf, { type: 'buffer' });
    const rows = convertDgfWorkbookToExportRows(wb);

    // DGF 704264495(옵스팀).xlsx has 21 valid items (Item 10 to 30) and 2 summary rows at the bottom
    assert.strictEqual(rows.length, 21, 'Should convert 21 valid item rows and exclude 2 summary rows');

    const first = rows[0];
    assert.ok(first);
    assert.strictEqual(first['HS 코드'], '8486902090');
    assert.strictEqual(first['원산지'], 'CN');
    assert.strictEqual(first['포장수량'], 0);
    assert.strictEqual(first['포장단위'], 'VO');
    assert.strictEqual(first['거래품명(=모델명2)'], 'BASE,ARC,V810,W');
    assert.strictEqual(first['모델명'], 'E17738420');
    assert.strictEqual(first['모델명2'], 'BASE,ARC,V810,W');
    assert.strictEqual(first['수량'], 2);
    assert.strictEqual(first['단위'], 'EA');
    assert.strictEqual(first['단가'], 533.08);
    assert.strictEqual(first['총금액'], 1066.16);
    assert.strictEqual(first['순중량'], 2);

    const last = rows[20];
    assert.ok(last);
    assert.strictEqual(last['HS 코드'], '8543709090');
    assert.strictEqual(last['원산지'], 'MY');
    assert.strictEqual(last['모델명'], '0190-80786');
    assert.strictEqual(last['수량'], 1);
    assert.strictEqual(last['단가'], 26969.11);
    assert.strictEqual(last['총금액'], 26969.11);
    assert.strictEqual(last['순중량'], 30);
  });
});
