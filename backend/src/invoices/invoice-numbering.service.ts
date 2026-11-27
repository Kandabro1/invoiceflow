import { Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { InvoiceCounter } from '../database/entities/invoice-counter.entity';

// Année et mois lus dans le fuseau Africa/Douala, quel que soit le fuseau du serveur.
const DOUALA_YEAR_MONTH = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Africa/Douala',
  year: 'numeric',
  month: 'numeric',
});

@Injectable()
export class InvoiceNumberingService {
  async prochainNumero(
    manager: EntityManager,
    userId: number,
    date: Date,
  ): Promise<string> {
    const { year, month } = this.yearMonthOf(date);

    await this.ensureCounterRow(manager, userId, year, month);

    const counter = await manager.findOne(InvoiceCounter, {
      where: { userId, year, month },
      lock: { mode: 'pessimistic_write' },
    });
    if (counter === null) {
      throw new Error('Compteur de facture introuvable après sa création.');
    }

    const next: number = counter.lastNumber + 1;
    await manager.update(
      InvoiceCounter,
      { userId, year, month },
      { lastNumber: next },
    );

    const mm: string = String(month).padStart(2, '0');
    const nnn: string = String(next).padStart(3, '0');
    return `FAC-${year}-${mm}-${nnn}`;
  }

  private yearMonthOf(date: Date): { year: number; month: number } {
    const parts = DOUALA_YEAR_MONTH.formatToParts(date);
    const read = (type: 'year' | 'month'): number => {
      const part = parts.find((p) => p.type === type);
      if (part === undefined) {
        throw new Error(`Date invalide : ${type} introuvable.`);
      }
      return Number(part.value);
    };
    return { year: read('year'), month: read('month') };
  }

  // Crée la ligne du compteur si absente. Les noms de table et de colonnes
  // viennent des métadonnées de l'entité : aucun nom en dur.
  private async ensureCounterRow(
    manager: EntityManager,
    userId: number,
    year: number,
    month: number,
  ): Promise<void> {
    const meta = manager.connection.getMetadata(InvoiceCounter);
    const escape = (name: string): string =>
      manager.connection.driver.escape(name);
    const column = (property: string): string => {
      const found = meta.findColumnWithPropertyName(property);
      if (found === undefined) {
        throw new Error(
          `Colonne introuvable pour la propriété « ${property} ».`,
        );
      }
      return escape(found.databaseName);
    };

    const table: string = escape(meta.tableName);
    const colUser: string = column('userId');
    const colYear: string = column('year');
    const colMonth: string = column('month');
    const colLast: string = column('lastNumber');

    await manager.query(
      `INSERT INTO ${table} (${colUser}, ${colYear}, ${colMonth}, ${colLast}) ` +
        `VALUES (?, ?, ?, 0) ` +
        `ON DUPLICATE KEY UPDATE ${colLast} = ${colLast}`,
      [userId, year, month],
    );
  }
}
