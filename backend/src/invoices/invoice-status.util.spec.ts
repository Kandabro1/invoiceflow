import { InvoiceCalculationError } from './invoice-calculation.error';
import {
  computeBalance,
  computePaymentStatus,
  computePaymentSummary,
  isOverdue,
  toDoualaDate,
} from './invoice-status.util';

function catchCalculationError(fn: () => unknown): InvoiceCalculationError {
  try {
    fn();
  } catch (error: unknown) {
    if (error instanceof InvoiceCalculationError) {
      return error;
    }
    throw error;
  }
  throw new Error('Une InvoiceCalculationError était attendue');
}

describe('computeBalance', () => {
  it('solde = TTC - allocations', () => {
    expect(computeBalance('119250.00', ['50000.00', '19250.00'])).toEqual({
      paidAmount: '69250.00',
      balance: '50000.00',
    });
  });

  it('sans allocation : rien payé', () => {
    expect(computeBalance('119250.00', [])).toEqual({
      paidAmount: '0.00',
      balance: '119250.00',
    });
  });

  it('entièrement payée en deux fois : solde 0.00', () => {
    expect(computeBalance('119250.00', ['100000.00', '19250.00'])).toEqual({
      paidAmount: '119250.00',
      balance: '0.00',
    });
  });

  it('refuse un montant non numérique', () => {
    const error = catchCalculationError(() =>
      computeBalance('100.00', ['abc']),
    );
    expect(error.code).toBe('INVALID_NUMBER');
  });
});

describe('computePaymentStatus', () => {
  it.each([
    ['rien payé', '119250.00', '0.00', 'NON_PAYEE'],
    ['paiement partiel', '119250.00', '69250.00', 'PARTIELLEMENT_PAYEE'],
    ['un centime manquant', '119250.00', '119249.99', 'PARTIELLEMENT_PAYEE'],
    ['payé exactement', '119250.00', '119250.00', 'PAYEE'],
    ['facture à 0.00 : rien à payer', '0.00', '0.00', 'PAYEE'],
    ['sur-paiement (ne devrait pas arriver)', '100.00', '100.01', 'PAYEE'],
  ])('%s', (_label, totalTtc, paidAmount, expected) => {
    expect(computePaymentStatus(totalTtc, paidAmount)).toBe(expected);
  });
});

describe('isOverdue', () => {
  const today = '2026-11-27';

  it.each([
    ['échéance dépassée, solde > 0', 'ENVOYEE', '2026-11-26', '10.00', true],
    [
      "le jour de l'échéance : pas encore en retard",
      'ENVOYEE',
      '2026-11-27',
      '10.00',
      false,
    ],
    ['échéance future', 'ENVOYEE', '2026-12-01', '10.00', false],
    ['échéance dépassée mais soldée', 'ENVOYEE', '2026-11-01', '0.00', false],
    ['brouillon : jamais en retard', 'BROUILLON', '2026-11-01', '10.00', false],
  ] as const)('%s', (_label, status, dueDate, balance, expected) => {
    expect(isOverdue({ status, dueDate, balance }, today)).toBe(expected);
  });

  it('refuse une date mal formée', () => {
    const error = catchCalculationError(() =>
      isOverdue(
        { status: 'ENVOYEE', dueDate: '27/11/2026', balance: '1.00' },
        today,
      ),
    );
    expect(error.code).toBe('INVALID_DATE');
  });
});

describe('computePaymentSummary', () => {
  const today = '2026-11-27';

  it('brouillon : null', () => {
    expect(
      computePaymentSummary(
        { status: 'BROUILLON', totalTtc: '119250.00', dueDate: '2026-11-01' },
        [],
        today,
      ),
    ).toBeNull();
  });

  it('partiellement payée ET en retard (note de P05)', () => {
    expect(
      computePaymentSummary(
        { status: 'ENVOYEE', totalTtc: '119250.00', dueDate: '2026-11-01' },
        ['50000.00'],
        today,
      ),
    ).toEqual({
      paidAmount: '50000.00',
      balance: '69250.00',
      status: 'PARTIELLEMENT_PAYEE',
      isOverdue: true,
    });
  });

  it('payée après échéance : plus en retard', () => {
    expect(
      computePaymentSummary(
        { status: 'ENVOYEE', totalTtc: '119250.00', dueDate: '2026-11-01' },
        ['119250.00'],
        today,
      ),
    ).toEqual({
      paidAmount: '119250.00',
      balance: '0.00',
      status: 'PAYEE',
      isOverdue: false,
    });
  });
});

describe('toDoualaDate', () => {
  it.each([
    ['2026-11-27T12:00:00Z', '2026-11-27'],
    ['2026-11-26T23:30:00Z', '2026-11-27'],
    ['2026-11-27T22:59:59Z', '2026-11-27'],
    ['2026-11-27T23:00:00Z', '2026-11-28'],
  ])('%s -> %s', (iso, expected) => {
    expect(toDoualaDate(new Date(iso))).toBe(expected);
  });
});
