# InvoiceFlow - Backend

API NestJS pour l'application de facturation InvoiceFlow.

## Prérequis

- Node.js 24 (LTS)
- XAMPP (MariaDB/MySQL) lancé en local
- Base de données `invoiceflow` et utilisateur `invoiceflow_user` déjà créés (voir script SQL dans l'historique Git ou `docs/`).

## Démarrage local (5 commandes)

```bash
# 1. Installer les dépendances
npm install

# 2. Copier la configuration d'environnement
cp .env.example .env

# 3. Appliquer les migrations et le seed initial
npm run migration:run && npm run seed:run

# 4. Lancer le serveur de développement
npm run start:dev