export type InvoiceCalculationErrorCode =
  | 'INVALID_NUMBER'
  | 'INVALID_QUANTITY'
  | 'INVALID_UNIT_PRICE'
  | 'INVALID_TAX_RATE';

export class InvoiceCalculationError extends Error {
  constructor(
    public readonly code: InvoiceCalculationErrorCode,
    message: string,
    public readonly lineIndex?: number,
  ) {
    super(message);
    this.name = 'InvoiceCalculationError';
  }
}
