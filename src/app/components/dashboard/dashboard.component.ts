import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ContratService } from '../../core/services/contrat.service';
import { dateFormatPipe } from '../../core/pipes/date-format-pipe.pipe';
import { ConsultationStatutColorPipe } from '../../core/pipes/consultation-statut-color.pipe';
import { Router } from '@angular/router';
import { AgenceService } from '../../core/services/agence.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, dateFormatPipe, ConsultationStatutColorPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  contrats: any;
  userId: any;
  nbrContrat: any;
  nbrContratPage: any;
  nbrPage: any;
  agenceUser: any;
  index: number = 1;
  page: number = 1;

  constructor(private contratService: ContratService, private agenceService: AgenceService, private router: Router) {
    this.userId = sessionStorage.getItem("userId");
    console.log(" this.userId ",  this.userId);
  }

  ngOnInit() {
    setTimeout(() => {
      this.getAgenceAll();
    }, 1000);
  }

  getAgenceAll() {
    this.agenceService.getAllAgence().subscribe({
      next: (data: any) => {
        this.agenceUser = data.find((a: any) => a.nomAgence == sessionStorage.getItem("agence")?.replaceAll('"',''))
        console.log("sessionStorage ", sessionStorage.getItem("agence")?.replaceAll('"',''));
        console.log("this.agenceUser ", this.agenceUser);
        this.getContrat(0, 10);
      },
      error: (error: any) => {
        console.log(error);
      }
    }); 
  }

  pagination(type: number) {
    if(type == 0 && this.page != 0) {
      this.nbrContratPage += 10
      this.page -= 1
    } else if(type == 1 && this.page != this.nbrPage) {
      this.nbrContratPage -= 10
      this.page += 1
    }
    this.getContrat(this.page-1, 10);
  }

  goToContrat() {
    window.location.href ='/voyage'
    // this.router.navigate(['/voyage']);
  }

  getContrat(index: number, size: number) {
    let body = {
      idContrat: null,
      dateDebut: null,
      dateFin: null,
      agence: this.agenceUser?.idAgence,
      idClient: null,
      nom: null,
      prenom: null,
      raisonSocial: null,
      produit: "20A"
    }
    this.contratService.filtresContrat(body, index, size).subscribe({
      next: (data: any) => {
        this.contrats = data.content
        if(index == 0) {
          this.nbrContrat = Number(data.totalElements)
          this.nbrContratPage = Number(data.totalElements)
          this.nbrPage = Number(data.totalPages)
        }
        console.log(data);
      },
      error: (error) => {

        console.log(error);

      }
    });
  }
}
