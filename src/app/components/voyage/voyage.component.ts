import { Component, inject, Input, ViewEncapsulation } from '@angular/core';
import { HSAccordion, HSStepper } from 'preline/preline';
import * as $ from 'jquery';
import moment from 'moment';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule, FormControl, AbstractControl, NgForm, ValidationErrors, ValidatorFn } from '@angular/forms';

import { Patterns } from '../../core/validators/patterns';
import { AgenceService } from '../../core/services/agence.service';
import { GenericService } from '../../core/services/generic.service';
import { ParamList, ParamRisqueProduit } from '../../core/models/param-risque-produit';
import { ParamRisqueService } from '../../core/services/param-risque.service';
import { PackService } from '../../core/services/pack.service';
import { DevisService } from '../../core/services/devis.service';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { AppComponent } from '../../app.component';
import { AuthService } from '../../core/services/auth.service';
import { CryptoService } from '../../core/services/crypto.service';
import { PersonneContrat } from '../../core/models/personne-contrat';
import { ContratService } from '../../core/services/contrat.service';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Router } from '@angular/router';
import { SatimService } from '../../core/services/satim.service';
import { RecaptchaModule, RecaptchaFormsModule, RecaptchaSettings, RECAPTCHA_SETTINGS } from "ng-recaptcha";
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

const todayDate: Date = new Date;

export function ageInfValidator(control: AbstractControl): { [key: string]: boolean } | null {
  var birthday: Date = new Date(control.value);
  console.log("todayDate < birthday ", todayDate < birthday)
  if ((todayDate < birthday)) {
    return {
      'ageInf': true
    };
  }
  return null;
}

export function ageInf18Validator(control: AbstractControl): { [key: string]: boolean } | null {
  var birthday: Date = new Date(control.value);

  if ((todayDate.getFullYear() - birthday.getFullYear()) < 18) {
    return {
      'ageInf18': true
    };
  }
  return null;
}

export function ageSup120Validator(control: AbstractControl): { [key: string]: boolean } | null {
  var birthday: Date = new Date(control.value);

  if ((todayDate.getFullYear() - birthday.getFullYear()) > 120) {
    return {
      'ageSup107': true
    };
  }
  return null;
}

export function ageSupValidator(control: AbstractControl): { [key: string]: boolean } | null {
  var birthday: Date = new Date(control.value);
  // var dateRetour: Date = new Date();
  console.log("todayDate < birthday ", todayDate < birthday)
  if ((todayDate > birthday)) {
    return {
      'ageSup': true
    };
  }
  return null;
}

export function dateAfterValidator(startDateControl: () => string): ValidatorFn {
  return (endDateControl: AbstractControl): ValidationErrors | null => {
    const startDate = startDateControl()?.split('T')[0];
    const endDate = endDateControl.value;
    console.log("startDate ", startDate)
    console.log("endDate ", endDate)
    
    console.log("new Date(startDate) < new Date(endDate) ", new Date(startDate) < new Date(endDate))

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return { dateInvalid: 'La date d\'expiration passport doit être postérieur à la date de retour' };
    }

    return null;
  };
}

$
@Component({
  selector: 'app-voyage',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, HeaderComponent, FooterComponent, RecaptchaModule],
  providers: [
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: {
        siteKey: environment.siteKey,
      } as RecaptchaSettings,
    },
  ],
  templateUrl: './voyage.component.html',
  styleUrl: './voyage.component.scss'
})
export class VoyageComponent {
  step: boolean = false;
  stepFile: boolean = false;
  retour: boolean = true;
  loaderDevis: boolean = false;
  loaderContrat: boolean = false;
  validateDateMin: any;
  validateDateMax: any;
  selector: any;
  errorState: any = 1;
  formInfoAssure: FormGroup | any;
  formParamRisqueDevis: FormGroup[] | any = [];
  formParamRisqueContrat: FormGroup[] | any = [];
  formListParamRisque: FormGroup | any;
  formOld: FormGroup | any;
  codeProduit: string | null;
  messageErreur: any = ""; 
  produit: any; 
  nbrAssure: any = 1;
  devis: any = {}
  contrat: any = {}
  contratJson: any = {}
  devisJson: any = {}
  primeTTC: any;
  retournedDevis: any = {}
  idProduit: number;
  autditUser: string | undefined | null = ""
  produitInfo: any = {}
  idDevisWorkFlow = 45
  maxDuree: any;
  paraRisqueProduit: ParamRisqueProduit[] = [];
  paraRisqueType: any = [];
  tableauxParCategorie: any = [];
  tableauxParCategorieAssure: any = [];
  tableauxParCategorieContrat: any = [];
  tableauxParCategorieAssureContrat: any = [];
  paraRisqueProduitCategory: any[] = []
  risqueArrayReady = false
  pageOne = false
  pageTwo = false
  pageThree = false
  pageFour = false
  agences: any[] = []
  packs: any[] = []
  groupesPacks: any = []
  agenceSelected: any = {}
  agenceUser: any = {}
  idPackComplet: any;
  garantiesNew: any;
  destination: any;
  packSelected: any;
  risqueIndex = 0
  risqueIndexBody = 0
  devisOutput: any = {}
  risqueConsult: any = {}
  paramElement: ParamList = {} as any
  controleDevis: any = []
  dateDepartSelected: any;
  dateRetourSelected: any;
  formData = new FormData();
  maxDateRetour: any;
  now = new Date();
  today: any;  
  minDate: any;  
  maxDate: any;
  maxDateNaissance: any;  
  minDateNaissance: any;
  userId: any;
  montant: any;
  tkn:string
  plafond:string = ""
  roles: any = [];
  canals: any = [];
  @Input() token: any;
  @Input() tokenDevis: any;
  garantie1:string = ""
  garantie2:string = ""
  garantie3:string = ""
  garantie4:string = ""
  garantie5:string = ""
  garantie6:string = ""
  garantie7:string = ""
  garantie8:string = ""
  garantie9:string = ""
  garantie10:string = ""
  garantie11:string = ""
  garantie12:string = ""
  garantie13:string = ""
  garantie14:string = ""
  garantie15:string = ""
  selectedFile: any;
  reductions: any = []
  conventions: any = []
  convention: any = {}
  devisGroupe: any = []
  fileSuccess = false;
  suivantCheck: any = true;
  multiRisqueArray: any = []
  userJson: any;
  communes: any = [];
  widthStep: any = 10;

  devisService = inject(DevisService);
  agenceService = inject(AgenceService);
  genericService = inject(GenericService);
  paramRisqueService = inject(ParamRisqueService);
  packService = inject(PackService);
  contratService = inject(ContratService);

  constructor(private satimService: SatimService, private cryptoService: CryptoService, private formBuilder: FormBuilder, private appComponent: AppComponent, private authService: AuthService, private router: Router) {
    this.userId = sessionStorage.getItem("userId");
    let login: any = this.authService.getLoggedIn();
    console.log("this.userId ", typeof(this.userId));
    this.token = undefined;
    this.tokenDevis = undefined;
    if(!login.source.value && this.userId == null) {
      this.step = true;
      this.appComponent.getKey();
    }
  }

  changeFormule(value: any) {
    console.log("value", value.target.value);
    if(value.target.value!='F01') {
      console.log("1")
      this.formInfoAssure.get("nbrAssure").setValue("")
      this.formInfoAssure.get("nbrAssure").setValidators(value.target.value=='F02' ? [Validators.pattern(Patterns.number), Validators.min(2), Validators.max(15), Validators.required] : [Validators.pattern(Patterns.number), Validators.min(2), Validators.required])
      if(this.userId != null) this.getConvention(value.target.value);
      // nombre assuré illimité group
      // this.formInfoAssure.get("nbrAssure").setValidators(value.target.value == 'F02' ? [Validators.pattern(Patterns.number), Validators.min(2), Validators.max(15)] : [Validators.pattern(Patterns.number), Validators.min(2)])
    } else {
      console.log("2")
      this.formInfoAssure.get("nbrAssure").setValue(1)
      this.formInfoAssure.get("nbrAssure").setValidators([Validators.pattern(Patterns.number), Validators.required])
    }
    this.formInfoAssure.get('nbrAssure').updateValueAndValidity();

  }

  ngOnInit() {   
    localStorage.removeItem("contrat");
    localStorage.removeItem("errorCode");
    localStorage.removeItem("messageError");
    localStorage.removeItem("orderId");

    this.today = moment((this.now).toString()).format("YYYY-MM-DD");
    this.maxDate = moment((this.now).toString()).add(181,"days").format("YYYY-MM-DD");
    this.minDate = moment((this.now).toString()).format("YYYY-MM-DD");

    this.maxDateNaissance = moment((this.now).toString()).add(0,"days").format("YYYY-MM-DD");
    this.minDateNaissance = moment((this.now).toString()).subtract(120,"years").format("YYYY-MM-DD");
    // this.minDate.setDate(this.minDate.getDate() - 365);

    console.log("this.maxDate ", this.maxDate)
    console.log("this.minDate ", this.minDate)

    this.formInfoAssure = this.formBuilder.group({
      formule: ['F01', [Validators.required]],
      nom: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(Patterns.nom)]],
      prenom: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(Patterns.nom)]],
      dateNaissance: ['', [Validators.required, ageInfValidator, ageSup120Validator]],
      tel: ['', [Validators.required, Validators.pattern(Patterns.indicatifMobile)]],
      email: ['', [Validators.required, Validators.pattern(Patterns.email)]],
      nbrAssure: ['', [Validators.pattern(Patterns.number)]]
    });

    console.log("this.formInfoAssure", this.formInfoAssure);

    this.devis.list=[]
    this.codeProduit = "20A";
    this.produit = "voyage";
    

    this.devis.groupes = []
    this.autditUser = "latif"
    
    setTimeout(() => {
      this.getProductId();
      this.getAgenceAll(); 
      this.getDictionnaire();
      this.getAllCommune();
    }, 2000);

    console.log("this.codeProduit ",this.codeProduit);
    

    this.formListParamRisque = this.formBuilder.group({});
  }
  
  getConvention(codeFormule: any) {
    this.devisService.getAllConventions().subscribe({
      next: async (data: any) => {
        this.conventions = data
        this.convention = this.conventions.find((c: any) => codeFormule =='F02' ? c.codeConvention == "C0193" : c.codeConvention == "C0192")
        await this.getReductionByConvention(this.convention?.idConvention);
      },
      error: (error: any) => {}
    });
  }

  getAllCommune() {
    this.contratService.getAllCommune().subscribe({
      next: (data: any) => {
        this.communes = data.map((commune: any) => {
          commune.id = commune.idCommune
          return commune
        })
      },
      error: (error: any) => {}
    });
  }

  getReductionByConvention(idConvention: any) {
    this.devisService.getReductionByConvention(idConvention).subscribe({
      next: (data: any) => {
        console.log("data", data);
        this.reductions = data
      },
      error: (error: any) => {}
    });
  }

  click() {
    console.log("fffff", this.formInfoAssure)
  }



  getDictionnaire() {
    this.genericService.getDictionnaire().subscribe((data: any) => {
      sessionStorage.setItem("dictionnaire", JSON.stringify(data))
      this.getRoles();
      this.getCanals();
    })
  }
  
  stepFiles() {
    this.stepFile= true;
    this.next(this.formParamRisqueDevis, 1);
  }

  next(form :any, step: number) {
    let validation = true
    let dateInput = this.formParamRisqueDevis[0].get("P212").value;
    let dateMin = this.tableauxParCategorie.find((param: any) => param.codeParam == "P212").valeurMin;
    let dateMax = this.maxDuree;
    let condition = false;
    let widthStep = 0;
    // form.forEach((element: any) => {
    //   Object.keys(element.controls).forEach((key: any) => {
    //     if(key.includes())
    //     if(!element.valid) { validation = false; }
    //   });
    // });
    if(!this.stepFile) {
      switch (step) {
        case 1:
          this.pageTwo = true;
          widthStep = 37;
          form.forEach((element: any, index: number) => {
            console.log("index ", index);
            if(index > 1) {
              Object.keys(element.controls).forEach((key: any) => {
                if(this.tableauxParCategorieAssure.findIndex((assure: any) => key.includes(assure.codeParam)) != -1){
                  console.log("element.get(key) ", element.get(key))
                  if(element.get(key).invalid) {
                    this.changeInputParam(key, element);
                    validation = false;
                    return;
                  }
                  return;
                }
                return;
              });
              return;
            } 
            return;
          });
          break;
        case 2:
          this.pageThree = true;
          widthStep = 50;
          console.log("form[0].get('pack')", form[0].get("pack"));
          console.log("form[0].get('agence')", form[0].get("agence"));
          form.forEach((element: any, index: number) => {
            console.log("index ", index);
            if(index == 0) {
              Object.keys(element.controls).forEach((key: any) => {
                if(this.tableauxParCategorie.findIndex((assure: any) => key.includes(assure.codeParam)) != -1){
                  console.log("element.get(key) ", element.get(key))
                  if(key.includes("P212") && (new Date(dateInput) < new Date(dateMin) || new Date(dateInput) > new Date(dateMax))) {
                    this.changeInputParam(key, element);
                    validation = false;
                    return;
                  } else if(element.get(key).invalid) {
                    this.changeInputParam(key, element);
                    validation = false;
                    return;
                  } else if(this.tokenDevis == undefined && this.userId == null) {
                    validation = false;
                    return;
                  }
                  return;
                } else if(form[0].get("pack").invalid || form[0].get("agence").invalid) {
                  this.changeInputParam(key, element);
                  validation = false;
                  return;
                }
                return;
              });
              return;
            } 
            return;
          });
          break;
        case 4:
          let check1: any = document.getElementById("hs-checkbox-delete")
          let check2: any = document.getElementById("hs-checkbox-archive")
          this.pageFour = true;
          widthStep = 77;
  
          form.forEach((element: any, index: number) => {
            console.log("index ", index);
            if(index > 0) {
              Object.keys(element.controls).forEach((key: any) => {
                if(this.tableauxParCategorieAssureContrat.findIndex((assure: any) => key.includes(assure.codeParam)) != -1){
                  console.log("element.get(key) ", element.get(key))
                  if(key.includes("P212") && (new Date(dateInput) < new Date(dateMin) || new Date(dateInput) > new Date(this.maxDuree))) {
                    this.changeInputParam(key, element);
                    validation = false;
                    return;
                  } else if(element.get(key).invalid) {
                    this.changeInputParam(key, element);
                    validation = false;
                    return;
                  } else if((!check1?.checked || !check2?.checked) && this.userId == null) {
                    this.changeInputParam(key, element);
                    validation = false;
                    return;
                  }
                  return;
                }
                return;
              });
              return;
            } 
            return;
          });
          break;
      
        default:
          break;
      }
    }

    console.log("tableauxParCategorie ", this.tableauxParCategorie);
    console.log("tableauxParCategorieAssure ", this.tableauxParCategorieAssure);

    if(validation) {
      const el: any = HSStepper.getInstance('#stepper');
      console.log("next ", el)
      el.nextBtn.click();
      this.widthStep = widthStep;
    } 

    return validation;
  }

  back() {
    const el: any = HSStepper.getInstance('#stepper');
    console.log("el", el)
    this.primeTTC = undefined;
    // el.setProcessedNavItem(0)
    this.retour = false;
    this.step = false;
    this.stepFile = false;
    el.backBtn.click();
  }

  getPackMulti(idPack: any, groupe: any) {
    if(this.packs.find((p: any) => p.idPack0 == idPack.target.value).codePack == "V04") {
      this.maxDateRetour=  moment(this.formParamRisqueDevis[0].get("P211").value).add(30,"days").format("YYYY-MM-DD")
      this.maxDuree = moment(this.formParamRisqueDevis[0].get("P211").value).add(30,"days").format("YYYY-MM-DD");
    } else if(this.packs.find((p: any) => p.idPack0 == idPack.target.value).codePack == "V05" || this.packs.find((p: any) => p.idPack0 == idPack.target.value).codePack == "V06") {
      this.maxDateRetour=  moment(this.formParamRisqueDevis[0].get("P211").value).add(60,"days").format("YYYY-MM-DD")
      this.maxDuree = moment(this.formParamRisqueDevis[0].get("P211").value).add(60,"days").format("YYYY-MM-DD");
      if(this.userId != null) {
        // this.formParamRisqueDevis[0].get('convention').disable();
        this.formParamRisqueDevis[0].get('reduction').disable();
      }
    }
    else {
      this.maxDateRetour=  moment(this.formParamRisqueDevis[0].get("P211").value).add(364,"days").format("YYYY-MM-DD")
      this.maxDuree = moment(this.formParamRisqueDevis[0].get("P211").value).add(364,"days").format("YYYY-MM-DD");
    }
    this.packSelected = this.packs.find((p: any) => p.idPack0 == idPack.target.value);
    idPack = Number(this.formParamRisqueDevis[0].get("pack").value)
    this.packService.getPackById(idPack).subscribe({
      next: async (data: any) => {
        console.log("data.garantie", data);
        this.idPackComplet=data.idPackComplet;
        this.garantiesNew=data.garantie;
        this.devis.pack = Number(idPack)

        // this.devis.groupes.find((grp:any)=>grp.description==groupe).idPack=idPack.value
        this.groupesPacks= [{ group: groupe, pack: data }]
        console.log("this.groupesPacks",this.groupesPacks);
        let dateInput = this.formParamRisqueDevis[0].get("P212").value;
        let dateMin = this.tableauxParCategorie.find((param: any) => param.codeParam == "P212").valeurMin;
        let dateMax = this.maxDuree;

        console.log("dateInput", dateInput);
        console.log("dateMin", dateMin);
        console.log("dateMax", dateMax);

        let input: any = document.getElementById("P212");

        if(new Date(dateInput) >= new Date(dateMin) && new Date(dateInput) <= new Date(this.maxDuree)) {
          await input?.classList.remove('border-danger');
          await input?.classList.remove('focus:border-danger');
          await input?.classList.remove('focus:ring-danger');

          await input?.classList.add('border-gray-300');
          await input?.classList.add('focus:border-primary-400');
          await input?.classList.add('focus:ring-primary-400');

          input = input;
          this.formParamRisqueDevis[0].get("P212").setErrors(null);
        } else {
          await input?.classList.remove('border-gray-300');
          await input?.classList.remove('focus:border-primary-400');
          await input?.classList.remove('focus:ring-primary-400');

          await input?.classList.add('border-danger');
          await input?.classList.add('focus:border-danger');
          await input?.classList.add('focus:ring-danger');
          input = input;
          this.formParamRisqueDevis[0].get("P212").setErrors({
            "dateError" : true
          });
        }
        //this.checkValidation(this.formParamRisqueDevis);
        console.log("input", input);
      },
      error: (error) => {

        console.log(error);

      }
    });
  }

  onDateChange(event:any,code:any){
    switch (code) {
       case "P211":
         if(this.packs.find((p: any) => p.idPack0 == this.formParamRisqueDevis[0].get("pack")?.value)?.codePack == "V04") {
          this.maxDateRetour=  moment(event).add(30,"days").format("YYYY-MM-DD")
          this.maxDuree = moment(event).add(30,"days").format("YYYY-MM-DD");
        } else if(this.packs.find((p: any) => p.idPack0 == this.formParamRisqueDevis[0].get("pack")?.value)?.codePack == "V05" || this.packs.find((p: any) => p.idPack0 == this.formParamRisqueDevis[0].get("pack")?.value)?.codePack == "V06") {
          this.maxDateRetour=  moment(event).add(60,"days").format("YYYY-MM-DD")
          this.maxDuree = this.maxDateRetour;
        } else {
          this.maxDateRetour=  moment(event).add(364,"days").format("YYYY-MM-DD")
          this.maxDuree = this.maxDateRetour;
        }
         break;
       case "P212":
       break;
       default:
         break;
     }
     this.devis?.groupes[0]?.groupeList?.forEach((el: any) => {
       el?.risque?.paramList?.forEach((param: any) => {
         
         if (param?.codeParam === code) {
      
           param.reponse = {
             idReponse: null,
             description: moment(event.value).format("YYYY-MM-DD[T]HH:mm:ss.000Z")
           };
         }
       });
     });
 
  }

  submitParamRisque(idDevisWorkFlow: any, form: any) {
    this.loaderDevis = true;
    let controlElement: any = []
    let groupeList: any = []
    this.controleDevis = []
    let risque: any = []
    let index2 = 0;
    let formParamRisque = idDevisWorkFlow == 45 ? this.formParamRisqueDevis : this.formParamRisqueContrat;
    if(!this.selectedFile) {
      // this.checkValidation(formParamRisque);
      for (let index = 0; index < Number(this.nbrAssure)+1; index++) {
        risque[index2] = {}
        risque[index2].paramList = []
  
        let idparam
          let idreponse
          let description = "debase"
          let tableauxParCategorie: any
          
          let formName: any = ""
  
          if(index == 0) {
            tableauxParCategorie = this.tableauxParCategorie
          } else {
            tableauxParCategorie = this.tableauxParCategorieAssure
          }
  
          tableauxParCategorie.map((param: any) => {
            Object.keys(formParamRisque[index].controls).map((paramFormName: any) => {
  
              index == 0 ? formName = param.codeParam : formName = param.codeParam+index;
  
              if (paramFormName == formName) {
  
                idparam = param.idParamRisque
                if (param.typeChamp?.code == 'L01') {
                  idreponse = formParamRisque[index].get(paramFormName).value.idParam
                  description = ''
                  // if(index == 0)
                  //   controlElement = {
                  //     "idParam": idparam,
                  //     "reponse": {
                  //       "idReponse": idreponse,
                  //       "description": description
                  //     }
                  //   }
                  Object.assign(this.risqueConsult, { [param.libelle]: param.reponses.find( (r: any) => r.id == formParamRisque[index].get(paramFormName).value).description });
                } else {
  
                  idreponse = null
                  if (param.typeChamp?.code == 'L08') {
                    if(param.codeParam == 'P182')
                    {
                      let destinationParam: any = this.paraRisqueProduit.find((param: any) => param.codeParam == "P182")
                      this.destination = destinationParam?.reponses.find((res: any) => res.id == formParamRisque[index].get("P182").value);
                      console.log("this.destination ", this.destination);
                    }
                    description = formParamRisque[index].get(paramFormName).value
                    Object.assign(this.risqueConsult, { [param.libelle]: param.reponses?.find( (r: any) => r.id == formParamRisque[index]?.get(paramFormName)?.value)?.description });
  
                  } else if (param.typeChamp?.code != 'L06') {
                    description = formParamRisque[index].get(paramFormName).value                  
                    Object.assign(this.risqueConsult, { [param.libelle]: description });
  
                  } else {
  
                    description = moment(formParamRisque[index].get(paramFormName).value).format('YYYY-MM-DD[T]HH:mm:ss.000Z');
                    Object.assign(this.risqueConsult, { [param.libelle]: description });
  
                  }
                  if(index == 0)
                    controlElement.push({
                      "idParam": idparam,
                      "reponse": {
                        "idReponse": idreponse,
                        "description": description
                      }
                    })
  
                }
                
                this.paramElement = {
                  "idParam": idparam,
                  "reponse": {
                    "idReponse": idreponse,
                    "description": description
                  }
                }
  
              }
            })
            if(index == 0)
              this.controleDevis.push(controlElement)
            // let indexParam = risque.paramList.findIndex((param: any) => param.idParam == this.paramElement.idParam);
            // if(indexParam != -1)
            // {
            //   risque.paramList[indexParam] = this.paramElement;
            // } 
            // else 
            // {
              risque[index2].paramList.push(this.paramElement)
            // }
          })
          if(index != 0)
          {
            this.risqueIndexBody = this.risqueIndexBody + 1
            groupeList.push({
              "numRisque": this.risqueIndexBody,
              "risque": risque[index2]
            })
            index2++;
          }
      }
      
      let formuleParam: any = this.paraRisqueProduit.find((param: any) => param.codeParam == "P179")
      console.log("formuleParam ", formuleParam);
      controlElement.push({
        "idParam": formuleParam?.idParamRisque,
        "reponse": {
          "idReponse": formuleParam?.reponses.find((res: any) => res.code == this.formInfoAssure.get("formule").value)?.idParam,
          "description": ""
        }
      })
  
      groupeList.map((groupe: any) => {
        controlElement.forEach((element: any) => {
          groupe.risque.paramList.push(element)
        });
      })
  
      this.devis.groupes = [{
        description: "voyage",
        idPack: Number(formParamRisque[0].get("pack").value),
        groupeList: groupeList
      }];
    }
    console.log("this.stepFile ", this.stepFile);
    console.log("this.selectedFile ", this.selectedFile);
    console.log("this.selectedFile ", this.selectedFile);
    if((this.stepFile && this.selectedFile && this.suivantCheck) || !this.stepFile) {
      let packCompletOne: any = []
      let categoryOfGaranti: any = []
      let sousCategorieList = null
      console.log("this.groupesPacks ", this.groupesPacks)
      console.log("this.devis.groupes ", this.devis.groupes)
      this.groupesPacks.map((gp: any) => {
        //let packInfo: any =  this.getPack(gp.pack)
        gp.pack.garantie.map((garantie: any) => {
  
          garantie.categorieList?.map((categorie: any) => {
            sousCategorieList = null
            if (garantie.sousCategorieList?.length != undefined && garantie.sousCategorieList?.length != 0) {
              sousCategorieList = {
                "idSousCategoriePackComplet": categorie.sousCategorieList[0].idParamSCPackComplet,
                "valeur": categorie.sousCategorieList[0].valeur,
              }
            }
  
            categoryOfGaranti.push({
              "idCategoriePackComplet": categorie.idParamPackComplet,
              "valeur": categorie.valeur,
              "sousCategorieList": sousCategorieList
            })
  
          })
  
            packCompletOne.push({
              "idPackComplet": garantie.idPackComplet,
              "prime": "",
              "categorieList": categoryOfGaranti
            })
  
  
          categoryOfGaranti = []
        })
  
        this.devis.groupes.map((groupe: any) => {
          console.log("groupe.description", groupe.description);
          console.log("gp.group", gp.group);
         if(groupe.description==gp.group){
  
          groupe.groupeList.map((array: any) => {
  
              array.risque.packCompletList = packCompletOne
              array.risque.primeList = []
              array.risque.taxeList = []
            })
          }
  
        })
  
        packCompletOne = []
  
      })
  
  
      
      this.submitDevis(idDevisWorkFlow);
    }

  }

  getRoles() {
    this.genericService.getParam(JSON.parse(sessionStorage.getItem('dictionnaire') || '{}').find((parametre: any) => parametre.code == "C33").idCategorie).subscribe({
      next: (data: any) => {
        this.roles = data
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }

  getCanals() {
    this.genericService.getParam(JSON.parse(sessionStorage.getItem('dictionnaire') || '{}').find((parametre: any) => parametre.code == "C22").idCategorie).subscribe({
      next: (data: any) => {
        this.canals = data
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }

  onRecaptchaResponse(token: any) {
    console.log("reCAPTCHA token:", token);
    this.token = token;
  }

  onRecaptchaResponseDevis(token: any) {
    console.log("reCAPTCHA token:", token);
    this.tokenDevis = token;
  }

  checkValidationContrat(form:  any) {
    form.forEach((element: any, index: any) => {
      if(index != 0) {
        Object.keys(element.controls).map((paramFormName: any) => {
          if(index > 0 && !element.get(paramFormName).disabled) {
            this.changeInputParam(paramFormName, element);
          }
        })
      }
    });
  }

  checkValidation(form:  any) {
    form.forEach((element: any, index: any) => {
        Object.keys(element.controls).map((paramFormName: any) => {
          if(!element.get(paramFormName).disabled) {
            this.changeInputParam(paramFormName, element);
          }
        })

    });
  }

  submitParamRisqueContrat(form: NgForm) {
    this.loaderDevis = true;
    this.risqueIndexBody = 0;
    let controlElement: any = []
    let groupeList: any = []
    this.controleDevis = []
    let risque: any = []
    let index2 = 0;
    let formParamRisque = this.formParamRisqueContrat;
    console.log("this.formParamRisqueContrat ", this.formParamRisqueContrat);
    // this.checkValidationContrat(this.formParamRisqueContrat);
    for (let index = 1; index < Number(this.nbrAssure)+1; index++) {
      risque[index2] = []

      let idparam
      let codeparam
        let idreponse
        let description = "debase"
        let tableauxParCategorieContrat: any
        
        let formName: any = ""

        if(index == 0) {
          tableauxParCategorieContrat = this.tableauxParCategorieContrat
        } else {
          tableauxParCategorieContrat = this.tableauxParCategorieAssureContrat
        }

        tableauxParCategorieContrat.map((param: any) => {
          Object.keys(formParamRisque[index].controls).map((paramFormName: any) => {

            index == 0 ? formName = param.codeParam : formName = param.codeParam+index + "c";

            if (paramFormName == formName) {

              idparam = param.idParamRisque
              codeparam = param.codeParam
              if (param.typeChamp?.code == 'L01') {
                idreponse = formParamRisque[index].get(paramFormName).value
                console.log("idreponse ", idreponse)
                console.log("param ", param)
                description = param.reponses?.find( (r: any) => r.idParam == Number(formParamRisque[index].get(paramFormName).value))?.description
                console.log("description ", description)
                
                Object.assign(this.risqueConsult, { [param.libelle]: description });
              } else {

                idreponse = null
                if (param.typeChamp?.code == 'L08') {
                  description = formParamRisque[index].get(paramFormName).value
                  
                  Object.assign(this.risqueConsult, { [param.libelle]: param?.reponses?.find( (r: any) => r.id == formParamRisque[index]?.get(paramFormName)?.value)?.description });

                } else if (param.typeChamp?.code != 'L06') {
                  description = formParamRisque[index].get(paramFormName).value                  
                  Object.assign(this.risqueConsult, { [param.libelle]: description });

                } else {

                  description = moment(formParamRisque[index].get(paramFormName).value)?.format('YYYY-MM-DD[T]HH:mm:ss.000Z');
                  Object.assign(this.risqueConsult, { [param.libelle]: description });

                }
                if(index == 0)
                  controlElement.push({
                    "idParam": idparam,
                    "codeRisque": codeparam,
                    "codeParam": codeparam,
                    "reponse": {
                      "idReponse": idreponse,
                      "description": description
                    }
                  })

              }
              
              this.paramElement = {
                "idParam": idparam,
                "codeRisque": codeparam,
                "codeParam": codeparam,
                "reponse": {
                  "idReponse": idreponse,
                  "description": description
                }
              }

            }
          })
          if(index == 0)
            this.controleDevis.push(controlElement)
          // let indexParam = risque.paramList.findIndex((param: any) => param.idParam == this.paramElement.idParam);
          // if(indexParam != -1)
          // {
          //   risque.paramList[indexParam] = this.paramElement;
          // } 
          // else 
          // {
            risque[index2].push(this.paramElement)
          // }
        })
        if(index != 0)
        {
          this.risqueIndexBody = this.risqueIndexBody + 1
          groupeList.push({
            "idRisque": this.risqueIndexBody,
            "paramList": risque[index2]
          })
          index2++;
        }
    }
    
    let formuleParam: any = this.paraRisqueProduit.find((param: any) => param.codeParam == "P179")
    let dateDepartParam: any = this.paraRisqueProduit.find((param: any) => param.codeParam == "P211")
    let dateRetourParam: any = this.paraRisqueProduit.find((param: any) => param.codeParam == "P212")
    let destinationParam: any = this.paraRisqueProduit.find((param: any) => param.codeParam == "P182")
    
    controlElement.push({
      "idParam": formuleParam?.idParamRisque,
      "codeRisque": formuleParam?.codeParam,
      "codeParam": formuleParam?.codeParam,
      "reponse": {
        "idReponse": formuleParam?.reponses.find((res: any) => res.code == this.formInfoAssure.get("formule").value)?.idParam,
        "description": ""
      }
    }, {
      "idParam": dateDepartParam?.idParamRisque,
      "codeRisque": dateDepartParam?.codeParam,
      "codeParam": dateDepartParam?.codeParam,
      "reponse": {
        "idReponse": null,
        "description": moment(this.formParamRisqueDevis[0].get("P211").value).format('YYYY-MM-DD[T]HH:mm:ss.000Z')
      }
    }, {
      "idParam": dateRetourParam?.idParamRisque,
      "codeRisque": dateRetourParam?.codeParam,
      "codeParam": dateRetourParam?.codeParam,
      "reponse": {
        "idReponse": null,
        "description": moment(this.formParamRisqueDevis[0].get("P212").value).format('YYYY-MM-DD[T]HH:mm:ss.000Z')
      }
    }, {
      "idParam": destinationParam?.idParamRisque,
      "codeRisque": destinationParam?.codeParam,
      "codeParam": destinationParam?.codeParam,
      "reponse": {
        "idReponse": null,
        "description": this.destination?.id
      }
    })

    groupeList.map((groupe: any) => {
      controlElement.forEach((element: any) => {
        groupe.paramList.push(element)
      });
    })

    this.contrat.groupes = [{
      groupe: {
        description: "voyage",
        idGroupe: this.devisOutput.groupes[0]?.idGroupe
      },
      groupeList: groupeList
    }];

    this.contrat.personnes = [];
    console.log("this.contrat.groupes[0] ", this.contrat.groupes[0]);

    if(this.userId == null) {
      let personne: PersonneContrat = {
        role: (this.roles.find((role: any) => role.code === 'CP236') || {}).idParam,
        typeClient: "PH",
        risqueList: [this.devisOutput.groupes[0].risques[0].idRisque] ,
        idClient: null,
        nom: this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P164').reponse.description,
        prenom: this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P165').reponse.description,
        raisonSocial: null,
        dateNaissance: moment(this.devisOutput?.dateAssure).format('YYYY-MM-DD[T]HH:mm:ss.000Z'),
        nif: null,
        nin: this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P167').reponse.description,
        telephone: {
          description: this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P169').reponse.description
        },
        email: {
          description: this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P168').reponse.description
        },
        adresse: {
          description: this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P170').reponse.description,
          wilaya: Number(this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P177').reponse.description),
          commune: Number(this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P171').reponse.description)
        },
        genre: Number(this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P172').reponse.idReponse),
        situation: Number(this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P173').reponse.idReponse),
        profession: {
          id: 0,
          idProfession: 0,
        },
        rib: {
          idRib: 0,
          description: ""
        },
        permis: {
          idDocument: 0,
          dateDelivrance: '',
          wilayaDelivrance: 0
        }
      };
      this.contrat.personnes.push(personne)
    } else {
      let personne: PersonneContrat = { // Assurée
        role: (this.roles.find((role: any) => role.code === 'CP235') || {}).idParam,
        typeClient: "PH",
        risqueList: [this.devisOutput.groupes[0].risques[0].idRisque] ,
        idClient: null,
        nom: this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P164').reponse.description,
        prenom: this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P165').reponse.description,
        raisonSocial: null,
        dateNaissance: moment(this.devisOutput?.dateAssure).format('YYYY-MM-DD[T]HH:mm:ss.000Z'),
        nif: null,
        nin: this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P167').reponse.description,
        telephone: {
          description: this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P169').reponse.description
        },
        email: {
          description: this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P168').reponse.description
        },
        adresse: {
          description: this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P170').reponse.description,
          wilaya: Number(this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P177').reponse.description),
          commune: Number(this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P171').reponse.description)
        },
        genre: Number(this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P172').reponse.idReponse),
        situation: Number(this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P173').reponse.idReponse),
        profession: {
          id: 0,
          idProfession: 0,
        },
        rib: {
          idRib: 0,
          description: ""
        },
        permis: {
          idDocument: 0,
          dateDelivrance: '',
          wilayaDelivrance: 0
        }
      };
      this.contrat.personnes.push(personne)

      // let personne1: PersonneContrat = { // Adhérents
      //   role: (this.roles.find((role: any) => role.code === 'CP241') || {}).idParam,
      //   typeClient: "PH",
      //   risqueList: [0] ,
      //   idClient: null,
      //   nom: this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P164').reponse.description,
      //   prenom: this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P165').reponse.description,
      //   raisonSocial: null,
      //   dateNaissance: moment(this.devisOutput?.dateAssure).format('YYYY-MM-DD[T]HH:mm:ss.000Z'),
      //   nif: null,
      //   nin: this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P167').reponse.description,
      //   telephone: {
      //     description: this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P169').reponse.description
      //   },
      //   email: {
      //     description: this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P168').reponse.description
      //   },
      //   adresse: {
      //     description: this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P170').reponse.description,
      //     wilaya: Number(this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P177').reponse.description),
      //     commune: Number(this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P171').reponse.description)
      //   },
      //   genre: Number(this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P172').reponse.idReponse),
      //   situation: Number(this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P173').reponse.idReponse),
      //   profession: {
      //     id: 0,
      //     idProfession: 0,
      //   },
      //   rib: {
      //     idRib: 0,
      //     description: this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P175').reponse.description
      //   },
      //   permis: {
      //     idDocument: 0,
      //     dateDelivrance: '',
      //     wilayaDelivrance: 0
      //   }
      // };
      // this.contrat.personnes.push(personne1)
    }

    this.contrat.devis = this.devisOutput.idDevis
    this.contrat.agence = this.userId == null ? "237" : this.devisOutput.agence.idAgence;
    this.contrat.dateEffet = moment(this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P211').reponse.description).add(3,"hours").format("YYYY-MM-DD[T]HH:mm:ss.000Z");
    this.contrat.dateExpiration = this.contrat.groupes[0].groupeList[0].paramList.find((g: any) => g.codeParam == 'P212').reponse.description
    this.contrat.auditUser = sessionStorage.getItem('userId') != null ? sessionStorage.getItem('userId') : "1102";

    console.log("this.contrat ", this.contrat);
    console.log("this.devisOutput ", this.devisOutput);
    let validation = this.next(this.formParamRisqueContrat, 4);
    console.log("(this.token != undefined || this.userId != null) ", (this.token != undefined || this.userId != null));
    if(validation && (this.token != undefined || this.userId != null)) {
      localStorage.setItem("contrat", JSON.stringify(this.contrat));
      if (this.userId == null) {
        this.saveContrat();
      } else {
        window.location.href = "/successPage"
      }
    }
  }

  newDevis() {
    window.location.href ='/voyage'
    // this.router.navigate(['/voyage']);
  }

  async saveContrat() {
    let primeTTC = this.devisOutput.primeList.find((p: any) => p.typePrime.code == "CP186").prime
    this.satimService.register(primeTTC, this.contrat.devis).subscribe({
      next: async (datas: any) => {
        console.log("datas ", datas)
        if(datas.errorCode == "0") {
          localStorage.setItem("orderId", datas.orderId);
          window.location.href = datas.formUrl
        }
        else {
          localStorage.setItem("errorCode", datas.ErrorCode);
          localStorage.setItem("messageError", datas.ErrorMessage);

          window.location.href = "/errorPage";
          console.log("datas", datas);
        }

      }, error: (error: any) => {
        console.log("error", error);
        this.loaderDevis = false;
      }
    });
  }


  printContrat(idContrat: number) {
    this.contratService.getContratById(idContrat).subscribe({
      next: (datas: any) => {
        this.contratJson = datas;
        this.consultRisqueContrat(datas?.groupeList?.[0]?.risques?.[0]?.idRisque, datas?.groupeList?.[0]?.idGroupe)
      }, error: (error: any) => {
        this.loaderDevis = false;
      }
    });

  }

  goToContrat() {
    this.formOld = this.formParamRisqueDevis;
    this.getAllParamRisqueContrat(46, this.formParamRisqueDevis);
  }

  async generateCalcul(devis: any) {
    this.tkn = this.userId == null ? localStorage.getItem('token') : JSON.parse(sessionStorage.getItem("access_token")||'')?.access_token
    // const hmac = await this.cryptoService.generateHmac(this.tkn, this.contrat);
    const hmac = await this.cryptoService.generateHmac(this.tkn, devis);
    const dataDevis = {
      stringJson:JSON.stringify(devis),
      signature: hmac
    }
    console.log("devis", devis);
    this.devisService.generateTarif(dataDevis).subscribe({
      next: (data: any) => {
        this.retournedDevis = data;
        this.retournedDevis.tarificationResponse.idConvention = this.formParamRisqueDevis[0]?.get("reduction")?.value != null && this.userId != null ? Number(this.convention?.idConvention) : 0;
        this.retournedDevis.tarificationResponse.idReduction = this.formParamRisqueDevis[0]?.get("reduction")?.value != null && this.userId != null ? Number(this.formParamRisqueDevis[0]?.get("reduction")?.value) : 0;
        this.formParamRisqueDevis[0]?.get("reduction")?.value != null && this.userId != null ? this.applyReduction() : this.saveDevis();
      },
      error: (error) => {
        this.loaderDevis = false;
        console.log("error ",error);
        if(error.status == 404) {
          this.messageErreur = error.message
          this.back();
        }
      }
    });
  }

  async applyReduction() {
    const hmac = await this.cryptoService.generateHmac(this.tkn, this.retournedDevis?.tarificationResponse);
        const stringifiedDevis1 = JSON.stringify(this.retournedDevis?.tarificationResponse);
        const dataDevis1 = {
          stringJson:stringifiedDevis1,
          signature: hmac
        }
        this.devisService.applyReduction(dataDevis1).subscribe({
          next: (data: any) => {

            this.retournedDevis = data
            this.saveDevis();
          },
          error: (error: any) => {
            if(error.status == 400)
              Swal.fire(
                error.message,
                ``,
                `error`,

              )
            //console.log(error)
          }
        });
  }

  async saveDevis() {
    this.tkn = this.userId == null ? localStorage.getItem('token') : JSON.parse(sessionStorage.getItem("access_token")||'')?.access_token
    // const hmac = await this.cryptoService.generateHmac(this.tkn, this.contrat);
    // const hmac = await this.cryptoService.generateHmac(this.tkn, this.retournedDevis);
    // const dataDevis = {
    //   stringJson:JSON.stringify(this.retournedDevis),
    //   signature: hmac
    // }

    this.devisService.createDevis({"UID": this.retournedDevis?.uid}).subscribe({
      next: (data: any) => {
        console.log("Devis Saved !!!", data);
        this.devisJson = data;
        this.primeTTC = Number(this.devisJson.primeList.find((prime: any) => prime.typePrime.code == "CP186").prime).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

        this.devisOutput = data;
        this.montant = Number(data.primeList.find((p: any) => p.typePrime.code == "CP186").prime).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        this.getDevisById(data.idDevis);
        // this.consultRisque(data.groupes[0].risques[0].idRisque, data.groupes[0].idGroupe)
      },
      error: (error) => {
        this.loaderDevis = false;
      }
    });
  }

  getDevisById(devis: any) {
    this.devisService.getDevisById(devis).subscribe({
      next: (datas: any) => {
        this.devisOutput = datas;
        switch (datas?.groupes[0]?.pack?.codePack) {
          case "V02": // Complete
            this.garantie1 = "50.000 €"
            this.garantie2 = "Frais réels(1)"
            this.garantie3 = "Frais réels"
            this.garantie4 = "Frais réels(2)"
            this.garantie5 = "160 €"
            this.garantie6 = "2.500 €"
            this.garantie7 = "80 €/nuit(4)"
            this.garantie8 = "4.000 €"
            this.garantie9 = "10.000 €"
            this.garantie10 = "20€/kg(5)"
            this.garantie11 = "150 €"
            this.garantie12 = "Illimité"
            this.garantie13 = "Frais réels"
            this.garantie14 = "Frais réels"
            this.garantie15 = "800.000 DZD"
            break;
          case "V01": // Essentielle
            this.garantie1 = "30.000 €"
            this.garantie2 = "Frais réels(1)"
            this.garantie3 = "Frais réels"
            this.garantie4 = "Frais réels(2)"
            this.garantie5 = "160 €"
            this.garantie6 = "-"
            this.garantie7 = "80 €/nuit(4)"
            this.garantie8 = "4.000 €"
            this.garantie9 = "10.000 €"
            this.garantie10 = "20€/kg(5)"
            this.garantie11 = "150 €"
            this.garantie12 = "Illimité"
            this.garantie13 = "Frais réels"
            this.garantie14 = "Frais réels"
            this.garantie15 = "500.000 DZD"
            break;
          case "V04": // Tunisie
            this.garantie1 = "5.000 €"
            this.garantie2 = "-"
            this.garantie3 = "-"
            this.garantie4 = "-"
            this.garantie5 = "160 €"
            this.garantie6 = "-"
            this.garantie7 = "100 €/jour(3)"
            this.garantie8 = "1.000 €"
            this.garantie9 = "1.000 €"
            this.garantie10 = "-"
            this.garantie11 = "-"
            this.garantie12 = "Illimité"
            this.garantie13 = "10.000 €"
            this.garantie14 = "Cercueil minimum + transport au lieu d'inhumation"
            this.garantie15 = "100.000 DZD"
            break;
          case "V03": // Turquie
            this.garantie1 = "10.000 €"
            this.garantie2 = "Frais réels(1)"
            this.garantie3 = "Frais réels"
            this.garantie4 = "Frais réels(2)"
            this.garantie5 = "160 €"
            this.garantie6 = "-"
            this.garantie7 = "80 €/nuit(4)"
            this.garantie8 = "4.000 €"
            this.garantie9 = "10.000 €"
            this.garantie10 = "20€/kg(5)"
            this.garantie11 = "150 €"
            this.garantie12 = "Illimité"
            this.garantie13 = "Frais réels"
            this.garantie14 = "Frais réels"
            this.garantie15 = "200.000 DZD"
            break;
        
          default:
            break;
        }
        this.consultRisque(datas.groupes[0].risques[0].idRisque, datas.groupes[0].idGroupe)

        

      }, error: (error: any) => {
        this.loaderDevis = false;
      }
    });

  }

  consultRisqueContrat(idRisque: any, idGroupe: any) {
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
          console.log("pays",pays.find((pay:any)=>pay.idPays==this.contratJson?.risqueList?.find((el:any)=>el?.codeRisque==="P182")?.reponse?.valeur))
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
          
            console.log("this.contratJson ", this.contratJson)
            // let pdf: any = await this.contratService.outputContrat(this.contratJson)

            // pdf.getBlob((data: any) => {
            //   let file = new File([data], "contrat.pdf", { type: data.type });
            //   //this.devisService.mailDevis(this.devisOutput.email, file);
            // });
            
            //await this.contratService.outputContrat(this.contrat)
            await this.contratService.getQuittanceById(this.contratJson.quittanceList[this.contratJson.quittanceList.length - 1]).subscribe({
              next: (quittance: any) => {

                this.contratService.outputQuittance(this.contratJson, quittance, null);
                this.loaderDevis = false;
                
              },
              error: (error: any) => {
                console.log(error);
                this.loaderDevis = false;
              }
            });
          },
          error: (error: any) => {
            console.log(error);
            this.loaderDevis = false;
          }
        });

      },
      error: (error: any) => {
        console.log(error);
        this.loaderDevis = false;
      }
    });
  }

  consultRisque(idRisque: any, idGroupe: any) {
    //EXP call get param risque by devis, groupe & id risque
    this.devisService.getParamDevisByIdRisque(this.devisOutput.idDevis, idGroupe, idRisque).subscribe({
      next: async (dataParam: any) => {
        this.devisOutput.risqueList = await Object.values(dataParam)

        
          let primeListRisques: any[]=[];
          let garantiePlafond :any={};
          //the use of for here is because we are doing calls inside the loop if we use map or for each it will not wait for all promises
          for (const risq of this.devisOutput?.groupes[0]?.risques || []) {
            try {
                const dataPack: any = await this.devisService.getPackIdRisque(this.devisOutput.idDevis, risq.idRisque).toPromise();
        
                dataPack?.primeList?.forEach((element: any) => {
                    if (element?.typePrime?.code === "CP101") {
                        primeListRisques.push({prime:element.prime,id:risq.idRisque});
                    }
                });
                dataPack.garantieList.forEach((element:any)=>{
                  if(element?.idGarantie !== 95){
                    garantiePlafond[element?.description]=element?.categorieList?.[0]?.valeur;
                  }
                })
        
            } catch (error) {
                console.log(error);
            }

          this.devisOutput.primeListRisques = primeListRisques;
          this.devisOutput.garantiePlafond = garantiePlafond;
          //EXP call get pack/garanties risque by devis, groupe & id risque
          await this.devisService.getPackIdRisque(this.devisOutput.idDevis, idRisque).subscribe({
            next: async (dataPack: any) => {
              this.devisOutput.paramDevisList = dataPack.garantieList
              this.devisOutput.pack = dataPack.pack
              console.log(this.devisOutput,"plafond",garantiePlafond)
              let pdf: any = await this.devisService.generatePdf(this.devisOutput)

             
                this.devisService.mailDevis(this.devisOutput?.idDevis);
                this.loaderDevis = false;
            },
            error: (error: any) => {
              console.log(error);
              this.loaderDevis = false;
            }
          });
        }




      },
      error: (error: any) => {
        console.log(error);
        this.loaderDevis = false;
      }
    });

  }

  submitDevis(idDevisWorkFlow :any) {
    let formParamRisque = this.formParamRisqueDevis;

    this.devis.pack = Number(formParamRisque[0].get("pack").value);
    this.devis.agence = Number(formParamRisque[0].get("agence").value);
    this.devis.auditUser = sessionStorage.getItem('userId') != null ? sessionStorage.getItem('userId') : "1102";
    this.devis.dateAssure = moment(this.formInfoAssure.get("dateNaissance").value).format('YYYY-MM-DD[T]HH:mm:ss.000Z')
    this.devis.email = this.formInfoAssure.get("email").value
    this.devis.nom = this.formInfoAssure.get("nom").value
    this.devis.prenom = this.formInfoAssure.get("prenom").value
    this.devis.telephone = this.formInfoAssure.get("tel").value
    this.devis.duree = 5
    this.devis.produit = 7
    this.devis.raisonSocial = ""
    this.devis.statue = 0
    this.devis.typeClient = 106
    this.devis.canal = (this.canals.find((canal: any) => this.userId == null ? canal?.code === 'DW' : canal?.code === 'DV') || {})?.idParam;

    this.packSelected = this.packs.find((p: any) => p.idPack0 == this.devis.pack);
    switch (this.packSelected?.codePack) {
      case "V02":
        this.plafond = "800 000 DZD"
        break;
      case "V03":
        this.plafond = "200 000 DZD"
        break;
      case "V04":
        this.plafond = "100 000 DZD"
        break;
    
      default:
        this.plafond = "500 000 DZD"
        break;
    }

    console.log("this.devis.groupes ", this.devis.groupes);

    console.log("devis ", this.devis);
    let validation = this.next(this.formParamRisqueDevis, 2);

    if(validation)
      this.generateCalcul(this.devis);
    
  }

  changeAgence(event: any) {
    this.checkValidation(this.formParamRisqueDevis);
    this.agenceService.getAgenceById(this.formParamRisqueDevis[0].get("agence").value).subscribe({
      next: (data: any) => {
        this.agenceSelected = data
        this.agenceSelected.email = data?.idPersonneMorale?.contactList?.find((c:any) => c.typeContact.description == "email").description
        this.agenceSelected.tel = "0"+data?.idPersonneMorale?.contactList?.find((c:any) => c.typeContact.description == 'mobile').description
        this.agenceSelected.adresse = data?.idPersonneMorale?.adressesList[0].description
        console.log("data agence ", data)
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  getPacks() {
    console.log("destination ", this.formParamRisqueDevis)
    let body= {
      "destination": this.formParamRisqueDevis[0].get("P182").value,
    }
    this.packService.getPackVoyage(body).subscribe({
          next: (data: any) => {

            this.packs = data

          },
          error: (error) => {
            console.log(error);
          }
        });
  }

  getProductId() {
    this.genericService.getAllProduit().subscribe({
      next: (data: any) => {
        this.idProduit = data.find((d: any) => d.codeProduit == this.codeProduit).idProduit;
        console.log("this.idProduit ",this.idProduit);

        this.getInfoProduit();
      },
      error: (error) => {
        console.log(error);
      }
    }); 
  }

  getInfoProduit() {
    this.genericService.getPorduitById(this.idProduit).subscribe({
      next: (data: any) => {
        this.produitInfo = data
        this.getAllParamRisque(45);
      },
      error: (error) => {

        console.log(error);

      }
    });
  }

  getAgenceAll() {
    this.agenceService.getAllAgence().subscribe({
      next: (data: any) => {
        this.agences = data

        this.agenceUser = this.agences.find((a: any) => a.nomAgence == sessionStorage.getItem("agence")?.replaceAll('"',''))
        console.log("this.agenceUser ",this.agenceUser)
        this.agenceService.getAgenceById(this.agenceUser?.idAgence).subscribe({
          next: (data: any) => {
            this.agenceUser.tel = "0"+data?.idPersonneMorale?.contactList?.find((c:any) => c.typeContact.description == 'mobile').description
            this.agenceUser.adresse = data?.idPersonneMorale?.adressesList[0].description
            console.log("data agence ", data)
          },
          error: (error) => {
            console.log(error);
          }
        });
      },
      error: (error) => {
        console.log(error);
      }
    }); 
  }

  changeInput(idInput: string) {
    let input = document.getElementById(idInput);
    console.log("fffff", this.formInfoAssure.get(idInput));

    if(this.formInfoAssure.get(idInput).errors != null) {
      input?.classList.remove('border-gray-300');
      input?.classList.remove('focus:border-primary-400');
      input?.classList.remove('focus:ring-primary-400');

      input?.classList.add('border-danger');
      input?.classList.add('focus:border-danger');
      input?.classList.add('focus:ring-danger');
      // input?.classList.add('border-danger');
    } else {
      input?.classList.remove('border-danger');
      input?.classList.remove('focus:border-danger');
      input?.classList.remove('focus:ring-danger');

      input?.classList.add('border-gray-300');
      input?.classList.add('focus:border-primary-400');
      input?.classList.add('focus:ring-primary-400');
    }
  }

  async changeInputParam(idInput: string, form: any) {
    if(idInput.includes('P211') || idInput.includes('P212'))
    {
      this.onDateChange(form.get(idInput).value, idInput);
    }

    let input: any = await document.getElementById(idInput);
    console.log("idInput ", idInput);
    console.log("form", form.get(idInput));

    if(form.get(idInput).errors != null) {
      await input?.classList.remove('border-gray-300');
      await input?.classList.remove('focus:border-primary-400');
      await input?.classList.remove('focus:ring-primary-400');

      await input?.classList.add('border-danger');
      await input?.classList.add('focus:border-danger');
      await input?.classList.add('focus:ring-danger');

      input = input;
      console.log("fffff22222", input);
    } else {
      await input?.classList.remove('border-danger');
      await input?.classList.remove('focus:border-danger');
      await input?.classList.remove('focus:ring-danger');
      
      await input?.classList.add('border-gray-300');
      await input?.classList.add('focus:border-primary-400');
      await input?.classList.add('focus:ring-primary-400');


      input = await input;
      // input.style.backgroundColor = 'gray';
    }
  }

  async changeInputParamDate(idInput: any, form: any, event: any) {
    console.log("formParamRisqueDevis[0].get(voyage.codeParam).value < now", this.formParamRisqueDevis[0].get(idInput.codeParam).value)
    console.log("formParamRisqueDevis[0].get(voyage.codeParam).value < now", moment(this.now).format("YYYY-MM-DD"))
    let input: any = document.getElementById(idInput.codeParam);
    console.log("event ", event);
    console.log("idInput ", idInput);
    console.log("form", form.get(idInput.codeParam));
    form.get(idInput.codeParam).value = await event.target.value
    
    if(idInput.codeParam.includes('P211') || idInput.codeParam.includes('P212'))
    {
      if (idInput.codeParam == 'P212') {
        idInput.valeurMin = moment(form.get('P211').value).format("YYYY-MM-DD");
        idInput.valeurMax = this.maxDuree;

        console.log("validateDateMin ", idInput.valeurMin)

        console.log("validateDateMax ", idInput.valeurMax)
      }

      await this.onDateChange(form.get(idInput.codeParam).value, idInput.codeParam);
      console.log("diff date1",new Date(event.target.value) >= new Date(idInput.valeurMin) && new Date(event.target.value) <= new Date(idInput.valeurMax))
      if(new Date(event.target.value) >= new Date(idInput.valeurMin) && new Date(event.target.value) <= new Date(idInput.valeurMax)) {
        await input?.classList.remove('border-danger');
        await input?.classList.remove('focus:border-danger');
        await input?.classList.remove('focus:ring-danger');

        await input?.classList.add('border-gray-300');
        await input?.classList.add('focus:border-primary-400');
        await input?.classList.add('focus:ring-primary-400');
        input = input;
        form.get(idInput.codeParam).setErrors(null);
      } else {
        await input?.classList.remove('border-gray-300');
        await input?.classList.remove('focus:border-primary-400');
        await input?.classList.remove('focus:ring-primary-400');

        await input?.classList.add('border-danger');
        await input?.classList.add('focus:border-danger');
        await input?.classList.add('focus:ring-danger');

        input = input;
        form.get(idInput.codeParam).setErrors({
          "dateError" : true
        });
      }
    }
    else {
      console.log("form.get(idInput.codeParam).valid ",form.get(idInput.codeParam).valid)
      if(form.get(idInput.codeParam).errors != null) {
        await input?.classList.remove('border-gray-300');
        await input?.classList.remove('focus:border-primary-400');
        await input?.classList.remove('focus:ring-primary-400');

        await input?.classList.add('border-danger');
        await input?.classList.add('focus:border-danger');
        await input?.classList.add('focus:ring-danger');
        input = input;
      } else {
        await input?.classList.remove('border-danger');
        await input?.classList.remove('focus:border-danger');
        await input?.classList.remove('focus:ring-danger');

        await input?.classList.add('border-gray-300');
        await input?.classList.add('focus:border-primary-400');
        await input?.classList.add('focus:ring-primary-400');
        input = input;
      }
    }
  }

  getAllParamRisque(idDevisWorkFlow: number) {
    let existInBoth = false
    let validators: any = []
    this.tableauxParCategorie = []
    this.tableauxParCategorieAssure = []
    this.formParamRisqueDevis = [];
    
    let formParamRisque: any;
    formParamRisque = this.formParamRisqueDevis;

    this.paramRisqueService.getParamByProduit(this.idProduit).subscribe({
      next: (data: any) => {

        this.paramRisqueService.getWorkFlowByProduit(this.idProduit, idDevisWorkFlow).subscribe({
          next: (dataWorkFlow: any) => {

            for (let index = 0; index < Number(this.nbrAssure)+1; index++) {
              formParamRisque[index] = this.formBuilder.group({});
              this.paraRisqueType = []
              this.paraRisqueProduit = []
              let category = index == 0 ? "CP540" : "CP541";

              data.map((param: any) => {
  
                let paramRisque: ParamRisqueProduit = {} as any
                let enabled: any = null
                let obligatoire: any = null
                

                dataWorkFlow.filter((paramWorkFlow: any) => {
                  //FIX DELETE 2ND CONDITION
                  if (param.paramRisque.idParamRisque == paramWorkFlow.paramRisque.idParamRisque) {
                    existInBoth = true
                    enabled = paramWorkFlow.enabled
                    obligatoire = paramWorkFlow.obligatoire
                  }
                })
                this.paraRisqueType.push(paramRisque)
  
                paramRisque.idParamRisque = param.paramRisque.idParamRisque
                paramRisque.libelle = param.paramRisque.libelle
                paramRisque.descriptionChamp = param.paramRisque.descriptionChamp
                paramRisque.formName = index == 0 ? param.paramRisque.codeParam : param.paramRisque.codeParam + "" + index
                paramRisque.orderChamp = param.paramRisque.orderChamp
                paramRisque.position = param.paramRisque.position
                paramRisque.typeChamp = param.paramRisque.typeChamp
                paramRisque.sizeChamp = param.paramRisque.sizeChamp
                paramRisque.codeParam = param.paramRisque.codeParam
                paramRisque.reponses = param.paramRisque.categorie?.paramDictionnaires
                paramRisque.typeValeur = param.iddictionnaire
                paramRisque.defaultValue = param.valeur
                paramRisque.obligatoire = obligatoire
                paramRisque.enable = enabled
                paramRisque.category = param.paramRisque.categorieParamRisque?.description
                paramRisque.codeCategory = param.paramRisque.categorieParamRisque?.code
                paramRisque.parent = param.paramRisque.paramRisqueParent
                paramRisque.isParent = param.paramRisque.isParent
                param?.iddictionnaire?.description == 'valeur minimum' ? paramRisque.valeurMin = param.valeur : ''
                param?.iddictionnaire?.description == 'valeur maximum' ? paramRisque.valeurMax = param.valeur : ''  
                let defaultValue: any = { value: paramRisque.defaultValue, disabled: false}
                let validation: any = [];

                  
                    switch (paramRisque.codeParam) {
                      case "P164": // Nom
                        validation = [Validators.pattern(Patterns.nom)]
                        defaultValue = { value: index == 1 ? this.formInfoAssure.get("nom").value : paramRisque.defaultValue, disabled: index == 1 ? true: false}
                        break;
                      case "P165": // Prenom
                        validation = [Validators.pattern(Patterns.nom)]
                        defaultValue = { value: index == 1 ? this.formInfoAssure.get("prenom").value : paramRisque.defaultValue, disabled: index == 1 ? true: false}
                        break;
                      case "P166": // Date de naissance
                        validation = [ageInfValidator, ageSup120Validator]
                        let value = this.formInfoAssure.get("dateNaissance").value
                        defaultValue = { value: index == 1 ? value : paramRisque.defaultValue, disabled: index == 1 ? true: false}
                        break;
                    
                      default:
                        defaultValue = { value: paramRisque.defaultValue, disabled: false}
                        break;
                    }
                  

                  console.log("paramRisque.codeParam ",paramRisque.codeParam);

                  if (paramRisque.codeParam==='P211') {
                    paramRisque.valeurMin = this.minDate;
                    paramRisque.valeurMax = this.maxDate;
  
                    console.log("validateDateMin ", paramRisque.valeurMin)
  
                    console.log("validateDateMax ", paramRisque.valeurMax)
                  }
  
                if (this.paraRisqueProduit.find(o => param.paramRisque.idParamRisque === o.idParamRisque) == undefined && existInBoth) {
                  if (paramRisque.sizeChamp != 0 && paramRisque.sizeChamp != undefined && paramRisque.sizeChamp != null)
                  {
                    formParamRisque[index].addControl(paramRisque.formName, new FormControl(defaultValue, paramRisque.codeParam==='P211' ? validation.concat([Validators.required, Validators.minLength(paramRisque.sizeChamp), Validators.maxLength(paramRisque.sizeChamp)]) : validation.concat([Validators.required, Validators.minLength(paramRisque.sizeChamp), Validators.maxLength(paramRisque.sizeChamp)])));
                  }
                  else
                  {
                    if (paramRisque.obligatoire)
                    {
                      formParamRisque[index].addControl(paramRisque.formName, new FormControl(defaultValue, paramRisque.codeParam==='P211' ? validation.concat([Validators.required]) : validation.concat([Validators.required])));
                    }
                    else
                    {
                      formParamRisque[index].addControl(paramRisque.formName, new FormControl(defaultValue));
                      param.paramRisque.typeChamp.code == "L06" ? console.log("formParamRisque[index]", formParamRisque[index]) : ''
                      if (paramRisque.parent != null) 
                        {
                          formParamRisque[index].get(paramRisque.formName).disable();
                        }
                      }
                    }                  
                  
                  //parent
                  if (param.paramRisque.typeChamp.code == "L08" && param.paramRisque.paramRisqueParent == null && index == Number(this.nbrAssure)) {
                    //EXP EN ATTENTE NOM TABLE EN RETOUR
                    this.paramRisqueService.getTableParamParent(param.paramRisque.idParamRisque).subscribe({
                      next: (data: any) => {
                        paramRisque.reponses = data
                        console.log("paramRisque ", paramRisque);
                      },
                      error: (error) => {
                        console.log(error);
                      }
                    })
                  }

                  this.paraRisqueProduit.push(paramRisque)
                  console.log("paramRisque.CODE ", paramRisque.codeParam);
                  console.log("paramRisque.reponses ", paramRisque.reponses);
                }
                else if (existInBoth) {
                  if (param?.iddictionnaire?.description == 'valeur minimum') {
                    formParamRisque[index].get(paramRisque.formName).addValidators([Validators.min(paramRisque.valeurMin)])
                    formParamRisque[index].get(paramRisque.formName).updateValueAndValidity();
                  }
                  else if (param?.iddictionnaire?.description == 'valeur maximum') {
                    formParamRisque[index].get(paramRisque.formName).addValidators([Validators.max(paramRisque.valeurMax)])
                    formParamRisque[index].get(paramRisque.formName).updateValueAndValidity();
                  }
                }
                existInBoth = false
                validators = []
              })

              formParamRisque[index].addControl("newGroupe", new FormControl('', []));
              formParamRisque[index].addControl("groupe", new FormControl({ value: "voyage", disabled: true }, []));
              formParamRisque[index].addControl("category", new FormControl({ value: category, disabled: true }, []));

              if(index == 0) {
                console.log("this.userId ", this.userId);
                formParamRisque[index].addControl("agence", new FormControl({ value: this.userId == null ? null : this.agenceUser?.idAgence, disabled: this.userId == null ? false : true }, [Validators.required]));
                formParamRisque[index].addControl("pack", new FormControl({ value: null, disabled: false }, [Validators.required]));
                if(this.userId != null) formParamRisque[index].addControl("reduction", new FormControl({ value: null, disabled: this.formInfoAssure.get("formule").value == 'F01' }, []));
              }
            }

            this.paraRisqueProduit.sort((a: any, b: any) => (a.orderChamp < b.orderChamp ? -1 : 1));
            
              this.paraRisqueProduit.filter((element:any)=>{
                if (element.codeCategory == "CP540" && element.codeParam != "P179") {
                  this.tableauxParCategorie.push(element)
                }
  
                if (element.codeCategory == "CP541") {
                  this.tableauxParCategorieAssure.push(element)
                }
              })

            // this.tableauxParCategorieAssure.map((risqueCategory: any) => {
            //   risqueCategory.sort((a: any, b: any) => (a.orderChamp < b.orderChamp ? -1 : 1));
            // })
            // this.tableauxParCategorie.map((risqueCategory: any) => {
            //   risqueCategory.sort((a: any, b: any) => (a.orderChamp < b.orderChamp ? -1 : 1));
            // })
            

            console.log("tableauxParCategorie",this.tableauxParCategorie)
            console.log("tableauxParCategorieAssure",this.tableauxParCategorieAssure)

            console.log("this.formParamRisqueDevis ", this.formParamRisqueDevis);

            // if(idDevisWorkFlow == 45) {
            //   const el: any = HSStepper.getInstance('#stepper');
            //   console.log("next ", el)
            //   el.nextBtn.click();
            // } else { 
            //   this.next(this.formParamRisqueDevis, 0); 
            // }
          },
          error: (error) => {
            console.log(error);
          }
        })
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  getAllParamRisqueContrat(idDevisWorkFlow: number, formParamRisqueDevis: any) {
    let existInBoth = false
    let validators: any = []
    this.tableauxParCategorieContrat = []
    this.tableauxParCategorieAssureContrat = []
    this.formParamRisqueContrat = [];
    
    let formParamRisque2: any;
    // this.formParamRisqueContrat = this.formParamRisqueDevis
    formParamRisque2 = this.formParamRisqueContrat;
    console.log("this.devisOutput ", this.devisOutput);
    this.dateDepartSelected = this.devisOutput?.risqueList?.find((r: any) => r.codeRisque == "P211")?.reponse?.valeur?.split('T')[0]
    this.dateRetourSelected = this.devisOutput?.risqueList?.find((r: any) => r.codeRisque == "P212")?.reponse?.valeur?.split('T')[0]

    this.paramRisqueService.getParamByProduit(this.idProduit).subscribe({
      next: (data: any) => {

        this.paramRisqueService.getWorkFlowByProduit(this.idProduit, idDevisWorkFlow).subscribe({
          next: (dataWorkFlow: any) => {
            console.log("this.nbrAssure", Number(this.nbrAssure)+1);
            for (let index = 0; index < Number(this.nbrAssure)+1; index++) {
              console.log("P164", this.devisOutput?.groupes[0]?.risques[index]?.risque?.find((r: any) => r.code == "P164")?.valeur);
              console.log("P165", this.devisOutput?.groupes[0]?.risques[index]?.risque?.find((r: any) => r.code == "P165")?.valeur);
              console.log("P166", this.devisOutput?.groupes[0]?.risques[index]?.risque?.find((r: any) => r.code == "P166")?.valeur);
              formParamRisque2[index] = this.formBuilder.group({});
              this.paraRisqueType = []
              this.paraRisqueProduit = []
              let category = index == 0 ? "CP540" : "CP541";

              data.map((param: any) => {
  
                let paramRisque: ParamRisqueProduit = {} as any
                let enabled: any = null
                let obligatoire: any = null
                

                dataWorkFlow.filter((paramWorkFlow: any) => {
                  //FIX DELETE 2ND CONDITION
                  if (param.paramRisque.idParamRisque == paramWorkFlow.paramRisque.idParamRisque) {
                    existInBoth = true
                    enabled = paramWorkFlow.enabled
                    obligatoire = paramWorkFlow.obligatoire
                  }
                })
                this.paraRisqueType.push(paramRisque)
  
                paramRisque.idParamRisque = param.paramRisque.idParamRisque
                paramRisque.libelle = param.paramRisque.libelle
                paramRisque.descriptionChamp = param.paramRisque.descriptionChamp
                paramRisque.formName = index == 0 ? param.paramRisque.codeParam : param.paramRisque.codeParam + "" + index + "c"
                paramRisque.orderChamp = param.paramRisque.orderChamp
                paramRisque.position = param.paramRisque.position
                paramRisque.typeChamp = param.paramRisque.typeChamp
                paramRisque.sizeChamp = param.paramRisque.sizeChamp
                paramRisque.codeParam = param.paramRisque.codeParam
                paramRisque.reponses = param.paramRisque.categorie?.paramDictionnaires
                paramRisque.typeValeur = param.iddictionnaire
                paramRisque.defaultValue = param.valeur
                paramRisque.obligatoire = obligatoire
                paramRisque.enable = enabled
                paramRisque.category = param.paramRisque.categorieParamRisque?.description
                paramRisque.codeCategory = param.paramRisque.categorieParamRisque?.code
                paramRisque.parent = param.paramRisque.paramRisqueParent
                paramRisque.isParent = param.paramRisque.isParent
                param?.iddictionnaire?.description == 'valeur minimum' ? paramRisque.valeurMin = param.valeur : ''
                param?.iddictionnaire?.description == 'valeur maximum' ? paramRisque.valeurMax = param.valeur : ''  
                let defaultValue: any = { value: paramRisque.defaultValue, disabled: false}
                let validation: any = [];
                if(idDevisWorkFlow == 46)
                {
                  if(index != 0) 
                    {
                      switch (paramRisque.codeParam) {
                        case "P164": // Nom
                          validation = [Validators.pattern(Patterns.nom)]
                          defaultValue = { value: this.devisOutput?.groupes[0]?.risques[index-1]?.risque?.find((r: any) => r.code == "P164")?.valeur, disabled: false}
                          break;
                        case "P165": // Prenom
                          validation = [Validators.pattern(Patterns.nom)]
                          defaultValue = { value: this.devisOutput?.groupes[0]?.risques[index-1]?.risque?.find((r: any) => r.code == "P165")?.valeur, disabled: false}
                          break;
                        case "P166": // Date de naissance
                          let value = this.devisOutput?.groupes[0]?.risques[index-1]?.risque?.find((r: any) => r.code == "P166")?.valeur?.split('T')[0]
                          defaultValue = { value: value, disabled: true}
                          break;
                        case "P182": // Destination
                          defaultValue = { value: this.devisOutput?.risqueList?.find((r: any) => r.codeRisque == "P182")?.reponse?.valeur, disabled: true}
                          break;
                        case "P211": // Date depart
                          defaultValue = { value: this.devisOutput?.risqueList?.find((r: any) => r.codeRisque == "P211")?.reponse?.valeur, disabled: true}
                          break;
                        case "P212": // Date de retour
                          defaultValue = { value: this.devisOutput?.risqueList?.find((r: any) => r.codeRisque == "P212")?.reponse?.valeur, disabled: true}
                          break;
                        case "P168": // Email
                          validation = [Validators.pattern(Patterns.email)]
                          defaultValue = { value: this.devisOutput?.email, disabled: false}
                          break;
                        case "P169": // Telephone
                          validation = [Validators.pattern(Patterns.indicatifMobile)]
                          defaultValue = { value: this.devisOutput?.telephone, disabled: false}
                          break;
                        case "P213": // Numero passeport ---
                          validation = [Validators.minLength(6), Validators.maxLength(15), Validators.pattern(Patterns.alphanumerique)]
                          defaultValue = { value: this.devisOutput?.risqueList?.find((r: any) => r.codeRisque == "P213")?.reponse?.valeur, disabled: false}
                          break;
                        case "P214": // date expiration ---
                          validation = [ageSupValidator, dateAfterValidator(() => this.devisOutput?.risqueList?.find((r: any) => r.codeRisque == "P212")?.reponse?.valeur)]
                          defaultValue = { value: this.devisOutput?.risqueList?.find((r: any) => r.codeRisque == "P214")?.reponse?.valeur?.split('T')[0], disabled: false}
                          break;
                        case "P172": // Genre ---
                          defaultValue = { value: this.devisOutput?.risqueList?.find((r: any) => r.codeRisque == "P172")?.reponse?.idParamReponse?.idParam, disabled: false}
                          break;
                        case "P215": // Nationalité ---
                          defaultValue = { value: this.devisOutput?.risqueList?.find((r: any) => r.codeRisque == "P215")?.reponse?.valeur, disabled: false}
                          break;
                        case "P170": // adresse ---
                          validation = [Validators.maxLength(255)]
                          defaultValue = { value: this.devisOutput?.risqueList?.find((r: any) => r.codeRisque == "P170")?.reponse?.valeur, disabled: false}
                          break;
                        case "P171": // commune ---
                        console.log("commune ", this.devisOutput?.risqueList?.find((r: any) => r.codeRisque == "P171"))
                          defaultValue = { value: this.devisOutput?.risqueList?.find((r: any) => r.codeRisque == "P171")?.reponse?.valeur, disabled: false}
                          break;
                        case "P177": // wilaya ---
                        console.log("wilaya ", this.devisOutput?.risqueList?.find((r: any) => r.codeRisque == "P177"))
                          this.communeByWilaya(Number(paramRisque.idParamRisque),this.devisOutput?.risqueList?.find((r: any) => r.codeRisque == "P177")?.reponse?.valeur);
                          // this.getRelation("L08",true,Number(paramRisque.idParamRisque),this.devisOutput?.risqueList?.find((r: any) => r.codeRisque == "P177")?.reponse?.valeur,"P171",46)
                          defaultValue = { value: this.devisOutput?.risqueList?.find((r: any) => r.codeRisque == "P177")?.reponse?.valeur, disabled: false}
                          break;
                      
                        default:
                          defaultValue = { value: paramRisque.defaultValue, disabled: false}
                          break;
                      }
                    } 
                }
  
                if (this.paraRisqueProduit.find(o => param.paramRisque.idParamRisque === o.idParamRisque) == undefined && existInBoth) {
                  console.log("paramRisque.formName ", paramRisque.formName);
                  if (paramRisque.sizeChamp != 0 && paramRisque.sizeChamp != undefined && paramRisque.sizeChamp != null)
                  {
                    formParamRisque2[index].addControl(paramRisque.formName, new FormControl(defaultValue, validation.concat([Validators.required, Validators.minLength(paramRisque.sizeChamp), Validators.maxLength(paramRisque.sizeChamp)])));
                  }
                  else
                  {
                    if (paramRisque.obligatoire)
                    {
                      formParamRisque2[index].addControl(paramRisque.formName, new FormControl(defaultValue, validation.concat([Validators.required])));
                    }
                    else
                    {
                      formParamRisque2[index].addControl(paramRisque.formName, new FormControl(defaultValue));
                      if (paramRisque.parent != null) 
                      {
                        formParamRisque2[index].get(paramRisque.formName).disable();
                      }
                    }
                  }
  
                  
                  //parent
                  if (param.paramRisque.typeChamp.code == "L08" && param.paramRisque.paramRisqueParent == null && index == Number(this.nbrAssure)) {
                    //EXP EN ATTENTE NOM TABLE EN RETOUR
                    this.paramRisqueService.getTableParamParent(param.paramRisque.idParamRisque).subscribe({
                      next: (data: any) => {
                        paramRisque.reponses = data
                      },
                      error: (error) => {
                        console.log(error);
                      }
                    })
                  }

                  this.paraRisqueProduit.push(paramRisque)
                  console.log("paramRisque.reponses ", paramRisque.reponses);
                }
                else if (existInBoth) {
                  if (param?.iddictionnaire?.description == 'valeur minimum') {
                    formParamRisque2[index].get(paramRisque.formName).addValidators([Validators.min(paramRisque.valeurMin)])
                    formParamRisque2[index].get(paramRisque.formName).updateValueAndValidity();
                  }
                  else if (param?.iddictionnaire?.description == 'valeur maximum') {
                    formParamRisque2[index].get(paramRisque.formName).addValidators([Validators.max(paramRisque.valeurMax)])
                    formParamRisque2[index].get(paramRisque.formName).updateValueAndValidity();
                  }
                }
                existInBoth = false
                validators = []
              })

              formParamRisque2[index].addControl("newGroupe", new FormControl('', []));
              formParamRisque2[index].addControl("groupe", new FormControl({ value: "voyage", disabled: true }, []));
              formParamRisque2[index].addControl("category", new FormControl({ value: category, disabled: true }, []));

              if(index == 0) {
                console.log("this.userId ", this.userId);
                formParamRisque2[index].addControl("agence", new FormControl({ value: this.userId == null ? null : this.agenceUser?.idAgence, disabled: this.userId == null ? false : true }, [Validators.required]));
                formParamRisque2[index].addControl("pack", new FormControl({ value: null, disabled: false }, [Validators.required]));
                if(this.userId != null) formParamRisque2[index].addControl("reduction", new FormControl({ value: null, disabled: this.formInfoAssure.get("formule").value == 'F01' }, []));
              }

            }


            console.log("formParamRisque2[index] ", formParamRisque2);

            console.log("formParamRisque ",formParamRisque2);
            console.log("paraProd",this.paraRisqueProduit)

            this.paraRisqueProduit.sort((a: any, b: any) => (a.orderChamp < b.orderChamp ? -1 : 1));
            
              this.paraRisqueProduit.filter((element:any)=>{
                if (element.codeCategory == "CP540" && element.codeParam != "P179") {
                  this.tableauxParCategorieContrat.push(element)
                }
  
                if (element.codeCategory == "CP541") {
                  this.tableauxParCategorieAssureContrat.push(element)
                }
              })
            

            console.log("tableauxParCategorieContrat",this.tableauxParCategorieContrat)
            console.log("tableauxParCategorieAssureContrat",this.tableauxParCategorieAssureContrat)

            console.log("this.formParamRisqueContrat ", this.formParamRisqueContrat);
            console.log("this.formParamRisque ", this.formParamRisqueDevis);

            if(idDevisWorkFlow == 45) {
              const el: any = HSStepper.getInstance('#stepper');
              console.log("next ", el)
              el.nextBtn.click();
            } else { 
              this.next(this.formParamRisqueDevis, 3); 
            }
          },
          error: (error) => {
            console.log(error);
          }
        })
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  communeByWilaya(idParamRisque: number, idReponse: any) {
    let idRisqueChild = this.paraRisqueProduit.find((rs: any) => rs.parent?.idParamRisque == idParamRisque)?.idParamRisque
    if (idRisqueChild)
      this.paraRisqueProduit.filter((param: any) => {
        if (param.idParamRisque == idRisqueChild) {
          param.reponses = this.communes.filter((commune: any) => commune?.idWilaya?.idWilaya == idReponse)
        }
      })
  }

  // private dateRangeValidator: ValidatorFn = (): {
  //   [key: string]: any;
  // } | null => {
  //   let invalid = false;
  //   for (let index = 1; index < Number(this.nbrAssure)+1; index++) {
  //     const from = this.formParamRisqueContrat[index] && this.formParamRisqueContrat[index].get("P214"+index+'c')?.value;
  //     const to = this.formParamRisqueDevis[0] && this.formParamRisqueDevis[0].get("P212").value;
  //     if (from && to) {
  //       invalid = new Date(from).valueOf() > new Date(to).valueOf();
  //     }
  //     return invalid ? { invalidRange: { from, to } } : null;
  //   }
  //   return null;
  // };

  getRelation(typeChamp: any, isParent: boolean, idParamRisque: number, idReponse: any, codeParam: any, idDevisWorkFlow: any) {
    let formParamRisque = idDevisWorkFlow == 45 ? this.formParamRisqueDevis : this.formParamRisqueContrat;
    this.checkValidationContrat(formParamRisque);
    if(codeParam == 'P182')
      {
        this.getPacks();
      }
        if (isParent == true)
          if (typeChamp == 'L01') {
    
            this.paramRisqueService.getParamRelation(idParamRisque, formParamRisque[0].get("P182").value).subscribe({
              next: (data: any) => {
    
                this.paraRisqueProduit.filter((param: any) => {
                  if (param.idParamRisque == data[0].idParamRisque) {
    
                    param.reponses = data[0].categorie.paramDictionnaires
                    formParamRisque.controls[param.formName].enable()
                  }
                })
              },
              error: (error) => {
                console.log(error);
              }
            })
          } else {
            let idRisqueChild = this.paraRisqueProduit.find((rs: any) => rs.parent?.idParamRisque == idParamRisque)?.idParamRisque
            if (idRisqueChild)
              this.paramRisqueService.getTableParamChild(idRisqueChild, idReponse).subscribe({
                next: (data: any) => {
                  this.paraRisqueProduit.filter((param: any) => {
                    if (param.idParamRisque == idRisqueChild) {
                      param.reponses = data
                      formParamRisque?.controls[param.formName]?.enable()
                    }
                  })
    
                },
                error: (error) => {
    
                  console.log(error);
    
                }
              })
          }
    
      }

  async toggleAcc(id: any) {
    let selector: any = await document.querySelector('#'+id);
    console.log("selector", selector)
    console.log("id", id)
    const accordion = await new HSAccordion(selector);

    await accordion.show();
  }
  
  submitInfosAssure(form : any) {
    console.log("form ", form);
      Object.keys(this.formInfoAssure.controls).map((paramFormName: any) => {
          this.changeInput(paramFormName);
      })
      this.pageOne = true;
      console.log("this.userId ", this.userId);
    if(this.formInfoAssure.valid) {
      console.log("this.formInfoAssure.get('formule').value", this.formInfoAssure.get("formule").value);
      console.log("this.retour", this.retour);
      this.formParamRisqueDevis[1].get('P1641').setValue(this.formInfoAssure.get("nom").value)
      this.formParamRisqueDevis[1].get('P1651').setValue(this.formInfoAssure.get("prenom").value)
      this.formParamRisqueDevis[1].get('P1661').setValue(this.formInfoAssure.get("dateNaissance").value)
      console.log("ASSURE ",this.formInfoAssure.get("nbrAssure").value)
      console.log("this.nbrAssure ",this.nbrAssure)
      this.formInfoAssure.get("formule").value == 'F01' || this.userId == null ? this.step = true : this.step = false;

      if((this.formInfoAssure.get("formule").value != 'F01' && this.retour) || (this.formInfoAssure.get("nbrAssure").value != '' && Number(this.formInfoAssure.get("nbrAssure").value) != Number(this.nbrAssure)))
      {
        this.nbrAssure = this.formInfoAssure.get("nbrAssure").value
        this.getAllParamRisque(45); // workflow devis 45
        console.log("this.formInfoAssure", this.formInfoAssure);
        if(this.formInfoAssure.valid) {
          const el: any = HSStepper.getInstance('#stepper');
          console.log("next ", el)
          el.nextBtn.click();
        }
      } else {
        console.log("this.formInfoAssure", this.formInfoAssure);
        if(this.formInfoAssure.valid) {
          const el: any = HSStepper.getInstance('#stepper');
          console.log("next ", el)
          el.nextBtn.click();
          this.widthStep = 24;
        }
      }
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];

    this.suivantCheck = this.uploadExcelFile()
  }

  uploadExcelFile() {
    if (this.selectedFile) {
      this.controleDevis=[];

      let risque: any = {}
      risque.paramList = []
      let groupeList: any = []
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target != null) {
          const data = event.target.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0]; // Assuming there's only one sheet
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
          });
          // Filter out empty rows
          const filteredData : any = jsonData.filter((row: any) => row.length > 0);
          if(filteredData.length - 1 != this.nbrAssure ) {
            Swal.fire(
              `Le nombre de lignes ne correspond pas au nombre de risque indiqué, nombre de ligne= ` + (filteredData.length -1) + `, nombre indiqué= ` + this.nbrAssure + `. veuillez resaisir le fichier ou modifié le nombre de risque`,
              ``,
              `error`,

            )
            this.suivantCheck = false;
            return
          }


          console.log("filteredData ", filteredData[1]);
          console.log("info assure ", this.formInfoAssure);
          let nomFich = filteredData[1][0];
          let prenomFich = filteredData[1][1];
          let DateNaissanceFich = filteredData[1][3].split("T")[0];
          let DateNaissanceAssure = this.formInfoAssure.get("dateNaissance").value;

          console.log("DateNaissanceFich ", filteredData[1][3].split("T")[0], this.formInfoAssure.get("dateNaissance").value, filteredData[1][3].split("T")[0] != this.formInfoAssure.get("dateNaissance").value)
          console.log("nomFich ", nomFich, this.formInfoAssure.get("nom").value)
          console.log("prenomFich ", prenomFich, this.formInfoAssure.get("prenom").value)

          if(nomFich != this.formInfoAssure.get("nom")?.value || prenomFich != this.formInfoAssure.get("prenom")?.value || DateNaissanceFich != DateNaissanceAssure) {
            Swal.fire(
              `Les informations de l'assuré principal doivent être les mêmes que le premiers assuré dans le fichier`,
              ``,
              `error`,

            )
            this.suivantCheck = false;
            return
          }

          this.devisService.paramFichier("20A").subscribe({next: (data: any) => {
            const nonFileParams = this.paraRisqueProduit.filter((el:any)=>data.find((d:any)=>d.paramRisque==el.idParamRisque)==undefined)

            let grpList:any[]=[]
            let controlDevEl:any[]=[]
            filteredData.slice(1).map((row:any[],i:number)=>{
              grpList.push({numRisque:i,risque:{paramList:[]}})
              row.map((param:any,idx:number)=>{
                console.log("idx ", idx, param);
                console.log("data[idx].paramRisque ", data[idx].paramRisque);
                param = idx == 3 ? moment(param).format('YYYY-MM-DD[T]HH:mm:ss.000Z') : param;
                const paramElement={
                  idParam:parseInt(data[idx].paramRisque),
                  reponse:{
                    idReponse:data[idx].reponseId ? param : null,
                    description:data[idx].reponseValeur ? param : null,
                  }
                }
                const ctrlDevisParam = {
                  idParam:parseInt(data[idx].paramRisque),
                  valeur: param
                }
                controlDevEl.push(ctrlDevisParam)
                grpList[i].risque.paramList.push(paramElement)
              })
              nonFileParams.map((nfParams:any)=>{
                const name = nfParams.codeParam;
                let paramElement:any={
                  idParam:nfParams.idParamRisque,
                  reponse:{
                    idReponse:null,
                    description:null,
                  }
                }
                const ctrlDevisParam = {
                  idParam:nfParams.idParamRisque,
                  valeur: ''
                }

                if (nfParams.typeChamp?.code == 'L08') {
                  if(nfParams.codeParam == 'P182')
                  {
                    let destinationParam: any = this.paraRisqueProduit.find((param: any) => param.codeParam == "P182")
                    this.destination = destinationParam?.reponses.find((res: any) => res.id == this.formParamRisqueDevis[0].get("P182").value);
                    paramElement.reponse.description = this.destination?.id;
                    ctrlDevisParam.valeur = this.destination?.id
                  } else {
                    paramElement.reponse.idReponse = nfParams.reponses?.find( (r: any) => r.id == this.formParamRisqueDevis[0]?.get(name)?.value)?.idParam;
                    ctrlDevisParam.valeur=nfParams.reponses?.find( (r: any) => r.id == this.formParamRisqueDevis[0]?.get(name)?.value)?.idParam
                  }
                } else if (nfParams.typeChamp?.code != 'L06') {
                  if(nfParams?.codeParam == "P179") {
                    paramElement.reponse.description = nfParams?.reponses.find((res: any) => res.code == this.formInfoAssure.get("formule").value)?.idParam;
                    //paramElement.reponse.description = "";
                    ctrlDevisParam.valeur= nfParams?.reponses.find((res: any) => res.code == this.formInfoAssure.get("formule").value)?.idParam;
                  } else {
                    paramElement.reponse.description = this.formParamRisqueDevis[0].get(name).value;
                    ctrlDevisParam.valeur= this.formParamRisqueDevis[0].get(name).value
                  }

                } else {
                  paramElement.reponse.description = moment(this.formParamRisqueDevis[0].get(name).value).format('YYYY-MM-DD[T]HH:mm:ss.000Z');
                  ctrlDevisParam.valeur= moment(this.formParamRisqueDevis[0].get(name).value).format('YYYY-MM-DD[T]HH:mm:ss.000Z');

                }
                grpList[i].risque.paramList.push(paramElement)
                controlDevEl.push(ctrlDevisParam)
               
              })
              this.controleDevis.push(controlDevEl)
              
              controlDevEl=[]
            })

              

            this.devisGroupe = [{
              "description": "voyage",
              "idPack": Number(this.formParamRisqueDevis[0].get("pack").value),
              "groupeList": grpList,
            }]
            // let groupExsit = false
            //   this.devisGroupe.map((groupe: any) => {
            //     if (groupe.description == "voyage")
            //       groupExsit = true
            //   })

            //   if (!groupExsit){


            //     this.devisGroupe.push({
            //       "description": "voyage",
            //       "idPack": Number(this.formParamRisqueDevis[0].get("pack").value),
            //       "groupeList": grpList,
            //     })
            //   }else {


            //     this.devisGroupe.filter((groupe: any) => groupe.description == "voyage")[0]?.groupeList.push({
            //       "risque": risque,numRisque: this.risqueIndexBody
            //     })
            //   }
                
              
              
            this.devisService.controleDevis(this.controleDevis, "20A").subscribe({next: (data: any) => {
              //todo fix error
              let isBreak=false
              data.forEach((elt:any)=>{
                elt.forEach((ligne:any)=>{
                 if(ligne.bloquant){
                  Swal.fire(
                    ligne.message,
                    ``,
                    `error`,
              
                  )
                  isBreak = true
                  this.suivantCheck = false;
                  return
                 }
                 
                 if(!ligne.bloquant && ligne.message){
                  Swal.fire(
                    ligne.message,
                    ``,
                    `warning`,
              
                  )
                 }
                })
              })
              if(isBreak)
              {
                this.suivantCheck = false;
                return
              } 

              // this.myStepper.next();
              this.devis.groupes = this.devisGroupe
              
              // Object.keys(this.formParamRisque.controls).forEach(controlName => {
              //   this.formParamRisque.get(controlName)?.setErrors(null);
              // });
              this.fileSuccess=true
              this.multiRisqueArray.map((elt:any)=>{
                let formuleParam: any = this.paraRisqueProduit.find((param: any) => param.codeParam == "P179")

                elt.DateDépart =this.formParamRisqueDevis[0].get("P211").value.format('YYYY-MM-DD');
                elt.DateRetour=this.formParamRisqueDevis[0].get("P212").value.format('YYYY-MM-DD');
                elt.Formule= formuleParam?.reponses.find((res: any) => res.code == this.formInfoAssure.get("formule").value)?.idParam;
                elt.Destination=this.formParamRisqueDevis[0].get("P182").value;


              })
              console.log("fffff")
              this.suivantCheck = true;
              Swal.fire(
                'Fichier importé avec succès',
                ``,
                `success`,
            
              )
              return

            // this.getPackVoyage()
              
              },error:(error:any)=>{
                console.log(error)
                Swal.fire(
                  'Fichier erroné ou Informations manquante',
                  ``,
                  `error`,
              
                )
              }
              })

          },error(err: any) {
            console.log("error",err)
          },})
       
        }
      };
      reader.readAsBinaryString(this.selectedFile);
    }
  }

  getPackVoyage() {
    let body={}

    body ={
      "destination": this.formParamRisqueDevis[0].get("P182").value ,
    }


    this.packService.getPackVoyage(body).subscribe({
      next: (data: any) => {
        this.packs = data
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

//   checkAssureNumber() {
//     if(this.risqueStep==2){      
//       if(this.selectedFile){  
//         this.uploadExcelFile();
//       }else{
//         Swal.fire(
//           "Veuillez selectionner un fichier",
//           `error`
//         )
//       }
//       return
//     }
  
   
//     let bodyPack : any;

//     if (this.nbrAssure.value !== this.multiRisqueArray.length) {
//       Swal.fire(
//         " le nombre d'assurés ajoutés ne correspond pas au nombre d'assurés  indiqué",
//         `error`
//       )
//       // this._snackBar.open(" le nombre de véhicules ajoutés ne correspond pas au nombre de véhicules indiqué", 'fermer', {
//       //   horizontalPosition: "end",
//       //   panelClass: ['danger-snackbar']
//       // })
//     } else{      
//       this.multiRisqueArray.map((elt:any)=>{
//         elt.DateDépart =this.formParamRisque?.get('DateDépart')?.value?.format('YYYY-MM-DD');
//         elt.DateRetour=this.formParamRisque?.get('DateRetour')?.value?.format('YYYY-MM-DD');
//         elt.Formule=this.formParamRisque?.get('Formule')?.value;
//         elt.Destination=this.formParamRisque?.get('Destination')?.value;        
//       })
        
//     this.getPackVoyage()
//   }
// }
}
