import test from 'node:test';
import assert from 'node:assert';
import { generateBusinessPlan } from '../utils/businessPlanEngine.ts';
import { computeCPC, computeBilan, computeVatSummary } from '../utils/accountingEngine.ts';
import { SAMPLE_ENTRIES } from '../data/sampleEntries.ts';

test('Business Plan Engine computes 3-year projections accurately', () => {
  const plan = generateBusinessPlan({
    baseCA: 1000000,
    growthRateYear1: 20,
    growthRateYear2: 15,
    growthRateYear3: 10,
    grossMarginRate: 40,
    payrollCost: 300000,
    externalCharges: 80000,
    initialInvestment: 200000,
    capitalContribution: 100000,
    bankLoanAmount: 100000,
    bankLoanInterestRate: 6,
    bankLoanDurationYears: 5,
    bfrDays: 45
  });

  assert.strictEqual(plan.years.length, 3);
  assert.strictEqual(plan.years[0].ca, 1200000);
  assert.ok(plan.years[0].margeBrute > 0);
  assert.ok(plan.years[0].seuilRentabilite > 0);
  assert.ok(plan.years[0].pointMortJours > 0 && plan.years[0].pointMortJours <= 365);
  assert.ok(plan.years[0].caf > 0);
});

test('Moroccan Accounting Engine computes CPC, Bilan and VAT for sample entries', () => {
  const cpc = computeCPC(SAMPLE_ENTRIES);
  const bilan = computeBilan(SAMPLE_ENTRIES);
  const vat = computeVatSummary(SAMPLE_ENTRIES);

  assert.ok(cpc.totalProduitsExploitation > 0, 'Produits d exploitation should be positive');
  assert.ok(cpc.totalChargesExploitation > 0, 'Charges d exploitation should be positive');
  assert.ok(bilan.actif.totalActif > 0, 'Bilan actif should be positive');
  assert.ok(bilan.passif.totalPassif > 0, 'Bilan passif should be positive');
  assert.strictEqual(bilan.actif.totalActif, bilan.passif.totalPassif, 'Bilan should balance (Actif = Passif)');
});

test('Excel Accounting Importer converts rows into valid Moroccan Accounting Entries', async () => {
  const XLSX = await import('xlsx');
  const { parseExcelAccountingFile } = await import('../utils/excelAccountingImporter.ts');
  const { SAMPLE_COMPANY } = await import('../data/sampleEntries.ts');

  const rows = [
    { 'Date': '2026-02-01', 'Journal': 'ACHATS', 'Référence': 'FAC-EXCEL-01', 'Compte PCM': '6111', 'Libellé': 'Achat marchandises', 'Débit': 50000, 'Crédit': 0 },
    { 'Date': '2026-02-01', 'Journal': 'ACHATS', 'Référence': 'FAC-EXCEL-01', 'Compte PCM': '34552', 'Libellé': 'TVA 20%', 'Débit': 10000, 'Crédit': 0 },
    { 'Date': '2026-02-01', 'Journal': 'ACHATS', 'Référence': 'FAC-EXCEL-01', 'Compte PCM': '4411', 'Libellé': 'Fournisseur', 'Débit': 0, 'Crédit': 60000 },
  ];

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Journal');
  const u8 = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  const file = new File([u8], 'test_import.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  const result = await parseExcelAccountingFile(file, SAMPLE_COMPANY);
  assert.strictEqual(result.entries.length, 1);
  assert.strictEqual(result.entries[0].lines.length, 3);
  assert.strictEqual(result.entries[0].journal, 'ACHATS');
});

