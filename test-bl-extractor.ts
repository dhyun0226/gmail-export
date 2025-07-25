import { extractBlNumber, extractUpsShipmentInfo } from './server/utils/blExtractor';

// 테스트 케이스들
const testCases = [
  // 1. DHL 패턴 테스트
  {
    subject: 'DHL 3344617975 (APPLIED MATERIALS SOUTH EAST ASIA P)',
    expected: '3344617975',
    description: 'DHL 패턴 1'
  },
  {
    subject: 'DHL 1878056552 (APPLIED MATERIALS SOUTH EAST ASIA P) - 화물도착(예정)안내',
    expected: '1878056552',
    description: 'DHL 패턴 2'
  },
  
  // 2. UPS 패턴 테스트 (제목만)
  {
    subject: '[당일건] [Pre-Alert] 03ER03B4LQ7 외 1건',
    expected: '03ER03B4LQ7',
    description: 'UPS Pre-Alert 패턴 1'
  },
  {
    subject: '[Pre-Alert] 8459V44MTRT 외 19건',
    expected: '8459V44MTRT',
    description: 'UPS Pre-Alert 패턴 2'
  },
  
  // 3. EI 패턴 테스트
  {
    subject: 'Pre-Alert Applied Materials - TPE-ICN | [SL1] - HB: 4812412901| MB: 695-51375133',
    expected: '4812412901',
    description: 'EI HB 패턴 1 (SL1)'
  },
  {
    subject: 'AMAT Shipment Alert - HB: 4052747565 | MB: 016-09784832 | SL1 |Shipment: 17305881 | INV: 0703355759',
    expected: '4052747565',
    description: 'EI HB 패턴 2'
  },
  {
    subject: 'Applied Materials // HAWB# 4230771630 // MAWB# 180-26478023 // SL1 // Shiment no. 17304249 // Invoice no. 703354663',
    expected: '4230771630',
    description: 'EI HAWB 패턴'
  },
  {
    subject: '[SL1] AMAT Shipment Alert - HB: 4120797700 | MB: 180-26504870 | ETA ICN: 7/25/2025 3:25:00 PM | Flight NO.: KE92/24 | E000000012682348',
    expected: '4120797700',
    description: 'EI HB 패턴 3 (prefix SL1)'
  },
  
  // 4. DFG 패턴 테스트 (@dhl.com 발신자)
  {
    subject: 'G374089 / 98805597653 / 4520436594;S3;4520436541 / FCA Shippers dock;KKF2560015-1-KRAP',
    sender: 'sender@dhl.com',
    expected: 'G374089',
    description: 'DFG 패턴 1'
  },
  {
    subject: 'F558772 / TRKNGO2500643813 DGF;18041567761 / 4520108162;S3;0016704384;4520105147 / DAP Destination Airport;0703151768',
    sender: 'sender@dhl.com',
    expected: 'F558772',
    description: 'DFG 패턴 2'
  },
  
  // 5. CNW 패턴 테스트
  {
    subject: '++CNEE++ CNW Pre-Alert - 11477525 - UA805 JUL-25ICN - 016-78537896 - CARGOHOLIC INTERNATIONAL KOREA - SFO – ICN',
    expected: '11477525',
    description: 'CNW 패턴'
  }
];

console.log('BL 번호 추출 테스트 시작\n');
console.log('='.repeat(80));

let passCount = 0;
let failCount = 0;

testCases.forEach((testCase, index) => {
  const result = extractBlNumber(testCase.subject, testCase.sender);
  const pass = result === testCase.expected;
  
  console.log(`\n테스트 ${index + 1}: ${testCase.description}`);
  console.log(`제목: ${testCase.subject}`);
  if (testCase.sender) {
    console.log(`발신자: ${testCase.sender}`);
  }
  console.log(`예상값: ${testCase.expected}`);
  console.log(`실제값: ${result}`);
  console.log(`결과: ${pass ? '✅ PASS' : '❌ FAIL'}`);
  
  if (pass) {
    passCount++;
  } else {
    failCount++;
  }
});

console.log('\n' + '='.repeat(80));
console.log(`\n총 테스트: ${testCases.length}`);
console.log(`성공: ${passCount}`);
console.log(`실패: ${failCount}`);
console.log(`성공률: ${((passCount / testCases.length) * 100).toFixed(1)}%`);

// UPS Shipment 정보 추출 테스트
console.log('\n\n' + '='.repeat(80));
console.log('UPS Shipment 정보 추출 테스트\n');

const upsTestCases = [
  {
    subject: '[Pre-Alert] 8459V44MTRT 외 19건',
    body: `BL Number: 8459V44MTRT
Tracking: 1Z1234567890
Weight: 10kg

BL Number: 7652X33NQRS  
Tracking Number: 1Z9876543210
Weight: 5kg`,
    expected: [
      { blNumber: '8459V44MTRT', trackingNumber: '1Z1234567890' },
      { blNumber: '7652X33NQRS', trackingNumber: '1Z9876543210' }
    ],
    description: '헤더가 있는 표 형식'
  },
  {
    subject: '[Pre-Alert] 03ER03B4LQ7 외 1건',
    body: `03ER03B4LQ7
1Z1234567890
10kg

8459V44MTRT
1Z9876543210  
5kg`,
    expected: [
      { blNumber: '03ER03B4LQ7', trackingNumber: '1Z1234567890' },
      { blNumber: '8459V44MTRT', trackingNumber: '1Z9876543210' }
    ],
    description: '헤더가 없는 표 형식'
  }
];

upsTestCases.forEach((testCase, index) => {
  const results = extractUpsShipmentInfo(testCase.body, testCase.subject);
  
  console.log(`\nUPS 테스트 ${index + 1}: ${testCase.description}`);
  console.log(`제목: ${testCase.subject}`);
  console.log(`예상 결과:`);
  testCase.expected.forEach(exp => {
    console.log(`  - BL: ${exp.blNumber}, Tracking: ${exp.trackingNumber}`);
  });
  console.log(`실제 결과:`);
  results.forEach(res => {
    console.log(`  - BL: ${res.blNumber}, Tracking: ${res.trackingNumber}`);
  });
  
  const pass = results.length === testCase.expected.length &&
    results.every((res, i) => 
      res.blNumber === testCase.expected[i].blNumber &&
      res.trackingNumber === testCase.expected[i].trackingNumber
    );
  
  console.log(`결과: ${pass ? '✅ PASS' : '❌ FAIL'}`);
});