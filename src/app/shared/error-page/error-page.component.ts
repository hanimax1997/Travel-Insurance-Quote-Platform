import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { SatimService } from '../../core/services/satim.service';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.scss'
})
export class ErrorPageComponent {
  orderId: any;
  codeError: any = "";
  message: any = "";
  
  satimService = inject(SatimService);
  ngOnInit() {
    this.confirmOrder();
  }

  goToDevis() {
    window.location.href = "voyage"
  }

  confirmOrder() {
    this.orderId = localStorage.getItem("orderId");
    this.satimService.confirm(this.orderId).subscribe({
      next: async (datas: any) => {
        console.log("datas.errorCode", datas)
        if(datas.errorCode == 0 && datas?.params?.respCode == "00") {
          if(datas.orderStatus == 2) {
            this.message = "Votre paiement a été accepté"
            localStorage.setItem("errorCode", "0");
            localStorage.setItem("messageError", "Votre paiement a été accepté");
            window.location.href = "/successPage";
          } else if(datas.orderStatus == 3) {
            localStorage.removeItem("contrat");
            this.codeError = datas?.params?.respCode || datas?.errorCode;
            this.message = "Votre transaction a été rejetée / Your transaction was rejected / تم رفض معاملتك";
            localStorage.setItem("errorCode", datas?.errorCode);
            localStorage.setItem("messageError", "Votre transaction a été rejetée / Your transaction was rejected / تم رفض معاملتك");
          } else {
            localStorage.removeItem("contrat");
            this.codeError = datas?.params?.respCode || datas?.errorCode;
          this.message = datas?.params?.respCode_desc || datas?.actionCodeDescription;
            localStorage.setItem("errorCode", datas?.errorCode);
            localStorage.setItem("messageError", datas?.params?.respCode_desc || datas?.actionCodeDescription);
          }
        }
        else {
          localStorage.removeItem("contrat");
          this.codeError = datas?.params?.respCode || datas?.errorCode;
          this.message = datas.params?.respCode_desc || datas?.actionCodeDescription;
          localStorage.setItem("errorCode", datas?.errorCode);
          localStorage.setItem("messageError", datas?.params?.respCode_desc || datas?.actionCodeDescription);
        }

      }, error: (error: any) => {
        localStorage.removeItem("contrat");
        console.log("error", error);
      }
    });
  }
}
