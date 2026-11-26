import { AppDataSource } from '../data-source';
import { TaxRate } from '../entities/tax-rate.entity';

async function run(): Promise<void> {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(TaxRate);

  const seeds = [
    { code: 'NORMAL', rate: '19.25', isExempt: false },
    { code: 'EXONERE', rate: '0.00', isExempt: true },
  ];

  for (const seed of seeds) {
    const exists = await repo.findOneBy({ code: seed.code });
    if (!exists) {
      await repo.save(repo.create(seed));
      console.warn(`Taux ${seed.code} ajouté.`);
    } else {
      console.warn(`Taux ${seed.code} existe déjà, ignoré.`);
    }
  }

  await AppDataSource.destroy();
}

void run();
