import { Component, inject, Input } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CryptoService } from '../../core/services/crypto.service';
import { ContratService } from '../../core/services/contrat.service';
import { DevisService } from '../../core/services/devis.service';
import { SatimService } from '../../core/services/satim.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HSOverlay } from 'preline/preline';
import Swal from 'sweetalert2'
import { AuthService } from '../../core/services/auth.service';
// import 'sweetalert2/src/sweetalert2.scss'

@Component({
  selector: 'app-success-page',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule, FormsModule],
  providers: [DatePipe],
  templateUrl: './success-page.component.html',
  styleUrl: './success-page.component.scss'
})
export class SuccessPageComponent {
  userId: any;
  message: any = "";
  contrat: any;
  contratJson: any;
  files: any = [];
  tkn:string
  orderId:any = "";
  orderNumber:any = "";
  approvalCode:any = "";
  dateOrder:any = "";
  montantPaiement:any = "";
  modePaiement:any = "Carte CIB/Edhahabia";
  idContrat:any = "";
  @Input() email:any = "";
  
  contratService = inject(ContratService);
  cryptoService = inject(CryptoService);
  devisService = inject(DevisService);
  satimService = inject(SatimService);

  constructor(private datePipe: DatePipe, private authService: AuthService) {
    
  }

  voirModel() {
    Swal.fire({
      title: "Envoi du reçu par mail",
      input: "text",
      inputAttributes: {
        autocapitalize: "off"
      },
      showCancelButton: false,
      confirmButtonText: "Envoyer",
      confirmButtonColor: "#00008F",
      showLoaderOnConfirm: true,
      preConfirm: async (login) => {
        console.log("login", login);
        this.email = login;
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("result.value.login", result);
        
        this.mailRecu();
      }
    });    
  }

  ngOnInit() {
    this.userId = sessionStorage.getItem("userId");
    this.contrat = localStorage.getItem("contrat") || "";


    console.log("contrat", this.contrat)
    console.log("message", this.message)

    if(this.userId == null) {
      this.confirmOrder();
    } else {
      this.saveContrat();
    }
  }

  confirmOrder() {
    this.orderId = localStorage.getItem("orderId");
    this.satimService.confirm(this.orderId).subscribe({
      next: async (datas: any) => {
        console.log("datas.errorCode", datas)
        this.orderNumber = datas?.orderNumber
        this.approvalCode = datas?.approvalCode
        this.dateOrder = new Date();
        this.montantPaiement = (datas?.amount / 100);

        if((datas?.errorCode == 0 || datas?.errorCode == 2) && datas?.params?.respCode == "00") {
          if(datas?.orderStatus == 2) {
            this.message = "Votre paiement a été accepté"
            localStorage.setItem("errorCode", "0");
            localStorage.setItem("messageError", "Votre paiement a été accepté");
            datas?.errorCode == 0 ? this.saveContrat() : '';
          } else if(datas?.orderStatus == 3) {
            localStorage.removeItem("contrat");
            localStorage.setItem("errorCode", datas?.errorCode);
            localStorage.setItem("messageError", "Votre transaction a été rejetée / Your transaction was rejected / تم رفض معاملتك");
            window.location.href = "/errorPage";
          } else {
            localStorage.removeItem("contrat");
            localStorage.setItem("errorCode", datas?.errorCode);
            localStorage.setItem("messageError", datas?.params?.respCode_desc || datas?.actionCodeDescription);
            window.location.href = "/errorPage";
          }
        }
        else {
          localStorage.removeItem("contrat");
          localStorage.setItem("errorCode", datas?.errorCode);
          localStorage.setItem("messageError", datas?.params?.respCode_desc || datas?.actionCodeDescription);
          window.location.href = "/errorPage";
        }

      }, error: (error: any) => {
        localStorage.removeItem("contrat");
        console.log("error", error);
      }
    });
  }

  formatDate(date: Date): string | null {
    return this.datePipe.transform(date, 'M-d-yyyy h:mm a');
  }

  async saveContrat() {
    this.tkn = this.userId == null ? localStorage.getItem('token') : JSON.parse(sessionStorage.getItem("access_token")||'')?.access_token
    const hmac = await this.cryptoService.generateHmac(this.tkn, JSON.parse(this.contrat));
    const dataContrat = {
      stringJson: this.contrat,
      signature: hmac
    }

    this.contratService.createContrat(dataContrat).subscribe({
      next: (data: any) => {
        console.log("Contrat Saved !!!", data);
        localStorage.removeItem("contrat");
        localStorage.setItem("errorCode", "0");
        localStorage.setItem("messageError", "Contrat effectué avec succés");
        this.message = "Contrat effectué avec succés"
        this.idContrat = data?.idContrat;
        
        this.printContrat(data?.idContrat, false);
      },
      error: (error: any) => {
        console.log("error", error);
        // localStorage.removeItem("contrat");
        // localStorage.setItem("errorCode", error.code);
        // localStorage.setItem("messageError", error.code == 400 ? error.message : "Erreur Systeme");
        // window.location.href = "/errorPage"
      }
    });
  }

  async voirRecu() {
    let body = {
      "orderId": this.orderId,
      "montantPaiement": this.montantPaiement,
      "orderNumber": this.orderNumber,
      "dateOrder": this.formatDate(this.dateOrder),
      "approvalCode": this.approvalCode,
      "idContrat": this.idContrat
    }

    let pdf: any = await this.satimService.outputAttestation(body);
    return pdf;
  }

  async mailRecu() {
    this.satimService.sendMail(this.email, this.orderId).subscribe(data => {
      this.contratJson.user = data
    })
  }

  newDevis() {
    window.location.href="/voyage"
  }

  printContrat(idContrat: number, recu: any) {
    this.contratService.getContratById(idContrat).subscribe({
      next: async (datas: any) => {
        this.contratJson = datas;
        if(this.userId == null) {
          let body = {
            "orderId": this.orderId,
            "montantPaiement": this.montantPaiement,
            "orderNumber": this.orderNumber,
            "dateOrder": this.formatDate(this.dateOrder),
            "approvalCode": this.approvalCode,
            "idContrat": idContrat
          }
          // let pdf: any = await this.satimService.outputAttestation(body);
          // pdf.getBlob((data: any) => {
          //   this.files.push(data);
          // });
        }
        this.consultRisqueContrat(datas?.groupeList?.[0]?.risques?.[0]?.idRisque, datas?.groupeList?.[0]?.idGroupe, recu)
      }, error: (error: any) => {
      }
    });

  }

  consultRisqueContrat(idRisque: any, idGroupe: any, recu: any) {
    this.contratService.getParamContratByIdRisque(this.contratJson.idContrat, idGroupe, idRisque).subscribe({
      next: async (dataParam: any) => {
        this.contratJson.risqueList = await Object.values(dataParam)
        let primeListRisques: any[]=[];
      let garantiePlafond :any={};
      for(const group of this.contratJson?.groupeList || []){
        for (const risq of group.risques || []) {
          try {
              const dataPack: any = await this.contratService.getPackIdRisque(this.contratJson.idContrat, risq.idRisque).toPromise();
      
              dataPack?.primeList?.forEach((element: any) => {
                  if (element?.typePrime?.code === "CP101") {
                      primeListRisques.push({prime:element?.prime,id:risq?.idRisque});
                  }
              });
              dataPack.garantieList.forEach((element:any)=>{
                if(element?.codeGarantie !== "G44"){
                  garantiePlafond[element?.description]=element?.categorieList?.[0]?.valeur;
                }
              })
      
          } catch (error) {
              console.log(error);
          }
      }
      }
      
      this.contratService.getPaysList().subscribe({
        next: async (pays: any) => {
          this.contratJson.isShengen= pays.find((pay:any)=>pay.idPays==this.contratJson?.risqueList?.find((el:any)=>el?.codeRisque==="P182")?.reponse?.valeur)?.isShengen
        },
        error: (error: any) => {
          console.log(error);
        }
      })
      this.contratJson.primeListRisques = primeListRisques;
      this.contratJson.garantiePlafond = garantiePlafond;
        //EXP call get pack/garanties risque by devis, groupe & id risque
        await this.contratService.getPackIdRisque(this.contratJson.idContrat, idRisque).subscribe({
          next: async (dataPack: any) => {

            this.contratJson.paramContratList = dataPack.garantieList
            this.contratJson.pack = dataPack.pack

            // const apiCalls = this.contratJson?.groupeList.map((group: any) => 
            //   this.packService.getPackById(group.pack.idPack0)
            // );
          
            console.log("this.contratJson ", this.contratJson);
            let pdf: any = await this.contratService.outputContrat(this.contratJson, this.userId == null ? false:true)

            this.contratService.mailContrat(this.contratJson?.idContrat, this.userId == null ? false:true, this.orderId);
            
            //await this.contratService.outputContrat(this.contrat)
            // await this.contratService.getQuittanceById(this.contratJson.quittanceList[this.contratJson.quittanceList.length - 1]).subscribe({
            //   next: async (quittance: any) => {
            //     console.log("quittance ", quittance);
            //     this.contratService.outputQuittance(this.contratJson, quittance, null);

            //     this.contratService.mailContrat(this.contratJson?.idContrat, this.userId == null ? false:true, this.orderId);
            //   },
            //   error: (error: any) => {
            //     console.log(error);
            //   }
            // });
          },
          error: (error: any) => {
            console.log(error);
          }
        });

      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }

}
