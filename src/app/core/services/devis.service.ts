import { Injectable } from '@angular/core';
import { Constants } from '../config/constants';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import moment from 'moment';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import getBase64ImageFromURL from '../utils/imageHandling';
import { text } from 'stream/consumers';
@Injectable({
  providedIn: 'root'
})
export class DevisService {
    VL: any;
    isVoyageLocal: boolean;
    valas: number;
    valtot: number;

  constructor(private http: HttpClient) { }

  createDevis(devis: any) {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      })
    };
    
    return this.http.post<any[]>(`${Constants.API_ENDPOINT_DEVIS}`, devis, httpOption).pipe(
        tap((response) => this.logs(response)),
        catchError((error) => throwError(error.error))
    );
}

controleDevis(paramRisque: any, codeDevis: any) {
    const httpOption = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'skip': ""
        })
    };
    return this.http.post<any[]>(`${Constants.API_ENDPOINT_CONTROLE}/${codeDevis}`, paramRisque, httpOption).pipe(
        tap((response) => this.logs(response)),
        catchError((error) => throwError(error.error))
    );
}

getPackIdRisque(idDevis: any, idRisque: any) {
    const httpOption = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        })
    };
    return this.http.get<any[]>(`${Constants.API_ENDPOINT_DEVIS}/${idDevis}/risque/${idRisque}`, httpOption).pipe(
        tap((response) => this.logs(response)),
        catchError((error) => throwError(error.error))
    );
}

getAllConventions() {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.get<any>(`${Constants.API_ENDPOINT_TEST_CONVENTION}`, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    )
}

getReductionByConvention(idConvention:any) {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.get<any>(`${Constants.API_ENDPOINT_TEST_REDUCTION_BY_CONVENTION}/${idConvention}`, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    )
}

applyReduction(reduction:any) {
    const httpOption : any = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'skip': ''
      })
    };

    return this.http.post<any>(`${Constants.API_ENDPOINT_TEST_REDUCTION_DEVIS}`, reduction, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    )
}

mailDevis(idDevis: any) {
    const httpOption = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        })
    };
    // return this.http.post<any[]>(`${Constants.API_ENDPOINT_DEVIS_MAIL}/${email}`, form, httpOption).pipe(
    //     tap((response) => this.logs(response)),
    //     catchError((error) => throwError(error.error))
    // );

    const userValue: any = JSON.parse(sessionStorage.getItem('access_token') as string);
    const isLoggedIn = userValue && userValue.access_token;

    let user = isLoggedIn ? userValue?.access_token : localStorage.getItem('token');
    const userId = sessionStorage.getItem("userId");
        
    $.ajax({
        "url": `${Constants.API_ENDPOINT_DEVIS_MAIL}/${idDevis}`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "canal": userId == null ? 'DW':'DV',
            "Authorization": "Bearer "+user
        },
        "processData": false,
        "mimeType": "multipart/form-data",
        "contentType": false
    }).done((response) => {
        console.log(response);
    });
}



getParamDevisByIdRisque(idDevis: any, idGroupe: any, idRisque: any) {
    const httpOption = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        })
    };
    return this.http.get<any[]>(`${Constants.API_ENDPOINT_DEVIS}/${idDevis}/groupe/${idGroupe}/risque/${idRisque}`, httpOption).pipe(
        tap((response) => this.logs(response)),
        catchError((error) => throwError(error.error))
    );
}

paramFichier(codeProduit: any) {
    const httpOption = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'skip': ''
        })
    };
    return this.http.get<any[]>(`${Constants.API_ENDPOINT_CONTROLE}/${codeProduit}`, httpOption).pipe(
        tap((response) => this.logs(response)),
        catchError((error) => throwError(error.error))
    );
}

generateTarif(devis: any) {
  const httpOption = {
      headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
      })
  };

  return this.http.post<any[]>(`${Constants.API_ENDPOINT_TARIF}`, devis, httpOption).pipe(
      tap((response) => {this.logs(response)
          console.log("response",response);
      }),
      catchError((error) => throwError(error.error))
  );
}

getDevisById(idDevis: any) {
    const httpOption = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        })
    };
    return this.http.get<any[]>(`${Constants.API_ENDPOINT_DEVIS}/${idDevis}`, httpOption).pipe(
        tap((response) => this.logs(response)),
        catchError((error) => throwError(error.error))
    );
}

//generate devis pdf
async generatePdf(devis: any) {  

  let index = 0;
  let risque: any = [];
  let garanties: any = [];
  let primes: any = [];
  let champs: any = ["Garanties"];
  let primeChamps: any = [];
  let widthChamp: any = [];
  let widthChampPrime: any = [];
  let dateNaissance: string = "";
  let categoriePermis: string = "";
  let dateObtentionPermis: string = "";
  let risqueList: any = [];
  let risqueListConducteur: any = [];
  let valeurVenale: any = 0
  let zone:string="";
  let dateDebut = moment(devis.risqueList.find((risk:any)=>risk.codeRisque==="P211")?.reponse?.valeur).format('DD/MM/YYYY');
  let dateRetour = moment(devis.risqueList.find((risk:any)=>risk.codeRisque==="P212")?.reponse?.valeur).format('DD/MM/YYYY');;
  let destination = devis.risqueList.find((risk:any)=>risk.codeRisque==="P182")?.reponse?.description;
  let duree=0;
  let primeGestion = Number(devis?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T01' || taxe?.taxe?.code == 'T08')?.prime).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  let droitTimbre = Number(devis?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T03')?.prime).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  let primeTotal = Number(devis?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP186')?.prime).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  let primeNette = Number(devis?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP101')?.prime).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  let pack= devis?.pack?.description
  let risquesRows=[]
  let garantis=[];
  const isDevisVoyage = devis.produit.codeProduit == "20A"
  if (isDevisVoyage){
  
  if (dateDebut && dateRetour) {
      const startDate = moment(dateDebut, 'DD/MM/YYYY');
      const endDate = moment(dateRetour, 'DD/MM/YYYY').add(1,"day");
      duree = endDate.diff(startDate, 'days');
  }
   
  switch (devis?.pack?.codePack) {
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
   risquesRows = devis?.groupes[0]?.risques?.map((risque: any) => [
      { text: risque?.idRisque, fontSize: "8",alignment:"center" },
      { text: (risque?.risque[0]?.valeur || '') + " " + (risque?.risque[1]?.valeur || ''), fontSize: "8",alignment:"center" },
      { text: moment(risque?.risque[2]?.valeur).format('DD/MM/YYYY') || '', fontSize: "8",alignment:"center" },
      { text: devis?.primeListRisques?.find((rsq:any)=>rsq.id ===risque?.idRisque).prime, fontSize: "8",alignment:"center" }
  ]) || [];
   garantis = devis?.paramDevisList.map((garantie:any,idx:number)=>[
      {text:garantie.description,fontSize:"8"},
      {text:idx!==1?"-":"15%",alignment:"center",fontSize:"8"},
      (devis.garantiePlafond[garantie.description]=='' || devis.garantiePlafond[garantie.description]==undefined)?
                        {text:idx===2?"Voir conditions au verso":`${''} -`,alignment:"center",fontSize:"8"}

                      :  {text:idx===2?"Voir conditions au verso":`${devis.garantiePlafond[garantie.description]} DZD`,alignment:"center",fontSize:"8"}
  ])||[];

}
  risqueList = devis?.risqueList?.filter((risque: any) => risque?.categorieParamRisque != "Conducteur")
  risqueListConducteur = devis?.risqueList?.filter((risque: any) => risque.categorieParamRisque == "Conducteur")
  valeurVenale = devis?.risqueList?.find((risque: any) => risque?.codeRisque == "P40")?.reponse?.valeur
  

  while (index < risqueList?.length) {
      risque.push({
          text1: [
              { text: risqueList[index].libelle + ": ", bold: true, fontSize: "8" },
              { text: risqueList[index].typeChamp?.description == "Liste of values" ? risqueList[index].reponse?.idParamReponse?.description : risqueList[index].typeChamp?.description == "From Table" ? risqueList[index].reponse?.description : risqueList[index].reponse?.valeur, fontSize: "8" },
          ],
          text2: [
              { text: risqueList[index + 1] ? risqueList[index + 1].libelle + ": " : "", bold: true, fontSize: "8" },
              { text: risqueList[index + 1] ? risqueList[index + 1].typeChamp?.description == "Liste of values" ? risqueList[index + 1].reponse?.idParamReponse?.description : risqueList[index + 1].typeChamp?.description == "From Table" ? risqueList[index + 1].reponse?.description : risqueList[index + 1].reponse?.valeur : "", fontSize: "8" },
          ]
      })
      index = index + 2;
  }

  index = 0;
  while (index < risqueListConducteur?.length) {
      switch (risqueListConducteur[index].libelle) {
          case "Date obtention permis":
              dateObtentionPermis = risqueListConducteur[index].reponse?.valeur.split("T")[0]
              break;
          case "Date de Naissance":
              dateNaissance = risqueListConducteur[index].reponse?.valeur.split("T")[0]
              break;
          case "Categorie Permis":
              categoriePermis = risqueListConducteur[index].reponse?.valeur
              break;

          default:
              break;
      }
      index = index + 1;
  }

  index = 0;
  while (index < devis?.paramDevisList?.length) {
      if((devis?.paramDevisList[index].prime && devis?.paramDevisList[index].prime != "0") || devis?.produit?.codeProduit != "95")
      {
          devis?.paramDevisList[index].categorieList?.map((element: any) => {
              champs.push(element?.description)
          });
      }

      index++;
  }
  champs = champs.filter((x: any, i: any) => champs.indexOf(x) === i);
  champs.push("Primes")

  champs.map((champ: string) => {
      widthChamp.push("*")
  })

  index = 0;
  while (index < devis?.paramDevisList?.length) {
      if((devis?.paramDevisList[index].prime && devis?.paramDevisList[index].prime != "0") || devis?.produit?.codeProduit != "95")
      {
          let tmp = {
              Garanties: [
                  { text: devis?.paramDevisList[index].description, fontSize: "8" },
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
              "Primes": [
                  { text: Number(devis?.paramDevisList[index].prime).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+ " DZD", fontSize: "8" },
              ],
          };

          devis?.paramDevisList[index].categorieList?.map((cat: any) => {
              switch (cat.description) {
                  case "plafond":
                      if (cat.valeur == '0') { cat.valeur = valeurVenale }
                      tmp.plafond[0].text = Number(cat.valeur).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      break;

                  case "formule":
                      tmp.formule[0].text = Number(cat.valeur).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      break;

                  case "franchise":
                      tmp.franchise[0].text = Number(cat.valeur).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      break;

                  default:
                      break;
              }
          })

          garanties.push(tmp);

      }
      index++;
    
  }

  index = 0;
  while (index < devis?.primeList?.length) {
      if (devis?.primeList[index].typePrime?.code == "CP101") {
          primeChamps.push(devis?.primeList[index].typePrime?.description)
          primes.push(Number(devis?.primeList[index].prime).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
      }

      index++;
  }

  index = 0;
  while (index < devis?.primeList?.length) {
      if (devis?.primeList[index].typePrime?.code != "CP186" && devis?.primeList[index].typePrime?.code != "CP101") {
          if((devis?.primeList[index].typePrime?.code != "CP102" && devis?.primeList[index].typePrime?.code != "CP103" && devis?.primeList[index].typePrime?.code != "CP104" && devis?.primeList[index].typePrime?.code != "CP105") || devis?.produit?.codeProduit != '95')
          {   

              primeChamps.push(devis?.primeList[index].typePrime?.description)
              primes.push(devis?.primeList[index].prime?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
          }
      }

      index++;
  }

  index = 0;
  while (index < devis?.taxeList?.length) {
      primeChamps.push(devis?.taxeList[index].taxe?.description)
      primes.push(Number(devis?.taxeList[index].prime).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))

      index++;
  }

  index = 0;
  while (index < devis?.primeList?.length) {
      if (devis?.primeList[index].typePrime?.code == "CP186") {
          primeChamps.push(devis?.primeList[index].typePrime?.description)
          primes.push(Number(devis?.primeList[index].prime).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
      }

      index++;
  }

  primeChamps.map((champ: string) => {
      widthChampPrime.push("*")
  })

  const docDefinition: any = {
      watermark: { text: 'DEVIS', color: 'blue', opacity: 0.1 },
      pageMargins: [35, 50, 35, 50],
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
                                            text: 'AXA ' + devis?.produit?.description.toUpperCase() + '\n',
                                            style: 'sectionHeader',
                                            alignment:'right',
                                        },
                                        (devis?.pack?.codePack=='V05' ||devis?.pack?.codePack=='V06')?
                                        {
                                            text: 'Devis'+" Hadj et Omra",
                                            style: 'sectionHeader',
                                            color: 'black'
                                        }: 
                                        {
                                            text: 'Devis\n',
                                            style: 'sectionHeader',
                                            alignment:'right',
                                            color: 'black'
                                        },
                                        (devis?.pack?.codePack=='V05' ||devis?.pack?.codePack=='V06')? {}:
                                        {
                                            text: devis?.pack?.description+"\n",
                                            style: 'sectionHeader',
                                            alignment:'right',
                                            color: 'black'
                                        },
                                        devis?.convention != null?
                                {
                                    text: 'Convention: '+devis?.reduction.convention?.nomConvention+"\n",
                                    style: 'sectionHeader',
                                    alignment:'right',
                                    color: 'black'
                                }:
                                devis?.reduction != null?
                                {
                                    text: 'Réduction: ' +devis?.reduction?.nomReduction+"\n",
                                    style: 'sectionHeader',
                                    alignment:'right',
                                    color: 'black'
                                }:{},
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
      border: [false, false, false, false],
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
                                      text: `Référence `,
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
                                          { text: devis?.agence?.codeAgence + " " + devis?.agence?.raisonSocial, fontSize: "8" },
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
                                          { text: `Devis N° : `, bold: true, fontSize: "8" },
                                          { text: devis?.idDevis, fontSize: "8" },
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
                                          { text: devis?.agence?.adresse, fontSize: "8" },
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
                                          { text: `Date devis : `, bold: true, fontSize: "8" },
                                          { text: devis?.auditDate.split("T")[0], fontSize: "8" },
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
                                          { text: devis?.agence?.telephone, fontSize: "8" },
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
                                          { text: `Date expiration devis : `, bold: true, fontSize: "8" },
                                          { text: devis?.dateExpiration, fontSize: "8" },
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
                                          { text: devis?.agence?.email, fontSize: "8" },
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
                                          { text: `Ce présent devis est valide 30 jours`, bold: true, fontSize: "8" },
                                          // { text: devis?.duree?.description, fontSize: "8" },
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
               
            ]
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
                                        { text: devis?.canal?.code == "DV" ? devis?.appUserResponse?.nom + " " + devis?.appUserResponse?.prenom : devis?.nom + " " + devis?.prenom, fontSize: "8" },
                                    ],
                                },
                            ],
                        ],
                    }
                },   
            ]
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
                                        { text: devis?.canal?.code == "DV" ? devis?.appUserResponse?.telephone : devis?.telephone, fontSize: "8" },
                                    ],
                                },
                            ],
                        ],
                    }
                },
                
            ]
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
                                        { text: devis?.canal?.code == "DV" ? devis?.appUserResponse?.email : devis?.email, fontSize: "8" },
                                    ],
                                },
                            ],
                        ],
                    }
                },
                
            ]
        },
        [{
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
          },],
        { text: "\n" },
        {
            table: {
                widths: ['*', '*'], 
                body: [
                  [
                    { text: 'Informations du voyage', style: 'headerTable', colSpan: 2, alignment: 'center' },
                    ''
                  ], // Header row
                  [
                    { text: `Formule : ${pack}`,fontSize:"8"  },
                    { text: `Durée : ${duree} Jour(s)`,fontSize:"8" }
                  ], // Row 1
                  [
                    { text: `Zone : ${zone}`,fontSize:"8"  },
                    { text: `Date d'effet : ${dateDebut}`,fontSize:"8" }
                  ], // Row 2
                  [
                    { text: `Pays destination : ${destination}`,fontSize:"8"},
                    { text: `Date d'échéance : ${dateRetour}`,fontSize:"8" }
                  ], // Row 3
                ]
              }
        },
        //Debut Garanties et sous-garanties
        [
            { text: "\n" },
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
        ],
        //fin Garanties et sous garanties
          
          //debut Prime
          {
              style: "table",
              table: {
                  widths: ["*"],
                  alignment: "right",
                  body: [
                      [
                          {
                              text: `Décompte de primes`,
                              style: "headerTable"
                          },
                      ],
                  ],
              },
          },
          
          isDevisVoyage?{
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
                      {text:`${primeNette} DZD`,bold:true,alignment:"center",fontSize:"8"},
                      
                      {text:`${primeGestion} DZD`,bold:true,alignment:"center",fontSize:"8"},
                      {text:`${droitTimbre} DZD`,bold:true,alignment:"center",fontSize:"8"},
                      {text:`${primeTotal} DZD `,bold:true,alignment:"center",fontSize:"8"}
                    ] // Row 2
                  ]
                }
          }:
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
                                      text: `Prime sans réduction`,
                                      style: "headerTable"
                                  },
                                  {
                                      text: `Coût de police`,
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
                                 
                                 
                              ],
                              [
                                  {
                                      text: primeNette + " DZD",
                                      fontSize: 10
                                  },
                                  {
                                      text: Number(devis?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP264')?.prime).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                      fontSize: 10
                                  },
                                  {
                                      text: primeGestion + " DZD",
                                      fontSize: 10
                                  },
                                  {
                                      text: Number(devis?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T04')?.prime).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                      fontSize: 10
                                  },                                      
                                 
                                  {
                                      text: droitTimbre + " DZD",
                                      fontSize: 10
                                  },
                                
                                  
                              ],
                              [                                        
                                  {},
                                  {},
                                  {},
                                  {
                                      text: `Prime Totale`,
                                      style: "headerTable",
                                  },
                                  {
                                      text: primeTotal + " DZD" ,
                                      fontSize: 8
                                  },
                              ],
                             
                          ],
                      }
                  }
              ],
          },
      
          '\n',
          
          {
              style: "table",
              text: [
                  { text: `Déclaration du souscripteur \n`, bold: true, fontSize: "8" },
                  { text: `Je reconnais avoir été informé(e), au moment de la collecte d'informations que les conséquences qui pourraient résulter d'une omission ou d'une déclaration inexacte sont celles prévues par l'article 19 de l'ordonnance n°95/07 du 25 janvier 1995 relative aux assurances modifiée et complétée par la loi n°06/04 du 20 février 2006.\n`, fontSize: "8", alignment: 'justify' },
                  { text: `Je reconnais également avoir été informé(e), que les informations saisies dans ce document soient, utilisées, exploitées, traitées par AXA Assurances Algérie Dommage, transférées à l'étranger et à ses sous-traitants, dans le cadre de l'exécution des finalités de la relation commerciale, conformément à la Loi n° 18-07 du 10 juin 2018 relative à la protection des personnes physiques dans le traitement des données à caractère personnel.\n`, fontSize: "8", alignment: 'justify' },
                  { text: `Pour toute demande concernant le traitement et vos droits relatifs à vos données à caractère personnel, merci de nous contacter sur l'adresse : dpo@axa.dz\n`, fontSize: "8", alignment: 'justify' },
              ]
          },
          sessionStorage.getItem("roles")?.includes("COURTIER") ? 
              {
                  text: [
                   `\n`,
                    'Je donne par le présent mandat à ',
                    { text: `${devis?.agence?.raisonSocial}`, bold: true },
                    ' En tant que Société de Courtage en assurances, à l’effet de négocier et gérer pour mon compte auprès des compagnies d’assurances aux meilleures conditions de garanties et de tarifs, en veillant à la défense de mes intérêts pendant toute la durée de l’assurance depuis la confection du contrat, qu’à l’occasion des règlements des sinistres. Le présent mandat prend effet à la date de signature du présent, et demeure valable tant qu’il n’a pas été dénoncé expressément par mes soins conformément à la législation en vigueur \n\n'
                  ],
                  fontSize: 8,
                  alignment: 'justify'
                }:{},
          {
              layout: 'noBorders',
              margin: [35, 25, 35, 5],
              table: {
                  widths: ["*", "*"],
                  alignment: "center",
                  body: [
                      [
                          {
                              text: `Fait à Alger Le `+  moment(devis?.auditDate)?.format('DD/MM/YYYY'),//devis?.auditDate.split("T")[0],
                              fontSize: 8,
                              alignment: 'left'
                          },
                          {
                              text: `Assureur`,
                              fontSize: 8,
                              alignment: 'right'
                          }
                      ]
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

  let pdf = pdfMake.createPdf(docDefinition, undefined, undefined, pdfFonts.vfs)

  pdf.download("Devis Assurance Voyage.pdf");

  return pdf;
}

// generatePdf(devis: any) {
//     const httpOption = {
//         headers: new HttpHeaders({
//             'Content-Type': 'application/json',
//             'Access-Control-Allow-Origin': '*'
//         })
//     };
  
//     return this.http.post<any[]>(`http://localhost:9089/outputDevis`, devis, httpOption).pipe(
//         tap((response) => {this.logs(response)
//             console.log("response",response);
//         }),
//         catchError((error) => throwError(error.error))
//     );
// }

remplissageDevis(devis: any) {
    const httpOption = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        })
    };
    return this.http.post<any[]>(`${Constants.API_ENDPOINT_TARIF_REMPLISSAGE}`, devis, httpOption).pipe(
        tap((response) => response),
        catchError((error) => throwError(error.error))
    );
}

async generatePdfMrh(devis: any) {  

        const logo = await getBase64ImageFromURL(this.http, '/images/AXA_LOGO.png');

        let index = 0;
        let risque: any = [];
        let garanties: any = [];
        let primes: any = [];
        let champs: any = ["Garanties"];
        let primeChamps: any = [];
        let widthChamp: any = [];
        let widthChampPrime: any = [];
        let dateNaissance: string = "";
        let categoriePermis: string = "";
        let dateObtentionPermis: string = "";
        let risqueList: any = [];
        let risqueListConducteur: any = [];
        let valeurVenale: any = 0
        let zone:string="";
        let dateDebut = moment(devis.risqueList.find((risk:any)=>risk.codeRisque==="P211")?.reponse?.valeur).format('DD/MM/YYYY');
        let dateRetour = moment(devis.risqueList.find((risk:any)=>risk.codeRisque==="P212")?.reponse?.valeur).format('DD/MM/YYYY');;
        let destination = devis.risqueList.find((risk:any)=>risk.codeRisque==="P182")?.reponse?.description;
        let duree=0;
        let primeGestion = Number(devis?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T01' || taxe?.taxe?.code == 'T08')?.prime).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        let droitTimbre = Number(devis?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T03')?.prime).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        let primeTotal = Number(devis?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP186')?.prime).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        let primeNette = Number(devis?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP101')?.prime).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        let pack= devis?.pack?.description
        let risquesRows=[]
        let widthTableAssures=devis.produit.codeProduit ==="20G"?["*","*","*","*","*"]:["*","*","*","*"]
        let bodyTableAssure :any[]=[]
        let garantis=[];
        let packRowsGav= [{text:"Garanties", style: 'headerTable'}]
        let widthspackRowsGav=["*"]
        let gavGarantieTable :any[]=[]
        let isScolaire:boolean=false


        if(devis?.produit?.codeProduit=='97'){
            if(devis.sousProduit.code=="CTH"){
        
            const    valas= devis?.risqueList.find((risque: { codeRisque: string; }) => risque.codeRisque === "P152");
            this.valas= valas.reponse.valeur*0.8
        console.log('je suis la valeur assure', this.valas)
    }
        if(devis.sousProduit.code =="CTI"){
            const    valas= devis?.risqueList.find((risque: { codeRisque: string; }) => risque.codeRisque === "P270");
        this.valtot= valas.reponse.valeur*0.5

}}

        const isDevisVoyage = devis.produit.codeProduit ==="20A"

        console.log("devised",devis);
         if (isDevisVoyage ||devis.produit.codeProduit ==="20G"){

        if(devis.produit.codeProduit ==="20G"){

            bodyTableAssure= [
                { text: 'Numéro d’assuré ', style: 'headerTable' },
                { text: 'Nom et Prénom', style: 'headerTable' },
                { text: 'Date de naissance', style: 'headerTable' },
                { text: 'Pack', style: 'headerTable' },
                { text: 'Prime nette', style: 'headerTable' }
              ]
        }else{
            bodyTableAssure= [
                { text: 'Numéro d’assuré ', style: 'headerTable' },
                { text: 'Nom et Prénom', style: 'headerTable' },
                { text: 'Date de naissance', style: 'headerTable' },     
                { text: 'Prime nette', style: 'headerTable' }
              ]
        }

        if (dateDebut && dateRetour) {
            const startDate = moment(dateDebut, 'DD/MM/YYYY');
            const endDate = moment(dateRetour, 'DD/MM/YYYY').add(1,"day");
            duree = endDate.diff(startDate, 'days');
        }

         

        switch (devis?.pack?.codePack) {
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
            default:
                break;

        }

        if(devis.produit.codeProduit ==="20G"){
            devis?.groupes.forEach((el:any) => {

                packRowsGav.push({text:el.pack.description, style: 'headerTable'})

                widthspackRowsGav.push("*")

                if(el.pack.codePack=="G03"){

                    isScolaire=true               

                } else {
                    console.log("devis.gavGarantieTable ", devis.gavGarantieTable);
                    devis.gavGarantieTable = devis.gavGarantieTable.filter((item: any) => 
                        item[0].text !== "Bris de lunettes en cas d’accident" && 
                        item[0].text !== "Prothèse dentaire en cas d’accident"
                    );
                }

            });

            devis.gavGarantieTable.unshift(packRowsGav)


            risquesRows = devis?.groupes?.flatMap((groupe: any) =>

                groupe?.risques?.map((risque: any) => [
                  { text: risque?.idRisque, fontSize: "8", alignment: "center" },
                  { 
                    text: (risque?.risque[0]?.valeur || '') + " " + (risque?.risque[1]?.valeur || ''), 
                    fontSize: "8", 
                    alignment: "center" 

                  },
                  { 
                    text: moment(risque?.risque[2]?.valeur).format('DD/MM/YYYY') || '', 
                    fontSize: "8", 
                    alignment: "center" 

                  },
                  { 
                    text: groupe.pack.description, 
                    fontSize: "8", 
                    alignment: "center" 
                  },
                  { 
                    text: devis?.primeListRisques?.find((rsq: any) => rsq.id === risque?.idRisque)?.prime || '', 
                    fontSize: "8", 
                    alignment: "center" 
                  }
                ])
              ) || [];
              console.log("risqrow",risquesRows)

        }else{

            risquesRows = devis?.groupes[0]?.risques?.map((risque: any) => [
                { text: risque?.idRisque, fontSize: "8",alignment:"center" },
                { text: (risque?.risque[0]?.valeur || '') + " " + (risque?.risque[1]?.valeur || ''), fontSize: "8",alignment:"center" },
                { text: moment(risque?.risque[2]?.valeur).format('DD/MM/YYYY') || '', fontSize: "8",alignment:"center" },
                { text: devis?.primeListRisques?.find((rsq:any)=>rsq.id ===risque?.idRisque).prime, fontSize: "8",alignment:"center" }
            ]) || [];

        }
         garantis = devis?.paramDevisList.map((garantie:any,idx:number)=>[
            {text:garantie.description,fontSize:"8"},
            {text:idx!==1?"-":"15%",alignment:"center",fontSize:"8"},
            {text:idx===2?"Voir conditions au verso":`${devis.garantiePlafond[garantie.description]} DZD`,alignment:"center",fontSize:"8"}
        ])||[];

    }
        risqueList = devis?.risqueList?.filter((risque: any) => risque?.categorieParamRisque != "Conducteur")
        
        

        


        function reorderRisqueList(risqueList:any, codesRisqueRecherche:any) {
                
            const matchingItems = risqueList
              .filter((item:any) => codesRisqueRecherche.includes(item.codeRisque))
              .sort((a:any, b:any) => codesRisqueRecherche.indexOf(a.codeRisque) - codesRisqueRecherche.indexOf(b.codeRisque));
          
              
            const remainingItems = risqueList.filter((item:any) => !codesRisqueRecherche.includes(item.codeRisque));
          
            
            return [...matchingItems, ...remainingItems];
        }
          

        switch (devis.produit.codeProduit) {
            case "97" :{

        const indexSMPToRemove = risqueList?.findIndex((risque:any) => risque?.codeRisque === "P245");

        if (indexSMPToRemove !== -1) {
        // Remove the found object at the found index
        risqueList.splice(indexSMPToRemove, 1);
        console.log('new rsiquelist',risqueList)
        }

                  const codesRisqueRecherche = ["P222", "P264", "P263", "P223", "P224", "P318"];
                  risqueList = reorderRisqueList(risqueList, codesRisqueRecherche);

                  break;
            }

            default:
                break;

        }
   
        valeurVenale = devis?.risqueList?.find((risque: any) => risque?.codeRisque == "P40")?.reponse?.valeur
        

        console.log('je cherceh smp',devis?.risqueList?.find((risque: any) => risque?.codeRisque == "P245"))


        while ((index < risqueList?.length )) {
           
            risque.push({
                text1: [
                    { text: risqueList[index].libelle + ": ", bold: true, fontSize: "8" },
                    { text: risqueList[index].typeChamp?.description == "Liste of values" ? risqueList[index].reponse?.idParamReponse?.description : risqueList[index].typeChamp?.description == "From Table" ? risqueList[index].reponse?.description : risqueList[index].reponse?.valeur, fontSize: "8" },
                ],
                text2: [
                    { text: risqueList[index + 1] ? risqueList[index + 1].libelle + ": " : "", bold: true, fontSize: "8" },
                    { text: risqueList[index + 1] ? risqueList[index + 1].typeChamp?.description == "Liste of values" ? risqueList[index + 1].reponse?.idParamReponse?.description : risqueList[index + 1].typeChamp?.description == "From Table" ? risqueList[index + 1].reponse?.description : risqueList[index + 1].reponse?.valeur : "", fontSize: "8" },
                ]
            })
            index = index + 2;
       }

        index = 0;
        while (index < risqueListConducteur?.length) {
            switch (risqueListConducteur[index].libelle) {
                case "Date obtention permis":
                    dateObtentionPermis = risqueListConducteur[index].reponse?.valeur.split("T")[0]
                    break;
                case "Date de Naissance":
                    dateNaissance = risqueListConducteur[index].reponse?.valeur.split("T")[0]
                    break;
                case "Categorie Permis":
                    categoriePermis = risqueListConducteur[index].reponse?.valeur
                    break;

                default:
                    break;
            }
            index = index + 1;
        }

        index = 0;
        while (index < devis?.paramDevisList?.length) {
            if((devis?.paramDevisList[index].prime && devis?.paramDevisList[index].prime != "0") || devis?.produit?.codeProduit != "95")
            {
                devis?.paramDevisList[index].categorieList?.map((element: any) => {
                    champs.push(element?.description)
                });
            }

            index++;
        }
        champs = champs.filter((x: any, i: any) => champs.indexOf(x) === i);
        // champs.push("Primes")

        champs.map((champ: string) => {
            widthChamp.push("*")
        })

        index = 0;
        while (index < devis?.paramDevisList?.length) {
            if((devis?.paramDevisList[index].prime && devis?.paramDevisList[index].prime != "0") || devis?.produit?.codeProduit != "95")
            {
                let tmp : any
                
                if (devis.produit.codeProduit!='97' )
                    {
                        tmp = {
                            Garanties: [
                                { text: devis?.paramDevisList[index].description, fontSize: "8" },
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
                            // "Primes": [
                            //     { text: Number(devis?.paramDevisList[index].prime).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+ " DZD", fontSize: "8" },
                            // ],
                        };}
                devis?.paramDevisList[index].categorieList?.map((cat: any) => {
                    switch (cat.description) {
                        case "plafond":
                            if (cat.valeur == '0') { cat.valeur = valeurVenale }
                            tmp.plafond[0].text = Number(cat.valeur).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            break;
    
                        case "formule":
                            tmp.formule[0].text = Number(cat.valeur).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            break;
    
                        case "franchise":
                            tmp.franchise[0].text = Number(cat.valeur).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            break;
    
                        default:
                            break;
                    }
                })
    
                garanties.push(tmp);
    
            }
            index++;
          
        }

        index = 0;
        while (index < devis?.primeList?.length) {
            if (devis?.primeList[index].typePrime?.code == "CP101") {
                primeChamps.push(devis?.primeList[index].typePrime?.description)
                primes.push(Number(devis?.primeList[index].prime).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
            }

            index++;
        }

        index = 0;
        while (index < devis?.primeList?.length) {
            if (devis?.primeList[index].typePrime?.code != "CP186" && devis?.primeList[index].typePrime?.code != "CP101") {
                if((devis?.primeList[index].typePrime?.code != "CP102" && devis?.primeList[index].typePrime?.code != "CP103" && devis?.primeList[index].typePrime?.code != "CP104" && devis?.primeList[index].typePrime?.code != "CP105") || devis?.produit?.codeProduit != '95')
                {   

                    primeChamps.push(devis?.primeList[index].typePrime?.description)
                    primes.push(devis?.primeList[index].prime?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
                }
            }

            index++;
        }

        index = 0;
        while (index < devis?.taxeList?.length) {
            primeChamps.push(devis?.taxeList[index].taxe?.description)
            primes.push(Number(devis?.taxeList[index].prime).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))

            index++;
        }

        index = 0;
        while (index < devis?.primeList?.length) {
            if (devis?.primeList[index].typePrime?.code == "CP186") {
                primeChamps.push(devis?.primeList[index].typePrime?.description)
                primes.push(Number(devis?.primeList[index].prime).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
            }

            index++;
        }

        primeChamps.map((champ: string) => {
            widthChampPrime.push("*")
        })

        const docDefinition: any = {
            watermark: { text: 'DEVIS', color: 'blue', opacity: 0.1 },
            pageMargins: [35, 45, 35, 120],
            header: {
        columns:[
            {
                layout: 'noBorders',
                margin: [35, 10, 35, 35],
                table: {
                        widths: [ '*','*' ],
                        alignment: "center",
                        body: [
                            [
                                {
                                    image: await getBase64ImageFromURL(this.http, '/images/AXA_LOGO.png'),
                                    alignment: 'left',
                                    width: 40,
                                    height: 40,
                                },
                                {
                                    alignment:'right',
                                    stack: [
                                        {                            
                                            text: 'AXA  MultiRisque Habitation\n' ,
                                            style: 'sectionHeader',
                                            alignment:'right',
                                        },
                                        {
                                            text: 'Devis',
                                            style: 'sectionHeader',
                                            color: 'black',
                                            alignment:'right',
                                        },
                                        {
                                            text: "Confort Habitation",
                                            style: 'sectionHeader',
                                            color: 'black',
                                            alignment:'right',
                                        },
                                        devis?.convention != null?
                                        {
                                            text: 'Convention: '+devis?.reduction.convention?.nomConvention + "\n",
                                            style: 'sectionHeader',
                                            alignment:'right',
                                            color: 'black'
                                        }:
                                        devis?.reduction != null?
                                        {
                                            text: 'Réduction: ' +devis?.reduction?.nomReduction + "\n",
                                            style: 'sectionHeader',
                                            alignment:'right',
                                            color: 'black'
                                        }:{},
                                    ]
                                }
                            ]
                        ]
                }
            }
        ]
      },
            border: [false, false, false, false],
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
                                            text: `Référence `,
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
                                                { text: devis?.agence?.codeAgence + " " + devis?.agence?.raisonSocial, fontSize: "8" },
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
                                                { text: `Devis N° : `, bold: true, fontSize: "8" },
                                                { text: devis?.idDevis, fontSize: "8" },
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
                                                { text: devis?.agence?.adresse, fontSize: "8" },
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
                                                { text: `Date devis : `, bold: true, fontSize: "8" },
                                                { text: devis?.auditDate.split("T")[0], fontSize: "8" },
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
                                                { text: "0"+devis?.agence?.telephone, fontSize: "8" },
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
                                                { text: `Date expiration devis : `, bold: true, fontSize: "8" },
                                                { text: devis?.dateExpiration, fontSize: "8" },
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
                                                { text: devis?.agence?.email, fontSize: "8" },
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
                                                { text: `Ce présent devis est valide 30 jours`, bold: true, fontSize: "8" },
                                                // { text: devis?.duree?.description, fontSize: "8" },
                                            ],
                                        },
                                    ],
                                ],
                            },
                        }
                    ],
                },
                {
                    columns:isDevisVoyage || devis.produit.codeProduit=="20G" ? [
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
                       
                    ] : [
                        {
                            style: "table",
                            table: {
                                widths: ["*"],
                                alignment: "left",
                                body: [
                                    [
                                        {
                                            text: `Assuré(e)`,
                                            style: "headerTable"
                                        },
                                    ],
                                ],
                            }
                        },
                        risqueListConducteur?.length != 0 ?
                            {
                                style: "table",
                                table: {
                                    widths: ["*"],
                                    alignment: "right",
                                    body: [
                                        [
                                            {
                                                text: `Conducteur`,
                                                style: "headerTable"
                                            },
                                        ],
                                    ],
                                },
                            } : {},
                    ],
                },
                {
                    columns: isDevisVoyage || devis.produit.codeProduit=="20G" ?[
                        {
                            table: {
                                widths: ["*"],
                                alignment: "left",
                                body: [
                                    [
                                        {
                                            text: [
                                                { text: devis?.typeClient?.description == "personne morale" ? `Raison Sociale : ` : `Nom & Prénom : `, bold: true, fontSize: "8" },
                                                { text: devis?.typeClient?.description == "personne morale" ? devis?.raisonSocial : devis?.nom + " " + devis?.prenom, fontSize: "8" },
                                            ],
                                        },
                                    ],
                                ],
                            }
                        },
                        
                    ]:[
                        {
                            table: {
                                widths: ["*"],
                                alignment: "left",
                                body: [
                                    [
                                        {
                                            text: [
                                                { text: devis?.typeClient?.description == "personne morale" ? `Raison Sociale : ` : `Nom & Prénom : `, bold: true, fontSize: "8" },
                                                { text: devis?.typeClient?.description == "personne morale" ? devis?.raisonSocial : devis?.nom + " " + devis?.prenom, fontSize: "8" },
                                            ],
                                        },
                                    ],
                                ],
                            }
                        },
                        risqueListConducteur?.length != 0 ?
                            {
                                table: {
                                    widths: ["*"],
                                    alignment: "right",
                                    body: [
                                        [
                                            {
                                                text: [
                                                    { text: `Date de naissance : `, bold: true, fontSize: "8" },
                                                    { text: dateNaissance, fontSize: "8" },
                                                ],
                                            },
                                        ],
                                    ],
                                },
                            } : {}
                    ],
                },
                {
                    columns: isDevisVoyage || devis.produit.codeProduit=="20G" ?
                    [
                        {
                            table: {
                                widths: ["*"],
                                alignment: "left",
                                body: [
                                    [
                                        {
                                            text: [
                                                { text: `Téléphone : `, bold: true, fontSize: "8" },
                                                { text: "0" + devis?.telephone, fontSize: "8" },
                                            ],
                                        },
                                    ],
                                ],
                            }
                        },
                        
                    ]
                    :[
                        {
                            table: {
                                widths: ["*"],
                                alignment: "left",
                                body: [
                                    [
                                        {
                                            text: [
                                                { text: `E-mail : `, bold: true, fontSize: "8" },
                                                { text: devis?.email, fontSize: "8" },
                                            ],
                                        },
                                    ],
                                ],
                            }
                        },
                        risqueListConducteur?.length != 0 ?
                            {
                                table: {
                                    widths: ["*"],
                                    alignment: "right",
                                    body: [
                                        [
                                            {
                                                text: [
                                                    { text: `Categorie du permis : `, bold: true, fontSize: "8" },
                                                    { text: categoriePermis, fontSize: "8" },
                                                ],
                                            },
                                        ],
                                    ],
                                },
                            } : {}
                    ],
                },
                {
                    columns: isDevisVoyage || devis.produit.codeProduit=="20G" ?
                    [
                        {
                            table: {
                                widths: ["*"],
                                alignment: "left",
                                body: [
                                    [
                                        {
                                            text: [
                                                { text: `E-mail : `, bold: true, fontSize: "8" },
                                                { text: devis?.email, fontSize: "8" },
                                            ],
                                        },
                                    ],
                                ],
                            }
                        },
                        
                    ]
                    :[
                        {
                            table: {
                                widths: ["*"],
                                alignment: "left",
                                body: [
                                    [
                                        {
                                            text: [
                                                { text: `Téléphone : `, bold: true, fontSize: "8" },
                                                { text: "0"+devis?.telephone, fontSize: "8" },
                                            ],
                                        },
                                    ],
                                ],
                            }
                        },
                        risqueListConducteur?.length != 0 ?
                            {
                                table: {
                                    widths: ["*"],
                                    alignment: "right",
                                    body: [
                                        [
                                            {
                                                text: [
                                                    { text: `Date d'obtention du permis : `, bold: true, fontSize: "8" },
                                                    { text: dateObtentionPermis, fontSize: "8" },
                                                ],
                                            },
                                        ],
                                    ],
                                },
                            } : {}
                    ],
                },
                isDevisVoyage || devis.produit.codeProduit=="20G" ?
                [{
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
                      widths:widthTableAssures, 
                      body: [
                        bodyTableAssure,
                         ...risquesRows, 
                      ]
                    }
                  },]
                :[{
                    style: "table",
                    table: {
                        widths: ["*"],
                        alignment: "right",
                        body: [
                            [
                                {
                                   // text: risqueList[0].categorieParamRisque,
                                    text:'Caractéristiques du risque assuré',
                                    style: "headerTable"
                                },
                            ],
                        ],
                    },
                },
                this.table(risque, ['text1', 'text2'])],
                { text: "\n" },
                isDevisVoyage?{
                    table: {
                        widths: ['*', '*'], 
                        body: [
                          [
                            { text: 'Informations du voyage', style: 'headerTable', colSpan: 2, alignment: 'center' },
                            ''
                          ], // Header row
                          [
                            { text: `Formule : ${pack}`,fontSize:"8"  },
                            { text: `Durée : ${duree} Jour(s)`,fontSize:"8" }
                          ], // Row 1
                          [
                            { text: `Zone : ${zone}`,fontSize:"8"  },
                            { text: `Date d'effet : ${dateDebut}`,fontSize:"8" }
                          ], // Row 2
                          [
                            { text: `Pays destination : ${destination}`,fontSize:"8"},
                            { text: `Date d'échéance : ${dateRetour}`,fontSize:"8" }
                          ], // Row 3
                        ]
                      }
                }:{},
                //Debut Garanties et sous-garanties
                isDevisVoyage?[
                    { text: "\n" },
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
                ]:  devis.produit.codeProduit=="20G"?
                [{
                    table: {
                        headerRows: 1,
                        widths: widthspackRowsGav,
                        body: isScolaire? devis.gavGarantieTable.slice(0,6) : devis.gavGarantieTable
                    },
                },
                 { text: `(*) : Décès accidentel 4 – 13 ans Pas de capital décès                 (*) : Décès accidentel 13 – 18 ans`, fontSize: 6 }

            ]: 
            devis.produit.codeProduit!="97"?
               [this.table(garanties, champs)]:[],




               (devis?.produit?.codeProduit=='97' && devis.sousProduit.code=="CTH")?[
                {
                    style: "table",
                    table: {
                      widths: ["50%", "50%"],
                      body: [
                        [
                          {
                            text: "Limite de garantie 80%",
                            style: "headerTable",
                          },
                          {
                            text: `${this.valas}`,
                            fontSize: 8,
                          },
                        ],
                        [
                          {
                            text: "Franchise",
                            style: "headerTable",
                          },
                          {
                            text: "2 % des dommages, Minimum 30.000 DZD",
                            fontSize: 8,
                          },
                        ],
                      ],
                    },
                  },
                  
              ]:
               
        
            (devis?.produit?.codeProduit=='97' && devis.sousProduit.code=="CTI")?[
              {
                  style: "table",
                  table: {
                    widths: ["50%", "50%"],
                    body: [
                      [
                        {
                          text: "Limite de garantie 50%",
                          style: "headerTable",
                        },
                        {
                          text: `${this.valtot} DZD`,
                          fontSize: 8,
                        },
                      ],
                      [
                        {
                          text: "Franchise",
                          style: "headerTable",
                        },
                        {
                          text: "10 % des dommages",
                          fontSize: 8,
                        },
                      ],
                    ],
                  },
                },
                
            ]:[],
        //    [this.table(garanties, champs)],
                //fin Garanties et sous garanties
                
                //debut Prime
                {
                    style: "table",
                    table: {
                        widths: ["*"],
                        alignment: "right",
                        body: [
                            [
                                {
                                    text: `Décompte de primes`,
                                    style: "headerTable"
                                },
                            ],
                        ],
                    },
                },
                
                devis?.produit?.codeProduit == "45A" || devis?.produit?.codeProduit == "45F"?
            
                {
                    columns: [
                       
                        {
                            style: "table",
                            table: {
                                
                                widths:  ["*","*","*","*","*","*"] ,
                                body: [
                                    [
                                        {
                                            text: `Prime nette`,
                                            style: "headerTable"
                                        },
                                        {
                                            text: `Coût de police`,
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
                                            text: primeNette + " DZD",
                                            fontSize: 10
                                        },
                                        
                                        {
                                            text: primeGestion + " DZD",
                                            fontSize: 10
                                        },
                                        {
                                            text: Number(devis?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T04')?.prime).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                            fontSize: 10
                                        },                                      
                                        {
                                            text: Number(devis?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T07')? devis?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T07')?.prime : ' ').toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                            fontSize: 10
                                        },
                                        {
                                            text: droitTimbre + " DZD",
                                            fontSize: 10
                                        },
                                      
                                        {
                                            text: Number(devis?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T02')? devis?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T02')?.prime : ' ').toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
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
                                            text: primeTotal + " DZD" ,
                                            fontSize: 10
                                        },
                                    ],
                                   
                                ],
                            }
                        }
                    ],
                }:isDevisVoyage || devis.produit.codeProduit=="20G" ?{
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
                            {text:`${primeNette} DZD`,bold:true,alignment:"center",fontSize:"8"},
                            
                            {text:`${primeGestion} DZD`,bold:true,alignment:"center",fontSize:"8"},
                            {text:`${droitTimbre} DZD`,bold:true,alignment:"center",fontSize:"8"},
                            {text:`${primeTotal} DZD `,bold:true,alignment:"center",fontSize:"8"}
                          ] // Row 2
                        ]
                      }
                }:
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
                                            text: `Prime sans réduction`,
                                            style: "headerTable"
                                        },
                                        {
                                            text: `Coût de police`,
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
                                       
                                       
                                    ],
                                    [
                                        {
                                            text: primeNette + " DZD",
                                            fontSize: 10
                                        },
                                        {
                                            text: Number(devis?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP264')?.prime).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                            fontSize: 10
                                        },
                                        {
                                            text: primeGestion + " DZD",
                                            fontSize: 10
                                        },
                                        // {
                                        //     text: Number(devis?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T04')?.prime).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                        //     fontSize: 10
                                        // },                                      
                                       

                                        {
                                            text: devis?.codeproduit === 97
                                                ? "0.00 DZD"
                                                : Number(devis?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T04')?.prime || 0)
                                                    .toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                            fontSize: 10
                                        },
                                        {
                                            text: droitTimbre + " DZD",
                                            fontSize: 10
                                        },
                                      
                                        
                                    ],
                                    [                                        
                                        {},
                                        {},
                                        {},
                                        {
                                            text: `Prime Totale`,
                                            style: "headerTable",
                                        },
                                        {
                                            text: primeTotal + " DZD" ,
                                            fontSize: 10
                                        },
                                    ],
                                   
                                ],
                            }
                        }
                    ],
                },
            

                
                {
                    style: "table",
                    text: [
                        { text: `Déclaration du souscripteur \n`, bold: true, fontSize: "8" },
                        { text: `Je reconnais avoir été informé(e), au moment de la collecte d'informations que les conséquences qui pourraient résulter d'une omission ou d'une déclaration inexacte sont celles prévues par l'article 19 de l'ordonnance n°95/07 du 25 janvier 1995 relative aux assurances modifiée et complétée par la loi n°06/04 du 20 février 2006.\n`, fontSize: "6", alignment: 'justify' },
                        { text: `Je reconnais également avoir été informé(e), que les informations saisies dans ce document soient, utilisées, exploitées, traitées par AXA Assurances Algérie Dommage, transférées à l'étranger et à ses sous-traitants, dans le cadre de l'exécution des finalités de la relation commerciale, conformément à la Loi n° 18-07 du 10 juin 2018 relative à la protection des personnes physiques dans le traitement des données à caractère personnel.\n`, fontSize: "6", alignment: 'justify' },
                        { text: `J'autorise AXA Assurances Algérie Dommage à m'envoyer des messages et des appels de prospections commerciales quel qu'en soit le support ou la nature.\n`, fontSize: "6", alignment: 'justify' },
                        { text: `Pour toute demande concernant le traitement et vos droits relatifs à vos données à caractère personnel, merci de nous contacter sur l'adresse : dpo@axa.dz\n`, fontSize: "6", alignment: 'justify' },
                    ]
                },
                sessionStorage.getItem("roles")?.includes("COURTIER") ? 
                    {
                        text: [
                         `\n`,
                          'Je donne par le présent mandat à ',
                          { text: `${devis?.agence?.raisonSocial}`, bold: true },
                          ' En tant que Société de Courtage en assurances, à l’effet de négocier et gérer pour mon compte auprès des compagnies d’assurances aux meilleures conditions de garanties et de tarifs, en veillant à la défense de mes intérêts pendant toute la durée de l’assurance depuis la confection du contrat, qu’à l’occasion des règlements des sinistres. Le présent mandat prend effet à la date de signature du présent, et demeure valable tant qu’il n’a pas été dénoncé expressément par mes soins conformément à la législation en vigueur \n\n'
                        ],
                        fontSize: 8,
                        alignment: 'justify'
                      }:{},
                {
                    layout: 'noBorders',
                    margin: [35, 25, 35, 5],
                    table: {
                        widths: ["*", "*"],
                        alignment: "center",
                        body: [
                            [
                                {
                                    text: `Fait à Alger Le `+  moment(devis?.auditDate)?.format('DD/MM/YYYY'),//devis?.auditDate.split("T")[0],
                                    fontSize: 8,
                                    alignment: 'left'
                                },
                                {
                                    text: `Assureur`,
                                    fontSize: 8,
                                    alignment: 'right'
                                }
                            ]
                        ],
                    },
                }
            ], footer: {
        layout: 'noBorders',
        margin: [35, 65, 35, 10],
        table: {
                widths: [ '*' ],
                alignment: "center",
                body: [
                    [
                        {                            
                            text: 'AXA Assurances Algérie Dommage - lotissement 11 décembre 1960 lots 08 et 12, 16030 El Biar Alger',
                            style: 'headerTable',
                            fontSize: 8,
                            alignment:'left'
                        }
                    ],
                    [
                        {                            
                            text: 'www.axa.dz',
                            style: 'headerTable',
                            fontSize: 8,
                            alignment:'left'
                        }
                    ],
                    [
                        {                            
                            text: 'AXA Assurances Algérie Dommage, Société Par Actions au capital de 3 150 000 000 DZD. Entreprise régie par la Loi n°06/04 du 20 Février 2006 modifant et complétant l’ordonnance n°95/07 du 25 Janvier 1995, relative aux Assurances. Siège social : lotissement 11 décembre 1960 lots 08 et 12, 16030 El Biar Alger. Registre de Commerce N°16/00 - 1005275 B 11. Agrément N°79 du 02 novembre 2011.',
                            style: 'headerTable',
                            bold: false,
                            fontSize: 6,
                            alignment:'left'
                        }
                    ]
                ]
        }
      },
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
        const fileName = 'Devis Assurance Habitation';
        pdfMake.createPdf(docDefinition).download(fileName);
    }

    generatePdfAuto(devis: any) {
        const logoAXA = 'data:image/png;base64,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';
        ; // mets ici TOUT le code base64 de l’image

        let index = 0;
        let risque: any = [];
        let garanties: any = [];
        let primes: any = [];
        let champs: any = ["Garanties"];
        let primeChamps: any = [];
        let widthChamp: any = [];
        let widthChampPrime: any = [];
        let dateNaissance: string = "";
        let categoriePermis: string = "";
        let dateObtentionPermis: string = "";
        let risqueList: any = [];
        let risqueListConducteur: any = [];
        let valeurVenale: any = 0
        let zone: string = "";
        let dateDebut = moment(devis.risqueList.find((risk: any) => risk.codeRisque === "P211")?.reponse?.valeur).format('DD/MM/YYYY');
        let dateRetour = moment(devis.risqueList.find((risk: any) => risk.codeRisque === "P212")?.reponse?.valeur).format('DD/MM/YYYY');;
        let destination = devis.risqueList.find((risk: any) => risk.codeRisque === "P182")?.reponse?.description;
        let duree = 0;
        let primeGestion = Number(devis?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T01' || taxe?.taxe?.code == 'T08')?.prime).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        let droitTimbre = Number(devis?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T03')?.prime).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        let primeTotal = Number(devis?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP186')?.prime).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        let primeNette = Number(devis?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP101')?.prime).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        let pack = devis?.pack?.description
        let risquesRows = []
        let widthTableAssures = devis.produit.codeProduit === "20G" ? ["*", "*", "*", "*", "*"] : ["*", "*", "*", "*"]
        let bodyTableAssure: any[] = []
        let garantis = [];
        let packRowsGav = [{ text: "Garanties", style: 'headerTable' }]
        let widthspackRowsGav = ["*"]
        let gavGarantieTable: any[] = []
        let isScolaire: boolean = false





        if (devis?.produit?.codeProduit == '97') {
            if (devis.sousProduit.code == "CTH") {

                const valas = devis?.risqueList.find((risque: { codeRisque: string; }) => risque.codeRisque === "P152");
                this.valas = valas.reponse.valeur * 0.8
                console.log('je suis la valeur assure', this.valas)
            }
            if (devis.sousProduit.code == "CTI") {
                const valas = devis?.risqueList.find((risque: { codeRisque: string; }) => risque.codeRisque === "P270");
                this.valtot = valas.reponse.valeur * 0.5

            }
        }

        const isDevisVoyage = devis.produit.codeProduit === "20A"

        console.log("devised", devis);
        if (isDevisVoyage || devis.produit.codeProduit === "20G") {

            if (devis.produit.codeProduit === "20G") {

                bodyTableAssure = [
                    { text: 'Numéro d’assuré ', style: 'headerTable' },
                    { text: 'Nom et Prénom', style: 'headerTable' },
                    { text: 'Date de naissance', style: 'headerTable' },
                    { text: 'Pack', style: 'headerTable' },
                    { text: 'Prime nette', style: 'headerTable' }
                ]
            } else {
                bodyTableAssure = [
                    { text: 'Numéro d’assuré ', style: 'headerTable' },
                    { text: 'Nom et Prénom', style: 'headerTable' },
                    { text: 'Date de naissance', style: 'headerTable' },
                    { text: 'Prime nette', style: 'headerTable' }
                ]
            }

            if (dateDebut && dateRetour) {
                const startDate = moment(dateDebut, 'DD/MM/YYYY');
                const endDate = moment(dateRetour, 'DD/MM/YYYY').add(1, "day");
                duree = endDate.diff(startDate, 'days');
            }



            switch (devis?.pack?.codePack) {
                case "V01":
                    zone = "Monde entier sauf USA, Canada, Japon, Singapour"
                    break;
                case "V02":
                    zone = "Monde entier"
                    break;
                case "V04":
                    zone = "Tunisie"
                    break;
                case "V03":
                    zone = "Turquie"
                    break;
                default:
                    break;

            }

            if (devis.produit.codeProduit === "20G") {
                devis?.groupes.forEach((el: any) => {

                    packRowsGav.push({ text: el.pack.description, style: 'headerTable' })

                    widthspackRowsGav.push("*")

                    if (el.pack.codePack == "G03") {

                        isScolaire = true

                    } else {
                        console.log("devis.gavGarantieTable ", devis.gavGarantieTable);
                        devis.gavGarantieTable = devis.gavGarantieTable.filter((item: any) =>
                            item[0].text !== "Bris de lunettes en cas d’accident" &&
                            item[0].text !== "Prothèse dentaire en cas d’accident"
                        );
                    }

                });

                devis.gavGarantieTable.unshift(packRowsGav)


                risquesRows = devis?.groupes?.flatMap((groupe: any) =>

                    groupe?.risques?.map((risque: any) => [
                        { text: risque?.idRisque, fontSize: "8", alignment: "center" },
                        {
                            text: (risque?.risque[0]?.valeur || '') + " " + (risque?.risque[1]?.valeur || ''),
                            fontSize: "8",
                            alignment: "center"

                        },
                        {
                            text: moment(risque?.risque[2]?.valeur).format('DD/MM/YYYY') || '',
                            fontSize: "8",
                            alignment: "center"

                        },
                        {
                            text: groupe.pack.description,
                            fontSize: "8",
                            alignment: "center"
                        },
                        {
                            text: devis?.primeListRisques?.find((rsq: any) => rsq.id === risque?.idRisque)?.prime || '',
                            fontSize: "8",
                            alignment: "center"
                        }
                    ])
                ) || [];
                console.log("risqrow", risquesRows)

            } else {

                risquesRows = devis?.groupes[0]?.risques?.map((risque: any) => [
                    { text: risque?.idRisque, fontSize: "8", alignment: "center" },
                    { text: (risque?.risque[0]?.valeur || '') + " " + (risque?.risque[1]?.valeur || ''), fontSize: "8", alignment: "center" },
                    { text: moment(risque?.risque[2]?.valeur).format('DD/MM/YYYY') || '', fontSize: "8", alignment: "center" },
                    { text: devis?.primeListRisques?.find((rsq: any) => rsq.id === risque?.idRisque).prime, fontSize: "8", alignment: "center" }
                ]) || [];

            }
            garantis = devis?.paramDevisList.map((garantie: any, idx: number) => [
                { text: garantie.description, fontSize: "8" },
                { text: idx !== 1 ? "-" : "15%", alignment: "center", fontSize: "8" },
                { text: idx === 2 ? "Voir conditions au verso" : `${devis.garantiePlafond[garantie.description]} DZD`, alignment: "center", fontSize: "8" }
            ]) || [];

        }
        risqueList = devis?.risqueList?.filter((risque: any) => risque?.categorieParamRisque != "Conducteur")






        function reorderRisqueList(risqueList: any, codesRisqueRecherche: any) {

            const matchingItems = risqueList
                .filter((item: any) => codesRisqueRecherche.includes(item.codeRisque))
                .sort((a: any, b: any) => codesRisqueRecherche.indexOf(a.codeRisque) - codesRisqueRecherche.indexOf(b.codeRisque));


            const remainingItems = risqueList.filter((item: any) => !codesRisqueRecherche.includes(item.codeRisque));


            return [...matchingItems, ...remainingItems];
        }


        switch (devis.produit.codeProduit) {
            case "97": {

                const indexSMPToRemove = risqueList?.findIndex((risque: any) => risque?.codeRisque === "P245");

                if (indexSMPToRemove !== -1) {
                    // Remove the found object at the found index
                    risqueList.splice(indexSMPToRemove, 1);
                    console.log('new rsiquelist', risqueList)
                }

                const codesRisqueRecherche = ["P222", "P264", "P263", "P223", "P224", "P318"];
                risqueList = reorderRisqueList(risqueList, codesRisqueRecherche);

                break;
            }

            default:
                break;

        }

        valeurVenale = devis?.risqueList?.find((risque: any) => risque?.codeRisque == "P40")?.reponse?.valeur


        console.log('je cherceh smp', devis?.risqueList?.find((risque: any) => risque?.codeRisque == "P245"))
const risqueLibellesToHide = [
    "energie",
    "n° d'immatriculation"
];
risqueList = risqueList.filter(
    (item: any) => !risqueLibellesToHide.includes(item.libelle?.toLowerCase().trim())
);

console.log("risqueList.map((item: any)",risqueList.map((item: any) => "[" + item.libelle + "]"));
function formatDateIfNeeded(value: any): string {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
            // Format AAAA-MM-JJ
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
    }
    return value ?? '';
}

index = 0;
while (index < risqueList?.length) {
    // Si c'est la dernière ligne ET nombre de champs impair
    if (index === risqueList.length - 1) {
        risque.push({
            text1: [
                { text: risqueList[index].libelle + ": ", bold: true, fontSize: "8" },
                { text: 
                    risqueList[index].typeChamp?.description == "Liste of values"
                        ? formatDateIfNeeded(risqueList[index].reponse?.idParamReponse?.description)
                        : risqueList[index].typeChamp?.description == "From Table"
                        ? formatDateIfNeeded(risqueList[index].reponse?.description)
                        : formatDateIfNeeded(risqueList[index].reponse?.valeur), fontSize: "8"
                },
            ],
            text2: [
                { text: "", fontSize: "8" },
                { text: "", fontSize: "8" }
            ]
        });
        index++;
    } else {
        risque.push({
            text1: [
                { text: risqueList[index].libelle + ": ", bold: true, fontSize: "8" },
                { text: 
                    risqueList[index].typeChamp?.description == "Liste of values"
                        ? formatDateIfNeeded(risqueList[index].reponse?.idParamReponse?.description)
                        : risqueList[index].typeChamp?.description == "From Table"
                        ? formatDateIfNeeded(risqueList[index].reponse?.description)
                        : formatDateIfNeeded(risqueList[index].reponse?.valeur), fontSize: "8"
                },
            ],
            text2: [
                { text: risqueList[index + 1].libelle + ": ", bold: true, fontSize: "8" },
                { text: 
                    risqueList[index + 1].typeChamp?.description == "Liste of values"
                        ? formatDateIfNeeded(risqueList[index + 1].reponse?.idParamReponse?.description)
                        : risqueList[index + 1].typeChamp?.description == "From Table"
                        ? formatDateIfNeeded(risqueList[index + 1].reponse?.description)
                        : formatDateIfNeeded(risqueList[index + 1].reponse?.valeur), fontSize: "8"
                },
            ]
        });
        index = index + 2;
    }
}


        

        index = 0;
        while (index < risqueListConducteur?.length) {
            switch (risqueListConducteur[index].libelle) {
                case "Date obtention permis":
                    dateObtentionPermis = risqueListConducteur[index].reponse?.valeur.split("T")[0]
                    break;
                case "Date de Naissance":
                    dateNaissance = risqueListConducteur[index].reponse?.valeur.split("T")[0]
                    break;
                case "Categorie Permis":
                    categoriePermis = risqueListConducteur[index].reponse?.valeur
                    break;

                default:
                    break;
            }
            index = index + 1;
        }

        index = 0;
        while (index < devis?.paramDevisList?.length) {
            if ((devis?.paramDevisList[index].prime && devis?.paramDevisList[index].prime != "0") || devis?.produit?.codeProduit != "95") {
                devis?.paramDevisList[index].categorieList?.map((element: any) => {
                    champs.push(element?.description)
                });
            }

            index++;
        }
        champs = champs.filter((x: any, i: any) => champs.indexOf(x) === i);
        // champs.push("Primes")

        champs.map((champ: string) => {
            widthChamp.push("*")
        })

        index = 0;
        while (index < devis?.paramDevisList?.length) {
            if ((devis?.paramDevisList[index].prime && devis?.paramDevisList[index].prime != "0") || devis?.produit?.codeProduit != "95") {
                let tmp: any

                if (devis.produit.codeProduit != '97') {
                    tmp = {
                        Garanties: [
                            { text: devis?.paramDevisList[index].description, fontSize: "8" },
                        ],
                        plafond: [
                            { text: '', fontSize: "8" },
                        ],
                         franchise: [
                            { text: '', fontSize: "8" },
                        ],
                        // "Primes": [
                        //      { text: Number(devis?.paramDevisList[index].prime).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+ " DZD", fontSize: "8" },
                        // ],
                    };
                }
                devis?.paramDevisList[index].categorieList?.map((cat: any) => {
                    switch (cat.description) {
                        case "plafond":
                            if (cat.valeur == '0') { cat.valeur = valeurVenale }
                            tmp.plafond[0].text = Number(cat.valeur).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            break;

                        case "franchise":
                            tmp.franchise[0].text = Number(cat.valeur).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            break;

                        default:
                            break;
                    }
                })
champs = champs.filter((x: any, i: any) => champs.indexOf(x) === i);
champs = champs.filter((c: string) => c !== 'formule');

                garanties.push(tmp);

            }
            index++;

        }

        index = 0;
        while (index < devis?.primeList?.length) {
            if (devis?.primeList[index].typePrime?.code == "CP101") {
                primeChamps.push(devis?.primeList[index].typePrime?.description)
                primes.push(Number(devis?.primeList[index].prime).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
            }

            index++;
        }

        index = 0;
        while (index < devis?.primeList?.length) {
            if (devis?.primeList[index].typePrime?.code != "CP186" && devis?.primeList[index].typePrime?.code != "CP101") {
                if ((devis?.primeList[index].typePrime?.code != "CP102" && devis?.primeList[index].typePrime?.code != "CP103" && devis?.primeList[index].typePrime?.code != "CP104" && devis?.primeList[index].typePrime?.code != "CP105") || devis?.produit?.codeProduit != '95') {

                    primeChamps.push(devis?.primeList[index].typePrime?.description)
                    primes.push(devis?.primeList[index].prime?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
                }
            }

            index++;
        }

        index = 0;
        while (index < devis?.taxeList?.length) {
            primeChamps.push(devis?.taxeList[index].taxe?.description)
            primes.push(Number(devis?.taxeList[index].prime).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))

            index++;
        }

        index = 0;
        while (index < devis?.primeList?.length) {
            if (devis?.primeList[index].typePrime?.code == "CP186") {
                primeChamps.push(devis?.primeList[index].typePrime?.description)
                primes.push(Number(devis?.primeList[index].prime).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
            }

            index++;
        }

        primeChamps.map((champ: string) => {
            widthChampPrime.push("*")
        })

        const docDefinition: any = {
            watermark: { text: 'DEVIS', color: 'blue', opacity: 0.1 },
            pageMargins: [35, 30, 35, 120],

            border: [false, false, false, false],
            content: [
    
      

                devis?.produit.codeProduit == "96" ?
                
                    {
                        text: 'AXA  MultiRisque Habitation',
                        style: 'sectionHeader'
                    }
                    :
{
  columns: [
    {
      image: logoAXA,  //LOGO AXA 
      width: 40,
      height: 40,
    },
    {
                 text: 'AXA ' + devis?.produit?.description.toUpperCase(), // AXA AUTOMONO TEXT
                        style: 'sectionHeader',
                              margin: [0, 30, 0, 0]

    }
  ]
},


                (devis?.produit?.codeProduit == '97' && devis.sousProduit.code == "CTI") ?
                    {
                        text: 'Bien commerecial et industriel',
                        style: 'sectionHeader'
                    }
                    :
                    (devis?.produit?.codeProduit == '97' && devis.sousProduit.code == "CTH") ?
                        {
                            text: 'Bien immobilier',
                            style: 'sectionHeader'
                        } : {},







                {
                    text: 'Devis',
                    style: 'sectionHeader',
                    color: 'black'
                },
                {
                    text: isDevisVoyage || devis.produit.codeProduit == "20G" ? "" : devis?.pack?.description,
                    style: 'sectionHeader',
                    color: 'black'
                },
                devis?.convention != null ?
                    {
                        text: 'Convention: ' + devis?.reduction.convention?.nomConvention,
                        style: 'sectionHeader',
                        color: 'black'
                    } :
                    devis?.reduction != null ?
                        {
                            text: 'Réduction: ' + devis?.reduction?.nomReduction,
                            style: 'sectionHeader',
                            color: 'black'
                        } : {},
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
                                            text: `Référence `,
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
                                                { text: devis?.agence?.codeAgence + " " + devis?.agence?.raisonSocial, fontSize: "8" },
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
                                                { text: `Devis N° : `, bold: true, fontSize: "8" },
                                                { text: devis?.idDevis, fontSize: "8" },
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
                                                { text: devis?.agence?.adresse, fontSize: "8" },
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
                                                { text: `Date devis : `, bold: true, fontSize: "8" },
                                                { text: devis?.auditDate.split("T")[0], fontSize: "8" },
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
                                                { text: "0" + devis?.agence?.telephone, fontSize: "8" },
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
                                                { text: `Date expiration devis : `, bold: true, fontSize: "8" },
                                                { text: devis?.dateExpiration, fontSize: "8" },
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
                                                { text: devis?.agence?.email, fontSize: "8" },
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
                                                { text: `Ce présent devis est valide 30 jours`, bold: true, fontSize: "8" },
                                                // { text: devis?.duree?.description, fontSize: "8" },
                                            ],
                                        },
                                    ],
                                ],
                            },
                        }
                    ],
                },
                {
                    columns: isDevisVoyage || devis.produit.codeProduit == "20G" ? [
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

                    ] : [
                        {
                            style: "table",
                            table: {
                                widths: ["*"],
                                alignment: "left",
                                body: [
                                    [
                                        {
                                            text: `Assuré(e)`,
                                            style: "headerTable"
                                        },
                                    ],
                                ],
                            }
                        },
                        risqueListConducteur?.length != 0 ?
                            {
                                style: "table",
                                table: {
                                    widths: ["*"],
                                    alignment: "right",
                                    body: [
                                        [
                                            {
                                                text: `Conducteur`,
                                                style: "headerTable"
                                            },
                                        ],
                                    ],
                                },
                            } : {},
                    ],
                },
                {
                    columns: isDevisVoyage || devis.produit.codeProduit == "20G" ? [
                        {
                            table: {
                                widths: ["*"],
                                alignment: "left",
                                body: [
                                    [
                                        {
                                            text: [
                                                { text: devis?.typeClient?.description == "personne morale" ? `Raison Sociale : ` : `Nom & Prénom : `, bold: true, fontSize: "8" },
                                                { text: devis?.typeClient?.description == "personne morale" ? devis?.raisonSocial : devis?.nom + " " + devis?.prenom, fontSize: "8" },
                                            ],
                                        },
                                    ],
                                ],
                            }
                        },

                    ] : [
                        {
                            table: {
                                widths: ["*"],
                                alignment: "left",
                                body: [
                                    [
                                        {
                                            text: [
                                                { text: devis?.typeClient?.description == "personne morale" ? `Raison Sociale : ` : `Nom & Prénom : `, bold: true, fontSize: "8" },
                                                { text: devis?.typeClient?.description == "personne morale" ? devis?.raisonSocial : devis?.nom + " " + devis?.prenom, fontSize: "8" },
                                            ],
                                        },
                                    ],
                                ],
                            }
                        },
                        risqueListConducteur?.length != 0 ?
                            {
                                table: {
                                    widths: ["*"],
                                    alignment: "right",
                                    body: [
                                        [
                                            {
                                                text: [
                                                    { text: `Date de naissance : `, bold: true, fontSize: "8" },
                                                    { text: dateNaissance, fontSize: "8" },
                                                ],
                                            },
                                        ],
                                    ],
                                },
                            } : {}
                    ],
                },
                {
                    columns: isDevisVoyage || devis.produit.codeProduit == "20G" ?
                        [
                            {
                                table: {
                                    widths: ["*"],
                                    alignment: "left",
                                    body: [
                                        [
                                            {
                                                text: [
                                                    { text: `Téléphone : `, bold: true, fontSize: "8" },
                                                    { text: devis?.telephone, fontSize: "8" },
                                                ],
                                            },
                                        ],
                                    ],
                                }
                            },

                        ]
                        : [
                            {
                                table: {
                                    widths: ["*"],
                                    alignment: "left",
                                    body: [
                                        [
                                            {
                                                text: [
                                                    { text: `E-mail : `, bold: true, fontSize: "8" },
                                                    { text: devis?.email, fontSize: "8" },
                                                ],
                                            },
                                        ],
                                    ],
                                }
                            },
                            risqueListConducteur?.length != 0 ?
                                {
                                    table: {
                                        widths: ["*"],
                                        alignment: "right",
                                        body: [
                                            [
                                                {
                                                    text: [
                                                        { text: `Categorie du permis : `, bold: true, fontSize: "8" },
                                                        { text: categoriePermis, fontSize: "8" },
                                                    ],
                                                },
                                            ],
                                        ],
                                    },
                                } : {}
                        ],
                },
                {
                    columns: isDevisVoyage || devis.produit.codeProduit == "20G" ?
                        [
                            {
                                table: {
                                    widths: ["*"],
                                    alignment: "left",
                                    body: [
                                        [
                                            {
                                                text: [
                                                    { text: `E-mail : `, bold: true, fontSize: "8" },
                                                    { text: devis?.email, fontSize: "8" },
                                                ],
                                            },
                                        ],
                                    ],
                                }
                            },

                        ]
                        : [
                            {
                                table: {
                                    widths: ["*"],
                                    alignment: "left",
                                    body: [
                                        [
                                            {
                                                text: [
                                                    { text: `Téléphone : `, bold: true, fontSize: "8" },
                                                    { text: devis?.telephone, fontSize: "8" },
                                                ],
                                            },
                                        ],
                                    ],
                                }
                            },
                            risqueListConducteur?.length != 0 ?
                                {
                                    table: {
                                        widths: ["*"],
                                        alignment: "right",
                                        body: [
                                            [
                                                {
                                                    text: [
                                                        { text: `Date d'obtention du permis : `, bold: true, fontSize: "8" },
                                                        { text: dateObtentionPermis, fontSize: "8" },
                                                    ],
                                                },
                                            ],
                                        ],
                                    },
                                } : {}
                        ],
                },
                isDevisVoyage || devis.produit.codeProduit == "20G" ?
                    [{
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
                            widths: widthTableAssures,
                            body: [
                                bodyTableAssure,
                                ...risquesRows,
                            ]
                        }
                    },]
                    : [{
                        style: "table",
                        table: {
                            widths: ["*"],
                            alignment: "right",
                            body: [
                                [
                                    {
                                        // text: risqueList[0].categorieParamRisque,
                                        text: 'Caractéristiques du risque assuré',
                                        style: "headerTable"
                                    },
                                ],
                            ],
                        },
                    },
                    console.log("risque" , risque),
                    this.table(risque, ['text1', 'text2'])],
                { text: "\n" },
                isDevisVoyage ? {
                    table: {
                        widths: ['*', '*'],
                        body: [
                            [
                                { text: 'Informations du voyage', style: 'headerTable', colSpan: 2, alignment: 'center' },
                                ''
                            ], // Header row
                            [
                                { text: `Formule : ${pack}`, fontSize: "8" },
                                { text: `Durée : ${duree} Jour(s)`, fontSize: "8" }
                            ], // Row 1
                            [
                                { text: `Zone : ${zone}`, fontSize: "8" },
                                { text: `Date d'effet : ${dateDebut}`, fontSize: "8" }
                            ], // Row 2
                            [
                                { text: `Pays destination : ${destination}`, fontSize: "8" },
                                { text: `Date d'échéance : ${dateRetour}`, fontSize: "8" }
                            ], // Row 3
                        ]
                    }
                } : {},
                //Debut Garanties et sous-garanties
                isDevisVoyage ? [
                    { text: "\n" },
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
                ] : devis.produit.codeProduit == "20G" ?
                    [{
                        table: {
                            headerRows: 1,
                            widths: widthspackRowsGav,
                            body: isScolaire ? devis.gavGarantieTable.slice(0, 6) : devis.gavGarantieTable
                        },
                    },
                    { text: `(*) : Décès accidentel 4 – 13 ans Pas de capital décès                 (*) : Décès accidentel 13 – 18 ans`, fontSize: 6 }

                    ] :
                    devis.produit.codeProduit != "97" ?
                        [this.table(garanties, champs)] : [],




                (devis?.produit?.codeProduit == '97' && devis.sousProduit.code == "CTH") ? [
                    {
                        style: "table",
                        table: {
                            widths: ["50%", "50%"],
                            body: [
                                [
                                    {
                                        text: "Limite de garantie 80%",
                                        style: "headerTable",
                                    },
                                    {
                                        text: `${this.valas}`,
                                        fontSize: 8,
                                    },
                                ],
                                [
                                    {
                                        text: "Franchise",
                                        style: "headerTable",
                                    },
                                    {
                                        text: "2 % des dommages, Minimum 30.000 DZD",
                                        fontSize: 8,
                                    },
                                ],
                            ],
                        },
                    },

                ] :


                    (devis?.produit?.codeProduit == '97' && devis.sousProduit.code == "CTI") ? [
                        {
                            style: "table",
                            table: {
                                widths: ["50%", "50%"],
                                body: [
                                    [
                                        {
                                            text: "Limite de garantie 50%",
                                            style: "headerTable",
                                        },
                                        {
                                            text: `${this.valtot} DZD`,
                                            fontSize: 8,
                                        },
                                    ],
                                    [
                                        {
                                            text: "Franchise",
                                            style: "headerTable",
                                        },
                                        {
                                            text: "10 % des dommages",
                                            fontSize: 8,
                                        },
                                    ],
                                ],
                            },
                        },

                    ] : [],
                //    [this.table(garanties, champs)],
                //fin Garanties et sous garanties

                //debut Prime
                {
                    style: "table",
                    table: {
                        widths: ["*"],
                        alignment: "right",
                        body: [
                            [
                                {
                                    text: `Décompte de primes`,
                                    style: "headerTable"
                                },
                            ],
                        ],
                    },
                },

                devis?.produit?.codeProduit == "45A" || devis?.produit?.codeProduit == "45F" ?

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
                                                text: `Coût de police`,
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
                                                text: primeNette + " DZD",
                                                fontSize: 10
                                            },

                                            {
                                                text: primeGestion + " DZD",
                                                fontSize: 10
                                            },
                                            {
                                                text: Number(devis?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T04')?.prime).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                                fontSize: 10
                                            },
                                            {
                                                text: Number(devis?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T07') ? devis?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T07')?.prime : ' ').toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                                fontSize: 10
                                            },
                                            {
                                                text: droitTimbre + " DZD",
                                                fontSize: 10
                                            },

                                            {
                                                text: Number(devis?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T02') ? devis?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T02')?.prime : ' ').toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
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
                                                text: primeTotal + " DZD",
                                                fontSize: 10
                                            },
                                        ],

                                    ],
                                }
                            }
                        ],
                    } : isDevisVoyage || devis.produit.codeProduit == "20G" ? {
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
                                    { text: `${primeNette} DZD`, bold: true, alignment: "center", fontSize: "8" },

                                    { text: `${primeGestion} DZD`, bold: true, alignment: "center", fontSize: "8" },
                                    { text: `${droitTimbre} DZD`, bold: true, alignment: "center", fontSize: "8" },
                                    { text: `${primeTotal} DZD `, bold: true, alignment: "center", fontSize: "8" }
                                ] // Row 2
                            ]
                        }
                    } :
                        {
                            columns: [

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
                                                {
                                                    text: `Prime sans réduction`,
                                                    style: "headerTable"
                                                },
                                                {
                                                    text: `Coût de police`,
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


                                            ],
                                            [
                                                {
                                                    text: primeNette + " DZD",
                                                    fontSize: 10
                                                },
                                                {
                                                    text: Number(devis?.primeList?.find((prime: any) => prime?.typePrime?.code == 'CP264')?.prime).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                                    fontSize: 10
                                                },
                                                {
                                                    text: primeGestion + " DZD",
                                                    fontSize: 10
                                                },
                                                // {
                                                //     text: Number(devis?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T04')?.prime).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                                //     fontSize: 10
                                                // },                                      


                                                {
                                                    text: devis?.codeproduit === 97
                                                        ? "0.00 DZD"
                                                        : Number(devis?.taxeList?.find((taxe: any) => taxe?.taxe?.code == 'T04')?.prime || 0)
                                                            .toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD",
                                                    fontSize: 10
                                                },
                                                {
                                                    text: droitTimbre + " DZD",
                                                    fontSize: 10
                                                },


                                            ],
                                            [
                                                {},
                                                {},
                                                {},
                                                {
                                                    text: `Prime Totale`,
                                                    style: "headerTable",
                                                },
                                                {
                                                    text: primeTotal + " DZD",
                                                    fontSize: 8
                                                },
                                            ],

                                        ],
                                    }
                                }
                            ],
                        },



                {
                    style: "table",
                    text: [
                        { text: `Déclaration du souscripteur \n`, bold: true, fontSize: "8" },
                        { text: `Je reconnais avoir été informé(e), au moment de la collecte d'informations que les conséquences qui pourraient résulter d'une omission ou d'une déclaration inexacte sont celles prévues par l'article 19 de l'ordonnance n°95/07 du 25 janvier 1995 relative aux assurances modifiée et complétée par la loi n°06/04 du 20 février 2006.\n`, fontSize: "6", alignment: 'justify' },
                        { text: `Je reconnais également avoir été informé(e), que les informations saisies dans ce document soient, utilisées, exploitées, traitées par AXA Assurances Algérie Dommage, transférées à l'étranger et à ses sous-traitants, dans le cadre de l'exécution des finalités de la relation commerciale, conformément à la Loi n° 18-07 du 10 juin 2018 relative à la protection des personnes physiques dans le traitement des données à caractère personnel.\n`, fontSize: "6", alignment: 'justify' },
                        { text: `J'autorise AXA Assurances Algérie Dommage à m'envoyer des messages et des appels de prospections commerciales quel qu'en soit le support ou la nature.\n`, fontSize: "6", alignment: 'justify' },
                        { text: `Pour toute demande concernant le traitement et vos droits relatifs à vos données à caractère personnel, merci de nous contacter sur l'adresse : dpo@axa.dz\n`, fontSize: "6", alignment: 'justify' },
                    ]

                    
                },
                
                sessionStorage.getItem("roles")?.includes("COURTIER") ?
                    {
                        text: [
                            `\n`,
                            'Je donne par le présent mandat à ',
                            { text: `${devis?.agence?.raisonSocial}`, bold: true },
                            ' En tant que Société de Courtage en assurances, à l’effet de négocier et gérer pour mon compte auprès des compagnies d’assurances aux meilleures conditions de garanties et de tarifs, en veillant à la défense de mes intérêts pendant toute la durée de l’assurance depuis la confection du contrat, qu’à l’occasion des règlements des sinistres. Le présent mandat prend effet à la date de signature du présent, et demeure valable tant qu’il n’a pas été dénoncé expressément par mes soins conformément à la législation en vigueur \n\n'
                        ],
                        fontSize: 8,
                        alignment: 'justify'
                    } : {},
                {
                    layout: 'noBorders',
                    margin: [35, 25, 35, 5],
                    table: {
                        widths: ["*", "*"],
                        alignment: "center",
                        body: [
                            [
                                {
                                    text: `Fait à Alger Le ` + moment(devis?.auditDate)?.format('DD/MM/YYYY'),//devis?.auditDate.split("T")[0],
                                    fontSize: 8,
                                    alignment: 'left'
                                },
                                {
                                    text: `Assureur`,
                                    fontSize: 8,
                                    alignment: 'right'
                                }
                            ]
                        ],
                    },
                }
            ],

                             footer: {
        layout: 'noBorders',
        margin: [35, 65, 35, 0],
        table: {
                widths: [ '*' ],
                alignment: "center",
                body: [
                    [
                        {                            
                            text: 'AXA Assurances Algérie Dommage - lotissement 11 décembre 1960 lots 08 et 12, 16030 El Biar Alger',
                            style: 'headerTable',
                            fontSize: 8,
                            bold: false,
                            alignment:'left'
                        }
                    ],
                     [
                        {                            
                            text: 'www.axa.dz',
                            style: 'headerTable',
                            fontSize: 8,
                            alignment:'left'
                        }
                    ],
                    
                    [
                        {                            
                            text: 'AXA Assurances Algérie Dommage, Société Par Actions au capital de 3 150 000 000 DZD. Entreprise régie par la Loi n°06/04 du 20 Février 2006 modifiant et complétant l’ordonnance n°95/07 du 25 Janvier 1995, relative aux Assurances. Siège social : lotissement 11 décembre 1960 lots 08 et 12, 16030 El Biar Alger. Registre de Commerce N°16/00 - 1005275 B 11. Agrément N°79 du 02 novembre 2011.',
                            style: 'headerTable',
                            bold: false,
                            fontSize: 6,
                            alignment:'left'
                        }
                    ]
                ]
        }
      },
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

        pdfMake.createPdf(docDefinition).download("Devis Assurance Automobile");
    }

/** Envoie le devis par e-mail (backend: POST  /devis/{id}/mail) */
    mailDevisMrh(idDevis: number, token: string): Observable<string> {
    const headers = new HttpHeaders({
        Authorization : `Bearer ${token}`,
        canal         : 'DW',
        'Content-Type': 'application/json'
    });

    return this.http.post(`${Constants.API_ENDPOINT_DEVIS_MAIL}/${idDevis}`,
                            {}, { headers, responseType: 'text' })
                    .pipe(
                        tap(r => this.logs(r)),
                        catchError(err => {
                        console.error('[mailDevis] ', err);
                        return throwError(() => err);
                        })
                    );
    }

    controleDevisMulti(formData: any, codeDevis: any) {
        const httpOption = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'skip': ''
            })
        };
        return this.http.post<any[]>(`${Constants.API_ENDPOINT_CONTROLE_FILE}/${codeDevis}`, formData, httpOption).pipe(
            tap((response) => this.logs(response)),
            catchError((error) => throwError(error.error))
        );
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
                column1.text = col
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
    let pourcentage = 100 / columns.length;
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
  logs(response: unknown): void {
  }
}
