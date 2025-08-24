import { Component, inject, Input, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import moment from 'moment';
import { RECAPTCHA_SETTINGS, RecaptchaModule, RecaptchaSettings } from 'ng-recaptcha';
import {
  FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule,
  FormControl, AbstractControl, ValidationErrors, ValidatorFn, FormArray
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatOptionModule } from '@angular/material/core';
import * as CV from '../../core/validators/custom-validators';
import { firstValueFrom, forkJoin, of, tap } from 'rxjs';
import { Patterns } from '../../core/validators/patterns';
import { AgenceService } from '../../core/services/agence.service';
import { DureeService } from '../../core/services/duree.service';
import { GenericService } from '../../core/services/generic.service';
import { ParamList, ParamRisqueProduit } from '../../core/models/param-risque-produit';
import { ParamRisqueService } from '../../core/services/param-risque.service';
import { DevisService } from '../../core/services/devis.service';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { CryptoService } from '../../core/services/crypto.service';
import { CommonModule } from '@angular/common';
import { PackService } from '../../core/services/pack.service';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { ParamRisque } from '../../core/models/param-risque';
import { ListRisqueDialogComponent } from './list-risque-dialog/list-risque-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MoneyPipe } from '../../../app/core/pipes/MoneyPipe';
import { RouterModule } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AppComponent } from '../../app.component';
import { Wilaya } from '../../core/models/wilaya.model';
import { LOCALE_ID, NgModule } from '@angular/core';
import { registerLocaleData }   from '@angular/common';
import localeFr                 from '@angular/common/locales/fr';
import { environment } from '../../../environments/environment';
const todayDate: Date = new Date();

declare var HSStepper: any;

interface Reponse {
  idReponse: number | null;      // ← Id technique transmis à l’API
  description: string;           // ← Libellé lisible pour le client
}

interface ParamItem {
  idParam  : number;             // Identifiant du paramètre dans la base
  codeParam: string;             // Code fonctionnel (P106, P125, …)
  reponse  : Reponse;            // Valeur (id + libellé)
}

registerLocaleData(localeFr);

@Component({
  selector: 'app-mrh',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    MatDialogModule,
    MatIconModule,
    HeaderComponent,
    FooterComponent,
    MoneyPipe,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTableModule,
    MatOptionModule,
    RecaptchaModule,
],
    animations: [
    trigger('detailExpand', [
      state('collapsed', style({height:'0px', minHeight:'0', display:'none'})),
      state('expanded',  style({height:'*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4,0,0.2,1)')),
    ])
  ],
  providers: [
  { provide: LOCALE_ID, useValue: 'fr-FR' },
  {
    provide : RECAPTCHA_SETTINGS,
    useValue: { siteKey: '6LdmQYMrAAAAAGNI5H_UA_ex_z9iKuyndmrGUpEY' }
  }
  ],
  templateUrl: './mrh.component.html',
  styleUrl: './mrh.component.scss'
})

export class MrhComponent implements AfterViewInit {
  // --- Attributs principaux ---
  idDevis: number;
  idPays: number;
  wilayas:  any[] = [];
  communes: any[] = [];
  step = false;
  stepFile = false;
  retour = true;
  loaderDevis = false;
  loaderContrat = false;
  validateDateMin: any;
  validateDateMax: any;
  selector: any;
  errorState: any = 1;
  formInfoAssure!: FormGroup;
  formParamRisqueDevis!: FormGroup;
  formListParamRisque!: FormGroup;
  formOld: FormGroup | any;
  codeProduit: string | null = null;
  produit: any;
  nbrAssure = 1;
  primeTTC: any;
  returnedDevis: any = {};
  idProduit!: number;
  auditUser: string | undefined | null = "";
  produitInfo: any = {};
  idDevisWorkFlow = 45;
  maxDuree: any;
  paramRisqueProduit: ParamRisqueProduit[] = [];
  paraRisqueType: any = [];
  tableauxParCategorie: any = [];
  tableauxParCategorieAssure: any = [];
  tableauxParCategorieContrat: any = [];
  paramRisqueProduitCategory: any[] = [];
  risqueArrayReady = false;
  pageOne = false;
  pageTwo = false;
  pageThree = false;
  pageFour = false;
  agences: any[] = [];
  groupesPacks: any = [];
  agenceSelected: any = {};
  agenceUser: any = {};
  idPackComplet: any;
  garantiesNew: any;
  packSelected: any;
  risqueIndex = 0;
  risqueIndexBody = 0;
  devisOutput: any = {};
  risqueConsult: any = {};
  paramElement: ParamList = {} as any;
  controleDevis: any = [];
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
  duree: any;
  montant: any;
  tkn!: string;
  plafond: string = "";
  roles: any = [];
  canals: any = [];
  @Input() token: any;
  @Input() tokenDevis: any;
  garantie1: string = "";
  garantie2: string = "";
  garantie3: string = "";
  garantie4: string = "";
  garantie5: string = "";
  garantie6: string = "";
  garantie7: string = "";
  garantie8: string = "";
  garantie9: string = "";
  garantie10: string = "";
  garantie11: string = "";
  garantie12: string = "";
  garantie13: string = "";
  garantie14: string = "";
  garantie15: string = "";
  selectedFile: any;
  reductions: any = [];
  conventions: any = [];
  convention: any = {};
  devisGroupe: any[] = [];
  fileSuccess = false;
  suivantCheck: any = true;
  Array: any = [];
  userJson: any;
  devis: any = {};
  garantieSelected: any = [];
  garantieSelectedIds: any = [];
  sousGarantieSelectedIds: any = [];

  tarifReady = false;
  franchiseExist = false;
  plafondExist = false;
  formuleExist = false;
  sousGarantieExist = false;
  loadTable = false;

  idPack = 9;
  indexGarantieMrp = 0;
  indexSousGarantieMrp = 0;

  garantieAll: any[] = [];
  garantieTab: any[] = [];
  sousGarantieTab: any[] = [];
  acctuelPack: any;
  selectedSousProduit = '';

  packs: any[] = [];
  errorTarif = { error: false, msg: '' };
  PrimeTotale = 0;
  garantieNull = false;
  expandedElement: any;
  selection = new SelectionModel<any>(true, []);
  actualControlGarantie = 0;

  listParamRisque: any[] = [];
  displayedColumnsListParamRisque: string[] = [];
  idsListParams: number[] = [];
  codesListParams: number[] = [];
  lengthColumnsListParamRisque =
   0;
  idListParamList!: number;

  formPackGaranties: FormGroup | any;
  dataSource = new MatTableDataSource<any>();
  DisplayedColumnsSousGarantie = ['select','garantie','plafond','franchise','formule','action','more'];
  displayedColumns: string[] = ['select', 'garantie', 'plafond', 'franchise', 'formule', 'action', 'sousGarantie'];
  originalDisplayedColumns: string[] = ['select', 'garantie', 'plafond', 'franchise', 'formule', 'action', 'sousGarantie'];
  displayedColumnsListOfList: string[] = ['idList', 'description', 'action'];
  displayedColumnsRisque: any[] = [];

  private _packLoaded = false;   // getPack déjà appelé ?
  private _tarifDone  = false;   // generateCalcul déjà appelé ?

  errorHandler = {
    error: false,
    msg: ""
  };

  dataSourceListParamRisque = new MatTableDataSource<any>();
  dataSourceListOfListes    = new MatTableDataSource<any>();
  paramList: any[]          = [];
  loaderTarif = false;
  returnedTarif: any;
  uid:any;

  errorPackForm = false;

  currentStep = 0;
  maxStepReached = 0;

  steps = [
    { label: 'Assuré', icon: '/images/icon1.png' },
    { label: 'Risque', icon: '/images/icon2.png' },
    { label: 'Récapitulatif', icon: '/images/icon3.png' }
  ];

  infoBubbles: string[] = [
    ' Dommages causés par le feu, explosions, défaillances électriques …',
    ' Dommages causés par le feu, explosions, défaillances électriques …',
    " Les dommages causés par l'eau à votre logement.",
    " Les dommages causés par l'eau à vos biens.",
    ' Prise en charge des dommages causés par vous même et les occupants de votre domicile.',
    ' Prise en charge des glaces, vitres et autres produits verriers.',
    ' Cette garantie vous couvre contre la perte ou la détérioration de vos biens suite à un vol ou une tentative de vol, commis par effraction.',
    ' Service d’intervention d’urgence en cas de problème de plomberie, d’électricité, de serrurerie ou de vitrerie.',
    ' Cette garantie vous couvre contre la perte ou la détérioration de vos biens suite à un vol ou une tentative de vol, commis par effraction.',
    ' Cette garantie couvre le remboursement des biens de valeur (bijoux, ...) en cas de vol suite à une effraction, elle est soumise à conditions.'
  ];

  isBOUser:boolean=false;
  successDevis = false;
  loaderControles = false;

  /* ───────────────────── Flags calcul ───────────────────── */
  calculReady            = false;   // le pack est totalement chargé
  private _tarifInFlight = false;   // bloque les double-clics
  private _tarifRetry    = false;   // 2ᵉ tentative auto sur HTTP 500
  basicTarif: any;
  valAss: any;
  TOTALE:any;

  asArray(val: any): any[] {
    return Array.isArray(val) ? val : [];
  }

  private loadWilayas(): void {
    this.genericService.getAllWilayas(1).subscribe({
      next : data => (this.wilayas = data as Wilaya[]),
      error: err  => console.error('[Wilayas] ', err)
    });
  }
  onWilayaChange(raw: string): void {
    const idWilaya = Number(raw);
    if (isNaN(idWilaya)) { return; }
    this.formParamRisqueDevis.get('P126')?.reset();
    this.genericService.getAllCommuneByWilaya(idWilaya).subscribe({
        next : data => this.communes = data as { idCommune:number; description:string; }[],
      error: err  => console.error('[Communes] ', err)
    });
  }

  goToStep(index: number): void {
    if (index <= this.maxStepReached) {
      this.currentStep = index;
    }
  }

  nextStep(): void {
    if (this.currentStep >= this.steps.length - 1) { return; }

    this.currentStep++;

    /* on n’incrémente maxStepReached qu’une seule fois */
    this.maxStepReached = Math.max(this.maxStepReached, this.currentStep);

    // ─ Étape Risque : charger le pack une seule fois
    if (this.currentStep === 1 && !this._packLoaded) {
      this.getPack();
      this._packLoaded = true;
    }

    // ─ Étape Récap : calculer le tarif une seule fois
    if (this.currentStep === 2 && !this._tarifDone) {
      this.generateCalcul();
      this._tarifDone = true;
    }
  }

prevStep(): void {
  if (this.currentStep === 2) {
    this._tarifDone  = false;
    this.tarifReady  = false;
    this.loaderTarif = false;
    this._tarifInFlight = false;
  }

  if (this.currentStep === 1) {
    this._packLoaded = false;

    this.getPack();
  }

  if (this.currentStep > 0) {
    this.currentStep--;
  }
}
  
  round(value:number) {
    return Math.round(value);
  }

  /* =================================================================== */
  /*  Construit dynamiquement le paramList pour le produit MRH           */
  /* =================================================================== */
  private buildParamList(): ParamItem[] {
    const p116      = this.formParamRisqueDevis.get('P116')?.value ?? '';
    const p118      = this.formParamRisqueDevis.get('P118')?.value ?? '';

    const idWilaya  = Number(this.formParamRisqueDevis.get('P125')?.value);
    const idCommune = Number(this.formParamRisqueDevis.get('P126')?.value);

    return [
      { idParam: 114, codeParam: 'P106', reponse: { idReponse: null , description: ''} },
      { idParam: 124, codeParam: 'P116', reponse: { idReponse: null , description: p116 } },
      { idParam: 126, codeParam: 'P125', reponse: { idReponse: null , description: idWilaya  } },
      { idParam: 127, codeParam: 'P126', reponse: { idReponse: null, description: idCommune } },
      { idParam: 125, codeParam: 'P118', reponse: {
              idReponse: ({ Oui: 4020, Non: 4021 } as Record<string, number>)[p118] ?? null,
              description: p118
            }
          },
          { idParam: 128, codeParam: 'P117', reponse: { idReponse: 4024, description: '' } }
    ];
  }

constructor(
    private devisService:         DevisService,
    private packService:          PackService,
    private agenceService:        AgenceService,
    private genericService:       GenericService,
    private paramRisqueService:   ParamRisqueService,
    private cryptoService:        CryptoService,
    private dureeService:         DureeService,
    private formBuilder:          FormBuilder,
    private dialog:               MatDialog,
    private appComponent: AppComponent
  ) { }

  ngOnInit() {

    localStorage.removeItem('errorCode');
    localStorage.removeItem('messageError');
    localStorage.removeItem('orderId');

    this.appComponent.getKey();

    this.today = moment(this.now).format('YYYY-MM-DD');
    this.maxDate = moment(this.now).add(181, 'days').format('YYYY-MM-DD');
    this.minDate = this.today;

    this.maxDateNaissance = this.today;
    this.minDateNaissance = moment(this.now).subtract(120, 'years').format('YYYY-MM-DD');


      const now = moment();                     // moment() = aujourd’hui
      this.maxDateNaissance = now
        .subtract(18, 'years')                  // ↙ aujourd’hui – 18 ans
        .format('YYYY-MM-DD');                  // format attendu par <input type="date">

      this.minDateNaissance = now
        .subtract(120, 'years')                 // ↙ aujourd’hui – 120 ans
        .format('YYYY-MM-DD');

    this.formInfoAssure = this.formBuilder.group({
      typePersonne  : ['physique'],
      nom           : ['', [
                        Validators.required,
                        Validators.maxLength(50),
                        CV.personName,
                        CV.trimmed
                      ]],
      prenom        : ['', [
                        Validators.required,
                        Validators.maxLength(50),
                        CV.personName,
                        CV.trimmed
                      ]],
      dateNaissance : ['', [
                        Validators.required,
                        CV.notInFuture(),
                        CV.ageBetween(18, 120)      // 18 ≤ âge ≤ 120
                      ]],
      tel           : ['', [
                        Validators.required,
                        CV.mobileDz
                      ]],
      email         : ['', [
                        Validators.required,
                        Validators.email,
                        Validators.pattern(Patterns.email)
                      ]],
      agence        : ['', Validators.required],
      duree         : [''],
      formule       : ['F01', Validators.required]
    });

    this.formPackGaranties = this.formBuilder.group({

      franchiseFormArray: this.formBuilder.array([]),
    });

    this.formParamRisqueDevis = this.formBuilder.group({
      P116: [
        '',
        [
          Validators.required,
          CV.minValue(1),
          Validators.max(10000000)
        ]
      ],
      P118: ['', Validators.required],
      P125: ['', Validators.required],
      P126: ['', Validators.required],
      captcha: ['', Validators.required]
    });

    this.codeProduit = '96';
    this.produit     = 'MRH';
    this.devis.list=[];
    this.devis.groupes = [];
    this.auditUser   = 'latif';

  setTimeout(() => {
    this.getProductId();
    this.getAgenceAll();
    this.loadWilayas();
  }, 2000);

    this.getDureeByProduit(this.idProduit);
    this.loadWilayas(); 

    this.formListParamRisque = this.formBuilder.group({});
    let garantiesResume: any = []
    let formule = {}
    let franchise = {}
    let plafond = {}
    let taux={}
  }

  ngAfterViewInit(): void {
    if ((window as any).HSStaticMethods && typeof (window as any).HSStaticMethods.autoInit === 'function') {
      (window as any).HSStaticMethods.autoInit();
    }
  }

  getWilayas() {
    this.genericService.getAllWilayas(this.idPays).subscribe({
      next: (data: any) => {

        this.wilayas = data

      },
      error: (error) => {

        

      }
    });
  }

  getCommune(idWilaya: any) {
    this.genericService.getAllCommuneByWilaya(idWilaya).subscribe({
      next: (data: any) => {
        this.communes = data
      },
      error: (error) => {
        
      }
    });
  }

  getControl(index: number, controlName: string): FormControl {
    this.actualControlGarantie = index
    return (this.formPackGaranties.at(index) as FormGroup).get(controlName) as FormControl;
  }
  getSousGarantieControl(index: number, controlName: string): FormControl {

    let mainFormGroup = this.formPackGaranties.at(this.actualControlGarantie) as FormGroup;
    let souGarantieArray = mainFormGroup.get('souGarantieArray') as FormArray;

    return (souGarantieArray.at(index) as FormGroup).get(controlName) as FormControl;
  }

  private handleError(err: any) {
  console.error(err);
  //Swal.fire('Erreur serveur', '', 'error');
  }

  getListParamRisque(idListParam: any, idGarantie: any) {
 
    this.paramRisqueService.getListParamRisque(idListParam).subscribe((detailRisqueList: ParamRisque[]) => {

      this.listParamRisque = []
      this.displayedColumnsListParamRisque = []
      this.idsListParams = []
      this.codesListParams = []
      this.formListParamRisque = this.formBuilder.group({});
      detailRisqueList.map((detail: any) => {
        this.idListParamList = detail.idListParamRisque.idListParamRisque;

        this.listParamRisque.push(this.paraRisqueType.find((param: any) => param.idParamRisque == detail.idParamRisqueFils.idParamRisque))

      })

      this.listParamRisque.map((paramRisque: any) => {
        if (paramRisque.sizeChamp != 0 && paramRisque.sizeChamp != null)
          this.formListParamRisque.addControl(paramRisque.formName, new FormControl(paramRisque.defaultValue, [Validators.required, Validators.minLength(paramRisque.sizeChamp), Validators.maxLength(paramRisque.sizeChamp)]));
        else
          if (paramRisque.obligatoire)
            this.formListParamRisque.addControl(paramRisque.formName, new FormControl(paramRisque.defaultValue, [Validators.required]));
          else
            this.formListParamRisque.addControl(paramRisque.formName, new FormControl(paramRisque.defaultValue, [Validators.required]));

        if (paramRisque.typeChamp.code == "L08" && paramRisque.paramRisqueParent == null) {
          //EXP EN ATTENTE NOM TABLE EN RETOUR 
          this.paramRisqueService.getTableParamParent(paramRisque.idParamRisque).subscribe({
            next: (data: any) => {
              if (paramRisque.codeParam == "P279")
                paramRisque.reponses = data.filter((activite: any) => activite.is_professionnel == true)
              else
                paramRisque.reponses = data
            },
            error: (error) => {

              

            }
          })
        }

        this.displayedColumnsListParamRisque.push(paramRisque.formName);
        this.idsListParams.push(paramRisque.idParamRisque);
        this.codesListParams.push(paramRisque.codeParam);

      })

      this.lengthColumnsListParamRisque = this.displayedColumnsListParamRisque.length
      this.openDialogList(idGarantie)

    })
  }

  private readonly STEP_WIDTH = [30, 70, 100];
  get progressWidth(): number {
    return this.STEP_WIDTH[this.currentStep] ?? 0;
  }

  checkGarantie(row: any, value: any) {
    this.tarifReady = false
    this.selection.toggle(row);
    if (value.checked && row.codeGarantie == "G50") {
      this.getListParamRisque(row.sousGarantieList.data.find((sg: any) => sg.codeSousGarantie == "SG91").idListParamRisque, row.sousGarantieList.data.find((sg: any) => sg.codeSousGarantie == "SG91").idSousGarantie)
    }
  }

  getDictionnaire() {
    this.genericService.getDictionnaire().subscribe((data: any) => {
      sessionStorage.setItem("dictionnaire", JSON.stringify(data))
      this.getRoles();
      this.getCanals();
    })
  }

  get communesFiltres() {
    return this.tableauxParCategorie
            .find((p:any) => p.codeParam === 'P126')?.reponses ?? [];
  }

  get qualitesAssure() {
    return this.tableauxParCategorie
            .find((p:any) => p.codeParam === 'P117')?.reponses ?? [];
  }

  onRecaptchaResponse(token: any) {
    this.token = token;
  }

  onRecaptchaResponseDevis(token: any) {
    this.tokenDevis = token;
  }

  getRoles() {
    this.genericService.getParam(JSON.parse(sessionStorage.getItem('dictionnaire') || '{}').find((parametre: any) => parametre.code == "C33").idCategorie).subscribe({
      next: (data: any) => {
        this.roles = data
      },
      error: (error: any) => {
      }
    });
  }

  getCanals() {
    this.genericService.getParam(JSON.parse(sessionStorage.getItem('dictionnaire') || '{}').find((parametre: any) => parametre.code == "C22").idCategorie).subscribe({
      next: (data: any) => {
        this.canals = data
      },
      error: (error: any) => {
      }
    });
  }

  newDevis() {
    window.location.href ='/mrh'
  }

  changeAgence(event: any) {
      // Récupère l'identifiant de l'agence sélectionnée dans la liste déroulante,
      // et le force en string pour éviter les soucis de type.
      const idAgence = event.target.value + ''; // On force string pour la robustesse

      // Met à jour la valeur du champ 'agence' dans le FormGroup principal du formulaire.
      // Ceci assure que le formulaire connaît la valeur sélectionnée.
      const agenceCtrl = this.formInfoAssure.get('agence');
      if (agenceCtrl) {
        const agenceCtrl = this.formInfoAssure.get('agence');
      }
      // On met à jour la valeur du champ (sécurité)

      // Affiche dans la console la valeur sélectionnée (pour debug, peut être supprimé en prod).

      // Appelle le service qui récupère les détails de l'agence à partir de son identifiant.
      this.agenceService.getAgenceById(idAgence).subscribe({
        // Callback si la requête réussit
        next: (data: any) => {
          // Stocke les données de l'agence dans la variable dédiée pour affichage ou logique métier
          this.agenceSelected = data;

          // Cherche dans la liste des contacts le contact de type "email"
          // et stocke sa valeur dans agenceSelected.email
          this.agenceSelected.email =
            data?.idPersonneMorale?.contactList?.find(
              (c: any) => c.typeContact.description == "email"
            )?.description;

          // Cherche le contact de type 'mobile', le préfixe d'un "0" pour le format local,
          // et stocke dans agenceSelected.tel
          this.agenceSelected.tel =
            "0" +
            data?.idPersonneMorale?.contactList?.find(
              (c: any) => c.typeContact.description == 'mobile'
            )?.description;

          // Prend la première adresse dans la liste des adresses
          // et la stocke dans agenceSelected.adresse
          this.agenceSelected.adresse =
            data?.idPersonneMorale?.adressesList[0]?.description;

          // Log des données récupérées pour vérification (debug)
        },
        // Callback en cas d'erreur lors de la requête HTTP
        error: (error) => {
        }
      });
  }

  getProductId() {
    this.genericService.getAllProduit().subscribe({
      next: (data: any) => {
        this.idProduit = data.find((d: any) => d.codeProduit == this.codeProduit).idProduit;
      },
      error: (error) => {
      }
    }); 
  }

    getDureeByProduit(idProduit:any) {
    this.dureeService.getDureeByIdProduit(idProduit).subscribe({
      next: (data: any) => {
        this.duree = data
      },
      error: (error) => {

        

      }
    });
  }

  getAgenceAll() {
    this.agenceService.getAllAgence().subscribe({
      next: (data: any) => {
        this.agences = data

        this.agenceUser = this.agences.find((a: any) => a.nomAgence == sessionStorage.getItem("agence")?.replaceAll('"',''))
        this.agenceService.getAgenceById(this.agenceUser?.idAgence).subscribe({
          next: (data: any) => {
            this.agenceUser.tel = "0"+data?.idPersonneMorale?.contactList?.find((c:any) => c.typeContact.description == 'mobile').description
            this.agenceUser.adresse = data?.idPersonneMorale?.adressesList[0].description
          },
          error: (error) => {
            
          }
        });
      },
      error: (error) => {
        
      }
    }); 
  }

  async changeInputParam(id: string) {
    const elt  = document.getElementById(id);
    const ctrl = this.formParamRisqueDevis.get(id);
    if (!elt || !ctrl) { return; }

    if (ctrl.invalid) {
      elt.classList.remove(
        'border',
        'border-primary-400',
        'focus:border-primary-400',
        'focus:ring-primary-400',
        'focus:ring-primary-200'
      );
      elt.classList.add(
        'border-danger',
        'focus:border-danger',
        'focus:ring-danger'
      );

    }
    else {
      elt.classList.remove(
        'border-danger', 'focus:border-danger', 'focus:ring-danger',
        'border-primary-400','focus:border-primary-400','focus:ring-primary-200'
      );
      // remets simplement la bordure neutre
      elt.classList.add('border');              // ou 'border-gray-300'
    }

  }

  changeInput(id: string) {
    const elt  = document.getElementById(id);
    const ctrl = this.formInfoAssure.get(id);
    if (!elt || !ctrl) { return; }

    /* on retire systématiquement ce qui pourrait traîner */
    elt.classList.remove(
      'border-danger', 'focus:border-danger', 'focus:ring-danger'
    );

    /* on remet la bordure grise (par sécurité) */
    elt.classList.add('border');

    /* puis on applique le rouge si invalide */
    if (ctrl.invalid) {
      elt.classList.add('border-danger', 'focus:border-danger', 'focus:ring-danger');
    }
  }

  /** validateurs métier propres au produit MRH */
  private readonly MRH_VALIDATORS: { [code: string]: ValidatorFn[] } = {
    P116: [Validators.required, Validators.min(1)],
    P118: [Validators.required] // ou la règle que tu veux
  };

  /* ===========================================================================
  * 1. getPack()  – charge le pack, construit le tableau ET lance le remplissage
  * =========================================================================== */
  getPack(): void {

    /* ─ 1. Réinitialisation de l’état local ──────────────────────────────── */
    this.tarifReady         = false;
    this.loadTable          = false;
    this.calculReady        = false;
    this.errorHandler.error = false;
    this.errorHandler.msg   = '';
    this.idPack             = 9;          // pack MRH fixe

    /* ─ 2. Appel API pack --------------------------------------------------- */
    this.packService.getPackById(this.idPack).subscribe({
      next: (data: any) => {

        /* ─ 2-a. Préparation des structures -------------------------------- */
        this.acctuelPack   = data;
        this.devis.pack    = this.idPack;

        this.garantieAll   = data.garantie ?? [];
        this.garantiesNew  = this.garantieAll;
        this.garantieTab   = [];
        this.displayedColumns            = ['select','garantie','plafond','franchise','formule','action','sousGarantie'];
        this.DisplayedColumnsSousGarantie= ['select','garantie','plafond','franchise','formule','action','more'];

        let hasPlafond = false, hasFranchise = false, hasFormule = false, hasSousGarantie = false;

        /* ─ 2-b. Parcours des garanties ------------------------------------ */
        for (const g of this.garantieAll) {

          const catPlafond:any[] = [], catFranchise:any[] = [], catFormule:any[] = [];

          /* Sous-garanties -------------------------------------------------- */
          const sousTab:any[] = [];
          for (const sg of g.sousGarantieList ?? []) {

            const sgPlafond:any[] = [], sgFranchise:any[] = [], sgFormule:any[] = [];
            for (const cat of sg.categorieList) {
              switch (cat.description) {
                case 'plafond'   : sgPlafond  .push(cat); hasPlafond   = true; break;
                case 'formule'   : sgFormule  .push(cat); hasFormule   = true; break;
                case 'franchise' : sgFranchise.push(cat); hasFranchise = true; break;
              }
            }

            sousTab.push({
              idSousGarantie   : sg.idSousGarantie,
              codeSousGarantie : sg.codeSousGarantie,
              idPackComplet    : sg.idPackComplet,
              idListParamRisque: sg.idListParamRisque,
              description      : sg.description,
              obligatoire      : sg.obligatoire,
              prime            : '',
              plafond          : sgPlafond,
              franchise        : sgFranchise,
              formule          : sgFormule,
              valeur           : sg.valeurGarantie
            });
            hasSousGarantie = true;
          }

          /* Catégories de la garantie racine -------------------------------- */
          for (const cat of g.categorieList) {
            switch (cat.description) {
              case 'plafond'   : catPlafond  .push(cat); hasPlafond   = true; break;
              case 'formule'   : catFormule  .push(cat); hasFormule   = true; break;
              case 'franchise' : catFranchise.push(cat); hasFranchise = true; break;
            }
          }

          /* Push garantie dans le tableau ----------------------------------- */
          this.garantieTab.push({
            idGarantie       : g.idGarantie,
            idPackComplet    : g.idPackComplet,
            codeGarantie     : g.codeGarantie,
            idListParamRisque: g.idListParamRisque,
            description      : g.description,
            obligatoire      : g.obligatoire,
            prime            : '',
            plafond          : catPlafond,
            franchise        : catFranchise,
            formule          : catFormule,
            sousGarantieList : new MatTableDataSource(sousTab)
          });
        }

        /* ─ 2-c. Retrait des colonnes inutiles ------------------------------ */
        const drop = (col:string) => {
          this.displayedColumns             = this.displayedColumns.filter(c => c!==col);
          this.DisplayedColumnsSousGarantie = this.DisplayedColumnsSousGarantie.filter(c => c!==col);
        };
        if (!hasPlafond)      drop('plafond');
        if (!hasFormule)      drop('formule');
        if (!hasFranchise)    drop('franchise');
        if (!hasSousGarantie) drop('sousGarantie');

        /* ─ 2-d. Datasource + FormArray ------------------------------------ */
        this.garantieTab.sort((a,b) => Number(b.obligatoire) - Number(a.obligatoire));
        this.dataSource = new MatTableDataSource(this.garantieTab);

        this.formPackGaranties = new FormArray(
          this.garantieTab.map(g => new FormGroup({

            idPackComplet : new FormControl(g.idPackComplet),

            franchise     : new FormControl(),
            idfranchise   : new FormControl({ value: g.franchise, disabled: true }),

            plafond       : new FormControl(),
            idplafond     : new FormControl({ value: g.plafond  , disabled: true }),

            formule       : new FormControl(),
            idformule     : new FormControl({ value: g.formule  , disabled: true }),

            checked       : new FormControl({ value: g.obligatoire, disabled: g.obligatoire }),

            souGarantieArray: new FormArray(
              (g.sousGarantieList.data as any[]).map(sg => new FormGroup({

                idPackComplet : new FormControl(sg.idPackComplet),

                franchise     : new FormControl(),
                idfranchise   : new FormControl({ value: sg.franchise, disabled: true }),

                plafond       : new FormControl(),
                idplafond     : new FormControl({ value: sg.plafond  , disabled: true }),

                formule       : new FormControl(),
                idformule     : new FormControl({ value: sg.formule  , disabled: true }),

                checked       : new FormControl({ value: sg.obligatoire, disabled: sg.obligatoire }),

                valeur        : new FormControl(sg.valeur ?? '')
              }))
            )
          }))
        );

        /* ─ 2-e.  Flags UI -------------------------------------------------- */
        this.loadTable   = true;
        this.tarifReady  = true;
        this.calculReady = true;

        /* ─ 2-f.  Pré-remplissage plafonds (capital / terrasse) ------------ */
        const p116 = this.formParamRisqueDevis.get('P116')?.value ?? '';
        const p118 = (this.formParamRisqueDevis.get('P118')?.value ?? '');

        this.devis.groupes[0].groupeList[0].risque.paramList = this.buildParamList();
        this.devis.groupes[0].groupeList[0].risque.packCompletList = [];
        this.devis.groupes[0].groupeList[0].risque.primeList       = [];
        this.devis.groupes[0].groupeList[0].risque.taxeList        = [];

        /* Lance le remplissage automatique des plafonds si demandé ---------- */
        this.objectDevis(true);
      },

      error: err => {
        this.errorHandler = { error:true, msg:'Erreur de récupération du pack' };
        console.error('[MRH] getPack', err);
      }
    });
  }

  private getPackCompletList(): any[] {
    const list: any[] = [];
    this.garantieTab.forEach((garantie: any) => {
      const categorieList = garantie.plafond.map((p: any) => ({
        idCategoriePackComplet: p.idParamPackComplet,
        valeur: p.valeur,
        sousCategorieList: {
          idSousCategoriePackComplet: p.idParamPackComplet,
          valeur: p.valeur
        }
      }));

      list.push({
        idPackComplet: garantie.idPackComplet,
        prime: '',
        categorieList
      });
    });
    return list;
  }

  /** Remplit les plafonds du devis MRH (pack fixe id = 9) */
  remplissageTarif(): void {
        // Étape 1 : Mise à jour des données du devis
    this.devis.groupes[0].description = 'mono'; // à remplacer : "Habitation" => "mono"

    // [✅] Met à jour le packCompletList avec les garanties choisies
    this.devis.groupes[0].groupeList[0].risque.packCompletList = this.getPackCompletList(); // à créer

    // Étape 2 : Informations de l’assuré (extraites du formulaire formInfoAssure)
    this.devis.nom        = this.formInfoAssure.get('nom')?.value ?? '';
    this.devis.prenom     = this.formInfoAssure.get('prenom')?.value ?? '';
    this.devis.email      = this.formInfoAssure.get('email')?.value ?? '';
    this.devis.telephone  = this.formInfoAssure.get('tel')?.value ?? '';
    this.devis.dateAssure = moment(this.formInfoAssure.get('dateNaissance')?.value).format('YYYY-MM-DD[T]HH:mm:ss.SSSZ');
    this.devis.agence     = this.formInfoAssure.get('agence')?.value ?? 0;
    this.devis.duree = 3;
    this.devis.statue = 0;
    this.devis.auditUser  = this.auditUser ?? 'latif';
    // Étape 3 : Paramètres fixes ou calculés
    this.devis.auditUser  = '';
    this.devis.typeClient = 106;
    this.devis.pack       = 9;
    this.devis.produit    = 3;
    this.devis.raisonSocial = '';
    this.devis.canal      = 0;
    this.devis.list       = [];
    this.devis.duree = Number(3);
    const capital = Number(this.formParamRisqueDevis.get('P116')?.value ?? 0);
    const p116 = this.formParamRisqueDevis.get('P116')?.value ?? '';
    const p118 = (this.formParamRisqueDevis.get('P118')?.value ?? '');

    if(capital>10000000) {
      this.devis.statue = 1;
    }

      this.devis.groupes[0].groupeList[0].risque.paramList = this.buildParamList();

      this.devisService.remplissageDevis(this.devis).subscribe({
        next: (data: any) => {
          /* accès rapide au tableau des catégories renvoyées par l’API */
          const catByPack = new Map<number, any[]>();
          data.groupes?.[0]?.groupeList?.[0]?.risque?.packCompletList
            ?.forEach((pc: any) => catByPack.set(pc.idPackComplet, pc.categorieList));

          /* Parcours de chaque garantie locale */
          for (const g of this.garantieTab) {
            g.prime = null;                              // reset

            /* mise à jour des plafonds de la garantie */
            const catMain = catByPack.get(g.idPackComplet) ?? [];
            g.plafond.forEach((p: any) => {
              catMain.forEach((c: any) => {
                if (p.idParamPackComplet === c.idCategoriePackComplet) {
                  p.valeur = c.valeur;
                }
              });
            });

            /* sous-garanties */
            (g.sousGarantieList?.data as any[]).forEach(sg => {
              const catSous = catByPack.get(sg.idPackComplet) ?? [];
              sg.plafond.forEach((p: any) => {
                catSous.forEach((c: any) => {
                  if (p.idParamPackComplet === c.idCategoriePackComplet) {
                    p.valeur = c.valeur;
                  }
                });
            });
            });
          }
        },
        error: err => console.error('[MRH] remplissageTarif', err)
      });
  }

  gestionErreurPack(idPackComplet: any, typeCategory: any, typeGarantieForm: any, withRemplissage: boolean) {
    if (!withRemplissage)
      typeGarantieForm.controls.forEach((garantie: FormGroup) => {
        if (garantie.value.idPackComplet == idPackComplet) {
          if (
            (typeCategory == "formule" && garantie.value.formule == null) ||
            (typeCategory == "plafond" && garantie.value.plafond == null) ||
            (typeCategory == "franchise" && garantie.value.franchise == null)
          ) {

            this.errorPackForm = true;
          }
        }
      });
  }

// /* --------------------------------------------------------------------------
//  *  OUVERTURE DU DIALOG  – UNIQUEMENT MRH (idProduit = 96)
//  * -------------------------------------------------------------------------- */
  openDialogList(idGarantie: number): void {

    const dialogRef = this.dialog.open(ListRisqueDialogComponent, {
      width: '60%',
      data: {
        displayedColumnsListParamRisque : this.displayedColumnsListParamRisque,
        idListParamList                 : this.idListParamList,
        listParamRisque                 : this.listParamRisque,
        formListParamRisque             : this.formListParamRisque,
        garantie                        : this.garantieAll.find(g => g.idGarantie === idGarantie),
        dataSourceListParamRisque       : this.dataSourceListParamRisque,
        numberEffective                 : this.formParamRisqueDevis.get('Effectif')?.value
      }
    });
  }

  async submitParamRisque(): Promise<void> {

    /* ------------------------------------------------------------------ */
    /* 2.  Construction **figée** du paramList                            */
    /* ------------------------------------------------------------------ */
    if (this.devisGroupe.length && this.devisGroupe[0].groupeList.length) {
      this.devisGroupe[0].groupeList = [];   // on vide la liste
      this.risqueIndexBody = 0;              // on remet l’index à 0
    }
    const capital   = this.formParamRisqueDevis.get('P116')?.value ?? '';
    const terrasse  = this.formParamRisqueDevis.get('P118')?.value ?? '';

    const p116 = this.formParamRisqueDevis.get('P116')?.value ?? '';
    const p118 = (this.formParamRisqueDevis.get('P118')?.value ?? '');

    const paramList = this.buildParamList();

    /*  payload à envoyer au service de contrôle métier ----------------- */
    const controleDevisPayload = paramList.map(p => ({
      idParam   : p.idParam,
      codeParam : p.codeParam,
      valeur    : p.reponse.description
    }));

    /* ------------------------------------------------------------------ */
    /* 3.  Création du risque et insertion dans le groupe                 */
    /* ------------------------------------------------------------------ */
    const risque = {
      paramList,
      packCompletList: [],   // rempli plus tard par objectDevis()
      primeList     : [],
      taxeList      : []
    };

    if (this.devisGroupe.length === 0) {
      this.devisGroupe.push({
        description: 'Habitation',
        idPack     : this.idPack,
        groupeList : []
      });
    }

    this.risqueIndexBody += 1;
    this.devisGroupe[0].groupeList.push({
      numRisque: this.risqueIndexBody,
      risque
    });

    this.devis.groupes = this.devisGroupe;

    /* 4. Injection du pack complet et éventuel pré-remplissage --------- */
    this.objectDevis(false);

    /* ------------------------------------------------------------------ */
    /* 5.  Contrôle métier (bloquant / warning)                           */
    /* ------------------------------------------------------------------ */
    this.loaderControles = true;

    this.devisService
        .controleDevis([controleDevisPayload], this.codeProduit)
        .subscribe({
          next: data => {
            this.loaderControles = false;

            const reponses  = data[0] as any[];
            const bloquant  = reponses.find(r => r.bloquant);
            const warnings  = reponses.filter(r => !r.bloquant && r.message);

            /* bloque si erreur bloquante -------------------------------- */
            if (bloquant) {
              //Swal.fire(bloquant.message, '', 'error');
              return;
            }

            /* affiche le 1ᵉʳ warning éventuel --------------------------- */
            if (warnings.length) {
              //Swal.fire(warnings[0].message, '', 'warning');
            }

            /* si tout est OK on revient au composant appelant ---------- */
          },
          error: err => {
            this.loaderControles = false;
            this.handleError(err);
          }
        });
  }

  /** Construit packCompletList à partir des cases cochées */
  private objectDevis(withRemplissage: boolean): void {

    if (!this.devis.groupes?.length || !this.devis.groupes[0].groupeList?.length) {
      return;
    }

    const packCompletList: any[] = [];

    /* ⚠️  on parcourt garantieTab **dans le même ordre** que formPackGaranties */
    this.garantieTab.forEach((garantie, idx) => {
      const gForm = this.formPackGaranties.at(idx) as FormGroup;
      if (!gForm) { return; }

      /* ───────── 1.  GARANTIE PRINCIPALE  ───────── */
      const gChecked = gForm.get('checked')?.value === true;

      // On ignore la garantie si elle n’est pas obligatoire **et** non cochée
      if (!garantie.obligatoire && !gChecked) {
        return;
      }

      /* constr. des catégories (plafond, franchise, …) ► inchangé             */
      const categorieList = this.buildCategorieList(gForm, withRemplissage);

      packCompletList.push({
        idPackComplet: garantie.idPackComplet,
        prime        : '',
        categorieList
      });

      /* ───────── 2.  SOUS-GARANTIES COCHÉES  ───────── */
      const sgArray = gForm.get('souGarantieArray') as FormArray;
      (garantie.sousGarantieList.data as any[]).forEach((sg, sgIdx) => {
        const sgForm = sgArray.at(sgIdx) as FormGroup;
        const sgChecked = sgForm.get('checked')?.value === true;

        if (!sg.obligatoire && !sgChecked) { return; }   // skip non cochée

        const catListSG = this.buildCategorieList(sgForm, withRemplissage);

        packCompletList.push({
          idPackComplet: sg.idPackComplet,
          prime        : '',
          categorieList: catListSG
        });
      });
    });

    /* injecte le résultat dans chaque risque */
    this.devis.groupes[0].groupeList.forEach((grp:any) => {
      grp.risque.packCompletList = packCompletList;
      grp.risque.primeList       = [];
      grp.risque.taxeList        = [];
    });

    /* remplissage automatique éventuel */
    if (withRemplissage) { this.remplissageTarif(); }
  }

  /* Petit helper factorisé : lit les 2 FormControl idXXX / XXX */
  private buildCategorieList(ctrlGrp: FormGroup, withRemplissage: boolean) {
    const categories:any[] = [];

    ['plafond','franchise','formule','taux'].forEach(key => {     // ajoute « taux » si besoin
      const idCtrl  = ctrlGrp.get(`id${key}` );
      const valCtrl = ctrlGrp.get(key);
      if (!idCtrl || !valCtrl || !idCtrl.value?.length) { return; }

      const meta      = idCtrl.value[0];
      const valeur    = valCtrl.value ?? meta.valeur;

      categories.push({
        idCategoriePackComplet : meta.idParamPackComplet,
        valeur                 : withRemplissage ? null : valeur,
        sousCategorieList      : meta.sousCategorieList?.length
          ? {
              idSousCategoriePackComplet : meta.sousCategorieList[0].idParamSCPackComplet,
              valeur                     : withRemplissage ? null : valeur
            }
          : null
      });
    });

    return categories;
  }

  //   consultRisque(idRisque: any, idGroupe: any) {
  //   //EXP call get param risque by devis, groupe & id risque
  //   this.devisService.getParamDevisByIdRisque(this.devisOutput.idDevis, idGroupe, idRisque).subscribe({
  //     next: async (dataParam: any) => {
  //       this.devisOutput.risqueList = await Object.values(dataParam)

  //         //EXP call get pack/garanties risque by devis, groupe & id risque
  //         await this.devisService.getPackIdRisque(this.devisOutput.idDevis, idRisque).subscribe({
  //           next: async (dataPack: any) => {
  //             this.devisOutput.paramDevisList = dataPack.garantieList
  //             this.devisOutput.pack = dataPack.pack

  //             await this.devisService.generatePdf(this.devisOutput)
  //           },
  //           error: (error: any) => {
  //             
  //           }
  //         });

  //     },
  //     error: (error: any) => {
  //       
  //     }
  //   });

  // }

  // downloadDevis(devis: any) {
  //   this.devisService.getDevisById(devis.idDevis).subscribe({
  //     next: (datas: any) => {
  //       this.devisOutput = datas;
  //       this.consultRisque(datas.groupes[0].risques[0].idRisque, datas.groupes[0].idGroupe)

  //     }, error: (error: any) => {
  //       this.handleError(error)

  //     }
  //   });
  // }

  /* ------------------------------------------------------------------
  *  Calcul tarif MRH – version API « pack complet »
  * ------------------------------------------------------------------ */
  async generateCalcul(): Promise<void> {

    const token = this.tkn
      || localStorage.getItem('token')
      || JSON.parse(sessionStorage.getItem('access_token') || '{}')?.access_token;

    if (!token) {
      //Swal.fire('Session expirée – veuillez vous reconnecter.', '', 'error');
      return;
    }

    this.objectDevis(false);

    // Mise à jour dynamique des plafonds (logique spécifique MRH mono)
    if (this.devis.groupes.length > 0 && this.devis.groupes[0].groupeList.length > 0) {
      for (let j = 0; j < this.devis.groupes[0].groupeList[0].risque.packCompletList.length; j++) {
        const pack = this.devis.groupes[0].groupeList[0].risque.packCompletList[j];

        for (let i = 0; i < this.devis.groupes[0].groupeList[0].risque.paramList.length; i++) {
          const param = this.devis.groupes[0].groupeList[0].risque.paramList[i];

          this.garantiesNew.forEach((garantie: any) => {
            garantie.categorieList.forEach((code: any) => {
              if (code.code === 'C7' && garantie.paramRisquePlafond?.idParamRisque === param.idParam) {
                pack.categorieList.forEach((categorie: any) => {
                  if (categorie.idCategoriePackComplet === code.idParamPackComplet) {
                    categorie.valeur = param.reponse.description;
                  }
                });
              }
            });
          });
        }
      }
    }

    const listElement = this.devis.list.find((el: any) => el.idListParamRisque === 1);
    if (listElement) {
      listElement.idGarantie = 87;
    }

    if (!this.errorPackForm) {
      this._tarifInFlight = true;
      this.loaderTarif = true;

      this.devis.idReduction = 0;
      this.devis.idConvention= 0;
      this.devis.canal       = 99;
      this.devis.auditUser=1102;

      const payload = {
        stringJson: JSON.stringify(this.devis),
        signature: await this.cryptoService.generateHmac(token, this.devis),
        auditUser: this.auditUser || 'latif'
      };

      this.devisService.generateTarif(payload).subscribe({
        next: (resp:any) => {
          this._tarifInFlight = false;
          this.loaderTarif = false;
          this.returnedTarif = resp.tarificationResponse;
          this.uid=resp.uid;
          this.basicTarif = resp.tarificationResponse;
          this.tarifReady = true;
          this.loaderDevis = false;
          this.garantieNull = false;

          this.valAss = resp.tarificationResponse.groupes[0]?.groupeList[0]?.risque?.paramList.find((p: any) => p.codeParam === "P152")?.reponse?.description;

          this.garantieTab.forEach((garantie: any) => {
            const garantieData = resp.tarificationResponse.groupes[0].groupeList[0].risque.packCompletList.find((gData: any) => garantie.idPackComplet === gData.idPackComplet);

            if (garantieData) {
              garantie.prime = garantieData.prime;
              garantie.sousGarantieList?.data?.forEach((sg: any) => {
                const sgData = resp.tarificationResponse.groupes[0].groupeList[0].risque.packCompletList.find((sData: any) => sg.idPackComplet === sData.idPackComplet);
                if (sgData) {
                  sg.prime = sgData.prime;
                  sgData.categorieList.forEach((categorie: any) => {
                    ['formule', 'franchise', 'plafond', 'taux'].forEach((type: string) => {
                      const item = sg[type]?.find((cat: any) => cat.idParamPackComplet === categorie.idCategoriePackComplet);
                      if (item) {
                        item.valeur = categorie.valeur;
                      }
                    });
                  });
                }
              });
            }
          });

          this.PrimeTotale = resp.tarificationResponse.primeList.find((prime: any) => prime.description === 'Prime nette')?.prime;
          this.dataSource = new MatTableDataSource(this.garantieTab);
          this.submitDevis();
        },
        error: err => {
          this._tarifInFlight = false;
          this.loaderTarif = false;
          this.handleError(err);
        }
      });
    }
  }

  /* --------------------------------------------------------------------------
  *  UTILITAIRES (extraits)                                                 */
  private buildReponse(key: string, cell: any) {
    const conf = this.listParamRisque.find(p => p.formName === key);
    /* Liste de valeurs --------------------------------------------------- */
    if (conf?.typeChamp?.description === 'Liste of values') {
      return { idReponse: cell.idParam, description: cell.code };
    }
    /* Table externe ------------------------------------------------------ */
    if (conf?.typeChamp?.description === 'From Table') {
      return { idReponse: null, description: cell.code };
    }
    /* Champs simples (texte/nombre/date) --------------------------------- */
    return { idReponse: null, description: String(cell) };
  }

  mapPrimesRetour(data: any): void {
    const primeList = data?.primeList ?? [];

    const primeNette = primeList.find((p: any) => p.description === 'Prime nette');
    this.PrimeTotale = primeNette ? primeNette.prime : 0;

    if (data?.groupes?.[0]?.groupeList?.[0]?.risque?.packCompletList) {
      data.groupes[0].groupeList[0].risque.packCompletList.forEach((src: any) => {
        const dst = this.garantieTab.find(g => g.idPackComplet === src.idPackComplet);
        if (dst) { dst.prime = src.prime; }
        dst?.sousGarantieList?.data.forEach((sg: any) => {
          const sgSrc = data.groupes[0].groupeList[0].risque.packCompletList
                        .find((x: any) => x.idPackComplet === sg.idPackComplet);
          if (sgSrc) { sg.prime = sgSrc.prime; }
        });
      });
    }

    this.dataSource = new MatTableDataSource(this.garantieTab);
  }

  async submitDevis(): Promise<void> {

    /* ───────────────────────── 1. Pré-contrôles ───────────────────────── */
    if (!this.returnedTarif?.primeList?.length) {
      //await Swal.fire('Veuillez d’abord calculer le tarif.', '', 'warning');
      return;
    }

    const rawToken =
          this.tkn
      || localStorage.getItem('token')
      || JSON.parse(sessionStorage.getItem('access_token') || '{}')?.access_token;

    if (!rawToken) {
      //await Swal.fire('Session expirée – veuillez vous reconnecter.', '', 'error');
      return;
    }

    /* ───────────────────────── 2. Préparation payload ──────────────────── */
    const devisToSend = {
      UID: this.uid
    };

    const signature = await this.cryptoService.generateHmac(rawToken, devisToSend);

    const payload = {
      stringJson: JSON.stringify(devisToSend),
      signature
    };

    /* ───────────────────────── 3. Appel API ───────────────────────────── */
    this.loaderDevis        = true;
    this.errorHandler.error = false;

    try {
      /* 3-a. Création du devis */
      const resp  = await firstValueFrom(this.devisService.createDevis(devisToSend));
      const devis = Array.isArray(resp) ? resp[0] : resp;

      this.idDevis       = devis.idDevis;
      this.returnedDevis = devis;
      this.successDevis  = true;

      // await Swal.fire(
      //   `Le devis N° ${this.idDevis} a été créé avec succès.`,
      //   '',
      //   'success'
      // );

      this.downloadDevis(this.returnedDevis)
      this.devisService.mailDevisMrh(this.idDevis, rawToken)
      .subscribe({
        error: err => console.error('mailDevis KO', err)
      });

    } catch (err: any) {
      console.error('[submitDevis] ', err);

      const msg = err?.message ?? 'Erreur serveur, veuillez réessayer plus tard.';
      this.errorHandler = { error: true, msg };

      //await Swal.fire(msg, '', 'error');

    } finally {
      this.loaderDevis = false;                        // toujours ré-initialiser le loader
    }
  }

  /* ------------------------------------------------------------ */
  /*  libellés lisibles + message par défaut (par contrôle)       */
  /* ------------------------------------------------------------ */
  private readonly FIELD_LABELS: Record<string, string> = {
    // ─ formInfoAssure
    nom           : 'Nom',
    prenom        : 'Prénom',
    email         : 'Adresse e-mail',
    tel           : 'Numéro de téléphone',
    dateNaissance : 'Date de naissance',
    agence        : 'Agence',
    // ─ formParamRisqueDevis
    P116          : 'Capital connu',
    P118          : 'Dernier étage'
  };

  /* ------------------------------------------------------------ */
  /*  traduction des erreurs Angular -> phrase compréhensible     */
  /* ------------------------------------------------------------ */
  private errorSentence(ctrlName: string, errors: ValidationErrors): string {
    const label = this.FIELD_LABELS[ctrlName] ?? ctrlName;

    if (errors['required'])            { return `${label} est obligatoire.`; }
    if (errors['email'])               { return `${label} n’est pas valide.`; }
    if (errors['minlength'])           { return `${label} doit contenir au moins ${errors['minlength'].requiredLength} caractères.`; }
    if (errors['maxlength'])           { return `${label} ne doit pas dépasser ${errors['maxlength'].requiredLength} caractères.`; }
    if (errors['min'])                 { return `${label} doit être ≥ ${errors['min'].min}.`; }
    if (errors['notInFuture'])         { return `${label} ne peut pas être dans le futur.`; }
    if (errors['ageBetween'])          { return `${label} doit correspondre à un âge compris entre 18 et 120 ans.`; }
    return `${label} est invalide.`;
  }

  /** contiendra « nom » → "Nom est obligatoire.", etc. */
  errorMessages: Record<string, string> = {};

  /** Renvoie true si un message existe pour ce champ */
  hasError(ctrlName: string): boolean {
    return !!this.errorMessages[ctrlName];
  }

  /** Renvoie le message pour le template */
  getError(ctrlName: string): string {
    return this.errorMessages[ctrlName] ?? '';
  }
  /** Marque tout le sous-arbre “touched”  ➜ affiche les erreurs */
  private touchRecursively(ctrl: AbstractControl): void {
    if (!ctrl) { return; }
    if (ctrl instanceof FormGroup || ctrl instanceof FormArray) {
      Object.values(ctrl.controls).forEach(c => this.touchRecursively(c));
    }
    ctrl.markAsTouched({ onlySelf: true });
  }

  /** Fait défiler la page jusqu’au premier champ invalide */
  private scrollToFirstError(): void {
    setTimeout(() => {
      const firstInvalid = document.querySelector(
        '.ng-invalid[formControlName], .ng-invalid[formArrayName]'
      ) as HTMLElement | null;
      firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalid?.focus();
    }, 0);
  }

  private applyErrorBorders(fg: FormGroup) {
  Object.keys(fg.controls).forEach(key => {
    const ctrl = fg.get(key);
    const elt  = document.getElementById(key);
    if (ctrl?.invalid && elt) {
      elt.classList.add('border-danger','focus:border-danger','focus:ring-danger');
    }
  });
  }


  submitInfos(): void {
    if (this.currentStep !== 0) { return; }

    this.touchRecursively(this.formInfoAssure);
    this.touchRecursively(this.formParamRisqueDevis);

    /* 2. On force la couleur sur les champs invalides */
    this.applyErrorBorders(this.formInfoAssure);
    this.applyErrorBorders(this.formParamRisqueDevis);

    if (this.formInfoAssure.invalid || this.formParamRisqueDevis.invalid) {
      this.scrollToFirstError();
      return;
    }
    const f = this.formInfoAssure.value;

    /* Hydratation de l’objet devis ------------------------------- */
    this.devis = {
      ...this.devis,                     
      typeClient   : 106,
      produit      : this.idProduit,
      agence       : f.agence,
      nom          : f.nom,
      prenom       : f.prenom,
      telephone    : f.tel,
      email        : f.email,
      // ⚠️ on convertit la date de naissance au format ISO
      dateNaissance: moment(f.dateNaissance)
                      .format('YYYY-MM-DD[T]HH:mm:ss.SSSZ'),
      // durée : 3 par défaut si non renseignée
      duree        : f.duree ?? 3,
      formule      : f.formule,
      auditUser    : this.auditUser ?? 'latif'
    };

    /* Paramètres risque de l’étape suivante ---------------------- */
    this.submitParamRisque();

    /* Passe à l’étape Risque : getPack() sera déclenché ensuite */
    this.nextStep();
  }

    downloadDevis(devis: any) {
    this.devisService.getDevisById(devis.idDevis).subscribe({
      next: (datas: any) => {
        this.devisOutput = datas;
        this.consultRisque(datas.groupes[0].risques[0].idRisque, datas.groupes[0].idGroupe)

      }, error: (error: any) => {
        this.handleError(error)

      }
    });
  }

  consultRisque(idRisque: any, idGroupe: any) {
    //EXP call get param risque by devis, groupe & id risque
    this.devisService.getParamDevisByIdRisque(this.devisOutput.idDevis, idGroupe, idRisque).subscribe({
      next: async (dataParam: any) => {
        this.devisOutput.risqueList = await Object.values(dataParam)

        
          //EXP call get pack/garanties risque by devis, groupe & id risque
          await this.devisService.getPackIdRisque(this.devisOutput.idDevis, idRisque).subscribe({
            next: async (dataPack: any) => {
              this.devisOutput.paramDevisList = dataPack.garantieList
              this.devisOutput.pack = dataPack.pack

              await this.devisService.generatePdfMrh(this.devisOutput)
            },
            error: (error: any) => {
              
            }
          });
        
      },
      error: (error: any) => {
        
      }
    });

  }

  emailBorderClasses() {
  const ctrl = this.formInfoAssure.get('email');
  if (!ctrl) return [];

  if (ctrl.touched && ctrl.invalid) return ['border-red-500', 'focus:border-red-500'];
  if (ctrl.touched && ctrl.valid)   return ['border-primary-400', 'focus:border-primary-400'];
  /* état par défaut */
  return ['border', 'focus:border-primary-400'];
}


} //fin classe
