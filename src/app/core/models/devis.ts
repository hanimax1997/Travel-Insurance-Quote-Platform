
import { Prime } from "./prime";
import { ParamList } from "./param-risque-produit";
import { PackCompletList } from "./packCompletList";
import { taxeList } from "./taxe";

export class Devis {
    typeClient!: Number;
    nom!: String;
    produit!: Number;
    prenom!: String;
    raisonSocial!: String;
    telephone!: String;
    email!: String;
    duree!: Number;
    agence!: Number;
    canalx!: Number;
    primeList!: Prime[];
    paramList!: ParamList[];
    packCompletList!: PackCompletList[];
    taxeList!: taxeList[];
}

export let DevisJson = {
    "auditUser": "",
    "typeClient": 0,
    "nom": "",
    "produit": 0,
    "prenom": "",
    "raisonSocial": "",
    "statue": 0,
    "telephone": "",
    "email": "",
    "duree": 0,
    "dateAssure": "",
    "agence": 0,
    "canal": 0,
    "pack": 0,
    "tailleRisque": 0,
    "idReduction": 0,
    "groupes": [],
    "list": [] as any,
    "file": null,

}

export let returnJson = {

    "agence": {
        "idAgence": 47,
        "codeAgence": "71616",
        "idPersonneMorale": {
            "idClient": 12357,
            "adressesList": [
                {
                    "idAdresse": 7848,
                    "description": "Cité 29 logement alger"
                }
            ],
            "contactList": [
                {
                    "idContact": 2594,
                    "description": "badsi.idir@yahoo.fr"
                }
            ],
            "raisonSocial": "Idir Badsi"
        }
    },
    "auditDate": "2023-01-29T14:26:45.842+00:00",
    "auditUser": null,
    "canal": {
        "idParam": 100,
        "description": "devis web"
    },
    "dateExpiration": "2023-02-28",
    "duree": {
        "id_duree": 3,
        "type_duree": "Année",
        "duree": 1,
        "description": "1 année"
    },
    "email": "dif@gmail.com",
    "idDevis": 84,
    "nom": "naila",
    "paramDevisList": [
        {
            "idGarantie": 1,
            "description": "RC",
            "prime": "",
            "sousGarantieList": [],
            "categorieList": []
        },
        {
            "idGarantie": 4,
            "description": "Vol",
            "prime": "",
            "sousGarantieList": [],
            "categorieList": [
                {
                    "idCategorie": 29,
                    "description": "plafond",
                    "valeur": "0",
                    "sousCategorieList": {
                        "idSousCategorie": 10,
                        "description": "plafond par acte",
                        "valeur": "1200000"
                    }
                }
            ]
        },
        {
            "idGarantie": 5,
            "description": "Incendie véhicule terrestre",
            "prime": "",
            "sousGarantieList": [],
            "categorieList": [
                {
                    "idCategorie": 29,
                    "description": "plafond",
                    "valeur": "0",
                    "sousCategorieList": {
                        "idSousCategorie": 10,
                        "description": "plafond par acte",
                        "valeur": "1200000"
                    }
                }
            ]
        },
        {
            "idGarantie": 6,
            "description": "Vol Auto-Radio",
            "prime": "",
            "sousGarantieList": [],
            "categorieList": [
                {
                    "idCategorie": 19,
                    "description": "forumule",
                    "valeur": "80000",
                    "sousCategorieList": {
                        "idSousCategorie": 8,
                        "description": "formule par acte",
                        "valeur": "80000"
                    }
                },
                {
                    "idCategorie": 29,
                    "description": "plafond",
                    "valeur": "1500",
                    "sousCategorieList": {
                        "idSousCategorie": 10,
                        "description": "plafond par acte",
                        "valeur": "1500"
                    }
                }
            ]
        },
        {
            "idGarantie": 9,
            "description": "Défense et recours",
            "prime": "",
            "sousGarantieList": [],
            "categorieList": []
        },
        {
            "idGarantie": 10,
            "description": "Protection juridique",
            "prime": "",
            "sousGarantieList": [],
            "categorieList": []
        },
        {
            "idGarantie": 11,
            "description": "Protection financière",
            "prime": "",
            "sousGarantieList": [],
            "categorieList": []
        },
        {
            "idGarantie": 12,
            "description": "Assistance",
            "prime": "",
            "sousGarantieList": [],
            "categorieList": [
                {
                    "idCategorie": 19,
                    "description": "forumule",
                    "valeur": "15",
                    "sousCategorieList": {
                        "idSousCategorie": 8,
                        "description": "formule par acte",
                        "valeur": "15"
                    }
                }
            ]
        },
        {
            "idGarantie": 14,
            "description": "Dommage Collision Valeur Vénale",
            "prime": "",
            "sousGarantieList": [],
            "categorieList": [
                {
                    "idCategorie": 29,
                    "description": "plafond",
                    "valeur": "0",
                    "sousCategorieList": {
                        "idSousCategorie": 10,
                        "description": "plafond par acte",
                        "valeur": "1200000"
                    }
                }
            ]
        }
    ],
    "prenom": "dif",
    "primeList": [
        {
            "idPrime": 158,
            "typePrime": {
                "idParam": 101,
                "description": "prime net"
            },
            "prime": "1200"
        },
        {
            "idPrime": 159,
            "typePrime": {
                "idParam": 102,
                "description": "prime fractionnement"
            },
            "prime": "500"
        },
        {
            "idPrime": 160,
            "typePrime": {
                "idParam": 103,
                "description": "prime avec taxe"
            },
            "prime": "2000"
        },
        {
            "idPrime": 161,
            "typePrime": {
                "idParam": 104,
                "description": "prime sans taxe"
            },
            "prime": "2000"
        },
        {
            "idPrime": 162,
            "typePrime": {
                "idParam": 105,
                "description": "prime commercial"
            },
            "prime": "2000"
        }
    ],
    "produit": {
        "idCodeProduit": 150,
        "codeProduit": "45",
        "description": "Automono"
    },
    "raisonSocial": "",
    "risqueList": [
        {
            "idRisque": 140,
            "paramRisque": {
                "idParamRisque": 24,
                "libelle": "Genre",
                "descriptionChamp": "Genre"
            },
            "valeur": ""
        },
        {
            "idRisque": 141,
            "paramRisque": {
                "idParamRisque": 28,
                "libelle": "Année de mise en circulation",
                "descriptionChamp": "Année"
            },
            "valeur": "2023-01-11T23:00:00.000Z"
        },
        {
            "idRisque": 142,
            "paramRisque": {
                "idParamRisque": 29,
                "libelle": "Remorque",
                "descriptionChamp": "Remorque"
            },
            "valeur": ""
        },
        {
            "idRisque": 143,
            "paramRisque": {
                "idParamRisque": 31,
                "libelle": "Type Véhicule (Carrosserie)",
                "descriptionChamp": "Type Véhicule (Carrosserie)"
            },
            "valeur": ""
        },
        {
            "idRisque": 144,
            "paramRisque": {
                "idParamRisque": 34,
                "libelle": "Puissance",
                "descriptionChamp": "Puissance"
            },
            "valeur": ""
        },
        {
            "idRisque": 145,
            "paramRisque": {
                "idParamRisque": 38,
                "libelle": "N° d'Immatriculation",
                "descriptionChamp": "N° d'Immatriculation"
            },
            "valeur": "123456789"
        },
        {
            "idRisque": 146,
            "paramRisque": {
                "idParamRisque": 40,
                "libelle": "Valeur Vénal",
                "descriptionChamp": "Valeur Assuré"
            },
            "valeur": "1200000"
        },
        {
            "idRisque": 147,
            "paramRisque": {
                "idParamRisque": 41,
                "libelle": "Valeur auto radio",
                "descriptionChamp": "Valeur auto radio"
            },
            "valeur": "250000"
        },
        {
            "idRisque": 148,
            "paramRisque": {
                "idParamRisque": 56,
                "libelle": "Wilaya délivrence",
                "descriptionChamp": "Wilaya délivrence"
            },
            "valeur": "2"
        },
        {
            "idRisque": 149,
            "paramRisque": {
                "idParamRisque": 54,
                "libelle": "Date délivrance",
                "descriptionChamp": "Date délivrance"
            },
            "valeur": "2023-01-24T23:00:00.000Z"
        },
        {
            "idRisque": 150,
            "paramRisque": {
                "idParamRisque": 55,
                "libelle": "date Naissance",
                "descriptionChamp": "date naissance"
            },
            "valeur": "2023-01-25T23:00:00.000Z"
        },
        {
            "idRisque": 151,
            "paramRisque": {
                "idParamRisque": 52,
                "libelle": "Usage",
                "descriptionChamp": "Usage"
            },
            "valeur": ""
        }
    ],
    "statue": {
        "idParam": 109,
        "description": "Active"
    },
    "taxeList": [
        {
            "idDevisTaxe": 83,
            "taxe": {
                "idTaxe": 1,
                "idNational": "1",
                "description": "Cout de police"
            },
            "prime": "1200"
        },
        {
            "idDevisTaxe": 84,
            "taxe": {
                "idTaxe": 2,
                "idNational": "2",
                "description": "Droit de timbre gradué"
            },
            "prime": "500"
        }
    ],
    "telephone": "0559468465",
    "typeClient": {
        "idParam": 107,
        "description": "personne morale"
    }
}


