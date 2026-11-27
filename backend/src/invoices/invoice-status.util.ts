import { Decimal } from 'decimal.js';
import { InvoiceCalculationError } from './invoice-calculation.error';

export type PaymentStatus = 'NON_PAYEE' | 'PARTIELLEMENT_PAYEE' | 'PAYEE';
export type StoredInvoiceStatus = 'BROUILLON' | 'ENVOYEE';

export interface Balance {
  paidAmount: string;
  balance: string;
}

export interface OverdueInput {
  status: StoredInvoiceStatus;
  dueDate: string;
  balance: string;
}

export interface SummaryInput {
  status: StoredInvoiceStatus;
  totalTtc: string;
  dueDate: string;
}

export interface PaymentSummary extends Balance {
  status: PaymentStatus;
  isOverdue: boolean;
}

const Money = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const DOUALA_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Africa/Douala',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function toMoney(raw: string, label: string): Decimal {
  let value: Decimal | null = null;
  try {
    value = new Money(raw);
  } catch {
    value = null;
  }
  if (value === null || !value.isFinite()) {
    throw new InvoiceCalculationError('INVALID_NUMBER', `${label} invalide.`);
  }
  return value;
}

function format(value: Decimal): string {
  return value.isZero() ? '0.00' : value.toFixed(2);
}

function assertIsoDate(raw: string, label: string): void {
  if (!ISO_DATE.test(raw)) {
    throw new InvoiceCalculationError(
      'INVALID_DATE',
      `${label} invalide (format AAAA-MM-JJ attendu).`,
    );
  }
}

/** Solde = TTC - somme des allocations (RG8). */
export function computeBalance(
  totalTtc: string,
  allocationAmounts: readonly string[],
): Balance {
  const ttc = toMoney(totalTtc, 'Total TTC');
  const paid = allocationAmounts.reduce(
    (acc, amount) => acc.plus(toMoney(amount, 'Montant alloué')),
    new Money(0),
  );
  return { paidAmount: format(paid), balance: format(ttc.minus(paid)) };
}

/** Statut de paiement calculé (P04). */
export function computePaymentStatus(
  totalTtc: string,
  paidAmount: string,
): PaymentStatus {
  const ttc = toMoney(totalTtc, 'Total TTC');
  const paid = toMoney(paidAmount, 'Montant payé');
  if (paid.gte(ttc)) {
    return 'PAYEE';
  }
  if (paid.gt(0)) {
    return 'PARTIELLEMENT_PAYEE';
  }
  return 'NON_PAYEE';
}

/** En retard (P05, RG9) : ENVOYEE, échéance dépassée et solde > 0. */
export function isOverdue(invoice: OverdueInput, today: string): boolean {
  assertIsoDate(invoice.dueDate, "Date d'échéance");
  assertIsoDate(today, 'Date du jour');
  return (
    invoice.status === 'ENVOYEE' &&
    invoice.dueDate < today &&
    toMoney(invoice.balance, 'Solde').gt(0)
  );
}

/** Objet « payment » du contrat d'API ; null tant que la facture est BROUILLON. */
export function computePaymentSummary(
  invoice: SummaryInput,
  allocationAmounts: readonly string[],
  today: string,
): PaymentSummary | null {
  if (invoice.status === 'BROUILLON') {
    return null;
  }
  const { paidAmount, balance } = computeBalance(
    invoice.totalTtc,
    allocationAmounts,
  );
  return {
    paidAmount,
    balance,
    status: computePaymentStatus(invoice.totalTtc, paidAmount),
    isOverdue: isOverdue(
      { status: invoice.status, dueDate: invoice.dueDate, balance },
      today,
    ),
  };
}

/** « Aujourd'hui » en AAAA-MM-JJ, fuseau Africa/Douala. L'horloge reste chez l'appelant. */
export function toDoualaDate(instant: Date): string {
  const parts = DOUALA_DATE.formatToParts(instant);
  const read = (type: 'year' | 'month' | 'day'): string => {
    const part = parts.find((p) => p.type === type);
    if (part === undefined) {
      throw new InvoiceCalculationError(
        'INVALID_DATE',
        'Date invalide : impossible de lire le jour.',
      );
    }
    return part.value;
  };
  return `${read('year')}-${read('month')}-${read('day')}`;
}
