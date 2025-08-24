import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import getBase64ImageFromURL from '../utils/imageHandling';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Constants } from '../config/constants';

@Injectable({
  providedIn: 'root'
})
export class SatimService {


  constructor(private router: Router, private http: HttpClient) { }

  register(primeTTC: any, idDevis: any) {
    const httpOption = {
      headers: new HttpHeaders({
        'accept': '*/*',
        'Access-Control-Allow-Origin': '*'
      })
    };   
   
    let paiement = {
      language: "fr",
      orderNumber: ""+idDevis,
    }

    return this.http.post<any>(`${Constants.API_ENDPOINT_PAIEMENT_SATIM}`, paiement, httpOption).pipe(
      tap((response) => response),
      catchError((error) => throwError(error.error))
    )
  }

  confirm(orderId: any) {
    const httpOption = {
      headers: new HttpHeaders({
        'accept': '*/*',
        'Access-Control-Allow-Origin': '*'
      })
    };

    let confirm = {
      orderId: orderId,
      language: "fr"
    }

    return this.http.post<any>(`${Constants.API_ENDPOINT_CONFIRM_SATIM}`, confirm, httpOption).pipe(
      tap((response) => response),
      catchError((error) => throwError(error.error))
    )
  }

  sendMail(mail: any, orderId: any) {
    const httpOption = {
      headers: new HttpHeaders({
        'accept': '*/*',
        'orderId': orderId,
        'canal': "DW",
        'Access-Control-Allow-Origin': '*'
      })
    };

    return this.http.post<any>(`${Constants.API_ENDPOINT_SEND_MAIL}/${mail}`, confirm, httpOption).pipe(
      tap((response) => response),
      catchError((error) => throwError(error.error))
    )
  }

  async outputAttestation(data: any) {
    const docDefinition: any = {
      // watermark: { text: [ {image: await getBase64ImageFromURL(this.http,'SWITCH.jpg')}], color: 'blue', opacity: 0.1 },
      background: [
        {
            image: await getBase64ImageFromURL(this.http,'SWITCH.jpg'),
            marginTop: 200,
            marginLeft: 100,
            width: 460,
            height: 450
        }
      ],
      pageMargins: [50, 50, 35, 120],
     
      border: [false, false, false, false],
      content: [
        {
          columns:[
            {
              style: "table",
              layout: 'noBorders',
              table: {
                  widths: ["*","*"],
                  alignment: "center",
                  body: [
                      [
                        {
                          image: await getBase64ImageFromURL(this.http,'AXA_LOGO.png'),
                          alignment:'left',
                          width: 80,
                          height: 80
                        },
                        {
                          image: await getBase64ImageFromURL(this.http,'CIB-Dahabia8.png'),
                          alignment:'right',
                          width: 80,
                          height: 80
                        },
                      ],
                  ],
              }
            },
          ]
        },
        {
          text: "ATTESTATION DE PAIEMENT BANCAIRE",
          style: 'headerTable',
          alignment: "center",
          marginTop: 20,
          marginBottom: 80,
          fontSize: 17,
        },
        {
          text: "Numéro de transaction = " + data?.orderId,
          style: 'headerTable',
          marginLeft: 65,
          marginBottom: 5,
        },
        {
          text: "Mode de paiment = Carte CIB/Edhahabia",
          style: 'headerTable',
          marginLeft: 65,
          marginBottom: 5,
        },
        {
          text: "Montant de la transaction :" + data?.montantPaiement,
          style: 'headerTable',
          marginLeft: 65,
          marginBottom: 5,
        },
        {
          text: "Nº de l'opération : " + data?.orderNumber,
          style: 'headerTable',
          marginLeft: 65,
          marginBottom: 5,
        },
        {
          text: "Date et heure de la transaction : " + data?.dateOrder,
          style: 'headerTable',
          marginLeft: 65,
          marginBottom: 5,
        },
        {
          text: "Numéro d'autorisation : " + data?.approvalCode,
          style: 'headerTable',
          marginLeft: 65,
          marginBottom: 5,
        },
        {
          text: "Numéro (s) de contrat : " + data?.idContrat,
          style: 'headerTable',
          marginLeft: 65,
          marginBottom: 30,
        },
        {
          text: "En cas de problème de paiement. veuillez contacter le numéro vert de la SATIM 3020",
          style: 'headerTable',
          marginLeft: 65,
          marginBottom: 5,
        },
        {
          image: await getBase64ImageFromURL(this.http,'satim-vert.png'),
          alignment:'center',
          width: 70,
        },
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
              bold: true,
              fontSize: 15,
              color: "#00008F",
              marginTop: 5,
          }
      }
    }
    let pdf = pdfMake.createPdf(docDefinition, undefined, undefined, pdfFonts.vfs);
    
    pdf.download("Attestation bancaire");
    return pdf;
  }
}
