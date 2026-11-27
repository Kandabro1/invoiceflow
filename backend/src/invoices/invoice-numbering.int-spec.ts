import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { In } from 'typeorm';
import type { EntityManager } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { InvoiceCounter } from '../database/entities/invoice-counter.entity';
import { User } from '../database/entities/user.entity';
import { InvoiceNumberingService } from './invoice-numbering.service';

const MARCH = new Date('2026-03-15T12:00:00Z');
const APRIL = new Date('2026-04-02T12:00:00Z');

describe('InvoiceNumberingService (intégration MySQL)', () => {
  const service = new InvoiceNumberingService();
  const createdUserIds: number[] = [];

  async function createUser(): Promise<number> {
    const repository = AppDataSource.getRepository(User);
    const user = await repository.save(
      repository.create({
        email: `int-${randomUUID()}@invoiceflow.test`,
        passwordHash: 'not-a-real-hash',
        companyName: 'Test intégration',
      }),
    );
    createdUserIds.push(user.id);
    return user.id;
  }

  // Chaque appel s'exécute dans SA propre transaction, comme le fera l'envoi d'une facture.
  function nextNumber(userId: number, date: Date): Promise<string> {
    return AppDataSource.transaction((manager: EntityManager) =>
      service.prochainNumero(manager, userId, date),
    );
  }

  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  afterAll(async () => {
    if (!AppDataSource.isInitialized) {
      return;
    }
    if (createdUserIds.length > 0) {
      await AppDataSource.getRepository(InvoiceCounter).delete({
        userId: In(createdUserIds),
      });
      await AppDataSource.getRepository(User).delete(createdUserIds);
    }
    await AppDataSource.destroy();
  });

  it('numérote 001, 002, 003', async () => {
    const userId = await createUser();
    expect(await nextNumber(userId, MARCH)).toBe('FAC-2026-03-001');
    expect(await nextNumber(userId, MARCH)).toBe('FAC-2026-03-002');
    expect(await nextNumber(userId, MARCH)).toBe('FAC-2026-03-003');
  });

  it('un autre mois repart à 001, sans toucher au compteur du premier', async () => {
    const userId = await createUser();
    expect(await nextNumber(userId, MARCH)).toBe('FAC-2026-03-001');
    expect(await nextNumber(userId, MARCH)).toBe('FAC-2026-03-002');
    expect(await nextNumber(userId, APRIL)).toBe('FAC-2026-04-001');
    expect(await nextNumber(userId, MARCH)).toBe('FAC-2026-03-003');
  });

  it('lit le mois dans le fuseau Africa/Douala (changement d’année)', async () => {
    const userId = await createUser();
    // 22:00 UTC = 23:00 à Douala : encore décembre 2026
    expect(await nextNumber(userId, new Date('2026-12-31T22:00:00Z'))).toBe(
      'FAC-2026-12-001',
    );
    // 23:30 UTC = 00:30 à Douala : déjà janvier 2027
    expect(await nextNumber(userId, new Date('2026-12-31T23:30:00Z'))).toBe(
      'FAC-2027-01-001',
    );
  });

  it('deux utilisateurs ont des compteurs indépendants', async () => {
    const userA = await createUser();
    const userB = await createUser();
    expect(await nextNumber(userA, MARCH)).toBe('FAC-2026-03-001');
    expect(await nextNumber(userB, MARCH)).toBe('FAC-2026-03-001');
    expect(await nextNumber(userA, MARCH)).toBe('FAC-2026-03-002');
    expect(await nextNumber(userB, MARCH)).toBe('FAC-2026-03-002');
  });

  it('20 appels concurrents donnent 20 numéros distincts et contigus', async () => {
    const userId = await createUser(); // aucune ligne de compteur : la création est aussi en concurrence
    const numbers = await Promise.all(
      Array.from({ length: 20 }, () => nextNumber(userId, MARCH)),
    );
    const expected = Array.from(
      { length: 20 },
      (_, i) => `FAC-2026-03-${String(i + 1).padStart(3, '0')}`,
    );
    expect([...numbers].sort()).toEqual(expected);
  });

  it('un rollback ne consomme pas le numéro', async () => {
    const userId = await createUser();
    expect(await nextNumber(userId, MARCH)).toBe('FAC-2026-03-001');

    await expect(
      AppDataSource.transaction(async (manager: EntityManager) => {
        await service.prochainNumero(manager, userId, MARCH); // aurait été 002
        throw new Error('échec simulé');
      }),
    ).rejects.toThrow('échec simulé');

    expect(await nextNumber(userId, MARCH)).toBe('FAC-2026-03-002');
  });
});
