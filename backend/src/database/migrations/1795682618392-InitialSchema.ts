import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1795682618392 implements MigrationInterface {
    name = 'InitialSchema1795682618392'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`facture\` (\`id\` int NOT NULL AUTO_INCREMENT, \`utilisateur_id\` int NOT NULL, \`client_id\` int NOT NULL, \`proforma_id\` int NULL, \`number\` varchar(20) NULL, \`status\` enum ('BROUILLON', 'ENVOYEE') NOT NULL DEFAULT 'BROUILLON', \`date_emission\` date NOT NULL, \`date_echeance\` date NOT NULL, \`date_envoi\` datetime NULL, \`currency\` varchar(3) NOT NULL DEFAULT 'XAF', \`notes\` text NULL, \`montant_ht\` decimal(15,2) NOT NULL DEFAULT '0.00', \`montant_tva\` decimal(15,2) NOT NULL DEFAULT '0.00', \`montant_ttc\` decimal(15,2) NOT NULL DEFAULT '0.00', \`emetteur_snapshot\` json NULL, \`client_snapshot\` json NULL, \`cree_le\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`uq_facture_numero\` (\`utilisateur_id\`, \`number\`), INDEX \`idx_facture_utilisateur_echeance\` (\`utilisateur_id\`, \`date_echeance\`), INDEX \`idx_facture_utilisateur_statut\` (\`utilisateur_id\`, \`status\`), INDEX \`idx_facture_utilisateur\` (\`utilisateur_id\`), UNIQUE INDEX \`REL_d15fb82b2ed116d4e579105ec9\` (\`proforma_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ligne_facture\` (\`id\` int NOT NULL AUTO_INCREMENT, \`facture_id\` int NOT NULL, \`taux_tva_id\` int NOT NULL, \`position\` int NOT NULL, \`description\` text NOT NULL, \`quantity\` decimal(12,3) NOT NULL, \`prix_unitaire_ht\` decimal(15,2) NOT NULL, \`taux_applique\` decimal(5,2) NOT NULL, INDEX \`idx_ligne_facture_facture\` (\`facture_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`taux_tva\` (\`id\` int NOT NULL AUTO_INCREMENT, \`code\` varchar(50) NOT NULL, \`rate\` decimal(5,2) NOT NULL, \`est_exonere\` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX \`IDX_3ed4e22c3fe8119f1a36e3f9da\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ligne_proforma\` (\`id\` int NOT NULL AUTO_INCREMENT, \`proforma_id\` int NOT NULL, \`taux_tva_id\` int NOT NULL, \`position\` int NOT NULL, \`description\` text NOT NULL, \`quantity\` decimal(12,3) NOT NULL, \`prix_unitaire_ht\` decimal(15,2) NOT NULL, INDEX \`idx_ligne_proforma_proforma\` (\`proforma_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`proforma\` (\`id\` int NOT NULL AUTO_INCREMENT, \`utilisateur_id\` int NOT NULL, \`client_id\` int NOT NULL, \`reference\` varchar(50) NOT NULL, \`status\` enum ('BROUILLON', 'ENVOYEE', 'ACCEPTEE', 'REFUSEE') NOT NULL DEFAULT 'BROUILLON', \`date_emission\` date NULL, \`date_validite\` date NULL, \`currency\` varchar(3) NOT NULL DEFAULT 'XAF', \`notes\` text NULL, \`montant_ht\` decimal(15,2) NOT NULL DEFAULT '0.00', \`montant_tva\` decimal(15,2) NOT NULL DEFAULT '0.00', \`montant_ttc\` decimal(15,2) NOT NULL DEFAULT '0.00', \`cree_le\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`idx_proforma_reference\` (\`utilisateur_id\`, \`reference\`), INDEX \`idx_proforma_utilisateur\` (\`utilisateur_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`allocation_paiement\` (\`id\` int NOT NULL AUTO_INCREMENT, \`paiement_id\` int NOT NULL, \`facture_id\` int NOT NULL, \`montant_alloue\` decimal(15,2) NOT NULL, INDEX \`idx_allocation_facture\` (\`facture_id\`), INDEX \`idx_allocation_paiement\` (\`paiement_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`paiement\` (\`id\` int NOT NULL AUTO_INCREMENT, \`utilisateur_id\` int NOT NULL, \`client_id\` int NOT NULL, \`date_paiement\` date NOT NULL, \`amount\` decimal(15,2) NOT NULL, \`method\` enum ('VIREMENT', 'ESPECES', 'MOBILE_MONEY', 'CHEQUE', 'AUTRE') NOT NULL, \`cree_le\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`idx_paiement_client\` (\`client_id\`), INDEX \`idx_paiement_utilisateur\` (\`utilisateur_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`client\` (\`id\` int NOT NULL AUTO_INCREMENT, \`utilisateur_id\` int NOT NULL, \`type_client\` enum ('PARTICULIER', 'ENTREPRISE') NOT NULL, \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NULL, \`niu\` varchar(50) NULL, \`address\` varchar(255) NULL, \`city\` varchar(100) NULL, \`country\` varchar(100) NULL, \`phone\` varchar(30) NULL, \`est_archive\` tinyint NOT NULL DEFAULT 0, \`cree_le\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`idx_client_utilisateur\` (\`utilisateur_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`compteur_facture\` (\`utilisateur_id\` int NOT NULL, \`year\` int NOT NULL, \`month\` int NOT NULL, \`dernier_numero\` int NOT NULL DEFAULT '0', PRIMARY KEY (\`utilisateur_id\`, \`year\`, \`month\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`refresh_token\` (\`id\` int NOT NULL AUTO_INCREMENT, \`utilisateur_id\` int NOT NULL, \`token_hash\` varchar(255) NOT NULL, \`expire_le\` datetime NOT NULL, \`revoque_le\` datetime NULL, \`cree_le\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`idx_refresh_token_hash\` (\`token_hash\`), INDEX \`idx_refresh_token_utilisateur\` (\`utilisateur_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`utilisateur\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`mot_de_passe_hash\` varchar(255) NOT NULL, \`nom_entreprise\` varchar(255) NOT NULL, \`forme_juridique\` varchar(100) NULL, \`niu\` varchar(50) NULL, \`rccm\` varchar(50) NULL, \`regime_tva\` varchar(50) NULL, \`devise_par_defaut\` varchar(3) NOT NULL DEFAULT 'XAF', \`address\` varchar(255) NULL, \`city\` varchar(100) NULL, \`country\` varchar(100) NULL, \`phone\` varchar(30) NULL, \`cree_le\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_e1136325a6b28e2a02b81b2f5e\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`facture\` ADD CONSTRAINT \`FK_15f04ffbb779edcc89d52d39c1c\` FOREIGN KEY (\`utilisateur_id\`) REFERENCES \`utilisateur\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`facture\` ADD CONSTRAINT \`FK_637ffe41e749927cb6732dbb270\` FOREIGN KEY (\`client_id\`) REFERENCES \`client\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`facture\` ADD CONSTRAINT \`FK_d15fb82b2ed116d4e579105ec91\` FOREIGN KEY (\`proforma_id\`) REFERENCES \`proforma\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ligne_facture\` ADD CONSTRAINT \`FK_ebf242dc10bfa75f54d87863fd6\` FOREIGN KEY (\`facture_id\`) REFERENCES \`facture\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ligne_facture\` ADD CONSTRAINT \`FK_fea2e6870015a86cf637f2303d1\` FOREIGN KEY (\`taux_tva_id\`) REFERENCES \`taux_tva\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ligne_proforma\` ADD CONSTRAINT \`FK_3b00b285c956b9677da47f927c0\` FOREIGN KEY (\`proforma_id\`) REFERENCES \`proforma\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ligne_proforma\` ADD CONSTRAINT \`FK_280a6369112e1d7cef4a80316db\` FOREIGN KEY (\`taux_tva_id\`) REFERENCES \`taux_tva\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`proforma\` ADD CONSTRAINT \`FK_939149ecaa35eedf934bf276b52\` FOREIGN KEY (\`utilisateur_id\`) REFERENCES \`utilisateur\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`proforma\` ADD CONSTRAINT \`FK_0865797610829d3f84c6ebcab10\` FOREIGN KEY (\`client_id\`) REFERENCES \`client\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`allocation_paiement\` ADD CONSTRAINT \`FK_999217cb04587429b38fa7e6261\` FOREIGN KEY (\`paiement_id\`) REFERENCES \`paiement\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`allocation_paiement\` ADD CONSTRAINT \`FK_d607d4b953cdcb7ed029f2303af\` FOREIGN KEY (\`facture_id\`) REFERENCES \`facture\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`paiement\` ADD CONSTRAINT \`FK_22546736f7146f65304f4cb648e\` FOREIGN KEY (\`utilisateur_id\`) REFERENCES \`utilisateur\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`paiement\` ADD CONSTRAINT \`FK_cbcaffa56106908c4d7474310fc\` FOREIGN KEY (\`client_id\`) REFERENCES \`client\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`client\` ADD CONSTRAINT \`FK_9eeff3a7dbcb88a69984d3357d3\` FOREIGN KEY (\`utilisateur_id\`) REFERENCES \`utilisateur\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`compteur_facture\` ADD CONSTRAINT \`FK_c5eab4eabb1be2fa37e5acb7a2b\` FOREIGN KEY (\`utilisateur_id\`) REFERENCES \`utilisateur\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`refresh_token\` ADD CONSTRAINT \`FK_a76e2749ec869c2db49b3dd675a\` FOREIGN KEY (\`utilisateur_id\`) REFERENCES \`utilisateur\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`refresh_token\` DROP FOREIGN KEY \`FK_a76e2749ec869c2db49b3dd675a\``);
        await queryRunner.query(`ALTER TABLE \`compteur_facture\` DROP FOREIGN KEY \`FK_c5eab4eabb1be2fa37e5acb7a2b\``);
        await queryRunner.query(`ALTER TABLE \`client\` DROP FOREIGN KEY \`FK_9eeff3a7dbcb88a69984d3357d3\``);
        await queryRunner.query(`ALTER TABLE \`paiement\` DROP FOREIGN KEY \`FK_cbcaffa56106908c4d7474310fc\``);
        await queryRunner.query(`ALTER TABLE \`paiement\` DROP FOREIGN KEY \`FK_22546736f7146f65304f4cb648e\``);
        await queryRunner.query(`ALTER TABLE \`allocation_paiement\` DROP FOREIGN KEY \`FK_d607d4b953cdcb7ed029f2303af\``);
        await queryRunner.query(`ALTER TABLE \`allocation_paiement\` DROP FOREIGN KEY \`FK_999217cb04587429b38fa7e6261\``);
        await queryRunner.query(`ALTER TABLE \`proforma\` DROP FOREIGN KEY \`FK_0865797610829d3f84c6ebcab10\``);
        await queryRunner.query(`ALTER TABLE \`proforma\` DROP FOREIGN KEY \`FK_939149ecaa35eedf934bf276b52\``);
        await queryRunner.query(`ALTER TABLE \`ligne_proforma\` DROP FOREIGN KEY \`FK_280a6369112e1d7cef4a80316db\``);
        await queryRunner.query(`ALTER TABLE \`ligne_proforma\` DROP FOREIGN KEY \`FK_3b00b285c956b9677da47f927c0\``);
        await queryRunner.query(`ALTER TABLE \`ligne_facture\` DROP FOREIGN KEY \`FK_fea2e6870015a86cf637f2303d1\``);
        await queryRunner.query(`ALTER TABLE \`ligne_facture\` DROP FOREIGN KEY \`FK_ebf242dc10bfa75f54d87863fd6\``);
        await queryRunner.query(`ALTER TABLE \`facture\` DROP FOREIGN KEY \`FK_d15fb82b2ed116d4e579105ec91\``);
        await queryRunner.query(`ALTER TABLE \`facture\` DROP FOREIGN KEY \`FK_637ffe41e749927cb6732dbb270\``);
        await queryRunner.query(`ALTER TABLE \`facture\` DROP FOREIGN KEY \`FK_15f04ffbb779edcc89d52d39c1c\``);
        await queryRunner.query(`DROP INDEX \`IDX_e1136325a6b28e2a02b81b2f5e\` ON \`utilisateur\``);
        await queryRunner.query(`DROP TABLE \`utilisateur\``);
        await queryRunner.query(`DROP INDEX \`idx_refresh_token_utilisateur\` ON \`refresh_token\``);
        await queryRunner.query(`DROP INDEX \`idx_refresh_token_hash\` ON \`refresh_token\``);
        await queryRunner.query(`DROP TABLE \`refresh_token\``);
        await queryRunner.query(`DROP TABLE \`compteur_facture\``);
        await queryRunner.query(`DROP INDEX \`idx_client_utilisateur\` ON \`client\``);
        await queryRunner.query(`DROP TABLE \`client\``);
        await queryRunner.query(`DROP INDEX \`idx_paiement_utilisateur\` ON \`paiement\``);
        await queryRunner.query(`DROP INDEX \`idx_paiement_client\` ON \`paiement\``);
        await queryRunner.query(`DROP TABLE \`paiement\``);
        await queryRunner.query(`DROP INDEX \`idx_allocation_paiement\` ON \`allocation_paiement\``);
        await queryRunner.query(`DROP INDEX \`idx_allocation_facture\` ON \`allocation_paiement\``);
        await queryRunner.query(`DROP TABLE \`allocation_paiement\``);
        await queryRunner.query(`DROP INDEX \`idx_proforma_utilisateur\` ON \`proforma\``);
        await queryRunner.query(`DROP INDEX \`idx_proforma_reference\` ON \`proforma\``);
        await queryRunner.query(`DROP TABLE \`proforma\``);
        await queryRunner.query(`DROP INDEX \`idx_ligne_proforma_proforma\` ON \`ligne_proforma\``);
        await queryRunner.query(`DROP TABLE \`ligne_proforma\``);
        await queryRunner.query(`DROP INDEX \`IDX_3ed4e22c3fe8119f1a36e3f9da\` ON \`taux_tva\``);
        await queryRunner.query(`DROP TABLE \`taux_tva\``);
        await queryRunner.query(`DROP INDEX \`idx_ligne_facture_facture\` ON \`ligne_facture\``);
        await queryRunner.query(`DROP TABLE \`ligne_facture\``);
        await queryRunner.query(`DROP INDEX \`REL_d15fb82b2ed116d4e579105ec9\` ON \`facture\``);
        await queryRunner.query(`DROP INDEX \`idx_facture_utilisateur\` ON \`facture\``);
        await queryRunner.query(`DROP INDEX \`idx_facture_utilisateur_statut\` ON \`facture\``);
        await queryRunner.query(`DROP INDEX \`idx_facture_utilisateur_echeance\` ON \`facture\``);
        await queryRunner.query(`DROP INDEX \`uq_facture_numero\` ON \`facture\``);
        await queryRunner.query(`DROP TABLE \`facture\``);
    }

}
