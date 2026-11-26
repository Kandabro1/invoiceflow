import { InvoiceCalculationError } from './invoice-calculation.error';
import { InvoiceCalculatorService } from './invoice-calculator.service';

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

describe('InvoiceCalculatorService', () => {
  const service = new InvoiceCalculatorService();

  describe('calculerLigne', () => {
    it.each([
      [
        '2 x 50000.00 à 19.25',
        '2.000',
        '50000.00',
        '19.25',
        '100000.00',
        '19250.00',
        '119250.00',
      ],
      [
        '3 x 3333.33 à 19.25 (TVA 1924.998075 arrondie)',
        '3.000',
        '3333.33',
        '19.25',
        '9999.99',
        '1925.00',
        '11924.99',
      ],
      [
        '1.5 x 1999.99 à 19.25 (HT 2999.985 arrondi)',
        '1.500',
        '1999.99',
        '19.25',
        '2999.99',
        '577.50',
        '3577.49',
      ],
      [
        '1 x 100000.00 à 0 (exonéré)',
        '1.000',
        '100000.00',
        '0.00',
        '100000.00',
        '0.00',
        '100000.00',
      ],
      [
        'moitié vers le haut : 1 x 0.005',
        '1.000',
        '0.005',
        '19.25',
        '0.01',
        '0.00',
        '0.01',
      ],
      ['prix nul accepté', '1.000', '0.00', '19.25', '0.00', '0.00', '0.00'],
      [
        'taux 100 accepté',
        '1.000',
        '10.00',
        '100.00',
        '10.00',
        '10.00',
        '20.00',
      ],
    ])(
      '%s',
      (
        _label,
        quantity,
        unitPriceHt,
        appliedRate,
        totalHt,
        totalVat,
        totalTtc,
      ) => {
        expect(
          service.calculerLigne({ quantity, unitPriceHt, appliedRate }),
        ).toEqual({
          totalHt,
          totalVat,
          totalTtc,
        });
      },
    );

    it.each([
      ['quantité nulle', '0', '10.00', '19.25', 'INVALID_QUANTITY'],
      ['quantité négative', '-1', '10.00', '19.25', 'INVALID_QUANTITY'],
      ['prix négatif', '1', '-0.01', '19.25', 'INVALID_UNIT_PRICE'],
      ['taux négatif', '1', '10.00', '-0.01', 'INVALID_TAX_RATE'],
      ['taux supérieur à 100', '1', '10.00', '100.01', 'INVALID_TAX_RATE'],
      ['quantité non numérique', 'abc', '10.00', '19.25', 'INVALID_NUMBER'],
      ['prix infini', '1', 'Infinity', '19.25', 'INVALID_NUMBER'],
    ])('refuse : %s', (_label, quantity, unitPriceHt, appliedRate, code) => {
      const error = catchCalculationError(() =>
        service.calculerLigne({ quantity, unitPriceHt, appliedRate }),
      );
      expect(error.code).toBe(code);
    });
  });

  describe('recalculer', () => {
    it('somme les montants de lignes déjà arrondis', () => {
      const result = service.recalculer([
        { quantity: '2.000', unitPriceHt: '50000.00', appliedRate: '19.25' },
        { quantity: '3.000', unitPriceHt: '3333.33', appliedRate: '19.25' },
      ]);
      expect(result.lines).toEqual([
        { totalHt: '100000.00', totalVat: '19250.00', totalTtc: '119250.00' },
        { totalHt: '9999.99', totalVat: '1925.00', totalTtc: '11924.99' },
      ]);
      expect(result.totals).toEqual({
        totalHt: '109999.99',
        totalVat: '21175.00',
        totalTtc: '131174.99',
      });
    });

    it('additionne les lignes arrondies, pas la somme brute (3 x 0.005 -> 0.03)', () => {
      const line = {
        quantity: '1.000',
        unitPriceHt: '0.005',
        appliedRate: '0.00',
      };
      const result = service.recalculer([line, line, line]);
      expect(result.totals).toEqual({
        totalHt: '0.03',
        totalVat: '0.00',
        totalTtc: '0.03',
      });
    });

    it('document sans ligne : totaux à zéro', () => {
      expect(service.recalculer([]).totals).toEqual({
        totalHt: '0.00',
        totalVat: '0.00',
        totalTtc: '0.00',
      });
    });

    it('indique la position de la ligne fautive', () => {
      const error = catchCalculationError(() =>
        service.recalculer([
          { quantity: '1.000', unitPriceHt: '10.00', appliedRate: '19.25' },
          { quantity: '0', unitPriceHt: '10.00', appliedRate: '19.25' },
        ]),
      );
      expect(error.code).toBe('INVALID_QUANTITY');
      expect(error.lineIndex).toBe(1);
    });
  });
});
