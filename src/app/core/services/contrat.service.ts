import { Injectable } from '@angular/core';
import { Constants } from '../config/constants';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import moment from 'moment';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import getBase64ImageFromURL from '../utils/imageHandling';
import { text } from 'stream/consumers';

@Injectable({
  providedIn: 'root'
})
export class ContratService {
    VL: any;
    isVoyageLocal: boolean;

  constructor(private http: HttpClient) { }

  getContratById(idContrat: any) {
    const httpOption = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        })
    };
    return this.http.get<any[]>(`${Constants.API_ENDPOINT_CONTRAT}/${idContrat}`, httpOption).pipe(
        tap((response) => this.logs(response)),
        catchError((error) => throwError(error.error))
    );
  }

  getContratHistoriqueById(idHisContrat: any) {
    const httpOption = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        })
    };
    return this.http.get<any[]>(`${Constants.API_ENDPOINT_CONTRAT}/historique/${idHisContrat}`, httpOption).pipe(
        tap((response) => this.logs(response)),
        catchError((error) => throwError(error.error))
    );
  }

  getParamContratByIdRisque(idContrat: any, idGroupe: any, idRisque: any) {
    const httpOption = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        })
    };
    return this.http.get<any[]>(`${Constants.API_ENDPOINT_CONTRAT}/${idContrat}/groupe/${idGroupe}/risque/${idRisque}`, httpOption).pipe(
        tap((response) => this.logs(response)),
        catchError((error) => throwError(error.error))
    );
  }

  getPackIdRisque(idContrat: any, idRisque: any) {
    const httpOption = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        })
    };
    return this.http.get<any[]>(`${Constants.API_ENDPOINT_CONTRAT}/${idContrat}/pack/risque/${idRisque}`, httpOption).pipe(
        tap((response) => this.logs(response)),
        catchError((error) => throwError(error.error))
    );
  }

  getPaysList(){
    const httpOption = {
        headers: new HttpHeaders({
            'Access-Control-Allow-Origin': '*',
        })
    };

    return this.http.get<any[]>(`${Constants.API_ENDPOINT_pays}`, httpOption).pipe(
        tap((response) => this.logs(response)),
        catchError((error) => throwError(error.error))
    );
  }

  getAllCommune(){
    const httpOption = {
        headers: new HttpHeaders({
            'Access-Control-Allow-Origin': '*',
        })
    };

    return this.http.get<any[]>(`${Constants.API_ENDPOINT_communes}`, httpOption).pipe(
        tap((response) => this.logs(response)),
        catchError((error) => throwError(error.error))
    );
  }

  getQuittanceById(idQuittance: any) {
    const httpOption = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        })
    };
    return this.http.get<any[]>(`${Constants.API_ENDPOINT_QUITTANCE}/${idQuittance}`, httpOption).pipe(
        tap((response) => this.logs(response)),
        catchError((error) => throwError(error.error))
    );
  }

  async outputQuittance(contrat: any, quittance: any, avenant: any) {
    let assure: any = {};
    let conducteur: any = {};
    let souscripteur: any = {};
   
    contrat?.personnesList?.forEach((element: any) => {
        switch (element?.role?.idParam) {
            case 233:
                conducteur = element?.personne
                break;
            case 234:
                souscripteur = element?.personne
                break;
            case 235:
                assure = element?.personne
                break;
            case 236:
                souscripteur = element?.personne
                assure = element?.personne
                break;
            case 237:
                souscripteur = element?.personne
                conducteur = element?.personne
                break;
            case 280:
                assure = element?.personne
                conducteur = element?.personne
                break;
            case 238:
                souscripteur = element?.personne
                assure = element?.personne
                conducteur = element?.personne
                break;

            default:
                break;
        }
    });

    let qr = "";
    switch (contrat?.produit.codeProduit) {
        case "20G":
            qr="https://www.axa.dz/wp-content/uploads/2023/10/Conditions-Generales-Assurance-Voyage.pdf"
             break;
        case "45A":
            qr = "https://www.axa.dz/wp-content/uploads/2023/10/Conditions-generales-Assurance-Automobile.pdf"
            break;
        case "96":
            qr = "https://www.axa.dz/wp-content/uploads/2023/10/Conditions-Generales-Habitation.pdf"
            break;
        case "95":
            qr = "https://www.axa.dz/wp-content/uploads/2023/11/Conditions-Generales-Multirisque-professionnelle.pdf"
            break;
        case '20A':
            if(contrat.groupeList[0].pack.codePack!="V05" && contrat.groupeList[0].pack.codePack!="V06")
                qr="https://www.axa.dz/wp-content/uploads/2023/10/Conditions-Generales-Assurance-Voyage.pdf"
            else
                qr="https://www.axa.dz/wp-content/uploads/2023/10/Conditions-Generales-Assurance-Voyage.pdf"
            break;
        default:
            break;
    } 
// fin de la quittance 
    const docDefinitionQuittance: any = {
        watermark: { text: '', color: 'blue', opacity: 0.1 },
        pageMargins: [35, 90, 35, 90],
        border: [false, false, false, false],
        header: {
                columns:[ 
                    {
                        layout: 'noBorders',
                        margin: [35, 10, 35, 10],
                        table: {
                                widths: [ '*','*' ],
                                alignment: "center",
                                body: [
                                    [
                                        {
                                            image: await getBase64ImageFromURL(this.http,'AXA_LOGO.png'),
                                            alignment:'left',
                                            width: 40,
                                            height: 40
                                        },
                                        {
                                            alignment:'right',
                                            text: [
                                                {
                                                    text: quittance?.auditDate?.split("T")[0],
                                                    style: 'sectionHeader',
                                                    color: 'black'
                                                },
                                                {
                                                    text: `\nQuittance de prime\n\n`,
                                                    style: 'sectionHeader',
                                                    color: 'black'
                                                },
                                                qr != '' ? {
                                                           qr: qr,
                                                           fit: '70',
                                                           alignment: "right",
                                                           style: 'sectionHeader'
                                                       }
                                                       : {}
                                            ]
                                        }
                                    ]
                                ]
                        }
                    }
                ]
              },
        footer: {
            layout: 'noBorders',
            margin: [35, 0, 35, 10],
            table: {
                    widths: [ '*' ],
                    alignment: "center",
                    body: [
                        [
                            {                            
                                text: 'AXA Assurances Algérie Vie - lotissement 11 décembre 1960 lots 08 et 12, 16030 El Biar Alger',
                                style: 'headerTable',
                                fontSize: 8,
                                alignment:'left'
                            }
                        ],
                        [
                            {                            
                                text: 'AXA Assurances Algérie Vie, Société Par Actions au capital de 2 250 000 000 DZD. Entreprise régie par la Loi n°06/04 du 20 Février 2006 modifiant et complétant l’ordonnance n°95/07 du 25 Janvier 1995, relative aux Assurances. Siège social : lotissement 11 décembre 1960 lots 08 et 12, 16030 El Biar Alger. Registre de Commerce N°16/00 - 1005275 B 11. Agrément N°79 du 02 novembre 2011.',
                                style: 'headerTable',
                                bold: false,
                                fontSize: 6,
                                alignment:'left'
                            }
                        ]
                    ]
            }
          },
        content: [
            {
                columns: [
                    {
                        style: "table",
                        table: {
                            widths: ["*"],
                            alignment: "left",
                            body: [
                                [
                                    {
                                        text: `Agence`,
                                        style: "headerTable"
                                    },
                                ],
                            ],
                        }
                    },
                    {
                        style: "table",
                        table: {
                            widths: ["*"],
                            alignment: "right",
                            body: [
                                [
                                    {
                                        text: `Référence`,
                                        style: "headerTable"
                                    },
                                ],
                            ],
                        },
                    },
                ],
            },
            {
                columns: [
                    {
                        table: {
                            widths: ["*"],
                            alignment: "left",
                            body: [
                                [
                                    {
                                        text: [
                                            { text: `Nom et code agence : `, bold: true, fontSize: "10" },
                                            { text: contrat?.agence?.codeAgence + " " + contrat?.agence?.raisonSocial, fontSize: "10" },
                                            
                                            // { text: avenant?.agence?.codeAgence + " " + avenant?.agence?.raisonSocial, fontSize: "10" },

                                            // pour pouvoir affiché l'agence et code agence depuiss l'impression d ela police et pas forcement depuis avenat 

                                        ],
                                    },
                                ],
                            ],
                        }
                    },
                    {
                        table: {
                            widths: ["*"],
                            alignment: "right",
                            body: [
                                [
                                    {
                                        text: [
                                            { text: `N° Police: `, bold: true, fontSize: "10" },
                                            { text: contrat?.idContrat, fontSize: "10" },
                                        ],
                                    },
                                ],
                            ],
                        },
                    }
                ],
            },
            {
                columns: [
                    {
                        table: {
                            widths: ["*"],
                            alignment: "left",
                            body: [
                                [
                                    {
                                        text: [
                                            { text: `Adresse agence : `, bold: true, fontSize: "10" },
                                            { text: contrat?.agence?.adresse, fontSize: "10" },
                                        ],
                                    },
                                ],
                            ],
                        }
                    },
                    {
                        table: {
                            widths: ["*"],
                            alignment: "right",
                            body: [
                                [
                                    {
                                        text: [
                                            { text: `Date effet : `, bold: true, fontSize: "10" },
                                            { text: avenant != null ? avenant.dateAvenant?.split("T")[0] : contrat?.dateEffet?.split("T")[0], fontSize: "10" },

                                        ],
                                    },
                                ],
                            ],
                        },
                    }
                ],
            },
            {
                columns: [
                    {
                        table: {
                            widths: ["*"],
                            alignment: "left",
                            body: [
                                [
                                    {
                                        text: [
                                            { text: `Téléphone agence : `, bold: true, fontSize: "10" },
                                            { text: contrat?.agence?.telephone, fontSize: "10" },
                                        ],
                                    },
                                ],
                            ],
                        }
                    },
                    {
                        table: {
                            widths: ["*"],
                            alignment: "right",
                            body: [
                                [
                                    {
                                        text: [
                                            { text: `Date expiration contrat : `, bold: true, fontSize: "10" },
                                            { text: contrat?.dateExpiration?.split("T")[0], fontSize: "10" },
                                        ],
                                    },
                                ],
                            ],
                        },
                    }
                ],
            },
            {
                columns: [
                    {
                        table: {
                            widths: ["*"],
                            alignment: "left",
                            body: [
                                [
                                    {
                                        text: [
                                            { text: `E-mail agence : `, bold: true, fontSize: "10" },
                                            { text: contrat?.agence?.email, fontSize: "10" },
                                        ],
                                    },
                                ],
                            ],
                        }
                    },
                    {
                        table: {
                            widths: ["*"],
                            alignment: "right",
                            body: [
                                [
                                    {
                                        text: [
                                            { text: `N° Quittance : `, bold: true, fontSize: "10" },
                                            { text: quittance.idQuittance, fontSize: "10" },
                                        ],
                                    },
                                ],
                            ],
                        },
                    }
                ],
            },

            contrat?.produit?.codeProduit == "45A" || contrat?.produit?.codeProduit == "45F" || contrat?.produit?.codeProduit == "45L" ?
                {
                    columns: [
                        {
                            style: "table",
                            table: {
                                widths: ["*", "*", "*", "*", "*", "*"],
                                body: [
                                    [
                                        {
                                            text: `Prime nette`,
                                            style: "headerTable"
                                        },
                                        contrat?.idHistorique == undefined || avenant?.typeAvenant?.code == 'A12' || avenant?.typeAvenant?.code == 'A13' || avenant?.typeAvenant?.code == 'A18' ?
                                            {
                                                text: `Coût de police`,
                                                style: "headerTable"
                                            }
                                            : {
                                                text: `Frais de gestion`,
                                                style: "headerTable"
                                            },
                                        {
                                            text: `T.V.A`,
                                            style: "headerTable"
                                        },

                                        {
                                            text: `F.G.A`,
                                            style: "headerTable"
                                        },
                                        {
                                            text: `Timbre de dimension`,
                                            style: "headerTable"
                                        },
                                        {
                                            text: `Timbre gradué`,
                                            style: "headerTable"
                                        },
                                    ],
                                    [
                                        {
                                            text: Number(quittance?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP101')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                            fontSize: 10
                                        },

                                        /*  {
                                              text: Number(quittance?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T01' || taxe?.taxe?.code == 'T08')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                              fontSize: 10
                                          },
                                          */
                                        contrat?.idHistorique == undefined || avenant?.typeAvenant?.code == 'A12' || avenant?.typeAvenant?.code == 'A13' || avenant?.typeAvenant?.code == 'A18' ?
                                            {
                                                text: Number(quittance?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T01')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                                fontSize: 10
                                            }
                                            : {
                                                text: Number(quittance?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T08')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                                fontSize: 10
                                            },
                                        {
                                            text: Number(quittance?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T04')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                            fontSize: 10
                                        },
                                        {
                                            text: Number(quittance?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T07')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                            fontSize: 10
                                        },
                                        {
                                            text: Number(quittance?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T03')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                            fontSize: 10
                                        },
                                        {
                                            text: Number(quittance?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T02')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                            fontSize: 10
                                        },
                                    ],
                                    [
                                        { text: '', colSpan: 4 },
                                        {},
                                        {},
                                        {},
                                        {
                                            text: `Prime Totale`,
                                            style: "headerTable",
                                        },
                                        {
                                            text: Number(quittance?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP186')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                            fontSize: 10
                                        },
                                    ],
                                ],
                            }
                        }
                    ],
                } : contrat?.produit?.codeProduit==="20A"?{
                    columns: [

                        {
                            style: "table",
                            table: {

                                widths: ["*", "*", "*", "*"],
                                body: [
                                    [
                                        {
                                            text: `Prime nette`,
                                            style: "headerTable"
                                        },
                                        contrat?.idHistorique == undefined || avenant?.typeAvenant?.code == 'A12' || avenant?.typeAvenant?.code == 'A13' || avenant?.typeAvenant?.code == 'A18' ?
                                            {
                                                text: `Coût de police`,
                                                style: "headerTable"
                                            }
                                            : {
                                                text: `Frais de gestion`,
                                                style: "headerTable"
                                            },
                                       

                                        {
                                            text: `Timbre de dimension`,
                                            style: "headerTable"
                                        },
                                        {
                                            text: `Prime Totale`,
                                            style: "headerTable",
                                        },

                                    ],
                                    [
                                        {
                                            text: Number(contrat?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP101')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                            fontSize: 10,
                                            alignment: "center"
                                        },
                                        /* {
                                             text: Number(quittance?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T01' || taxe?.taxe?.code == 'T08')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                             fontSize: 10,
                                             alignment: "center"
                                         },
                                         */
                                        contrat?.idHistorique == undefined || avenant?.typeAvenant?.code == 'A12' || avenant?.typeAvenant?.code == 'A13' || avenant?.typeAvenant?.code == 'A18' ?
                                            {
                                                text: Number(contrat?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T01')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                                fontSize: 10
                                            }
                                            : {
                                                text: Number(contrat?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T08')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                                fontSize: 10
                                            },
                                       

                                        {
                                            text: Number(contrat?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T03')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                            fontSize: 10,
                                            alignment: "center"
                                        },
                                        {
                                            text: Number(contrat?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP186')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                            fontSize: 10,
                                            alignment: "center"
                                        },



                                    ],

                                ],
                            }
                        },

                    ],
                }:contrat?.produit?.codeProduit==="97" ?{
                        columns: [

                            {
                                style: "table",
                                table: {

                                    widths: ["*", "*", "*", "*"],
                                    body: [
                                        [
                                            {
                                                text: `Prime nette`,
                                                style: "headerTable"
                                            },
                                            // contrat?.idHistorique == undefined || avenant?.typeAvenant?.code == 'A12' || avenant?.typeAvenant?.code == 'A13' || avenant?.typeAvenant?.code == 'A18' ?
                                                {
                                                    text: `Coût de police`,
                                                    style: "headerTable"
                                                },
                                                // : {
                                                //     text: `Frais de gestion`,
                                                //     style: "headerTable"
                                                // },
                                           

                                            {
                                                text: `Timbre de dimension`,
                                                style: "headerTable"
                                            },
                                            {
                                                text: `Prime Totale`,
                                                style: "headerTable",
                                            },

                                        ],
                                        [
                                            {
                                                text: Number(quittance?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP101')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                                fontSize: 10,
                                                alignment: "center"
                                            },
                                            /* {
                                                 text: Number(quittance?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T01' || taxe?.taxe?.code == 'T08')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                                 fontSize: 10,
                                                 alignment: "center"
                                             },
                                             */
                                            contrat?.idHistorique == undefined || avenant?.typeAvenant?.code == 'A12' || avenant?.typeAvenant?.code == 'A13' || avenant?.typeAvenant?.code == 'A18' ?
                                                {
                                                    text: Number(quittance?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T01')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                                    fontSize: 10
                                                }
                                                : {
                                                    text: Number(quittance?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T08')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                                    fontSize: 10
                                                },
                                           

                                            {
                                                text: Number(quittance?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T03')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                                fontSize: 10,
                                                alignment: "center"
                                            },
                                            {
                                                text: Number(quittance?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP186')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                                fontSize: 10,
                                                alignment: "center"
                                            },



                                        ],

                                    ],
                                }
                            },

                        ],
                    } :{ columns: [

                        {
                            style: "table",
                            table: {

                                widths: ["*", "*", "*", "*", "*"],
                                body: [
                                    [
                                        {
                                            text: `Prime nette`,
                                            style: "headerTable"
                                        },
                                        contrat?.idHistorique == undefined || avenant?.typeAvenant?.code == 'A12' || avenant?.typeAvenant?.code == 'A13' || avenant?.typeAvenant?.code == 'A18' ?
                                            {
                                                text: `Coût de police`,
                                                style: "headerTable"
                                            }
                                            : {
                                                text: `Frais de gestion`,
                                                style: "headerTable"
                                            },
                                           contrat.Produit=='CATNAT'?
                                           {}:
                                        {
                                            text: `T.V.A`,
                                            style: "headerTable"
                                        },

                                        {
                                            text: `Timbre de dimension`,
                                            style: "headerTable"
                                        },
                                        {
                                            text: `Prime Totale`,
                                            style: "headerTable",
                                        },

                                    ],
                                    [
                                        {
                                            text: Number(quittance?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP101')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                            fontSize: 10,
                                            alignment: "center"
                                        },
                                        /* {
                                             text: Number(quittance?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T01' || taxe?.taxe?.code == 'T08')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                             fontSize: 10,
                                             alignment: "center"
                                         },
                                         */
                                        contrat?.idHistorique == undefined || avenant?.typeAvenant?.code == 'A12' || avenant?.typeAvenant?.code == 'A13' || avenant?.typeAvenant?.code == 'A18' ?
                                            {
                                                text: Number(quittance?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T01')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                                fontSize: 10
                                            }
                                            : {
                                                text: Number(quittance?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T08')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                                fontSize: 10
                                            },
                                        {
                                            text: Number(quittance?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T04')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                            fontSize: 10,
                                            alignment: "center"
                                        },

                                        {
                                            text: Number(quittance?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T03')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                            fontSize: 10,
                                            alignment: "center"
                                        },
                                        {
                                            text: Number(quittance?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP186')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                            fontSize: 10,
                                            alignment: "center"
                                        },



                                    ],

                                ],
                            }
                        },

                    ],
                },
            /*   contrat?.produit?.codeProduit == "45F"?
               {


               
                 columns: [
                    
                     {
                         style: "table",
                         table: {
                             
                             widths:  ["*","*","*","*","*"] ,
                             body: [
                                 [
                                     {
                                         text: `Prime nette`,
                                         style: "headerTable"
                                     },
                                     {
                                         text: `Frais de gestion`,
                                         style: "headerTable"
                                     },
                                     {
                                         text: `T.V.A`,
                                         style: "headerTable"
                                     },
                                     
                                     {
                                         text: `Timbre de dimension`,
                                         style: "headerTable"
                                     },
                                     {
                                         text: `Prime Totale`,
                                         style: "headerTable",
                                     },
                                    
                                 ],
                                 [
                                     {
                                         text: Number(contrat?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP101')?.prime).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                         fontSize: 10,
                                         alignment: "center"
                                     },
                                     {
                                         text: Number(contrat?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T01' || taxe?.taxe?.code == 'T08')?.prime).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                         fontSize: 10,
                                         alignment: "center"
                                     },
                                     {
                                         text: Number(contrat?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T04')?.prime).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                         fontSize: 10,
                                         alignment: "center"
                                     },
                                  
                                     {
                                         text: Number(contrat?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T03')?.prime).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                         fontSize: 10,
                                         alignment: "center"
                                     },
                                     {
                                         text: Number(contrat?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP186')?.prime).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                         fontSize: 10,
                                         alignment: "center"
                                     },

                                    
                                     
                                 ],
                               
                             ],
                         }
                     },
                     
                 ],
               }:{},
               */
            // {
            //     margin: [0, 50, 0, 0],
            //     table: {
            //         widths: ['*'],
            //         body: [[" "], [" "]]
            //     },
            //     layout: {
            //         hLineWidth: function (i: any, node: any) {
            //             return (i === 0 || i === node.table.body.length) ? 0 : 2;
            //         },
            //         vLineWidth: function (i: any, node: any) {
            //             return 0;
            //         },
            //         hLineStyle: function (i: any, node: any) {
            //             if (i === 0 || i === node.table.body.length) {
            //                 return null;
            //             }
            //             return { dash: { length: 4, space: 2 } };
            //         },
            //         vLineStyle: function (i: any, node: any) {
            //             return 0;
            //         },
            //     }
            // },
            // {
            //     style: "table",
            //     table: {
            //         widths: ["*"],
            //         alignment: "right",
            //         body: [
            //             [
            //                 {
            //                     text: `SOUCHE DE QUITTANCE DE PRIME`,
            //                     style: "headerTable"
            //                 },
            //             ],
            //         ],
            //     },
            // },
            // contrat?.produit?.codeProduit==="20A" || contrat?.produit?.codeProduit==="97"?
            // {
            //     table: {
            //         widths: ["*", "*", "*", "*"],
            //         alignment: "right",
            //         body: [
            //             [
            //                 {
            //                     text: [
            //                         { text: `Assuré(e) :`, bold: true, fontSize: "10" },
            //                         { text: contrat?.personnesList?.find((person: any) => person?.personne?.raisonSocial != null ) ? contrat?.personnesList?.find((person: any) => person?.personne?.raisonSocial)?.personne?.raisonSocial : assure?.nom + " " + assure?.prenom1, fontSize: "10" },
            //                     ],
            //                     colSpan: 4,
            //                     alignment: "left"
            //                 },
            //                 {},
            //                 {},
            //                 {},
            //             ],
            //             [
            //                 {
            //                     text: [
            //                         { text: `Nº Quittance :`, bold: true, fontSize: "10" },
            //                         { text: contrat?.quittanceList.length != 0 ? contrat?.quittanceList[contrat?.quittanceList.length - 1] : contrat?.idQuittance, fontSize: "10" },
            //                     ],
            //                     colSpan: 2,
            //                     alignment: "left"
            //                 },
            //                 {
            //                     text: [
            //                         { text: `Nº de Police :`, bold: true, fontSize: "10" },
            //                         { text: contrat?.idContrat, fontSize: "10" },
            //                     ],
            //                     alignment: "left"
            //                 },
            //                 {},
            //                 {
            //                     text: [
            //                         { text: `Produit :`, bold: true, fontSize: "10" },
            //                         { text: contrat?.produit?.description, fontSize: "10" },
            //                     ],
            //                     alignment: "left"
            //                 },
            //             ],
            //             [
            //                 {
            //                     text: `Echéance`,
            //                     bold: true,
            //                     alignment: "center"
            //                 },
            //                 {
            //                     text: `Commissions`,
            //                     bold: true,
            //                     alignment: "center"
            //                 },
            //                 {
            //                     text: `Prime Nette`,
            //                     bold: true,
            //                     alignment: "center",
            //                 },
            //                 {
            //                     text: `Prime Totale`,
            //                     bold: true,
            //                     alignment: "center"
            //                 },
            //             ],
            //             [
            //                 {
            //                     text: [
            //                         { text: `Du :`, bold: true, fontSize: "10" },
            //                         { text: avenant != null ? avenant.dateAvenant?.split("T")[0] : contrat?.dateEffet?.split("T")[0], fontSize: "10" },
            //                         { text: `\nAu :`, bold: true, fontSize: "10" },
            //                         { text: contrat?.dateExpiration?.split("T")[0], fontSize: "10" }
            //                     ],
            //                     alignment: "left"
            //                 },
            //                 {
            //                     text: `0,00`,
            //                     bold: true,
            //                     alignment: "center"
            //                 },
            //                 {
            //                     text: Number(quittance?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP101')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
            //                     bold: true,
            //                     alignment: "center"
            //                 },
            //                 {
            //                     text: Number(quittance?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP186')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
            //                     bold: true,
            //                     alignment: "center"
            //                 },
            //             ],
            //         ],
            //     },
            // }
            // :
            // {
            //     table: {
            //         widths: ["*", "*", "*", "*", "*"],
            //         alignment: "right",
            //         body: [
            //             [
            //                 {
            //                     text: [
            //                         { text: `Assuré(e) :`, bold: true, fontSize: "10" },
            //                         { text: contrat?.personnesList?.find((person: any) => person?.personne?.raisonSocial != null ) ? contrat?.personnesList?.find((person: any) => person?.personne?.raisonSocial)?.personne?.raisonSocial : assure?.nom + " " + assure?.prenom1, fontSize: "10" },
            //                     ],
            //                     colSpan: 5,
            //                     alignment: "left"
            //                 },
            //                 {},
            //                 {},
            //                 {},
            //                 {},
            //             ],
            //             [
            //                 {
            //                     text: [
            //                         { text: `Nº Quittance :`, bold: true, fontSize: "10" },
            //                         { text: contrat?.quittanceList.length != 0 ? contrat?.quittanceList[contrat?.quittanceList.length - 1] : contrat?.idQuittance, fontSize: "10" },
            //                     ],
            //                     colSpan: 2,
            //                     alignment: "left"
            //                 },
            //                 {},
            //                 {
            //                     text: [
            //                         { text: `Nº de Police :`, bold: true, fontSize: "10" },
            //                         { text: contrat?.idContrat, fontSize: "10" },
            //                     ],
            //                     colSpan: 2,
            //                     alignment: "left"
            //                 },
            //                 {},
            //                 {
            //                     text: [
            //                         { text: `Produit :`, bold: true, fontSize: "10" },
            //                         { text: contrat?.produit?.description, fontSize: "10" },
            //                     ],
            //                     alignment: "left"
            //                 },
            //             ],
            //             [
            //                 {
            //                     text: `Echéance`,
            //                     bold: true,
            //                     alignment: "center"
            //                 },
            //                 {
            //                     text: `Commissions`,
            //                     bold: true,
            //                     alignment: "center"
            //                 },
            //                 {
            //                     text: `T.V.A`,
            //                     bold: true,
            //                     alignment: "center"
            //                 },
            //                 {
            //                     text: `Prime Nette`,
            //                     bold: true,
            //                     alignment: "center"
            //                 },
            //                 {
            //                     text: `Prime Totale`,
            //                     bold: true,
            //                     alignment: "center"
            //                 },
            //             ],
            //             [
            //                 {
            //                     text: [
            //                         { text: `Du :`, bold: true, fontSize: "10" },
            //                         { text: avenant != null ? avenant.dateAvenant?.split("T")[0] : contrat?.dateEffet?.split("T")[0], fontSize: "10" },
            //                         { text: `\nAu :`, bold: true, fontSize: "10" },
            //                         { text: contrat?.dateExpiration?.split("T")[0], fontSize: "10" }
            //                     ],
            //                     alignment: "left"
            //                 },
            //                 {
            //                     text: `0,00`,
            //                     bold: true,
            //                     alignment: "center"
            //                 },
            //                 {
            //                     text: Number(quittance?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T04')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
            //                     bold: true,
            //                     alignment: "center"
            //                 },
            //                 {
            //                     text: Number(quittance?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP101')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
            //                     bold: true,
            //                     alignment: "center"
            //                 },
            //                 {
            //                     text: Number(quittance?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP186')?.primeProrata).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
            //                     bold: true,
            //                     alignment: "center"
            //                 },
            //             ],
            //         ],
            //     },
            // },

            // {
            //     layout: 'noBorders',
            //     style: 'table',
            //     table: {
            //         widths: ["*", "*"],
            //         alignment: "center",
            //         body: [
            //             [
            //                 {
            //                     text: [
            //                         { text: `DATE RETOUR :\n\n`, bold: true, fontSize: "10" },
            //                         { text: `Nº BORDEREAU : \n`, bold: true, fontSize: "10" },
            //                     ],
            //                     alignment: 'left'
            //                 },
            //                 {
            //                     text: [
            //                         { text: `DATE ENCAISSEMENT :\n\n`, bold: true, fontSize: "10" },
            //                         { text: `MOTIF DE RETOUR : \n`, bold: true, fontSize: "10" },
            //                     ],
            //                     alignment: 'left'
            //                 }
            //             ]
            //         ],
            //     },
            // }
        ],
        styles: {
            sectionHeader: {
                bold: true,
                color: "#d14723",
                fontSize: 10,
                alignment: "right"
            },
            BG: {
                fontSize: 8
            },
            table: {
                margin: [0, 10, 0, 0]
            },
            headerTable: {
                alignment: "center",
                bold: true,
                fontSize: 10,
                color: "#00008F",
               
            }
        }
    }

    let pdf = pdfMake.createPdf(docDefinitionQuittance, undefined, undefined, pdfFonts.vfs);

    pdf.download("Quittance Voyage");
    
    return pdf;
  }

  mailContrat(idContrat: any, voyagiste: any, orderId: any) {
    const httpOption = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        })
    };

    // return this.http.post<any[]>(`${Constants.API_ENDPOINT_CONTRAT_MAIL}/${email}`, form, httpOption).pipe(
    //     tap((response) => this.logs(response)),
    //     catchError((error) => throwError(error.error))
    // );
    const userValue: any = JSON.parse(sessionStorage.getItem('access_token') as string);
    const isLoggedIn = userValue && userValue.access_token;

    let user = isLoggedIn ? userValue?.access_token : localStorage.getItem('token');

    $.ajax({
        "url": `${Constants.API_ENDPOINT_CONTRAT_MAIL}/${idContrat}`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            'canal': voyagiste ? "DV" : "DW",
            'orderId': voyagiste ? "" : orderId,
            "Authorization": "Bearer "+user
        },
        "processData": false,
        "mimeType": "multipart/form-data",
        "contentType": false
    }).done((response) => {
        console.log(response);
    });
}

  createContrat(contrat: any) {
    const httpOption = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        })
    };
    return this.http.post<any[]>(`${Constants.API_ENDPOINT_CONTRAT}`, contrat, httpOption).pipe(
        tap((response) => this.logs(response)),
        catchError((error) => throwError(error.error))
    );
  }

  filtresContrat(filterObject: any,index:number,size:number) {
    const httpOption = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        })
    };
    return this.http.post<any[]>(`${Constants.API_ENDPOINT_CONTRAT_FILTRE}?pageNumber=${index}&pageSize=${size}`, filterObject, httpOption).pipe(
        tap((response) => this.logs(response)),
        catchError((error) => throwError(error.error))
    );
}

  //generate contrat pdf
  async outputContrat(contrat: any, voyagiste: any) {       

    let index = 0;
    let garanties: any = [];
    let champs: any = ["Garanties"];
    let widthChamp: any = [];
    let assure: any = {};
    let conducteur: any = {};
    let souscripteur: any = {};
    let risqueListVehicule: any = [];
    let valeurVenale: any = 0
    let risque: any = [];
    let risqueList: any = [];
    let zone = '';
    let dateDebut =moment( contrat?.dateEffet).format('DD/MM/YYYY');
    let dateRetour = moment( contrat?.dateExpiration).format('DD/MM/YYYY');
    console.log("contrat?.risqueList ",contrat?.risqueList);
    let destination = contrat?.risqueList?.find((el:any)=>el?.codeRisque==="P182")?.reponse?.description;
    let duree=0;
    let garantieDomicile: any = [];
    let listGarantie: any = [];
    let headers: any = []
    let widthsHeaders:any[]=[80, 215, 125, 75];
    
    this.VL = contrat.risqueList.find((element: any) => element.codeRisque === 'P253');
    this.isVoyageLocal=this.VL!=undefined

    const isContratVoyage = contrat?.produit?.codeProduit==="20A";
    console.log("contrat?.groupeList[0]?.risques", contrat?.groupeList[0]?.risques)
    const risquesRows = contrat?.groupeList[0]?.risques?.map((risque: any) => [

        { text: risque?.idRisque, fontSize: "8",alignment:"center" },
        { text:(risque?.risque.find((cln:any)=>cln.colonne=="Nom")?.valeur || '') + " " + (risque?.risque.find((cln:any)=>cln.colonne=="Prénom")?.valeur || ''), fontSize: "8",alignment:"center" },
        { text:  moment(risque?.risque.find((cln:any)=>cln.colonne=="DateDeNaissance")?.valeur).format('DD/MM/YYYY') || '', fontSize: "8",alignment:"center" },
        { text: contrat?.primeListRisques?.find((rsq:any)=>rsq.id ===risque?.idRisque)?.prime, fontSize: "8",alignment:"center" }
    ]) || [];
    const garantis = contrat?.paramContratList?.map((garantie:any,idx:number)=>[
        {text:garantie?.description,fontSize:"8"},
        {text:idx!==1?"-":"15%",alignment:"center",fontSize:"8"},
        (contrat?.garantiePlafond?.[garantie?.description]!='')?
                        {text:idx===2?"Voir conditions au verso":`${contrat?.garantiePlafond?.[garantie?.description]} DZD`,alignment:"center",fontSize:"8"}:
                        {text:idx===2?"Voir conditions au verso":`${contrat?.garantiePlafond?.[garantie?.description]} -`,alignment:"center",fontSize:"8"}
    ])||[];
    
   
    
   

    switch (contrat?.pack?.codePack) {
        case "V01":
            zone="Monde entier sauf USA, Canada, Japon, Singapour"
            break;
        case "V02":
            zone="Monde entier"
            break;
        case "V04" :
            zone="Tunisie"
            break;
        case "V03" :
            zone="Turquie"
            break;
        case "V05" :
            zone="Monde entier sauf USA, Canada, Japon, Singapour"
            break;
        case "V06" :
            zone="Monde entier sauf USA, Canada, Japon, Singapour"
            break;
        default:
            break;
    }

    
    if (dateDebut && dateRetour) {
        const startDate = moment(dateDebut, 'DD/MM/YYYY');
        const endDate = moment(dateRetour, 'DD/MM/YYYY').add(1,"day");
        duree = endDate.diff(startDate, 'days');
    }
    if(isContratVoyage){
        widthsHeaders=["60%", "25%", "15%"]
    }
    contrat?.produit.codeProduit == "95" ?
        headers = [{
            text: `Garanties `,
            fontSize: 8,
            style: "headerTable"
        },
        {
            text: `Sous Garanties`,
            fontSize: 8,
            style: "headerTable"
        },
        {
            text: `Plafonds `,
            fontSize: 8,
            style: "headerTable"
        },
        {
            text: `Franchise `,
            fontSize: 8,
            style: "headerTable"
        },
        {
            text: `Primes `,
            fontSize: 8,
            style: "headerTable"
        },
        ] : isContratVoyage?
        headers = [{
            text: `Garanties `,
            style: "headerTable"
        },
        {
            text: `Limites & plafonds `,
            style: "headerTable"
        },
        {
            text: `Franchise `,
            style: "headerTable"
        },
        ]
        :
        headers = [{
            text: `Garanties `,
            style: "headerTable"
        },
        {
            text: `Sous Garanties`,
            style: "headerTable"
        },
        {
            text: `Plafonds `,
            style: "headerTable"
        },
        {
            text: `Franchise `,
            style: "headerTable"
        },

        ];
    let headers2 = [{
        text: `Garanties `,
        style: "headerTable",

    },
    {
        text: `Sous Garanties`,
        style: "headerTable"
    },
    {
        text: `Limites de garanties `,
        style: "headerTable"
    },
    {
        text: `Limite par an `,
        style: "headerTable"
    },
    {
        text: `Franchises `,
        style: "headerTable"
    }
    ];

    risqueListVehicule = contrat?.risqueList.filter((risque: any) => risque?.categorieParamRisque == "vehicule")
    valeurVenale = contrat?.risqueList.find((risque: any) => risque.codeRisque == "P40")?.reponse?.valeur
    risqueList = contrat?.risqueList.filter((risque: any) => risque.categorieParamRisque != "vehicule")
    
    index = 0;
    while (index < risqueList?.length) {
        risque.push({
            text1: [

                { text: risqueList[index].libelle + ": ", bold: true, fontSize: "8" },
                { text: risqueList[index].typeChamp == "Liste of values" ? risqueList[index].reponse?.idParamReponse?.description : risqueList[index].typeChamp == "From Table" ? risqueList[index].reponse?.description : risqueList[index].reponse?.valeur, fontSize: "8" },
            ],
            text2: [
                { text: risqueList[index + 1] ? risqueList[index + 1].libelle + ": " : "", bold: true, fontSize: "8" },
                { text: risqueList[index + 1] ? risqueList[index + 1].typeChamp == "Liste of values" ? risqueList[index + 1].reponse?.idParamReponse?.description : risqueList[index + 1].typeChamp == "From Table" ? risqueList[index + 1].reponse?.description : risqueList[index + 1].reponse?.valeur : "", fontSize: "8" },
            ]

        })
        index = index + 2;
    }

    contrat?.personnesList?.forEach((element: any) => {
        switch (element?.role?.idParam) {
            case 233:
                conducteur = element?.personne
                break;
            case 234:
                souscripteur = element?.personne
                break;
            case 235:
                assure = element?.personne
                break;
            case 236:
                souscripteur = element?.personne
                assure = element?.personne
                break;
            case 237:
                souscripteur = element?.personne
                conducteur = element?.personne
                break;
            case 280:
                assure = element?.personne
                conducteur = element?.personne
                break;
            case 238:
                souscripteur = element?.personne
                assure = element?.personne
                conducteur = element?.personne
                break;

            default:
                break;
        }
    });
    index = 0;
    while (index < contrat?.paramContratList?.length) {
        if ((contrat?.paramContratList[index].prime && contrat?.paramContratList[index].prime != "0") || contrat?.produit?.codeProduit != "95") {
            contrat?.paramContratList[index].categorieList?.map((element: any) => {
                champs.push(element?.description)
            });
        }

        index++;
    }
    champs = champs.filter((x: any, i: any) => champs.indexOf(x) === i);
    champs.push("Primes nettes")

    champs.map((champ: string) => {
        widthChamp.push("*")
    })

    if (contrat?.produit.codeProduit == "96" || contrat?.produit.codeProduit == "95") {

        let garantie: any = []
        garantie = contrat?.paramContratList?.find((item: any) => item.codeGarantie === "J01") ;
        garantieDomicile.push(garantie)
        listGarantie = contrat?.paramContratList?.filter((item: any) => item.codeGarantie != "J01") || [];

    }
    if(isContratVoyage){
        if(contrat.groupeList[0].pack.codePack!="V05" && contrat.groupeList[0].pack.codePack!="V06"){
            listGarantie= [
                {
                    description: "Décès accidentel",
                    franchise:"",
                    plafond:contrat.paramContratList?.find((param:any)=>param?.codeGarantie==="G42")?.categorieList?.[0]?.valeur + ' DZD',
                
                },
                {
                    description: "Incapacité Permanente Totale / Partielle",
                    franchise:"15%",
                    plafond:contrat.paramContratList?.find((param:any)=>param?.codeGarantie==="G43")?.categorieList?.[0]?.valeur + ' DZD',
                },
                {
                    description: "Rapatriement de corps en cas de décès",
                    franchise:"",
                    plafond:"Frais réels",
                    plafondInfo:"(2)"
                },
                {
                    description: "Rapatriement des autres bénéficiaires",
                    franchise:"",
                    plafond:"Frais réels",
                    plafondInfo:"(4)"
                },
                {
                    description: "Assistance : Prise en charge des frais médicaux",
                    franchise:"40€",
                    plafond:contrat?.pack?.codePack==="V01"? "30 000 €"
                    : contrat?.pack?.codePack==="V02"? "50 000 €":contrat?.pack?.codePack==="V03"?"10 000 €":"5 000 €",
                },
                {
                    description: "Transport Sanitaire",
                    franchise:"",
                    plafond:"Frais réels",
                    plafondInfo:"(1)"
                
                },
                {
                    description: "Visite d’un proche parent si l’hospitalisation du bénéficiaire est supérieure à 10 jours",
                    franchise:"",
                    plafond:"Frais réels" ,
                    plafondInfo:"(3)"
        
                },
                {
                    description: "Prolongation de séjour",
                    franchise:"",
                    plafond:"80 Euros/ nuit, Max 7 nuitées",
                },
                {
                    description: "Prise en charge des soins dentaires d’urgence",
                    franchise:"25€",
                    plafond:"160 Euros",
                },
                {
                    description: "Retour prématuré du Bénéficiaire",
                    franchise:"",
                    plafond:"Frais réels",
                    plafondInfo:"(5)"
        
                },
                {
                    description: "Frais de secours et sauvetage",
                    franchise:"",
                    plafond:"2 500 Euros",
                },
                {
                    description: "Assistance juridique",
                    franchise:"",
                    plafond:"4 000 Euros",
                },
                {
                    description: "Avance de caution pénale",
                    franchise:"",
                    plafond:"10 000 Euros",
                },
                {
                    description: "Perte de bagage, max = 40 kg",
                    franchise:"",
                    plafond:"20 Euros /kg",
                },
                {
                    description: "Retard de vol de plus de 12 heures",
                    franchise:"",
                    plafond:"150 Euros",
                },
                {
                    description: "Retard de livraison bagages de plus 48 heures",
                    franchise:"",
                    plafond:"300 Euros",
                },
                {
                    description: "Transmission de message urgent",
                    franchise:"",
                    plafond:"Illimité",
                },
            ]
        } else {
            listGarantie= [
                {
                    description: "Décès accidentel",
                    franchise:"",
                    plafond:contrat.paramContratList?.find((param:any)=>param?.codeGarantie==="G42")?.categorieList?.[0]?.valeur + ' DZD',
                   
                },
                (contrat.paramContratList?.find((param:any)=>param?.codeGarantie==="G43")?.categorieList.length!=0)?
                {
                    description: "Incapacité Permanente Totale / Partielle",
                    franchise:"15%",
                    plafond:contrat.paramContratList?.find((param:any)=>param?.codeGarantie==="G43")?.categorieList?.[0]?.valeur + ' DZD',
                }:{
                    description: "Incapacité Permanente Totale / Partielle",
                    franchise:"15%",
                    plafond:""
                }
            ]
        }
    }
  

    index = 0;
    while (index < contrat?.paramContratList?.length) {
        if ((contrat?.paramContratList[index].prime && contrat?.paramContratList[index].prime != "0") || contrat?.produit?.codeProduit != "95") {
            let tmp = {
                Garanties: [
                    { text: contrat?.paramContratList[index].description, fontSize: "8" },
                ],
                plafond: [
                    { text: '', fontSize: "8" },
                ],
                formule: [
                    { text: '', fontSize: "8" },
                ],
                franchise: [
                    { text: '', fontSize: "8" },
                ],
                "Primes nettes": [
                    { text: Number(contrat?.paramContratList[index].prime).toFixed(2), fontSize: "8" },
                ],
            };

            contrat?.paramContratList[index].categorieList?.map((cat: any) => {
                switch (cat.description) {
                    case "plafond":
                        if (cat.valeur == '0') { cat.valeur = valeurVenale }
                        tmp.plafond[0].text = cat.valeur
                        break;

                    case "formule":
                        tmp.formule[0].text = cat.valeur
                        break;

                    case "franchise":
                        tmp.franchise[0].text = cat.valeur
                        break;

                    default:
                        break;
                }
            })
            garanties.push(tmp);
        }

        index++;
    }

    let qr = "";
    switch (contrat?.produit.codeProduit) {
        case "45A":
            qr = "https://www.axa.dz/wp-content/uploads/2023/10/Conditions-generales-Assurance-Automobile.pdf"
            break;
        case "96":
            qr = "https://www.axa.dz/wp-content/uploads/2023/10/Conditions-Generales-Habitation.pdf"
            break;
        case "95":
            qr = "https://www.axa.dz/wp-content/uploads/2023/11/Conditions-Generales-Multirisque-professionnelle.pdf"
            break;
        case "20A":
            qr="https://www.axa.dz/wp-content/uploads/2023/10/Conditions-Generales-Assurance-Voyage.pdf"
            break;
        default:
            break;
    } 

    contrat.canal = voyagiste ? "DV": "DW";


    const docDefinitionContrat: any = {
        watermark: { text: '', color: 'blue', opacity: 0.1 },
        pageMargins: (isContratVoyage  || this.isVoyageLocal) ?[25, 40, 25, 25]:[25, 10, 25, 25],
        border: [false, false, false, false],
        footer: [
            {                            
                text: 'AXA Assurances Algérie Vie - lotissement 11 décembre 1960 lots 08 et 12, 16030 El Biar Alger\n',
                margin: [35, 0, 35, 0],
                style: 'headerTable',
                fontSize: 8,
                alignment:'left'
            },
            {                            
                text: 'AXA Assurances Algérie Vie, Société Par Actions au capital de 2 250 000 000 DZD. Entreprise régie par la Loi n°06/04 du 20 Février 2006 modifiant et complétant l’ordonnance n°95/07 du 25 Janvier 1995, relative aux Assurances. Siège social : lotissement 11 décembre 1960 lots 08 et 12, 16030 El Biar Alger. Registre de Commerce N°16/00 - 1005275 B 11. Agrément N°79 du 02 novembre 2011.',
                margin: [35, 0, 35, 0],
                style: 'headerTable',
                bold: false,
                fontSize: 6,
                alignment:'left'
            }
        ],
          header: {
                  columns:[ 
                      {
                          layout: 'noBorders',
                          margin: [35, 10, 35, 10],
                          table: {
                                  widths: [ '*','*' ],
                                  alignment: "center",
                                  body: [
                                      [
                                          {
                                              image: await getBase64ImageFromURL(this.http,'AXA_LOGO.png'),
                                              alignment:'left',
                                              width: 40,
                                              height: 40
                                          },{}
                                      ]
                                  ]
                          }
                      }
                  ]
                },
        // header: function(currentPage: any, pageCount: any, pageSize: any) {         
        //     if(currentPage == 1) {
        //         return {
        //             stack: [

        //             ],
        //             margin: [35, 30, 35, 0]
        //         }
        //     }   
        // },
        content: [
            {
                columns: [
                    { width: 120, text: '' }, // First empty column with a width of 120 units
                    (qr !== "" && contrat?.pack?.codePack!="V05" && contrat?.pack?.codePack!="V06" && !this.isVoyageLocal ) ? { qr: qr, fit: '70', width: 'auto', margin: [0, 0, 20, 0] } : {},
                    {
                        width: '*', // Third column taking the remaining space
                        stack: [
                            contrat?.produit.codeProduit == "96" ?
                            {
                                text: 'AXA  MultiRisque Habitation',
                                style: 'sectionHeader'
                            }
                            :
                            this.isVoyageLocal?{}:
                            {
                                text: 'AXA ' + contrat?.produit?.description.toUpperCase(),
                                style: 'sectionHeader'
                            },
                            {
                                text: 'Conditions Particulières',
                                style: 'sectionHeader',
                                color: 'black'
                            },
                            {
                                text: (contrat.produit.codeProduit == '97' && contrat.sousProduit.code == "CTI") ? 
                                            "Bien industriel et commercial" 
                                                : (contrat.produit.codeProduit == '97' && contrat.sousProduit.code == "CTH") ?
                                                 "Bien immobilier" 
                                                 :( contrat?.pack?.codePack=="V05" || contrat?.pack?.codePack=="V06")?

                                                 { 
                                                   text:"Hadj et Omra", 
                                                    style: 'sectionHeader',
                                            color: 'black'
                                                 }:
                                                 this.isVoyageLocal?{
                                                    text: 'AXA ' +this.VL.reponse.idParamReponse.description.toUpperCase(),
                                                   style: 'sectionHeader'
                                                }:

                                    contrat?.pack?.description + '',
                                style: 'sectionHeader',
                                color: 'black'
                            },
                            contrat?.convention != null ?
                            {
                                text: 'Convention: ' + contrat?.descriptionConvention,
                                style: 'sectionHeader',
                                color: 'black'
                            } : {},
                            contrat?.reduction != null ?
                            {
                                text: 'Réduction: ' + contrat?.descriptionReduction,
                                style: 'sectionHeader',
                                color: 'black'
                            } : {}
                        ]
                    }
                ]
            },
                {
                columns: [
                    {
                        style: "table",
                        table: {
                            widths: ["*"],
                            alignment: "left",
                            body: [
                                [
                                    {
                                        text: `Agence`,
                                        style: "headerTable",
                                    }
                                ],
                            ],
                        }
                    },
                    {
                        style: "table",
                        table: {
                            widths: ["*"],
                            alignment: "right",
                            body: [
                                [
                                    {
                                        text: `Référence du contrat`,
                                        style: "headerTable"
                                    },
                                ],
                            ],
                        },
                    },
                ],
            },
            {
                columns: [
                    {
                        table: {
                            widths: ["*"],
                            alignment: "left",
                            body: [
                                [
                                    {
                                        text: [
                                            { text: `Nom et code agence : `, bold: true, fontSize: "8" },
                                            { text: contrat?.agence?.codeAgence + " " + contrat?.agence?.raisonSocial, fontSize: "8" },
                                        ],
                                    },
                                ],
                            ],
                        }
                    },
                    {
                        table: {
                            widths: ["*"],
                            alignment: "right",
                            body: [
                                [
                                    {
                                        text: [
                                            { text: `N° Police: `, bold: true, fontSize: "8" },
                                            { text: contrat?.idContrat, fontSize: "8" },
                                        ],
                                    },
                                ],
                            ],
                        },
                    }
                ],
            },
            {
                columns: [
                    {
                        table: {
                            widths: ["*"],
                            alignment: "left",
                            body: [
                                [
                                    {
                                        text: [
                                            { text: `Adresse agence : `, bold: true, fontSize: "8" },
                                            { text: contrat?.agence?.adresse, fontSize: "8" },
                                        ],
                                    },
                                ],
                            ],
                        }
                    },
                    isContratVoyage?{
                        table: {
                            widths: ["*"],
                            alignment: "right",
                            body: [
                                [
                                    {
                                        text: [
                                            { text: `Durée : `, bold: true, fontSize: "8" },
                                            { text: `${duree}`, fontSize: "8" },
                                        ],
                                    },
                                ],
                            ],
                        },
                    }:{
                        table: {
                            widths: ["*"],
                            alignment: "right",
                            body: [
                                [
                                    {
                                        text: [
                                            { text: `Type de contrat : `, bold: true, fontSize: "8" },
                                            { text: `Durée Ferme`, fontSize: "8" },
                                        ],
                                    },
                                ],
                            ],
                        },
                    }
                ],
            },
            {
                columns: [
                    {
                        table: {
                            widths: ["*"],
                            alignment: "left",
                            body: [
                                [
                                    {
                                        text: [
                                            { text: `Téléphone agence : `, bold: true, fontSize: "8" },
                                            { text: contrat?.agence?.telephone, fontSize: "8" },
                                        ],
                                    },
                                ],
                            ],
                        }
                    },
                    {
                        table: {
                            widths: ["*"],
                            alignment: "right",
                            body: [
                                [
                                    {
                                        text: [
                                            { text: `Date effet : `, bold: true, fontSize: "8" },
                                            { text: contrat?.dateEffet?.split("T")[0], fontSize: "8" },
                                        ],
                                    },
                                ],
                            ],
                        },
                    }
                ],
            },
            {
                columns: [
                    {
                        table: {
                            widths: ["*"],
                            alignment: "left",
                            body: [
                                [
                                    {
                                        text: [
                                            { text: `E-mail agence : `, bold: true, fontSize: "8" },
                                            { text: contrat?.agence?.email, fontSize: "8" },
                                        ],
                                    },
                                ],
                            ],
                        }
                    },
                    {
                        table: {
                            widths: ["*"],
                            alignment: "right",
                            body: [
                                [
                                    {
                                        text: [
                                            { text: `Date d'échéance contrat : `, bold: true, fontSize: "8" },
                                            { text: contrat?.dateExpiration?.split("T")[0], fontSize: "8" },
                                        ],
                                    },
                                ],
                            ],
                        },
                    }
                ],
            },
            isContratVoyage?[
                {
                    style: "table",
                    table: {
                        widths: ["*"],
                        alignment: "left",
                        body: [
                            [
                                {
                                    text: `Souscripteur`,
                                    style: "headerTable",
                                    alignment: "left",

                                },
                            ],
                        ],
                    }
                },
                {
                    table: {
                        widths: ["*"],
                        alignment: "left",
                        body: [
                            [
                                {
                                    text: [
                                        { text: `Nom & Prénom : `, bold: true, fontSize: "8" },
                                        { text: contrat?.canal == "DV" ? contrat?.userResponse?.nom + " " + contrat?.userResponse?.prenom : souscripteur?.nom + " " + souscripteur?.prenom1, fontSize: "8" },
                                    ],
                                },
                            ],
                        ],
                    }
                },
                {
                    table: {
                        widths: ["*"],
                        alignment: "left",
                        body: [
                            [
                                {
                                    text: [
                                        { text: `Téléphone : `, bold: true, fontSize: "8" },
                                        { text: contrat?.canal == "DV" ? contrat?.userResponse?.telephone : souscripteur?.contactList?.find((contact: any) => contact?.typeContact?.code == "CNT1")?.description, fontSize: "8" },
                                    ],
                                },
                            ],
                        ],
                    }
                },
                {
                    table: {
                        widths: ["*"],
                        alignment: "left",
                        body: [
                            [
                                {
                                    text: [
                                        { text: `E-mail : `, bold: true, fontSize: "8" },
                                        { text: contrat?.canal == "DV" ? contrat?.userResponse?.email : souscripteur?.contactList?.find((contact: any) => contact?.typeContact?.code == "CNT2")?.description, fontSize: "8" },
                                    ],
                                },
                            ],
                        ],
                    }
                },
            ]
            :[
            {
                columns: [
                    {
                        style: "table",
                        table: {
                            widths: ["*"],
                            alignment: "left",
                            body: [
                                [
                                    {
                                        text: `Souscripteur`,
                                        style: "headerTable"
                                    },
                                ],
                            ],
                        }
                    },
                   {
                        style: "table",
                        table: {
                            widths: ["*"],
                            alignment: "right",
                            body: [
                                [
                                    {
                                        text: `Assuré(e)`,
                                        style: "headerTable"
                                    },
                                ],
                            ],
                        },
                    },
                ],
            },
            {
                columns: [
                    {
                        table: {
                            widths: ["*"],
                            alignment: "left",
                            body: [
                                [
                                    {
                                        text: [
                                            { text: `Nom & Prénom : `, bold: true, fontSize: "8" },
                                            { text: souscripteur?.nom + " " + souscripteur?.prenom1, fontSize: "8" },
                                        ],
                                    },
                                ],
                            ],
                        }
                    },
                    {
                        table: {
                            widths: ["*"],
                            alignment: "right",
                            body: [
                                [
                                    {
                                        text: [
                                            { text: contrat?.typeClient?.description == "personne morale" ? `Raison Sociale : ` : `Nom & Prénom : `, bold: true, fontSize: "8" },
                                            { text: contrat?.typeClient?.description == "personne morale" ? assure?.raisonSocial : assure?.nom + " " + assure?.prenom1, fontSize: "8" },
                                        ],
                                    },
                                ],
                            ],
                        },
                    }
                ],
            },
            {
                columns: [
                    {
                        table: {
                            widths: ["*"],
                            alignment: "left",
                            body: [
                                [
                                    {
                                        text: [
                                            { text: `Né(e) le : `, bold: true, fontSize: "8" },
                                            { text: souscripteur?.dateNaissance?.split("T")[0], fontSize: "8" },
                                        ],
                                    },
                                ],
                            ],
                        }
                    },
                    {
                        table: {
                            widths: ["*"],
                            alignment: "right",
                            body: [
                                [
                                    {
                                        text: [
                                            { text: `Né(e) le : `, bold: true, fontSize: "8" },
                                            { text: assure?.dateNaissance?.split("T")[0], fontSize: "8" },
                                        ],
                                    },
                                ],
                            ],
                        },
                    }
                ],
            },
            {
                columns: [
                    {
                        table: {
                            widths: ["*"],
                            alignment: "left",
                            body: [
                                [
                                    {
                                        text: [
                                            { text: `E-mail : `, bold: true, fontSize: "8" },
                                            { text: souscripteur?.contactList?.find((c: any) => c.typeContact?.idParam == 8)?.description, fontSize: "8" },
                                        ],
                                    },
                                ],
                            ],
                        }
                    },
                    {
                        table: {
                            widths: ["*"],
                            alignment: "right",
                            body: [
                                [
                                    {
                                        text: [
                                            { text: `E-mail : `, bold: true, fontSize: "8" },
                                            { text: assure?.contactList?.find((c: any) => c.typeContact?.idParam == 8)?.description, fontSize: "8" },
                                        ],
                                    },
                                ],
                            ],
                        },
                    }
                ],
            },
            {
                columns: [
                    {
                        table: {
                            widths: ["*"],
                            alignment: "left",
                            body: [
                                [
                                    {
                                        text: [
                                            { text: `Téléphone : `, bold: true, fontSize: "8" },
                                            { text: souscripteur?.contactList?.find((c: any) => c.typeContact?.idParam == 7)?.description, fontSize: "8" },
                                        ],
                                    },
                                ],
                            ],
                        }
                    },
                     {
                        table: {
                            widths: ["*"],
                            alignment: "right",
                            body: [
                                [
                                    {
                                        text: [
                                            { text: `Téléphone : `, bold: true, fontSize: "8" },
                                            { text: assure?.contactList?.find((c: any) => c.typeContact?.idParam == 7)?.description, fontSize: "8" },
                                        ],
                                    },
                                ],
                            ],
                        },
                    }
                ],
            }],
            risqueListVehicule?.length != 0 ?
                {
                    columns: [
                        {
                            style: "table",
                            table: {
                                widths: ["*"],
                                alignment: "left",
                                body: [
                                    [
                                        {
                                            text: `Conducteur principal`,
                                            style: "headerTable"
                                        },
                                    ],
                                ],
                            }
                        },

                        {
                            style: "table",
                            table: {
                                widths: ["*"],
                                alignment: "right",
                                body: [
                                    [
                                        {
                                            text: `Véhicule`,
                                            style: "headerTable"
                                        },
                                    ],
                                ],
                            },
                        },
                    ],
                } : {},
            risqueListVehicule?.length != 0 ?
                {
                    columns: [
                        {
                            table: {
                                widths: ["*"],
                                alignment: "left",
                                body: [
                                    [
                                        {
                                            text: [
                                                { text: `Nom & Prénom : `, bold: true, fontSize: "8" },
                                                { text: conducteur?.nom + ' ' + conducteur?.prenom1, fontSize: "8" },
                                            ],
                                        },
                                    ],
                                ],
                            }
                        },
                        {
                            table: {
                                widths: ["*"],
                                alignment: "right",
                                body: [
                                    [
                                        {
                                            columns: [
                                                {
                                                    text: [
                                                        { text: `Marque : `, bold: true, fontSize: "8" },
                                                        { text: risqueListVehicule.find((risque: any) => risque.codeRisque == 'P25')?.reponse?.idParamReponse?.description, fontSize: "8" },
                                                    ],

                                                },
                                                {
                                                    border: [false, true, true, true],
                                                    text: [
                                                        { text: `Modèle : `, bold: true, fontSize: "8" },
                                                        { text: risqueListVehicule.find((risque: any) => risque.codeRisque == 'P26')?.reponse?.idParamReponse?.description, fontSize: "8" },
                                                    ],

                                                }
                                            ],
                                        },
                                    ],
                                ],
                            },
                        }
                    ],
                } : {},
            risqueListVehicule?.length != 0 ?
                {
                    columns: [
                        {
                            table: {
                                widths: ["*"],
                                alignment: "left",
                                body: [
                                    [
                                        {
                                            text: [
                                                { text: `E-mail : `, bold: true, fontSize: "8" },
                                                { text: conducteur?.contactList?.find((c: any) => c.typeContact?.idParam == 8)?.description, fontSize: "8" },
                                            ],
                                        },
                                    ],
                                ],
                            }
                        },
                        {
                            table: {
                                widths: ["*"],
                                alignment: "right",
                                body: [
                                    [
                                        {
                                            text: [
                                                { text: `N° de Châssis :  `, bold: true, fontSize: "8" },
                                                { text: risqueListVehicule.find((risque: any) => risque.codeRisque == 'P30')?.reponse?.valeur, fontSize: "8" },
                                            ],
                                        },
                                    ],
                                ],
                            },
                        }
                    ],
                } : {},
            risqueListVehicule?.length != 0 ?
                {
                    columns: [
                        {
                            table: {
                                widths: ["*"],
                                alignment: "left",
                                body: [
                                    [
                                        {
                                            text: [
                                                { text: `Téléphone : `, bold: true, fontSize: "8" },
                                                { text: conducteur?.contactList?.find((c: any) => c.typeContact?.idParam == 7)?.description, fontSize: "8" },
                                            ],
                                        },
                                    ],
                                ],
                            }
                        },
                        {
                            table: {
                                widths: ["*"],
                                alignment: "right",
                                body: [
                                    [
                                        {
                                            text: [
                                                { text: `Immatriculation :  `, bold: true, fontSize: "8" },
                                                { text: risqueListVehicule.find((risque: any) => risque.codeRisque == 'P38')?.reponse?.valeur, fontSize: "8" },
                                            ],
                                        },
                                    ],
                                ],
                            },
                        }
                    ],
                } : {},
            risqueListVehicule?.length != 0 ?
                {
                    columns: [
                        {
                            table: {
                                widths: ["*"],
                                alignment: "left",
                                body: [
                                    [
                                        {
                                            text: [
                                                { text: `Né(e) le : `, bold: true, fontSize: "8" },
                                                { text: conducteur?.dateNaissance?.split("T")[0], fontSize: "8" },
                                            ],
                                        },
                                    ],
                                ],
                            }
                        },
                        {
                            table: {
                                widths: ["*"],
                                alignment: "right",
                                body: [
                                    [
                                        {
                                            text: [
                                                { text: `Date de mise en circulation : `, bold: true, fontSize: "8" },
                                                // { text: risqueListVehicule.find((risque: any) => risque.paramRisque?.codeParam == 'P28')?.valeur?.split("T")[0], fontSize: "8" },
                                                { text: risqueListVehicule.find((risque: any) => risque.codeRisque == 'P28')?.reponse?.valeur, fontSize: "8" },
                                            ],
                                        },
                                    ],
                                ],
                            },
                        }
                    ],
                } : {},
            risqueListVehicule?.length != 0 ?
                {
                    columns: [
                        {
                            table: {
                                widths: ["*"],
                                alignment: "left",
                                body: [
                                    [
                                        {
                                            text: [
                                                { text: `Catégorie de permis : `, bold: true, fontSize: "8" },
                                                { text: conducteur?.documentList?.find((d: any) => d.typeDocument?.idParam == 5)?.sousCategorie, fontSize: "8" },
                                            ],
                                        },
                                    ],
                                ],
                            }
                        },
                        {
                            table: {
                                widths: ["*"],
                                alignment: "right",
                                body: [
                                    [
                                        {
                                            text: [
                                                { text: `Valeur Vénale : `, bold: true, fontSize: "8" },
                                                { text: risqueListVehicule.find((risque: any) => risque.codeRisque == 'P40')?.reponse?.valeur + " DZD", fontSize: "8" },
                                            ],
                                        },
                                    ],
                                ],
                            },
                        }
                    ],
                } : {},
            risqueListVehicule?.length != 0 ?
                {
                    columns: [
                        {
                            table: {
                                widths: ["*"],
                                alignment: "left",
                                body: [
                                    [
                                        {
                                            text: [
                                                { text: `Obtenu le : `, bold: true, fontSize: "8" },
                                                { text: conducteur?.documentList?.find((d: any) => d.typeDocument?.idParam == 5)?.dateDelivrance?.split("T")[0], fontSize: "8" },
                                            ],
                                        },
                                    ],
                                ],
                            }
                        },
                        {
                            table: {
                                widths: ["*"],
                                alignment: "right",
                                body: [
                                    [
                                        {
                                            columns: [
                                                {

                                                    text: [
                                                        { text: `Genre : `, bold: true, fontSize: "8" },
                                                        { text: risqueListVehicule.find((risque: any) => risque.codeRisque == 'P31')?.reponse?.idParamReponse?.description, fontSize: "8" },
                                                    ]
                                                },
                                                {

                                                    text: [
                                                        { text: `Usage : `, bold: true, fontSize: "8" },
                                                        { text: risqueListVehicule.find((risque: any) => risque.codeRisque == 'P52')?.reponse?.idParamReponse?.description, fontSize: "8" },
                                                    ]
                                                }
                                            ],
                                        },
                                    ],
                                ],
                            },
                        }
                    ],
                } : {},
                
           isContratVoyage? [
                {
                columns: [
                    {
                        style: "table",
                        table: {
                            widths: ["*"],
                            alignment: "left",
                            body: [
                                [
                                    {
                                        text: `Assure(es)`,
                                        style: "headerTable",
                                        alignment: "left",

                                    },
                                ],
                            ],
                        }
                    },
                   
                ],
            },
            
            {
                table: {
                  widths: ['*', '*', '*', '*'], 
                  body: [
                    [
                        { text: 'Numéro d’assuré ', style: 'headerTable' },
                        { text: 'Nom et Prénom', style: 'headerTable' },
                        { text: 'Date de naissance', style: 'headerTable' },
                        { text: 'Prime nette', style: 'headerTable' }
                      ],
                     ...risquesRows, 

                  ]
                }
              },
              {text:`\n`},
              {
                table: {
                    widths: ['*', '*'], 
                    body: [
                      [
                        { text: 'Informations du voyage', style: 'headerTable', colSpan: 2, alignment: 'center' },
                        ''
                      ], // Header row
                      [
                        { text: `Formule : ${contrat?.pack?.description}`,fontSize:"8"  },
                        { text: `Durée : ${duree} Jour(s)`,fontSize:"8" }
                      ], // Row 1
                      [
                        { text: `Zone : ${zone}`,fontSize:"8"  },
                        { text: `Date d’effet : ${dateDebut}`,fontSize:"8" }
                      ], // Row 2
                      [
                        ( contrat?.pack?.codePack=="V05" || contrat?.pack?.codePack=="V06")?
                        {text: `Pays destination :  Arabie saoudite`,fontSize:"8"}: 
                        { text: `Pays destination : ${contrat.isShengen ? destination+" (Schengen)" :destination}`,fontSize:"8"},
                        { text: `Date d’échéance : ${dateRetour}`,fontSize:"8" }
                      ], // Row 3
                    ]
                  }
            },
            {text:`\n`},
            {
                table: {
                  widths: ['55%', '15%', '*'], // Define three columns with the first column auto-sized and the second column smaller
                  body: [
                    [
                      { text: 'Garanties', style: 'headerTable', colSpan: 3, alignment: 'center' },
                      '',
                      ''
                    ], // Header row
                    [
                      { text: 'Garanties accordées', style: 'headerTable' },
                      { text: 'Franchise', style: 'headerTable' },
                      { text: 'Capitaux', style: 'headerTable' }
                    ], // Row 1
                    ...garantis
                  ]
                }
              },
            ]:[
            risqueListVehicule?.length != 0 ? {} :
                {
                    style: "table",
                    table: {
                        widths: ["*"],
                        alignment: "right",
                        body: [
                            [
                                {
                                    //text: risqueList[0].paramRisque.categorieParamRisque.description,
                                    text: 'Caracteristique du risque assuré',
                                    style: "headerTable"
                                },
                            ],
                        ],
                    },
                },

            risqueListVehicule?.length != 0 ? {} : this.table(risque, ['text1', 'text2']),],
            { text: "\n" },

            //Debut Garanties et sous-garanties
            risqueListVehicule?.length != 0 ? garanties.length != 0 ? this.table(garanties, champs) : {} : {},
            //fin Garanties et sous garanties

            //debut Prime
            risqueListVehicule?.length != 0 ?
                {
                    columns: [

                        {
                            style: "table",
                            table: {

                                widths: ["*", "*", "*", "*", "*", "*"],
                                body: [
                                    [
                                        {
                                            text: `Prime nette`,
                                            style: "headerTable"
                                        },
                                        contrat?.idHistorique == undefined ?
                                            {
                                                text: `Coût de police`,
                                                style: "headerTable"
                                            }
                                            : {
                                                text: `Frais de gestion`,
                                                style: "headerTable"
                                            },
                                        {
                                            text: `T.V.A`,
                                            style: "headerTable"
                                        },
                                        risqueListVehicule?.length != 0 ?
                                            {
                                                text: `F.G.A`,
                                                style: "headerTable"
                                            } : {},
                                        {
                                            text: `Timbre de dimension`,
                                            style: "headerTable"
                                        },
                                        risqueListVehicule?.length != 0 ?
                                            {
                                                text: `Timbre gradué`,
                                                style: "headerTable"
                                            } : {},
                                    ],
                                    [
                                        {
                                            text: Number(contrat?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP101')?.primeProrata).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                            fontSize: 10
                                        },
                                        contrat?.idHistorique == undefined ?
                                            {
                                                text: Number(contrat?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T01')?.primeProrata).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                                fontSize: 10
                                            }
                                            : {
                                                text: Number(contrat?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T08')?.primeProrata).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                                fontSize: 10
                                            },
                                        /* {
                                             text: Number(contrat?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T01' || taxe?.taxe?.code == 'T08')?.primeProrata).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" DZD",
                                             fontSize: 10
                                         },
                                         */
                                        {
                                            text: Number(contrat?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T04')?.primeProrata).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                            fontSize: 10
                                        },
                                        risqueListVehicule?.length != 0 ?
                                            {
                                                text: Number(contrat?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T07')?.primeProrata).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                                fontSize: 10
                                            } : {},
                                        {
                                            text: Number(contrat?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T03')?.primeProrata).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                            fontSize: 10
                                        },
                                        risqueListVehicule?.length != 0 ?
                                            {
                                                text: Number(contrat?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T02')?.primeProrata).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                                fontSize: 10
                                            } : {},
                                    ],
                                    [
                                        { text: '', colSpan: 4 },
                                        {},
                                        {},
                                        {},
                                        {
                                            text: `Prime Totale`,
                                            style: "headerTable",
                                        },
                                        {
                                            text: Number(contrat?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP186')?.primeProrata).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                            fontSize: 10
                                        },
                                    ],
                                ],
                            }
                        }
                    ],
                } : isContratVoyage?
                {
                    table: {
                        widths: ['*', '*', '*', '*'], // Define five columns with equal width
                        body: [
                          [
                            { text: 'Prime nette', style: 'headerTable' },
                          
                            { text: 'Frais de gestion', style: 'headerTable' },
                            { text: 'Droit de timbres', style: 'headerTable' },
                            { text: 'Prime TTC', style: 'headerTable' }
                          ], // Header row
                          [
                            {text: Number(contrat?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP101')?.primeProrata).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",bold:true,alignment:"center",fontSize:"8"},
                            
                            {text:Number(contrat?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T01')?.primeProrata).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " DZD" ,bold:true,alignment:"center",fontSize:"8"},
                            {text: Number(contrat?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T03')?.primeProrata).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",bold:true,alignment:"center",fontSize:"8"},
                            {text:Number(contrat?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP186')?.primeProrata).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",bold:true,alignment:"center",fontSize:"8"}
                          ] // Row 2
                        ]
                      }
                }
                :
                {
                    columns: [

                        {
                            style: "table",
                            table: {

                                widths: ["*", "*", "*", "*", "*", "*"],
                                body: [
                                    [
                                        {
                                            text: `Prime nette`,
                                            style: "headerTable"
                                        },
                                        {
                                            text: `Prime sans réduction`,
                                            style: "headerTable"
                                        },
                                        contrat?.idHistorique == undefined  ?
                                            {
                                                text: `Coût de police`,
                                                style: "headerTable"
                                            }
                                            : {
                                                text: `Frais de gestion`,
                                                style: "headerTable"
                                            },
                                        {
                                            text: `T.V.A`,
                                            style: "headerTable"
                                        },

                                        {
                                            text: `Timbre de dimension`,
                                            style: "headerTable"
                                        },
                                        {
                                            text: `Prime Totale`,
                                            style: "headerTable",
                                        },

                                    ],
                                    [
                                        {
                                            text: Number(contrat?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP101')?.primeProrata).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                            fontSize: 10
                                        },
                                        {
                                            text: Number(contrat?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP264')?.primeProrata).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                            fontSize: 10
                                        },
                                        contrat?.idHistorique == undefined ?
                                            {
                                                text: Number(contrat?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T01')?.primeProrata).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " DZD",
                                                fontSize: 10
                                            }
                                            : {
                                                text: Number(contrat?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T08')?.primeProrata).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " DZD",
                                                fontSize: 10
                                            },
                                        {
                                            text: Number(contrat?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T04')?.primeProrata).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                            fontSize: 10
                                        },

                                        {
                                            text: Number(contrat?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T03')?.primeProrata).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                            fontSize: 10
                                        },
                                        {
                                            text: Number(contrat?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP186')?.primeProrata).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                            fontSize: 10
                                        },

                                    ],
                                ],
                            }
                        },

                    ],

                },
            { text: "\n" },
            
            isContratVoyage && (contrat?.pack?.codePack!="V05" && contrat?.pack?.codePack!="V06") ?[
                {
                    text: 'NB :',
                    bold: true,
                    margin: [0, 0, 0, 7],
                    fontSize:8
                  },
                  {
                    ul: [
                    'Toute modification de dates devra être demandée à l’assureur par le souscripteur, au moins 72 heures avant la prise d’effet du contrat.',
                    'La résiliation d’un contrat groupe ne peut se faire que pour la totalité des assurés mentionnés dans ce dernier.',
                    'En cas d’accident, de maladie inopinée ou afin d’invoquer les autres garanties d’assistance, vous devez contacter l’assisteur dans un délai maximum de 48h avant d’engager toute dépense.',
                    ],fontSize:8,bold:true
                } ,
                {
                    text: '\n',
                
                  },
            
            
            ]:
                        isContratVoyage && (contrat?.pack?.codePack=="V05" || contrat?.pack?.codePack=="V06")?

                        
                        [
                            
                            {
                                text: 'Important :',
                                bold: true,
                                margin: [0, 0, 0, 7],
                                fontSize:8
                              },
                              {
                                ul: [
                                'Toute modification ou résiliation du contrat   devra être demandée à l’assureur par le souscripteur, au moins 72 heures avant la prise d’effet du contrat.',
                                'La résiliation d’un contrat groupe ne peut se faire que pour la totalité des assurés mentionnés dans ce dernier.',
                                'En cas de sinistre, veuillez contacter votre agence dans un délai de 7 jours de sa survenance. '
                            //    'Toute annulation dans un delai inferieur a 72 heures avant la prise d effet du contrat engendrera une penalité equivalente à 25% du montant .' 
                                // 'TOUTE ANNULATION DANS UN DELAI INFERIEUR A 72 HEURES AVANT LA PRISE D’EFFET DU CONTRAT ENGENDRERA UNE PENALITE EQUIVALENTE A 25% DU MONTANT DE LA PRIME NETTE'

                                ],fontSize:8,bold:true
                            } ,
                            {
                                text: '\n',
                            
                              },
                        
                        
                        ]:
                        
                        
                        
                        {},
                         this.isVoyageLocal?
                        {
                            text:"Le présent contrat est régi par le Code Civil, l'ordonnance n°95/07 du 25 Janvier 1995 modifiée par la loi n°06/04 du 20 Février 2006, relative aux Assurances , l'ordonnance n°74/15 du 30 Janvier 1974 modifiée et complétée par la loi n°88/31 du 19/07/1988 et les décrets n°80/34 - n°80/35 - n°80/36 et n°80/37 du 16 Février 1980.",
                            fontSize: "8",
                            color: 'black',
                           
                        }:
            {
                text:"Le présent contrat est régi par le Code Civil, l'ordonnance n°95/07 du 25 Janvier 1995 modifiée par la loi n°06/04 du 20 Février 2006, relative aux Assurances , l'ordonnance n°74/15 du 30 Janvier 1974 modifiée et complétée par la loi n°88/31 du 19/07/1988 et les décrets n°80/34 - n°80/35 - n°80/36 et n°80/37 du 16 Février 1980.",
                fontSize: "8",
                color: 'black',
                pageBreak: 'after'
            },
            contrat?.produit.codeProduit == "96" || contrat?.produit.codeProduit == "95" || isContratVoyage ?
                {
                    style: 'table',
                    
                    text: isContratVoyage ? 'Tableau des garanties'+ ` - Formule : ${contrat?.pack?.description}`:"Tableau des garanties",
                    fontSize: 14,
                    color: 'black',
                    bold: true,
                    alignment: "center"

                }
                :{},

            contrat?.produit.codeProduit == "96"||isContratVoyage ? contrat?.paramContratList?.filter((item: any) => item.codeGarantie != "J01")||isContratVoyage ?
                {
                    style: "table",
                    table: {
                        // widths: [95,245,90,50],   
                        widths:  widthsHeaders,
                        headerRows: 1,
                        body: [headers].concat(
                           
                            listGarantie.map((g: any) => {
                                
                                let garantie: any;
                                let sGarantie: any = [];
                                let plafond: any = [];
                                let franchise: any = [];
                                const priceA = 10000;
                                
                                if (g.codeGarantie != "J01") {
                                    let i = 0;
                                    garantie = g.description
                                    g?.sousGarantieList?.map((sg: any) => {
                                        sGarantie.push({ text: sg.description, fontSize: 10, lineHeight: 1.25 });
                                        plafond[i] = sg.codeSousGarantie != "SG23" ?
                                            sg.codeSousGarantie != "SG20" ?
                                                sg.codeSousGarantie != "SG07" && sg.codeSousGarantie != "SG08" && sg.codeSousGarantie != "SG108" && sg.codeSousGarantie != "SG109" ?
                                                    sg.codeSousGarantie != "SG12" && sg.codeSousGarantie != "SG35" && sg.codeSousGarantie != "SG22" && sg.codeSousGarantie != "SG44" && sg.codeSousGarantie != "SG37" && sg.codeSousGarantie != "SG39" ?
                                                        sg.categorieList?.find((cat: any) => cat?.description == "plafond")?.valeur != 0 ?
                                                        sg.categorieList?.find((cat: any) => cat?.description == "plafond") ?
                                                            
                                                                { text: Number(sg.categorieList?.find((cat: any) => cat?.description == "plafond").valeur).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " DZD", fontSize: "10", lineHeight: 1.25, alignment: "center" }
                                                                : { text: "A concurrence des frais engagés", fontSize: "6", lineHeight: 1.25, alignment: "center" }
                                                            : { text: "/", fontSize: "10", alignment: "center" }
                                                        : { text: "5% de l'indemnité", fontSize: "10", lineHeight: 1.25, alignment: "center" }
                                                    : { text: " Valeur locative annuelle de 'l'habitation avec un maximum de 1 000 000 DZD", fontSize: "6", lineHeight: 1, alignment: "center" }
                                                : { text: "250 000 DZD par sinistre par année d’assurance", fontSize: "6", lineHeight: 1, alignment: "center" }
                                            : { text: "15 000 DZD par année d’assurance", fontSize: "7", lineHeight: 1.25, alignment: "center" }

                                        franchise = g.codeGarantie != "D04" && g.codeGarantie != "D05" ?
                                            { text: "5% des dommages avec un minimum de 5000 DZD ", fontSize: "9", valign: 'middle' }

                                            : { text: "5% des dommages avec un minimum de 5000 DZD et un délai de carrance d’un mois à compter de la date d’effet", fontSize: "6", valign: 'middle' }

                                        // franchise = { text: "5% des dommages avec un minimum de 5000 DZD ", fontSize: "9",valign: 'middle'}     

                                        /*  sg.categorieList?.find((cat: any) => cat?.description == "franchise") ? sg.categorieList?.find((cat: any) => cat?.description == "franchise").valeur ?
                                          { text: "5% des dommages avec un minimum de 5000 DZD", fontSize: "9",valign: 'middle'}: " " 
                                          */
                                        i++;

                                    })
                                    if (g?.sousGarantieList?.length == 0 && g?.categorieList?.length != 0) {
                                        plafond[i] = { text: g.categorieList?.find((cat: any) => cat?.description == "plafond") ? Number(g.categorieList?.find((cat: any) => cat?.description == "plafond")?.valeur).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " DZD" : "", fontSize: "10", lineHeight: 1.25, alignment: "center" }
                                        franchise = { text: g.categorieList?.find((cat: any) => cat?.description == "franchise") ? "5% des dommages avec un minimum de 5000 DZD" : "", fontSize: "9", valign: 'middle' }
                                    }

                                }
                                if(isContratVoyage){
                                    garantie=g.description
                                    const textplfnd = g.plafondInfo?
                                     {text:[
                                         g.plafond + ' ',
                                         { text:g.plafondInfo , sup: true },
                                       ],
                                       fontSize: 8,
                                       alignment: 'center'
                                    }
                                    :
                                    {text:g.plafond,fontSize: "8", alignment: 'center'}
                                    plafond=[textplfnd]
                                    franchise={ text: g.franchise, fontSize: "8", alignment: 'center' }
                                
                                    return [
                                        [{ text: garantie, fontSize: "8", verticalAlignment: 'middle', colSpan: 4 }],
                                        [plafond ? plafond : null],
                                        franchise
                                    ]
                                }
                                return [
                                    [{ text: garantie, fontSize: "10", verticalAlignment: 'middle', colSpan: 4 }],
                                    isContratVoyage?null:[sGarantie ? sGarantie : null],
                                    [plafond ? plafond : null],
                                    franchise
                                ]


                            }),
                           
                        )
                    }
                }
                : {} : contrat?.produit.codeProduit == "95" ?
                {
                    style: "table",
                    table: {
                        // widths: [95,245,90,50],   
                        widths: [95, 175, 120, 45, 60],
                        headerRows: 1,
                        body: [headers].concat(

                            listGarantie.map((g: any) => {

                                let garantie: any;
                                let sGarantie: any = [];
                                let plafond: any = [];
                                let franchise: any = [];
                                let prime: any = [];
                                const priceA = 10000;
                                let i = 0;
                                garantie = g.description
                                g?.sousGarantieList?.map((sg: any) => {
                                    sGarantie.push({ text: sg.description, fontSize: 8, lineHeight: 1.25 });
                                    plafond[i] = sg.codeSousGarantie != "SG98" ?
                                        sg.codeSousGarantie != "SG87" && sg.codeSousGarantie != "SG89" ?
                                            sg.codeSousGarantie != "SG84" && sg.codeSousGarantie != "SG85" && sg.codeSousGarantie != "SG86" ?
                                                sg.codeSousGarantie != "SG82" ?
                                                    sg.codeSousGarantie != "SG81" ?
                                                        sg.codeSousGarantie != "SG68" ?
                                                            sg.codeSousGarantie != "SG64" && sg.codeSousGarantie != "SG65" ?
                                                                sg.codeSousGarantie != "SG79" ?
                                                                    sg.codeSousGarantie != "SG52" && sg.codeSousGarantie != "SG53" && sg.codeSousGarantie != "SG70" && sg.codeSousGarantie != "SG71" ?
                                                                        sg.codeSousGarantie != "SG50" ?
                                                                            sg.codeSousGarantie != "SG72" && sg.codeSousGarantie != "SG12" && sg.codeSousGarantie != "SG35" && sg.codeSousGarantie != "SG22" && sg.codeSousGarantie != "SG44" &&
                                                                                sg.codeSousGarantie != "SG37" && sg.codeSousGarantie != "SG39" && sg.codeSousGarantie != "SG54" && sg.codeSousGarantie != "SG55" && sg.codeSousGarantie != "SG72" ?
                                                                                sg.categorieList?.find((cat: any) => cat?.description == "plafond") ?
                                                                                    sg.categorieList?.find((cat: any) => cat?.description == "plafond").valeur != 0 ?
                                                                                        { text: Number(sg.categorieList?.find((cat: any) => cat?.description == "plafond").valeur).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " DZD", fontSize: "6", lineHeight: 1.25, alignment: "center" }
                                                                                        : { text: "A concurrence des frais engagés", fontSize: "6", lineHeight: 1.5, alignment: "center" } : " "
                                                                                : { text: "5% de l'indemnité avec un max de 1 000 000 DZD", fontSize: "5", lineHeight: 2, alignment: "center" }
                                                                            : { text: Number(sg.categorieList?.find((cat: any) => cat?.description == "plafond").valeur).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " DZD  /sinistre ", fontSize: "6", lineHeight: 1.25, alignment: "center" }
                                                                        : { text: "Valeur locative annuelle des locaux avec un maximum de 1 000 000 DZD", fontSize: "5", lineHeight: 1, alignment: "center" }
                                                                    : { text: "Frais engagés max à 50 000 DZD", fontSize: "6", lineHeight: 1.25, alignment: "center" }
                                                                : { text: "2 500 000 DZD/ Année d'assurance", fontSize: "7", lineHeight: 1.25, alignment: "center" }
                                                            : { text: "1 000 000 DZD/ Année d'assurance", fontSize: "7", lineHeight: 1.25, alignment: "center" }
                                                        : { text: "Limité à 50 000 DZD", fontSize: "6", lineHeight: 1.25, alignment: "center" }
                                                    : { text: "50 000 DZD / sinistre", fontSize: "6", lineHeight: 1.25, alignment: "center" }
                                                : { text: Number(sg.categorieList?.find((cat: any) => cat?.description == "plafond").valeur).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " DZD/ Année d'assurance ", fontSize: "6", lineHeight: 2, alignment: "center" }
                                            : { text: Number(sg.categorieList?.find((cat: any) => cat?.description == "plafond").valeur / 2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " DZD/  /sinistre ", fontSize: "6", lineHeight: 1.25, alignment: "center" }
                                        : { text: "Limité à 1 000 000 DZD", fontSize: "6", lineHeight: 1.25, alignment: "center" }


                                    sg.description == "Honoraires d’experts" ? plafond[i] = { text: "Selon barème UAR", fontSize: "6", lineHeight: 1.5, alignment: "center" } : " "

                                    prime[i] = { text: sg.prime != null && sg.prime != '0' ? Number(sg.prime).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " DZD" : " ", lineHeight: 1.25, fontSize: "6" }
                                    i++;

                                })


                                switch (g.codeGarantie) {
                                    case "G47":
                                    case "G52":
                                        franchise = { text: g.categorieList?.find((cat: any) => cat?.description == "franchise") ? "5% des dommages nets" : '', fontSize: "8", valign: 'middle' }
                                        break;
                                    case "G45":
                                    case "G53":
                                        franchise = { text: "20 000 DZD sur dommages matériels uniquement", fontSize: "8", valign: 'middle' }
                                        break;
                                    case "G51":
                                        franchise = { text: "7 Jours", fontSize: "8", valign: 'middle' }
                                        break;

                                    default:
                                        franchise = { text: g.categorieList?.find((cat: any) => cat?.description == "franchise") ? "10% des dommages avec un minimum de " + Number(g.categorieList?.find((cat: any) => cat?.description == "franchise")?.valeur) + " DZD" : "", fontSize: "8", valign: 'middle' }
                                        break;
                                }

                                if (g?.sousGarantieList?.length == 0 && g?.categorieList?.length != 0) {
                                    plafond[i] = { text: g.categorieList?.find((cat: any) => cat?.description == "plafond") ? Number(g.categorieList?.find((cat: any) => cat?.description == "plafond")?.valeur).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " DZD" : "", fontSize: "8", lineHeight: 1.25, alignment: "center" }
                                    prime[i] = { text: g.prime != null && g.prime != '0' ? Number(g.prime).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " DZD" : " ", lineHeight: 1.25, fontSize: "8" }
                                }


                                return [
                                    [{ text: garantie, fontSize: "8", verticalAlignment: 'middle', colSpan: 4 }],
                                    [sGarantie ? sGarantie : null],
                                    [plafond ? plafond : null],
                                    [franchise],
                                    [prime ? prime : null]
                                ]


                            }),
                        )
                    }
                } : {},
                (isContratVoyage && (contrat?.pack?.codePack!="V05" && contrat?.pack?.codePack!="V06"))?{
                    table:  {
                        widths: ['60%', '*'], 
                        body: [
                            [
                                { text: '(1) : Couts réels, avion sanitaire sur vols intracontinentaux uniquement.', fontSize: 7 },
                                { text: '(2) : Cercueil minimum + frais d\'inhumation', fontSize: 6 }
                            ],
                            [
                                { text: '(3) : Billet aller/retour classe économique.', fontSize: 6 },
                                { text: '(4) : Billet aller/retour classe économique.', fontSize: 6 }
                            ],
                            [
                                { text: '(5) : Billet retour classe économique.', fontSize: 6, colSpan: 2 }, 
                                {}
                            ]
                        ]
                    },
                    layout: {
                        hLineWidth: function(i:any, node:any) {
                            return (i === node.table.body.length) ? 1 : 0;
                        },
                        vLineWidth: function(i:any, node:any) {
                            return (i === 0 || i === node.table.widths.length) ? 1 : 0;
                        },
                        hLineColor:"black",
                        vLineColor:"black", 
                },
            }:{},
            { text: `\nDÉCLARATION DU SOUSCRIPTEUR \n`, bold: true, fontSize: "6", alignment: 'justify', pageBreak: isContratVoyage? '':'before' },
            contrat?.produit.codeProduit == "95" ?
                {
                    text: `Je reconnais avoir reçu un exemplaire des Conditions Générales et des présentes Conditions Particulières et déclare avoir pris connaissance des textes y figurant.
            Je reconnais que les présentes Conditions Particulières ont été établies conformément aux réponses que j’ai données aux questions posées par la Compagnie lors de la souscription du contrat.
            Je reconnais avoir été préalablement informé(e) du montant de la prime et des garanties du présent contrat.
            Je reconnais avoir été informé(e), au moment de la collecte d’informations que les conséquences qui pourraient résulter d’une omission ou d’une déclaration inexacte sont celles prévues par l’article 19 de l’ordonnance n°95/07 du 25 janvier 1995 relative aux assurances modifiée et complétée par la loi n°06/04 du 20 février 2006.
            Je reconnais également avoir été informé(e), que les informations saisies dans ce document soient, utilisées, exploitées, traitées par AXA Assurances Algérie Dommage, transférées à l’étranger et à ses sous-traitants, dans le cadre de l'exécution des finalités de la relation commerciale, conformément à la Loi n° 18-07 du 10 juin 2018 relative à la protection des personnes physiques dans le traitement des données à caractère personnel.
            J’autorise, également AXA Assurances Algérie de m’envoyer des messages et des appels de prospections commerciales quel qu’en soit le support ou la nature.
            Pour toute demande concernant le traitement et vos droits relatifs à vos données à caractère personnel, merci de nous contacter sur l’adresse : dpo@axa.dz \n\n` , fontSize: "6", alignment: 'justify'
                }
                :isContratVoyage?[{
                    text:`Je reconnais avoir reçu un exemplaire des Conditions Générales et des présentes Conditions Particulières.
                    Je reconnais que les présentes Conditions Particulières ont été établies conformément aux réponses que j’ai données aux questions posées par la Compagnie lors de la souscription du contrat.
                    Je reconnais également avoir été préalablement informé(e) du montant de la prime et des garanties du présent contrat.
                    J’autorise AXA Assurances Algérie Vie à communiquer ces informations à ses mandataires, réassureurs, organismes professionnels habilités et sous-traitants missionnés.
                    Je reconnais enfin avoir été informé(e), au moment de la collecte d’informations, que les conséquences qui pourraient résulter d’une omission ou d’une déclaration inexacte sont celles prévues par l’article 19 de l’ordonnance n°95/07 du 25 janvier 1995 relative aux assurances modifiée et complétée par la loi n°06/04 du 20 février 2006. 
                    
                    En signant ce document, j’accepte que les informations saisies dans ce document soient, utilisée, exploitées, traitées par AXA Assurances Algérie, transférées à l’étranger et à ses sous-traitants, dans le cadre de l'exécution des finalités de la relation commerciale, conformément à la Loi n° 18-07 du 10 juin 2018 relative à la protection des personnes physiques dans le traitement des données à caractère personnel. J’autorise, également AXA Assurances Algérie de m’envoyer des messages et des appels de prospections commerciales quel qu’en soit le support ou la nature. Pour toute demande concernant le traitement de vos données à caractère personnel, merci de nous contacter sur l’adresse : dpo@axa.dz.
                     \n`,fontSize:6, alignment: 'justify'
                },
                {
                    text:`Dispositif des Sanction : `,style:'axaBold'
                },
                {
                    text:`Les garanties définies dans le présent contrat sont réputées sans effet et l’assureur n’est pas tenu de fournir une couverture ou de verser une indemnité ou d’exécuter une prestation en vertu des présentes dans la mesure où la fourniture d'une telle couverture, le paiement d’une telle indemnité ou l’exécution de telles prestations exposerait l’assureur à toute sanction, interdiction ou restriction en vertu des résolutions des Nations Unies ou des sanctions commerciales ou économiques, des lois et/ou des règlements applicables en Algérie et à l’international notamment les lois/règlements de l'Union européenne, Royaume-Uni ou États-Unis d'Amérique en la matière ou toute loi applicable\n`,
                    alignment:'justify',fontSize:6
                },
                {text:`IMPORTANT :\n`,bold:true,fontSize:6,decoration: 'underline',},
                {text:`LE BENEFICIAIRE EST COUVERT DANS LES MEMES CONDITIONS ET LIMITES, EN CAS DE MALADIE D’ORIGINE INFECTIEUSE, DONT LA COVID 19, SOUS RESERVE DES EXCLUSIONS SPECIFIQUES PREVUES DANS LES CONDITIONS GENERALES. \n`,fontSize:6},
                // {text:`LE BÉNÉFICIARE NE POURRA PRÉTENDRE À AUCUN REMBOURSEMENT DE FRAIS S'IL N'A PAS, AU PRÉALABLE, REÇU L'ACCORD EXPRESS DE L'ASSISTEUR (COMMUNICATION D'UN NUMÉRO DE DOSSIER). 
                // TOUTE ANNULATION DANS UN DELAI INFERIEUR A 72 HEURES AVANT LA PRISE D’EFFET DU CONTRAT ENGENDRERA UNE PENALITE EQUIVALENTE A 25% DU MONTANT DE LA PRIME NETTE.
                // \n`,bold:true,fontSize:6},


            ]: {
                    text: `Je reconnais avoir reçu un exemplaire des Conditions Générales et des présentes Conditions Particulières et déclare avoir pris connaissance des textes y figurant.
            Je reconnais que les présentes Conditions Particulières ont été établies conformément aux réponses que j'ai données aux questions posées par la Compagnie lors de la souscription du contrat.
            Je reconnais avoir été informé(e), au moment de la collecte d'informations que les conséquences qui pourraient résulter d'une omission ou d'une déclaration inexacte sont celles prévues par l'article 19 de l'ordonnance n°95/07 du 25 janvier 1995 relative aux assurances modifiée et complétée par la loi n°06/04 du 20 février 2006.
            Je reconnais également avoir été informé(e), que les informations saisies dans ce document soient, utilisées, exploitées, traitées par AXA Assurances Algérie Dommage, transférées à l'étranger et à ses sous-traitants, dans le cadre de l'exécution des finalités de la relation commerciale, conformément à la Loi n° 18-07 du 10 juin 2018 relative à la protection des personnes physiques dans le traitement des données à caractère personnel.
            En signant ce document, j'accepte que les informations saisies dans ce document soient, utilisée, exploitées, traitées par AXA Assurances Algérie, transférées à l'étranger et à ses sous-traitants, dans le cadre de l'exécution des finalités de la relation commerciale, conformément à la Loi n° 18-07 du 10 juin 2018 relative à la protection des personnes physiques dans le traitement des données à caractère personnel. 
            J'autorise, également AXA Assurances Algérie de m'envoyer des messages et des appels de prospections commerciales quel qu'en soit le support ou la nature.
            Pour toute demande concernant le traitement et vos droits relatifs à vos données à caractère personnel, merci de nous contacter sur l'adresse : dpo@axa.dz \n\n`, fontSize: "6", alignment: 'justify'
                },

            { text: `Fait à ${contrat?.agence?.wilaya} Le ${moment(contrat?.auditDate)?.format('DD/MM/YYYY')}\n`, bold: true, fontSize: "8" },
            {
                layout: 'noBorders',
                table: {
                    widths: ["*", "*", "*"],
                    alignment: "center",
                    body: [
                        [
                            {
                                text: [
                                    { text:isContratVoyage?`Signature du souscripteur(trice) : \n`: `Signature de l'assuré(e)\n`, bold: true, fontSize: "8" },
                                    { text: `Précédée de la mention « Lu et approuvé »\n`, fontSize: "8" },
                                ],
                                alignment: 'left'
                            },
                            {},
                            {
                                text: [
                                    {
                                        text: `Pour la Compagnie:`, bold: true, fontSize: "8",
                                        alignment:'right',
                                    }
                                ],
                                alignment: 'right'
                            }
                        ],
                        [
                            { qr: qr, fit: '100', width: 'auto', alignment: "right",margin: [0, 50, 0, 0] },
                            { text: 'Scannez ce code QR pour télécharger nos conditions générales', fontSize: 10, bold: true, alignment: "left",margin: [0, 75, 0, 0]},
                            {
                                image: await getBase64ImageFromURL(this.http,'cachet_signature.png'),
                                alignment:'right',
                                width: 170,
                                height: 170
                            },
                        ],
                    ],
                },
            }
        ],
        styles: {
            sectionHeader: {
                bold: true,
                color: "#d14723",
                fontSize: 10,
                alignment: "right"
            },
            BG: {
                fontSize: 8
            },
            table: {
                margin: [0, 0, 0, 0]
            },
            axaBold:{
                alignment: "left",
                bold: true,
                fontSize: 10,
                color: "#00008F", 
            },
            headerTable: {
                alignment: "center",
                bold: true,
                fontSize: 10,
                color: "#00008F",
              
            }
        }
    }

    let pdf = pdfMake.createPdf(docDefinitionContrat, undefined, undefined, pdfFonts.vfs);

    pdf.download("Conditions Particulières Voyage");
    
    return pdf;
  }

buildTableBody(data: any, columns: any) {
    var body = [];

    if (columns.includes("text1"))
        body.push()
    else {
        if (columns.includes("prime")) {
            columns = columns.map((col: any) => {
                col.text = col
                col.style = "headerTable"
            })
            body.push(columns);
        }
        else {
            let column: any = [];
            columns.map((col: any) => {
                let column1 = {
                    text: '',
                    style: ''
                }
                column1.text = col.replace(/_/g, ' ');
                column1.style = "headerTable"


                column.push(column1);
            })

            body.push(column);
        }
    }

    data.forEach(function (row: any) {
        const dataRow: any = [];

        columns.forEach(function (column: any) {
            dataRow.push(row[column]);
        })

        body.push(dataRow);
    });

    return body;
}

table(data: any, columns: any) {
    let pourcentage = 100 / columns?.length;
    let width: any = []
    columns.map((col: any) => {
        width.push(pourcentage + "%")
    })

    return [{
        layout: '',
        table: {
            headerRows: 1,
            widths: width,
            body: this.buildTableBody(data, columns)
        }
    }];
  }
  logs(response: any[]): void {
  }
}
