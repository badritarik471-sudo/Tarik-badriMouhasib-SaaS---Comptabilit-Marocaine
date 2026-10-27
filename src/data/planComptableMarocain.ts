/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Plan Comptable Général Marocain (PCM)
 * Conforme au Code Général de Normalisation Comptable (CGNC)
 */

import { AccountPCM } from '../types/accounting';

export const PLAN_COMPTABLE_MAROCAIN: AccountPCM[] = [
  // CLASSE 1 : COMPTES DE FINANCEMENT PERMANENT
  { code: '1111', label: 'Capital social', classe: 1, category: 'Capitaux propres' },
  { code: '1112', label: 'Fonds de dotation', classe: 1, category: 'Capitaux propres' },
  { code: '1117', label: 'Capital personnel', classe: 1, category: 'Capitaux propres' },
  { code: '11171', label: 'Capital individuel', classe: 1, category: 'Capitaux propres' },
  { code: '11175', label: "Compte de l'exploitant", classe: 1, category: 'Capitaux propres' },
  { code: '1119', label: 'Actionnaires, capital souscrit-non appelé', classe: 1, category: 'Capitaux propres' },
  { code: '1121', label: "Primes d'émission", classe: 1, category: 'Primes et réserves' },
  { code: '1122', label: 'Primes de fusion', classe: 1, category: 'Primes et réserves' },
  { code: '1130', label: 'Écarts de réévaluation', classe: 1, category: 'Primes et réserves' },
  { code: '1140', label: 'Réserve légale', classe: 1, category: 'Réserves' },
  { code: '1151', label: 'Réserves statutaires ou contractuelles', classe: 1, category: 'Réserves' },
  { code: '1152', label: 'Réserves facultatives', classe: 1, category: 'Réserves' },
  { code: '1161', label: 'Report à nouveau (solde créditeur)', classe: 1, category: 'Report à nouveau' },
  { code: '1169', label: 'Report à nouveau (solde débiteur)', classe: 1, category: 'Report à nouveau' },
  { code: '1181', label: "Résultats nets en instance d'affectation (solde créditeur)", classe: 1, category: 'Résultat' },
  { code: '1191', label: "Résultat net de l'exercice (solde créditeur - Bénéfice)", classe: 1, category: 'Résultat' },
  { code: '1199', label: "Résultat net de l'exercice (solde débiteur - Perte)", classe: 1, category: 'Résultat' },
  { code: '1311', label: "Subventions d'investissement reçues", classe: 1, category: 'Capitaux assimilés' },
  { code: '1351', label: 'Provisions pour amortissements dérogatoires', classe: 1, category: 'Provisions réglementées' },
  { code: '1410', label: 'Emprunts obligataires', classe: 1, category: 'Dettes de financement' },
  { code: '1481', label: 'Emprunts auprès des établissements de crédit', classe: 1, category: 'Dettes de financement' },
  { code: '1486', label: "Fournisseurs d'immobilisation", classe: 1, category: 'Dettes de financement' },
  { code: '1487', label: 'Dépôts et cautionnements reçus', classe: 1, category: 'Dettes de financement' },
  { code: '1488', label: 'Dettes de financement diverses', classe: 1, category: 'Dettes de financement' },
  { code: '1511', label: 'Provisions pour litiges', classe: 1, category: 'Provisions durables' },
  { code: '1555', label: 'Provisions pour charges à répartir sur plusieurs exercices', classe: 1, category: 'Provisions durables' },

  // CLASSE 2 : COMPTES D'ACTIF IMMOBILISE
  { code: '2111', label: 'Frais de constitution', classe: 2, category: 'Immobilisations en non-valeurs' },
  { code: '2113', label: "Frais d'augmentation du capital", classe: 2, category: 'Immobilisations en non-valeurs' },
  { code: '2117', label: 'Frais de publicité', classe: 2, category: 'Immobilisations en non-valeurs' },
  { code: '2210', label: 'Immobilisation en recherche et développement', classe: 2, category: 'Immobilisations incorporelles' },
  { code: '2220', label: 'Brevets, marques, droits et valeurs similaires', classe: 2, category: 'Immobilisations incorporelles' },
  { code: '2230', label: 'Fonds commercial', classe: 2, category: 'Immobilisations incorporelles' },
  { code: '2285', label: 'Autres immobilisations incorporelles (logiciels, sites web)', classe: 2, category: 'Immobilisations incorporelles' },
  { code: '2311', label: 'Terrains nus', classe: 2, category: 'Immobilisations corporelles' },
  { code: '2313', label: 'Terrains bâtis', classe: 2, category: 'Immobilisations corporelles' },
  { code: '2321', label: 'Bâtiments (industriels, administratifs, commerciaux)', classe: 2, category: 'Immobilisations corporelles' },
  { code: '2327', label: 'Agencements et aménagements des constructions', classe: 2, category: 'Immobilisations corporelles' },
  { code: '2331', label: 'Installations techniques', classe: 2, category: 'Immobilisations corporelles' },
  { code: '2332', label: 'Matériel et outillage', classe: 2, category: 'Immobilisations corporelles' },
  { code: '2340', label: 'Matériel de transport (véhicules, utilitaires)', classe: 2, category: 'Immobilisations corporelles' },
  { code: '2351', label: 'Mobilier de bureau (bureaux, tables, sièges)', classe: 2, category: 'Immobilisations corporelles' },
  { code: '2352', label: 'Matériel de bureau', classe: 2, category: 'Immobilisations corporelles' },
  { code: '2355', label: 'Matériel informatique (ordinateurs, serveurs, écrans)', classe: 2, category: 'Immobilisations corporelles' },
  { code: '2356', label: 'Agencements, installations et aménagements divers', classe: 2, category: 'Immobilisations corporelles' },
  { code: '2393', label: 'Immobilisations corporelles en cours', classe: 2, category: 'Immobilisations corporelles' },
  { code: '2411', label: 'Prêts au personnel', classe: 2, category: 'Immobilisations financières' },
  { code: '2486', label: 'Dépôts et cautionnements versés', classe: 2, category: 'Immobilisations financières' },
  { code: '2510', label: 'Titres de participation', classe: 2, category: 'Immobilisations financières' },
  // Amortissements (Classe 28)
  { code: '2811', label: 'Amortissements des frais préliminaires', classe: 2, category: 'Amortissements' },
  { code: '2822', label: 'Amortissements des brevets, marques et droits', classe: 2, category: 'Amortissements' },
  { code: '2832', label: 'Amortissements des constructions', classe: 2, category: 'Amortissements' },
  { code: '2833', label: 'Amortissements des installations techniques, matériel et outillage', classe: 2, category: 'Amortissements' },
  { code: '2834', label: 'Amortissements du matériel de transport', classe: 2, category: 'Amortissements' },
  { code: '28351', label: 'Amortissements du mobilier de bureau', classe: 2, category: 'Amortissements' },
  { code: '28355', label: 'Amortissements du matériel informatique', classe: 2, category: 'Amortissements' },

  // CLASSE 3 : COMPTES D'ACTIF CIRCULANT (HORS TRESORERIE)
  { code: '3111', label: 'Marchandises (stocks)', classe: 3, category: 'Stocks' },
  { code: '3121', label: 'Matières premières', classe: 3, category: 'Stocks' },
  { code: '3122', label: 'Matières et fournitures consommables', classe: 3, category: 'Stocks' },
  { code: '3123', label: 'Emballages', classe: 3, category: 'Stocks' },
  { code: '3151', label: 'Produits finis', classe: 3, category: 'Stocks' },
  { code: '3411', label: 'Fournisseurs - avances et acomptes versés', classe: 3, category: 'Créances' },
  { code: '3421', label: 'Clients', classe: 3, category: 'Créances' },
  { code: '3424', label: 'Clients douteux ou litigieux', classe: 3, category: 'Créances' },
  { code: '3425', label: 'Clients - effets à recevoir', classe: 3, category: 'Créances' },
  { code: '3427', label: 'Clients - factures à établir', classe: 3, category: 'Créances' },
  { code: '3431', label: 'Avances et acomptes au personnel', classe: 3, category: 'Créances' },
  { code: '3453', label: 'Acomptes sur impôts sur les résultats (IS)', classe: 3, category: 'État - Débiteur' },
  { code: '34551', label: 'État - TVA récupérable sur immobilisations', classe: 3, category: 'État - Débiteur' },
  { code: '34552', label: 'État - TVA récupérable sur charges', classe: 3, category: 'État - Débiteur' },
  { code: '3456', label: 'État - crédit de TVA', classe: 3, category: 'État - Débiteur' },
  { code: '3461', label: "Associés - comptes d'apport en société", classe: 3, category: 'Associés' },
  { code: '3463', label: 'Comptes courants des associés débiteurs', classe: 3, category: 'Associés' },
  { code: '3481', label: "Créances sur cessions d'immobilisations", classe: 3, category: 'Autres débiteurs' },
  { code: '3491', label: "Charges constatées d'avance (CCA)", classe: 3, category: 'Régularisation actif' },
  { code: '3501', label: 'Titres et valeurs de placement (TVP)', classe: 3, category: 'Placement' },
  { code: '3942', label: 'Provisions pour dépréciation des clients', classe: 3, category: 'Provisions actif circulant' },

  // CLASSE 4 : COMPTES DU PASSIF CIRCULANT (HORS TRESORERIE)
  { code: '4411', label: 'Fournisseurs', classe: 4, category: 'Dettes d exploitation' },
  { code: '4415', label: 'Fournisseurs - effets à payer', classe: 4, category: 'Dettes d exploitation' },
  { code: '4417', label: 'Fournisseurs - factures non parvenues (FNP)', classe: 4, category: 'Dettes d exploitation' },
  { code: '4421', label: 'Clients - avances et acomptes reçus', classe: 4, category: 'Dettes d exploitation' },
  { code: '4432', label: 'Rémunérations dues au personnel (salaires à payer)', classe: 4, category: 'Dettes sociales' },
  { code: '4434', label: 'Oppositions sur salaires', classe: 4, category: 'Dettes sociales' },
  { code: '4441', label: 'Caisse Nationale de Sécurité Sociale (CNSS)', classe: 4, category: 'Organismes sociaux' },
  { code: '4443', label: 'Caisses de retraite (CIMR / CMR)', classe: 4, category: 'Organismes sociaux' },
  { code: '4445', label: 'Mutuelles / AMO', classe: 4, category: 'Organismes sociaux' },
  { code: '44521', label: "État, taxe urbaine et taxe d'édilité", classe: 4, category: 'État - Créditeur' },
  { code: '44522', label: 'État, taxe professionnelle (Patente)', classe: 4, category: 'État - Créditeur' },
  { code: '44525', label: 'État, impôt sur le revenu retenu à la source (IR Salaires)', classe: 4, category: 'État - Créditeur' },
  { code: '4453', label: 'État, impôts sur les résultats (IS dû)', classe: 4, category: 'État - Créditeur' },
  { code: '4455', label: 'État, TVA facturée', classe: 4, category: 'État - Créditeur' },
  { code: '4456', label: 'État, TVA due (suivant déclarations)', classe: 4, category: 'État - Créditeur' },
  { code: '4457', label: 'État, impôts et taxes à payer', classe: 4, category: 'État - Créditeur' },
  { code: '4463', label: 'Comptes courants des associés créditeurs', classe: 4, category: 'Comptes associés' },
  { code: '4465', label: 'Associés - dividendes à payer', classe: 4, category: 'Comptes associés' },
  { code: '4481', label: "Dettes sur acquisitions d'immobilisations", classe: 4, category: 'Autres créanciers' },
  { code: '4491', label: "Produits constatés d'avance (PCA)", classe: 4, category: 'Régularisation passif' },

  // CLASSE 5 : COMPTES DE TRESORERIE
  { code: '5111', label: 'Chèques à encaisser', classe: 5, category: 'Trésorerie Actif' },
  { code: '51111', label: 'Chèques en portefeuille', classe: 5, category: 'Trésorerie Actif' },
  { code: '5113', label: 'Effets à encaisser', classe: 5, category: 'Trésorerie Actif' },
  { code: '5115', label: 'Virement de fonds', classe: 5, category: 'Trésorerie Actif' },
  { code: '5141', label: 'Banques (solde débiteur)', classe: 5, category: 'Trésorerie Actif' },
  { code: '5146', label: 'Chèques postaux', classe: 5, category: 'Trésorerie Actif' },
  { code: '5161', label: 'Caisse (espèces)', classe: 5, category: 'Trésorerie Actif' },
  { code: '5530', label: 'Crédits de trésorerie', classe: 5, category: 'Trésorerie Passif' },
  { code: '5541', label: 'Banques (solde créditeur - découverts)', classe: 5, category: 'Trésorerie Passif' },

  // CLASSE 6 : COMPTES DE CHARGES
  { code: '6111', label: 'Achats de marchandises', classe: 6, category: "Charges d'exploitation" },
  { code: '6114', label: 'Variation de stocks de marchandises', classe: 6, category: "Charges d'exploitation" },
  { code: '6119', label: 'Rabais, remises et ristournes obtenus sur achats', classe: 6, category: "Charges d'exploitation" },
  { code: '6121', label: 'Achats de matières premières', classe: 6, category: "Charges d'exploitation" },
  { code: '6122', label: 'Achats de matières et fournitures consommables', classe: 6, category: "Charges d'exploitation" },
  { code: '61223', label: 'Achats de combustibles (carburant)', classe: 6, category: "Charges d'exploitation" },
  { code: '61224', label: "Achats de produits d'entretien", classe: 6, category: "Charges d'exploitation" },
  { code: '61227', label: 'Achats de fournitures de bureau', classe: 6, category: "Charges d'exploitation" },
  { code: '61251', label: "Achats de fournitures non stockables (Eau, Électricité, Gaz)", classe: 6, category: "Charges d'exploitation" },
  { code: '61253', label: 'Achats de petit outillage et petit équipement', classe: 6, category: "Charges d'exploitation" },
  { code: '6126', label: 'Achats de travaux, études et prestations de service', classe: 6, category: "Charges d'exploitation" },
  { code: '6131', label: 'Locations et charges locatives (loyer de bureau/entrepôt)', classe: 6, category: 'Autres charges externes' },
  { code: '6132', label: 'Redevances de crédit-bail (Leasing)', classe: 6, category: 'Autres charges externes' },
  { code: '6133', label: 'Entretien et réparations (locaux, véhicules, matériel)', classe: 6, category: 'Autres charges externes' },
  { code: '61335', label: 'Maintenance logicielle et technique', classe: 6, category: 'Autres charges externes' },
  { code: '6134', label: "Primes d'assurances", classe: 6, category: 'Autres charges externes' },
  { code: '61341', label: 'Assurances multirisques (vol, incendie, RC)', classe: 6, category: 'Autres charges externes' },
  { code: '61345', label: 'Assurances - Matériel de transport', classe: 6, category: 'Autres charges externes' },
  { code: '6135', label: 'Rémunérations du personnel extérieur (intérim)', classe: 6, category: 'Autres charges externes' },
  { code: '61361', label: 'Commissions et courtages', classe: 6, category: 'Autres charges externes' },
  { code: '61365', label: 'Honoraires (experts-comptables, avocats, notaires)', classe: 6, category: 'Autres charges externes' },
  { code: '6142', label: 'Transports (transport du personnel, sur achats, fret)', classe: 6, category: 'Autres charges externes' },
  { code: '6143', label: 'Déplacements, missions et réceptions (frais de voyage, repas)', classe: 6, category: 'Autres charges externes' },
  { code: '6144', label: 'Publicité, publications et relations publiques (Google Ads, affichage)', classe: 6, category: 'Autres charges externes' },
  { code: '61451', label: 'Frais postaux (timbres, courriers)', classe: 6, category: 'Autres charges externes' },
  { code: '61455', label: 'Frais de téléphone, internet et télécommunications', classe: 6, category: 'Autres charges externes' },
  { code: '6146', label: 'Cotisations et dons professionnels', classe: 6, category: 'Autres charges externes' },
  { code: '61473', label: 'Frais et commissions sur services bancaires', classe: 6, category: 'Autres charges externes' },
  { code: '61611', label: "Taxe de services communaux et taxe d'édilité", classe: 6, category: 'Impôts et taxes' },
  { code: '61612', label: 'Taxe professionnelle (Patente)', classe: 6, category: 'Impôts et taxes' },
  { code: '61671', label: "Droits d'enregistrement et de timbre", classe: 6, category: 'Impôts et taxes' },
  { code: '61673', label: 'Taxes sur les véhicules (Vignette)', classe: 6, category: 'Impôts et taxes' },
  { code: '61711', label: 'Appointements et salaires (salaires de base)', classe: 6, category: 'Charges de personnel' },
  { code: '61712', label: 'Primes et gratifications (13ème mois, primes)', classe: 6, category: 'Charges de personnel' },
  { code: '61713', label: 'Indemnités et avantages divers (transport, panier)', classe: 6, category: 'Charges de personnel' },
  { code: '61741', label: 'Cotisations de sécurité sociale (CNSS patronale)', classe: 6, category: 'Charges de personnel' },
  { code: '61743', label: 'Cotisations aux mutuelles et AMO (patronale)', classe: 6, category: 'Charges de personnel' },
  { code: '61748', label: 'Taxe de formation professionnelle (1.6%)', classe: 6, category: 'Charges de personnel' },
  { code: '61765', label: 'Indemnités de préavis et de licenciement', classe: 6, category: 'Charges de personnel' },
  { code: '6182', label: 'Pertes sur créances irrécouvrables', classe: 6, category: "Autres charges d'exploitation" },
  { code: '6193', label: "Dotations d'exploitation aux amortissements des immobilisations corporelles", classe: 6, category: 'Dotations exploitation' },
  { code: '61934', label: 'D.E.A. du matériel de transport', classe: 6, category: 'Dotations exploitation' },
  { code: '61935', label: 'D.E.A. du mobilier, matériel de bureau et informatique', classe: 6, category: 'Dotations exploitation' },
  { code: '6196', label: "Dotations d'exploitation aux provisions de l'actif circulant", classe: 6, category: 'Dotations exploitation' },
  // Charges financières
  { code: '6311', label: 'Intérêts des emprunts et dettes (intérêts bancaires)', classe: 6, category: 'Charges financières' },
  { code: '6331', label: 'Pertes de change', classe: 6, category: 'Charges financières' },
  { code: '6386', label: 'Escomptes accordés', classe: 6, category: 'Charges financières' },
  // Charges non courantes
  { code: '6513', label: 'V.N.A. des immobilisations corporelles cédées', classe: 6, category: 'Charges non courantes' },
  { code: '6581', label: 'Pénalités sur marchés et dédits', classe: 6, category: 'Charges non courantes' },
  { code: '6583', label: 'Pénalités et amendes fiscales ou pénales', classe: 6, category: 'Charges non courantes' },
  { code: '6586', label: 'Dons et libéralités', classe: 6, category: 'Charges non courantes' },
  // Impôts sur les résultats
  { code: '6701', label: 'Impôts sur les bénéfices (Impôt sur les Sociétés - IS)', classe: 6, category: 'Impôts sur résultats' },
  { code: '6705', label: 'Cotisation minimale annuelle des sociétés (CM)', classe: 6, category: 'Impôts sur résultats' },

  // CLASSE 7 : COMPTES DE PRODUITS
  { code: '7111', label: 'Ventes de marchandises au Maroc', classe: 7, category: "Produits d'exploitation" },
  { code: '7113', label: "Ventes de marchandises à l'étranger (Export)", classe: 7, category: "Produits d'exploitation" },
  { code: '7119', label: 'Rabais, remises et ristournes accordés par l’entreprise', classe: 7, category: "Produits d'exploitation" },
  { code: '71211', label: 'Ventes de produits finis au Maroc', classe: 7, category: "Produits d'exploitation" },
  { code: '71243', label: 'Prestations de services au Maroc', classe: 7, category: "Produits d'exploitation" },
  { code: '71253', label: "Prestations de services à l'étranger (Offshoring)", classe: 7, category: "Produits d'exploitation" },
  { code: '71271', label: 'Locations diverses reçues (sous-location)', classe: 7, category: "Produits d'exploitation" },
  { code: '7131', label: 'Variation des stocks de produits', classe: 7, category: "Produits d'exploitation" },
  { code: '7143', label: 'Immobilisations corporelles produites par l’entreprise', classe: 7, category: "Produits d'exploitation" },
  { code: '7161', label: "Subventions d'exploitation reçues", classe: 7, category: "Produits d'exploitation" },
  { code: '7197', label: "Transferts des charges d'exploitation", classe: 7, category: "Produits d'exploitation" },
  // Produits financiers
  { code: '7321', label: 'Revenus des titres de participation (dividendes)', classe: 7, category: 'Produits financiers' },
  { code: '7331', label: 'Gains de change', classe: 7, category: 'Produits financiers' },
  { code: '7381', label: 'Intérêts et produits assimilés (intérêts créditeurs bancaires)', classe: 7, category: 'Produits financiers' },
  { code: '7386', label: 'Escomptes obtenus', classe: 7, category: 'Produits financiers' },
  // Produits non courants
  { code: '7513', label: "Produits des cessions d'immobilisations corporelles", classe: 7, category: 'Produits non courants' },
  { code: '7561', label: "Subventions d'équilibre reçues", classe: 7, category: 'Produits non courants' },
  { code: '7581', label: 'Pénalités et dédits reçus', classe: 7, category: 'Produits non courants' },
  { code: '7582', label: 'Dégrèvement d’impôts', classe: 7, category: 'Produits non courants' },

  // CLASSE 8 : COMPTES DE RESULTATS & ESG
  { code: '8100', label: "Résultat d'exploitation", classe: 8, category: 'Soldes de gestion' },
  { code: '8110', label: 'Marge brute sur ventes en l’état', classe: 8, category: 'Soldes de gestion' },
  { code: '8140', label: 'Valeur ajoutée', classe: 8, category: 'Soldes de gestion' },
  { code: '8171', label: "Excédent brut d'exploitation (EBE)", classe: 8, category: 'Soldes de gestion' },
  { code: '8179', label: "Insuffisance brute d'exploitation (IBE)", classe: 8, category: 'Soldes de gestion' },
  { code: '8300', label: 'Résultat financier', classe: 8, category: 'Soldes de gestion' },
  { code: '8400', label: 'Résultat courant', classe: 8, category: 'Soldes de gestion' },
  { code: '8500', label: 'Résultat non courant', classe: 8, category: 'Soldes de gestion' },
  { code: '8600', label: 'Résultat avant impôts', classe: 8, category: 'Soldes de gestion' },
  { code: '8800', label: 'Résultat après impôts', classe: 8, category: 'Soldes de gestion' },

  // CLASSE 9 : COMPTES ANALYTIQUES
  { code: '9031', label: 'Stocks réfléchis', classe: 9, category: 'Comptabilité analytique' },
  { code: '9061', label: "Charges d'exploitation réfléchies", classe: 9, category: 'Comptabilité analytique' },
  { code: '9071', label: "Produits d'exploitation réfléchis", classe: 9, category: 'Comptabilité analytique' },
  { code: '9331', label: "Coût d'achat de marchandises", classe: 9, category: 'Comptabilité analytique' },
  { code: '9551', label: 'Coûts de revient des produits', classe: 9, category: 'Comptabilité analytique' },

  // CLASSE 0 : COMPTES SPECIAUX
  { code: '0111', label: 'Réouverture des comptes des capitaux propres', classe: 0, category: "Bilan d'ouverture" },
  { code: '0123', label: 'Réouverture des comptes des immobilisations corporelles', classe: 0, category: "Bilan d'ouverture" },
  { code: '0134', label: 'Réouverture des comptes de créances', classe: 0, category: "Bilan d'ouverture" },
  { code: '0144', label: 'Réouverture des dettes du passif circulant', classe: 0, category: "Bilan d'ouverture" },
  { code: '0151', label: 'Réouverture de trésorerie actif', classe: 0, category: "Bilan d'ouverture" },
  { code: '0211', label: 'Clôture des comptes de capitaux propres', classe: 0, category: 'Clôture du bilan' },
  { code: '0223', label: 'Clôture des comptes des immobilisations corporelles', classe: 0, category: 'Clôture du bilan' },
  { code: '0411', label: 'Avals, cautions et garanties donnés', classe: 0, category: 'Engagements donnés' },
  { code: '0511', label: 'Avals, cautions et garanties reçus', classe: 0, category: 'Engagements reçus' }
];

export function findAccountByCode(code: string): AccountPCM | undefined {
  return PLAN_COMPTABLE_MAROCAIN.find(a => a.code === code) || {
    code,
    label: `Compte ${code}`,
    classe: Number(code[0]) || 0,
    category: 'Autre compte'
  };
}

export function searchAccounts(query: string): AccountPCM[] {
  const q = query.toLowerCase().trim();
  if (!q) return PLAN_COMPTABLE_MAROCAIN.slice(0, 30);
  return PLAN_COMPTABLE_MAROCAIN.filter(
    a => a.code.startsWith(q) || a.label.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
  );
}
