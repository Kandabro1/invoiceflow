import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { InvoiceCalculationError } from './invoice-calculation.error';

export interface LineAmountsInput {
  quantity: string;
  unitPriceHt: string;
  appliedRate: string;
}

export interface Amounts {
  totalHt: string;
  totalVat: string;
  totalTtc: string;
}

export interface RecalculationResult {
  lines: Amounts[];
  totals: Amounts;
}

interface ComputedLine {
  ht: Decimal;
  vat: Decimal;
  ttc: Decimal;
}

// Copie isolée de Decimal : ne touche pas à la configuration globale.
// precision 40 : quantité (12,3) x prix (15,2) peut dépasser les 20 chiffres par défaut.
const Money = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

const round2 = (value: Decimal): Decimal =>
  value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

@Injectable()
export class InvoiceCalculatorService {
  calculerLigne(input: LineAmountsInput): Amounts {
    return this.toAmounts(this.compute(input));
  }

  recalculer(lignes: readonly LineAmountsInput[]): RecalculationResult {
    const computed = lignes.map((ligne, index) => this.compute(ligne, index));
    const sum = (pick: (line: ComputedLine) => Decimal): Decimal =>
      computed.reduce((acc, line) => acc.plus(pick(line)), new Money(0));

    return {
      lines: computed.map((line) => this.toAmounts(line)),
      totals: this.toAmounts({
        ht: sum((l) => l.ht),
        vat: sum((l) => l.vat),
        ttc: sum((l) => l.ttc),
      }),
    };
  }

  private compute(input: LineAmountsInput, lineIndex?: number): ComputedLine {
    const quantity = this.parse(input.quantity, 'Quantité', lineIndex);
    const unitPrice = this.parse(
      input.unitPriceHt,
      'Prix unitaire HT',
      lineIndex,
    );
    const rate = this.parse(input.appliedRate, 'Taux de TVA', lineIndex);

    if (quantity.lte(0)) {
      throw new InvoiceCalculationError(
        'INVALID_QUANTITY',
        'La quantité doit être strictement positive.',
        lineIndex,
      );
    }
    if (unitPrice.lt(0)) {
      throw new InvoiceCalculationError(
        'INVALID_UNIT_PRICE',
        'Le prix unitaire HT ne peut pas être négatif.',
        lineIndex,
      );
    }
    if (rate.lt(0) || rate.gt(100)) {
      throw new InvoiceCalculationError(
        'INVALID_TAX_RATE',
        'Le taux de TVA doit être compris entre 0 et 100.',
        lineIndex,
      );
    }

    const ht = round2(quantity.times(unitPrice));
    const vat = round2(ht.times(rate).div(100));
    return { ht, vat, ttc: ht.plus(vat) };
  }

  private parse(raw: string, label: string, lineIndex?: number): Decimal {
    let value: Decimal | null = null;
    try {
      value = new Money(raw);
    } catch {
      value = null;
    }
    if (value === null || !value.isFinite()) {
      throw new InvoiceCalculationError(
        'INVALID_NUMBER',
        `${label} invalide.`,
        lineIndex,
      );
    }
    return value;
  }

  private toAmounts(line: ComputedLine): Amounts {
    return {
      totalHt: line.ht.toFixed(2),
      totalVat: line.vat.toFixed(2),
      totalTtc: line.ttc.toFixed(2),
    };
  }
}
