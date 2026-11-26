export enum InvoiceStatus {
  BROUILLON = 'BROUILLON',
  ENVOYEE = 'ENVOYEE',
}

export enum ProformaStatus {
  BROUILLON = 'BROUILLON',
  ENVOYEE = 'ENVOYEE',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE',
}

export enum ClientType {
  PARTICULIER = 'PARTICULIER',
  ENTREPRISE = 'ENTREPRISE',
}

export enum PaymentMethod {
  VIREMENT = 'VIREMENT',
  ESPECES = 'ESPECES',
  MOBILE_MONEY = 'MOBILE_MONEY',
  CHEQUE = 'CHEQUE',
  AUTRE = 'AUTRE',
}
