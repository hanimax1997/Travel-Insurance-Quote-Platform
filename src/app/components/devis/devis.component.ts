import { ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray, ValidatorFn, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { Patterns } from '../../core/validators/patterns'
import { HttpClient } from '@angular/common/http';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';

import { HttpHeaders } from '@angular/common/http';
import JSEncrypt from 'jsencrypt';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';

//models
import { ParamRisqueProduit } from '../../core/models/param-risque-produit';
import { returnJson } from '../../core/models/devis';
import { ParamList } from '../../core/models/param-risque-produit';
import { ParamRisque } from '../../core/models/param-risque';

//service
import { GenericService } from '../../core/services/generic.service'
import { ParamRisqueService } from '../../core/services/param-risque.service'
import { DureeService } from '../../core/services/duree.service';
import { PersonneService } from '../../core/services/personne.service';
import { AgenceService } from '../../core/services/agence.service';
import { PackService } from '../../core/services/pack.service';
import { DevisService } from '../../core/services/devis.service';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { ReductionService } from '../../core/services/reduction.service';
import { ConventionService } from '../../core/services/convention.service';
import { ReductionFiltreJson } from '../../core/models/reduction';
import { MatSort } from '@angular/material/sort';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { DialogRisqueComponent } from './dialog-risque/dialog-risque.component';
import { ListRisqueDialogComponent } from './list-risque-dialog/list-risque-dialog.component';
import { VehiculeService } from '../../core/services/vehicule.service';
import { Observable } from 'rxjs';
import { MoneyPipe } from "../../core/pipes/MoneyPipe";
import { CryptoService } from '../../core/services/crypto.service';
import { MatAccordion } from '@angular/material/expansion';

import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // pour support des dates natives (JS)
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material


import { MatCheckboxModule } from '@angular/material/checkbox';
import { Constants } from '../../core/config/constants';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
interface Categorie {
  valeur: string;
}

interface PackComplet {
  idPackComplet: number;
  prime: any;
  categorieList?: Categorie[];
}

export function permisApres18AnsValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const form = control.parent;
    if (!form) return null;

    const dateNaissance = form.get('dateNaissance')?.value;
    const datePermis = control.value;

    if (!dateNaissance || !datePermis) return null;

    const naissance = new Date(dateNaissance);
    const permis = new Date(datePermis);

    const age = permis.getFullYear() - naissance.getFullYear();
    const mois = permis.getMonth() - naissance.getMonth();
    const jour = permis.getDate() - naissance.getDate();

    const ageFinal = (age > 18) || (age === 18 && (mois > 0 || (mois === 0 && jour >= 0)));

    return ageFinal ? null : { permisAvant18ans: true };
  };
}
const todayDate: Date = new Date;
export function ageValidator(control: AbstractControl): ValidationErrors | null {
  const birthday = new Date(control.value);
  const today = new Date();

  // Calcule l'âge en années
  let age = today.getFullYear() - birthday.getFullYear();

  // Ajuste si le mois/jour de l'anniversaire n'est pas encore passé cette année
  const hasHadBirthdayThisYear =
    today.getMonth() > birthday.getMonth() ||
    (today.getMonth() === birthday.getMonth() && today.getDate() >= birthday.getDate());

  if (!hasHadBirthdayThisYear) {
    age--;
  }

  if (age < 18) {
    return { ageInf18: true };
  }

  return null;
}

export function ageSup107Validator(control: AbstractControl): { [key: string]: boolean } | null {
  var birthday: Date = new Date(control.value);

  if ((todayDate.getFullYear() - birthday.getFullYear()) > 106) {
    return {
      'ageSup107': true
    };
  }
  return null;
}

@Component({
  selector: 'app-creation-devis',
  templateUrl: './devis.component.html',
  standalone: true,
  styleUrls: ['./devis.component.scss'],
  imports: [
    RecaptchaModule,
    RecaptchaFormsModule,
    // Angular Core
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    RouterModule, MatTooltipModule,
    // Angular Material
    MatStepperModule,
    MatIconModule,
    MatAccordion,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSortModule,
    MatSnackBarModule,
    MatDialogModule, MatRadioModule,
    MatSelectModule,
    MatOptionModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule, // ou MatMomentDateModule si tu veux Moment
    MatMenuModule,
    MatPaginatorModule,
    MatCheckboxModule,

    // Pipes, directives ou autres composants standalone si nécessaires
    MoneyPipe,
    HeaderComponent,
    FooterComponent
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],

})

export class CreationDevisComponent implements OnInit {
  partnerHash: string = '';
  token: string | null = null;
  error: string | null = null;
  uid: string | null = null;
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;

      if (!exp) return true;

      const now = Math.floor(Date.now() / 1000);
      return exp < now;
    } catch (e) {
      console.error('Token invalide ou non décodable :', e);
      return true;
    }
  }

  dateDelivrance: Date | null = null;
  load: boolean = false;
  loadTable: boolean = false; idDevis!: string;
  actualControlGarantie!: number;
  codeProduit!: string | null;
  basicTarif: any;
  groupArray: any = [];
  @ViewChild('stepper')
  private myStepper!: MatStepper;
  @ViewChild('fileInput')
  fileInput!: ElementRef;
  tooltipText: string = 'La date d’obtention du permis doit être après vos 18 ans.';

  donnees: any = {};

// Pour gérer les info-bulles par codeParam (ex: 'P34', 'P40', ...)
showNumberFieldTooltip: { [param: string]: boolean } = {};

  selectedPacks!: any[];
  selectedSousProduit: any | null = null;
  groupesPacks: any = [];
  isFieldReadOnly: boolean = false;
  PMflotte: any;
  selectedFile: any;
  base64String!: string;
  fileControle: any;
  fileSuccess = false;
  acctuelPack: any;
todayMinus18: string = '';


  indexGarantieMrp = 0
  indexSousGarantieMrp = 0
  valAss: any;
  showTooltip = false;
  showTooltipP28 = false;

  constructor(private http: HttpClient, private vehiculeService: VehiculeService, private dialog: MatDialog, private cd: ChangeDetectorRef, private route: ActivatedRoute, private router: Router, private _snackBar: MatSnackBar,
    private conventionService: ConventionService, private cryptoService: CryptoService,
    private devisService: DevisService,
    private reductionService: ReductionService,
    private packService: PackService, private agencesService: AgenceService,
    private personneService: PersonneService, private dureeService: DureeService,
    private paramRisqueService: ParamRisqueService,
    private genericService: GenericService, private formBuilder: FormBuilder) { }
  displayedColumns: string[] = ['select', 'garantie', 'plafond', 'franchise', 'formule', 'action', 'sousGarantie'];
  originalDisplayedColumns: string[] = ['select', 'garantie', 'plafond', 'franchise', 'formule', 'action', 'sousGarantie'];
  displayedColumnsListOfList: string[] = ['idList', 'description', 'action'];
  displayedColumnsRisque: any[] = [];
  innerColumnsRisque: any[] = [];
  marques: any = [];
  modeles: any = [];
  produitInfo: any = {}
  dataSource = new MatTableDataSource<any>();
  dataSourceSousGarantie = new MatTableDataSource();
  dataSourceListOfListes = new MatTableDataSource();
  selection = new SelectionModel<any>(true, []);
  formInfosAssure: FormGroup | any;
  // formGroupPack: FormGroup | any;
  formParamRisque: FormGroup | any;
  formPackGaranties: FormGroup | any;
  formPackSousGaranties: FormGroup | any;
  formReduction: FormGroup | any;
  tarifReady = false
  errorPackForm = false
  sousGarantieExist = false
  PrimeTotale = 0
  formules: any = []
  plafondSlected: any = []
  franchises: any = []
  idProduit = 0
  loaderControles = false
  idDevisWorkFlow = 45
  valeurVenale: number = 0 // JUSTE TEST
  risqueIndex = 0
  risqueIndexBody = 0
  idPack: number = 0
  returnedDevis: any
  paraRisqueProduit: ParamRisqueProduit[] = [];
  devis: any = {};
  devisGroupe: any = []
  paramList: ParamList[] = []
  paramElement: ParamList = {} as any
  garantieSelected: any = [];
  garantieSelectedIds: any = [];
  sousGarantieSelectedIds: any = [];
  paramProduit!: ParamRisqueProduit;
  garantieTab: any = []
  sousGarantieTab: any = []
  garantieAll: any = []
  conventions: any = []
  communes: any = []
  ines = true
  taillersq!: number;
  // d la
  // wilayas: any = []; je lai retireer psk elle xiste ailleur
  communes_sous: any = [];
  // communes: any = []
  communes_assure: any = [];
  //a la c'est un supp pour ajouter wilaya et cpommune a assurée de catnat
  filterReduction = ReductionFiltreJson
  controleDevis: any = []
  reductions: any = []
  successDevis = false
  saveDevis = true
  loaderTarif = false
  loaderDevis = false
  //FIXME  delete column if column==null
  tauxExiste = false //ajj
  franchiseExist = false
  plafondExist = false
  formuleExist = false
  // nbrPages=0 // 24/09
  expandedElement: any
  multiRisque = false
  datemisen: any
  risqueArrayReady = false
  maxContenue = 10000000
  multiRisqueArray: any = []
  risqueConsult: any = {}
  calculCapitaleMRP = 50000
  DisplayedColumnsSousGarantie = ['select', 'garantie', 'plafond', 'franchise', 'formule', 'action', 'more'];
  //***************************** *LISTE
  displayedColumnsListParamRisque: any = [];
  list!: { idListParamRisque: any; };
  listParamRisque: any = [];
  lengthColumnsListParamRisque: any;
  dataSourceListParamRisque = [];
  paramRisqueList: any = [];
  idPackComplet: any;
  garantiesNew: any = [];
  idListParamList: any;
  paraRisqueType: any = [];
  idsListParams: any = [];
  codesListParams: any = [];
  /***************************** */
  duree: any
  dateMiseCirculation: any
  idPays = 0
  errorTarif = {
    "error": false,
    "msg": "",
  }

  //tableau resumé
  displayedColumnsGarantie: string[] = ['garantie', 'plafond', 'formule', 'franchise', 'prime'];
  dataSourceGarantie: any
  dataSourceRisque: any = new MatTableDataSource()
  dataSourceGroupePack!: MatTableDataSource<any>;
  displayedColumnsGroupePack: string[] = ['groupe', 'pack'];
  dataReturned = returnJson
  resumeTable: any = []
  returnedTarif: any = []
  listExemple = [
    {
      id: 1,
      value: 'exemple 1 ',
    },
    {
      id: 2,
      value: 'exemple 2 ',
    },
    {
      id: 3,
      value: 'exemple 3 ',
    },
  ]
  formListParamRisque: FormGroup | any;
  defaultConvention = 'aucuneConvention'
  typesContact = ["mobile"]
  wilayas: any[] = []
  durees: any[] = []
  idSousProduits = new FormControl() ///01
  IDSOUSPROD = null// a envoyer

  // idSousProduits:any[]
  typeClients: any[] = []
  agences: any[] = []
  warningMessage: any = []
  packs: any[] = []
  typeClient: any
  labelNom: string = "Nom"
  errorHandler = {
    "error": false,
    "msg": ""
  }
  autditUser: string | undefined | null = ""
  paraRisqueProduitCategory: any[] = []
  groupControl: any
  produit: any
  multirisqueParam: any = []
  nmbVehicule = new FormControl()
  nbrPages = new FormControl()
  risqueStep = 0
  isListParam: boolean = false;
  devisOutput: any;
  withFile = false
  garantieNull = false
  Smp: any;
  TOTALE: any;
  sousProduits: any;
  isBOUser: boolean = false;
  zone_sis: any;
  latitude: any;
  longitude: any;
  paramByProduit: any = [];
  today: Date = new Date();

  // IDSOUSPROD= new FormControl// a envoyer

  // idSousProduits:any
  // TO MERGE 
  ;
  isCourtier = localStorage.getItem("roles")?.includes("COURTIER")
  agencePersonne = parseInt(localStorage.getItem("agence") || '0');
  tkn: string = localStorage.getItem('token') || '';

  contenu: any;
  @ViewChildren('innerTables') innerTables: QueryList<MatTable<any>> | undefined;
  @ViewChildren('innerSort') innerSort: QueryList<MatSort> | undefined;

  ngOnInit(): void {
  const today = new Date();
  const year = today.getFullYear() - 18;
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  this.todayMinus18 = `${year}-${month}-${day}`;
    // this.injectMissingLocalStorage();
    this.getDictionnaire()
    const token = localStorage.getItem('token');


    // this.getWilayas();


    this.devis.list = []
    this.loadPacks();
      this.codeProduit = "45A";
      // this.produit = this.route.snapshot.paramMap.get('produit');

    this.devis.groupes = []
    // if (this.route.snapshot.paramMap.get('codeProduit') != "45A")
    //   this.router.navigate(["/"])
    this.autditUser = localStorage.getItem("userId")

    this.autditUser = this.autditUser?.replace(/^"(.+)"$/, '$1')

    this.dataSource.data = []
    this.getProductId()
    this.getIdPays("DZA")
    this.getParamRisque()

    
    
    this.getTypeClient()
    this.getAllAgences()
    //FIXME DELETE THIS

    // this.getAllConventions()
    // this.getAllReductions()
    //CHANGE DATA RETURN 
    let garantiesResume: any = []
    let formule = {}
    let franchise = {}
    let plafond = {}
    let taux = {}
    this.dataReturned.paramDevisList.map((garantie: any) => {
      garantie.categorieList.map((category: any) => {

        if (category.description == 'forumule') {
          formule = {
            "idCategorie": category.idCategorie,
            "description": category.description,
            "valeur": category.valeur,
            "sousCategorieList": {
              "idSousCategorie": category.sousCategorieList.idSousCategorie,
              "description": category.sousCategorieList.description,
              "valeur": category.sousCategorieList.valeur
            }
          }
        }
        else {
          if (category.description == 'plafond') {
            plafond = {
              "idCategorie": category.idCategorie,
              "description": category.description,
              "valeur": category.valeur,
              "sousCategorieList": {
                "idSousCategorie": category.sousCategorieList.idSousCategorie,
                "description": category.sousCategorieList.description,
                "valeur": category.sousCategorieList.valeur
              }
            }
          } else if (category.description == 'franchise') {
            franchise = {
              "idCategorie": category.idCategorie,
              "description": category.description,
              "valeur": category.valeur,
              "sousCategorieList": {
                "idSousCategorie": category.sousCategorieList.idSousCategorie,
                "description": category.sousCategorieList.description,
                "valeur": category.sousCategorieList.valeur
              }
            }
          }
          else if (category.description == 'taux') {
            taux = {
              "idCategorie": category.idCategorie,
              "description": category.description,
              "valeur": category.valeur,
              "sousCategorieList": {
                "idSousCategorie": category.sousCategorieList.idSousCategorie,
                "description": category.sousCategorieList.description,
                "valeur": category.sousCategorieList.valeur
              }
            }




          }

        }

      })

      garantiesResume.push({
        "idGarantie": garantie.idGarantie, // 2 
        "description": garantie.description, // VOL 
        "prime": garantie.prime,
        "plafond": plafond,
        "formule": formule,
        "franchise": franchise,
        "taux": taux,
      })
      formule = {}
      franchise = {}
      plafond = {}
      taux = {}
    })

    this.dataSourceGarantie = new MatTableDataSource(garantiesResume)


    if (this.codeProduit != '97') {
      // this.dataSourceGarantie = new MatTableDataSource(garantiesResume)
      this.formInfosAssure = this.formBuilder.group({
        // typeClient: ['personne physique', [Validators.required]],
        typeContact: ['mobile', [Validators.required]],
        nom: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[A-Za-z]+$/)]],
        prenom: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[A-Za-z]+$/)]],
        dateNaissance: ['', [Validators.required, ageValidator, ageSup107Validator, this.dateNaissanceMaxValidator()]],
        sexe: ['R16', Validators.required],
        wilaya: ['', Validators.required],
        dateDelivrance: ['', [Validators.required, permisApres18AnsValidator(),this.dateNaissanceMaxValidator()]],
        tel: ['', [Validators.pattern(/^(05|06|07)[0-9]{8}$/),Validators.required]],
        email: ['', [Validators.required, Validators.pattern(Patterns.email)]],
        duree: [3, [Validators.required]],
        agence: [this.isCourtier ? this.agencePersonne : '', [Validators.required]],

      },{ updateOn: 'blur' });
    }
    else {


      // this.dataSourceGarantie = new MatTableDataSource(garantiesResume)
      this.formInfosAssure = this.formBuilder.group({
        // typeClient: ['', [Validators.required]],
        typeContact: ['', [Validators.required]],
        nom: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[A-Za-z]+$/)]],
        prenom: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[A-Za-z]+$/)]],
        dateNaissance: ['', [Validators.required, ageValidator, ageSup107Validator]],
        dateDelivrance: ['', [Validators.required]],
        wilaya: ['', Validators.required],

        tel: ['', [Validators.required, Validators.pattern(Patterns.mobile)]],
        email: ['', [Validators.pattern(Patterns.email)]],
        duree: ['3', [Validators.required]],
        //ADD ines
        agence: [this.isCourtier ? this.agencePersonne : '', [Validators.required]],
        idSousProduits: [null, Validators.required],
        // sousProduits: [null, Validators.required],

        // wilaya: [{ value: '', disabled: this.codeProduit == '97' ? false : true }, [Validators.required]],
        // commune:[{ value: '', disabled: this.codeProduit == '97' ? false : true }, [Validators.required]]
        // commune: [{ value: '', disabled: !this.formInfosAssure.get('wilaya')?.value }, [Validators.required]]

        //ughaled sinon




      });
      //console.log('je met la valeur de nbrpage a 2',this.nbrPages)


    }

    this.formInfosAssure.get('dateNaissance')?.valueChanges.subscribe(() => {
      this.formInfosAssure.get('dateDelivrance')?.updateValueAndValidity();
    });



    this.formInfosAssure.valueChanges.subscribe(() => {
      this.tarifReady = false
    });
    this.formListParamRisque = this.formBuilder.group({});
    this.formParamRisque = this.formBuilder.group({});
    this.formParamRisque.valueChanges.subscribe(() => {
      this.tarifReady = false
    });
    this.formPackGaranties = this.formBuilder.group({

      franchiseFormArray: this.formBuilder.array([]),
    });
    this.formReduction = this.formBuilder.group({

      reduction: [0],
      convention: [0],
    });
    this.formReduction.get('convention').setValue('aucuneConvention');
    this.formReduction.get('reduction').setValue('aucuneReduction');
    // if (this.isCourtier) {
    //   this.formInfosAssure.get('agence')?.disable();
    // } else {
    //   this.formInfosAssure.get('agence')?.enable();
    // }

    const roles = localStorage.getItem('roles') || '';
    this.isBOUser = roles.includes("BO");


    if (this.codeProduit == '97' && this.isBOUser == false) {
      this.nbrPages.setValue(2);
      //console.log('je met la valeur de nbrpage a 2',this.nbrPages)
      // 
      // if (this.codeProduit === '97' && this.selectedSousProduit === '10' && !this.isBOUser) {

    }


  }

  getDictionnaire() {
    this.genericService.getDictionnaire().subscribe((data: any) => {
      localStorage.setItem("dictionnaire", JSON.stringify(data))
    })
  }

  // authenticate() {

  //   const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  //   this.http
  //     .post(this.apiUrlGetKey, { partnerHash: this.partnerHash }, { headers })
  //     .subscribe({
  //       next: (res: any) => {
  //         const rawPublicKey = res.publicKey;
  //         const publicKeyPem = this.formatToPem(rawPublicKey);
  //         const encryptedHash = this.encryptWithJSEncrypt(this.partnerHash, publicKeyPem);

  //         if (!encryptedHash) {
  //           this.error = 'Erreur de chiffrement RSA';
  //           return;
  //         }

  //         const body = {
  //           partnerHash: this.partnerHash,
  //           encryptedHash: encryptedHash,
  //         };

  //         this.http.post(this.apiUrlAuthenticate, body, { headers }).subscribe({

  //           next: (authRes: any) => {
  //             if (!authRes.token) {
  //               this.error = 'Aucun token reçu';
  //               return;
  //             }

  //             this.token = authRes.token;
  //             localStorage.setItem('token', authRes.token);
  //             localStorage.setItem('refreshToken', authRes.refreshToken);

  //             this.injectMissingLocalStorage(); // injection ici

  //             window.location.reload();

  //           },
  //           error: (err) => {
  //             this.error = 'Erreur d’authentification';
  //             console.error(' Auth error:', err);
  //           },
  //         });
  //       },
  //       error: (err) => {
  //         this.error = 'Erreur récupération de la clé publique';
  //         console.error(' GetKey error:', err);
  //       },
  //     });
  // }
  injectMissingLocalStorage() {
    

    // Chargement dictionnaire depuis fichier JSON

      this.http.get<any[]>('assets/dictionnaire_complet.json').subscribe({
        next: (data) => {
          localStorage.setItem('dictionnaire', JSON.stringify(data));
        },
        error: (err) => {
          console.error(' Erreur chargement dictionnaire:', err);
        }
      });
    
  }

  encryptWithJSEncrypt(data: string, publicKeyPem: string): string | null {
    try {
      const encryptor = new JSEncrypt();
      encryptor.setPublicKey(publicKeyPem);
      const encrypted = encryptor.encrypt(data);
      return encrypted !== false ? encrypted : null;
    } catch (e) {
      console.error('Erreur chiffrement RSA avec JSEncrypt:', e);
      return null;
    }
  }

  onDatePicked(date: Date | null) {
    if (date) {
      const formatted = moment(date).format('DD/MM/YYYY');
      this.formInfosAssure.get('dateNaissance')?.setValue(formatted);
    }
  }



  formatToPem(base64Key: string): string {
    const lines = base64Key.match(/.{1,64}/g) ?? [base64Key];
    return `-----BEGIN PUBLIC KEY-----\n${lines.join('\n')}\n-----END PUBLIC KEY-----`;
  }


  getIdPays(codePays: string) {
    this.genericService.getPays().subscribe({
      next: (data: any) => {

        this.idPays = data.find((pays: any) => pays.codePays == codePays).idPays

        this.getWilayas()
      },
      error: (error) => {

        //console.log(error);

      }
    });
  }

  onWilayaChange(value: any) {
    console.log('Wilaya sélectionnée :', value);
  }

  getProductId() {
    this.codeProduit = "45A"
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
        //console.log('jesuis le contenaire sous produit ',data)

        this.produitInfo = data
        this.multiRisque = data.param_Produit_Reponses.filter((element: any) => element.idParamProduit.libelle == "multirisque")[0]
          .reponse.description == "Oui" ? true : false
        this.sousProduits = data.sousProduits;

        this.getAllParamRisque()
        //console.log('contenu sousProduit',this.sousProduits)
        //souspr
        // if (this.multiRisque) {
        //   this.formGroupPack = this.formBuilder.group({
        //     groupes: this.formBuilder.array([])

        //   });


        // }
      },
      error: (error) => {

        //console.log(error);

      }
    });
  }
  // get groupes(): FormArray {
  //   return this.formGroupPack.get("groupes") as FormArray
  // }
  // newGroupes(): FormGroup {
  //   return this.formBuilder.group({
  //     groupe: ['', [Validators.required]],
  //     pack: ['', [Validators.required]],
  //   })
  // }
  // addGroupes() {
  //   this.groupes.push(this.newGroupes());
  // }
  // removeGroupes(i: number) {
  //   this.groupes.removeAt(i);
  // }
  get franchi(): FormArray {
    return this.formPackGaranties.get("franchiseFormArray") as FormArray
  }
  newFranchises(): FormGroup {
    return this.formBuilder.group({
      idGarantie: '',
      valeurFranchise: '',
    })
  }
  addfranchi() {
    this.franchi.push(this.newFranchises());
  }
  getWilayas() {
    this.genericService.getAllWilayas(this.idPays).subscribe({
      next: (data: any) => {

        this.wilayas = data

      },
      error: (error) => {

        //console.log(error);


      }
    });
  }

  getCommune(idWilaya: any) {
    this.genericService.getAllCommuneByWilaya(idWilaya).subscribe({
      next: (data: any) => {
        this.communes = data
      },
      error: (error) => {
        //console.log(error);
      }
    });
  }
  getDureeByProduit() {
    this.dureeService.getDureeByIdProduit(this.idProduit).subscribe({
      next: (data: any) => {

        this.durees = data
        console.log(' la diréee du produit', this.durees)
      },
      error: (error) => {

        //console.log(error);

      }
    });
  }



  onContenatChange() {
    // Calculer la somme de deux autres champs (param1FormName et param2FormName)
    this.paraRisqueProduit.map((param: any) => {
      Object.keys(this.formParamRisque.value).map((paramFormName: any) => {
        if (paramFormName == param.formName) {

          // Récupérer les valeurs des deux paramètres à additionner
          let ValeurMatérielEtÉquipement = this.formParamRisque.get('ValeurMatérielEtÉquipement').value;
          let ValeurDeLaMarchandise = this.formParamRisque.get('ValeurDeLaMarchandise').value;

          // Vérifier si les deux valeurs sont numériques avant de faire la somme
          if (!isNaN(ValeurDeLaMarchandise) && !isNaN(ValeurMatérielEtÉquipement)) {
            const sum = Number(ValeurMatérielEtÉquipement) + Number(ValeurDeLaMarchandise);

            // Affecter la somme au champ param3FormName
            this.formParamRisque.get('ValeurContenant').setValue(sum);
          }
        }
        if (this.codeProduit == '97' && this.formParamRisque.codeParam == 'P268' && this.selectedSousProduit == "CTI") {
          this.formParamRisque.get('SMP').setValue(this.Smp * 0.5);
        }
        else {

          if (this.codeProduit == '97' && this.formParamRisque.codeParam == 'P268') {
            this.formParamRisque.get('SMP').setValue(this.Smp);
          }
        }



      });
    });
  }
  getParamRisque() {
    //get param risque by type risque
    this.paramRisqueService.getParamRisqueList().subscribe((detailRisqueList: ParamRisque[]) => {
      this.paramRisqueList = detailRisqueList
    })
  }
  getListParamRisque(idListParam: any, idGarantie: any) {
    //get param risque by list param

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

              //console.log(error);

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
  // ajouterParam() {
  //   const newData = [...this.dataSourceListParamRisque.data, this.formListParamRisque.value];

  //   this.dataSourceListParamRisque.data = newData;

  // }
  getTypeClient() {

    this.genericService.getParam(JSON.parse(localStorage.getItem('dictionnaire') || '{}').find((parametre: any) => parametre.code == "C24").idCategorie).subscribe({
      next: (data: any) => {

        this.typeClients = data
        if (this.multiRisque)
          this.PMflotte = this.typeClients.find((type: any) => type.code === "PM");
      },
      error: (error) => {

        //console.log(error);

      }
    });
  }
  getAllAgences() {
    this.agencesService.getAllAgence().subscribe({
      next: (data: any) => {

        this.agences = data
      },
      error: (error) => {

        //console.log(error);

      }
    });
  }
  getAllPack() {
    if (this.route.snapshot.paramMap.get('codeProduit') == '45A') {
      let paramBody =
      {
        //FIX ME DELETE THIS
        "dateMiseEnCirculation": this.dateMiseCirculation,

        "duree": this.duree
        // "dateMiseEnCirculation": "2012-07-11",

        // "duree": 3
      }

      this.packService.getPackByProduitParam(this.idProduit, paramBody).subscribe({
        next: (data: any) => {
          this.packs = []
          data.map((pack: any) => {

            this.packs.push(pack)

          })
        },
        error: (error) => {

          //console.log(error);

        }
      });
    } else {
      this.packService.getPackByProduit(this.idProduit).subscribe({
        next: (data: any) => {
          this.packs = []
          data.map((pack: any) => {

            this.packs.push(pack)

          })
        },
        error: (error) => {

          //console.log(error);

        }
      });
    }

  }

  private getAge(dateOfBirth: string | Date): number {
    const dob = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }

  private getPackCompletId(): number {
    return this.getAge(this.devis.dateAssure) <= 25 ? 169 : 168;
  }
    private getPackCompletId2(): number {
    return this.getAge(this.devis.dateAssure) <= 25 ? 194 : 192;
  }
getFilteredFranchiseByAge(element: any): any[] {
  if (element.codeGarantie !== 'G13') {
    return element.franchise;
  }
  const age = this.getAge(this.devis.dateAssure);

  if (age < 25) {
    return element.franchise.filter((f: { valeur: any; }) => Number(f.valeur) === 30000);
  } else {
    return element.franchise.filter((f: { valeur: any; }) => Number(f.valeur) === 5000 || Number(f.valeur) === 10000);
  }
}



  getPack(idPack: any) {


    this.tarifReady = false
    this.errorHandler.error = false
    this.errorHandler.msg = ""
    this.idPack = idPack
    this.indexGarantieMrp = 0
    this.indexSousGarantieMrp = 0

    this.packService.getPackById(idPack).subscribe({
      next: (data: any) => {
        if (this.codeProduit == "96")
          Swal.fire(
            ` ATTENTION la GARANTIE "Vol Objets de Valeur" EST SOUMISE A LA DEROGATION DU  BO`,
            '',
            'warning'
          )

        this.acctuelPack = data;
        if (!this.multiRisque || this.codeProduit == '97') {
          this.displayedColumns = ['select', 'garantie', 'plafond', 'franchise', 'formule', 'action', 'sousGarantie'];
          this.DisplayedColumnsSousGarantie = ['select', 'garantie', 'plafond', 'franchise', 'formule', 'action', 'more'];

          if (this.codeProduit == '97') {
            this.displayedColumns.push('taux'); // Ajout de la colonne "taux"
            this.DisplayedColumnsSousGarantie.push('taux'); // Ajout de la colonne "taux" pour les sous-garanties
            //console.log('je rentre dasn le codeproduit97')
          }

          this.franchiseExist = false
          this.plafondExist = false
          this.formuleExist = false

          this.devis.pack = idPack
          this.garantieTab = []
          this.garantieAll = data.garantie

          if (this.route.snapshot.paramMap.get('codeProduit') == "95" && this.formParamRisque.get("ActivitéProfessionnelle")?.value?.is_professionnel) {

            let index = this.garantieAll.map((g: any) => g.codeGarantie).indexOf('G45')
            if (index !== -1) {
              this.garantieAll.splice(index, 1);
            }
          }
          else {

            let index = this.garantieAll.map((g: any) => g.codeGarantie).indexOf('G53')
            if (index !== -1) {
              this.garantieAll.splice(index, 1);
            }

          }


          if (!this.formParamRisque.get("ActivitéProfessionnelle")?.value?.is_perte_exploitation || this.formParamRisque.get("ChiffreDaffaire")?.value > 5000000) {
            let index = this.garantieAll.map((g: any) => g.codeGarantie).indexOf('G51')
            if (index !== -1) {
              this.garantieAll.splice(index, 1);
            }
          }


          this.garantieAll.filter((garantie: any) => {
            let plafond: any = []
            let formule: any = []
            let franchise: any = []
            let taux: any = []; // Ajout du tableau pour taux
            //exp sous garantie
            garantie.sousGarantieList?.filter((sousGarantie: any) => {
              this.sousGarantieExist = true
              let sousPlafond: any = []
              let sousFormule: any = []
              let sousFranchise: any = []
              let soustaux: any = [];  // Ajout pour sous-garanties
              //exp categorie sous garantie 
              sousGarantie.categorieList.filter((category: any) => {

                switch (category.description) {
                  case "plafond":

                    if (category.descriptionvVal == 'input valeur venale' && this.route.snapshot.paramMap.get('codeProduit') == "45A") { category.valeur = this.valeurVenale }

                    sousPlafond.push(category)
                    this.plafondExist = true
                    break;
                  case "formule":
                    sousFormule.push(category)
                    this.formuleExist = true
                    break;
                  case "franchise":
                    sousFranchise.push(category)
                    this.franchiseExist = true
                    break;

                  case "taux":  // Ajout de la gestion pour "taux"
                    soustaux.push(category);
                    this.tauxExiste = true
                    break;

                }
              })

              this.sousGarantieTab.push(
                {
                  "idSousGarantie": sousGarantie.idSousGarantie,
                  "codeSousGarantie": sousGarantie.codeSousGarantie,
                  "idPackComplet": sousGarantie.idPackComplet,
                  "idListParamRisque": sousGarantie.idListParamRisque,
                  "description": sousGarantie.description,
                  "obligatoire": sousGarantie.obligatoire,
                  "prime": "",
                  "plafond": sousPlafond,
                  "formule": sousFormule,
                  "franchise": sousFranchise,
                  "taux": soustaux || '',
                  "valeur": sousGarantie.valeurGarantie,
                }
              )
            })

            //exp categorie garantie 
            garantie.categorieList.filter((category: any) => {

              switch (category.description) {
                case "plafond":

                  if (category.descriptionvVal == 'input valeur venale' && this.route.snapshot.paramMap.get('codeProduit') == "45A") { category.valeur = this.valeurVenale }

                  plafond.push(category)
                  this.plafondExist = true
                  break;
                case "formule":
                  formule.push(category)
                  this.formuleExist = true
                  break;
                case "franchise":
                  franchise.push(category)
                  this.franchiseExist = true
                  break;
                case "taux":
                  taux.push(category)
                  this.tauxExiste = true
                  break;
              }
            })

            this.garantieTab.push(
              {
                "idGarantie": garantie.idGarantie,
                "idPackComplet": garantie.idPackComplet,
                "codeGarantie": garantie.codeGarantie,
                "idListParamRisque": garantie.idListParamRisque,
                "description": garantie.description,
                "obligatoire": garantie.obligatoire,
                "prime": "",
                "plafond": plafond,
                "formule": formule,
                "franchise": franchise,
                "taux": taux || '',  // Ajout du taux dans garantie

                "sousGarantieList": new MatTableDataSource(this.sousGarantieTab)
              }
            )

            this.sousGarantieTab = []
          })
          //FIXME  delete column if column==null
          if (!this.franchiseExist && this.displayedColumns.indexOf("franchise") !== -1) {
            this.displayedColumns.splice(this.displayedColumns.indexOf("franchise"), 1);
            this.DisplayedColumnsSousGarantie.splice(this.DisplayedColumnsSousGarantie.indexOf("franchise"), 1);
          }
          if (!this.plafondExist && this.displayedColumns.indexOf("plafond") !== -1) {
            this.displayedColumns.splice(this.displayedColumns.indexOf("plafond"), 1);
            this.DisplayedColumnsSousGarantie.splice(this.DisplayedColumnsSousGarantie.indexOf("plafond"), 1);
          }
          if (!this.formuleExist && this.displayedColumns.indexOf("formule") !== -1) {
            this.displayedColumns.splice(this.displayedColumns.indexOf("formule"), 1);
            this.DisplayedColumnsSousGarantie.splice(this.DisplayedColumnsSousGarantie.indexOf("formule"), 1);
          }
          if (!this.tauxExiste && this.displayedColumns.indexOf("taux") !== -1) {
            this.displayedColumns.splice(this.displayedColumns.indexOf("taux"), 1);
            this.DisplayedColumnsSousGarantie.splice(this.DisplayedColumnsSousGarantie.indexOf("taux"), 1); //ajj
          }
          if (!this.sousGarantieExist) {
            this.displayedColumns.splice(this.displayedColumns.indexOf("sousGarantie"), 1);
            this.DisplayedColumnsSousGarantie.splice(this.DisplayedColumnsSousGarantie.indexOf("sousGarantie"), 1);
          }
          this.garantieTab.sort(function (x: any, y: any) {

            // true values first
            //  return (x.obligatoire === y.obligatoire) ? 0 : x ? -1 : 1;
            // false values first
            // return (x === y)? 0 : x? 1 : -1;
          });

          this.garantieTab.sort((a: any, b: any) => Number(b.obligatoire) - Number(a.obligatoire));


          this.dataSource = new MatTableDataSource(this.garantieTab)

          if (this.selectedSousProduit != "CTH") {
            const ValEqu = this.devis.groupes[0]?.groupeList[0]?.risque?.paramList?.find((el: any) => el.idParam == 248)?.reponse?.description
            //console.log("Valeur matériel et équipement=======>", ValEqu)
            const ValMarch = this.devis.groupes[0]?.groupeList[0]?.risque?.paramList?.find((el: any) => el.idParam == 247)?.reponse?.description
            //console.log("Valeur de la marchandise=======>", ValEqu)

            const ValTotal = ValEqu + ValMarch
            //console.log("la valeur contenu valmarch+valmateriel===>",ValTotal)

          }
          this.Smp = this.devis.groupes?.[0]?.groupeList?.[0]?.risque?.paramList?.find((el: any) => el.idParam == 245)?.reponse?.description
          const idPackCompletChoisi = this.getPackCompletId();
          const idPackCompletChoisi2 = this.getPackCompletId2();

          //console.log("SMP======>", this.Smp)
          console.log("x.plafond ", this.dataSource.data)
          this.formPackGaranties = new FormArray(
            this.dataSource.data.map(
              (x: any) =>
                new FormGroup({
                  idPackComplet: new FormControl(x.idPackComplet),
                  franchise: new FormControl({
                    value:
                      x.codeGarantie === 'G02'
                        ? x.franchise.find(
                          (f: any) => f.idParamPackComplet === idPackCompletChoisi
                        ): "",
                        // x.codeGarantie === 'G13' ? x.franchise.find((f: any) => f.idParamPackComplet === idPackCompletChoisi2) : "" ,
                    disabled:["G02"].includes(x.codeGarantie)
                  }),
                  idfranchise: new FormControl({ value: x.franchise, disabled: x.franchise.descriptionvVal != 'input' ? true : false },),
                  plafond: new FormControl({
                    value: x.codeGarantie === "G10"
                      ? x.plafond.find((f: any) => f.code === "C7") :
                      x.codeGarantie === "G03"
                        ? x.plafond.find((f: any) => f.code === "C7") :
                        x.codeGarantie === "G04"
                          ? x.plafond.find((f: any) => f.code === "C7") :
                          x.codeGarantie === "G16"
                            ? x.plafond.find((f: any) => f.code === "C7")
                            : x.codeGarantie === "G17"
                              ? x.plafond.find((f: any) => f.code === "C7")
                              : x.codeGarantie === "G18"
                                ? x.plafond.find((f: any) => f.code === "C7")
                                : x.codeGarantie === "G15"
                                  ? x.plafond.find((f: any) => f.code === "C7")
                                  : "",
                    disabled: ["G10", "G15", "G16", "G17", "G18", "G03", "G04"].includes(x.codeGarantie)
                  }),
                  idplafond: new FormControl({ value: x.plafond, disabled: true },),
                  // formule: new FormControl(),
                  formule: new FormControl({
                    value: x.codeGarantie === "G11"
                      ? x.formule.find((f: any) => f.code === "C16")
                      : "",
                    disabled: x.codeGarantie === "G11"
                  }),
                  idformule: new FormControl({ value: x.formule, disabled: true },),
                  taux: new FormControl({ value: "", disabled: false }),  // Ajout du champ taux dans le formulaire,
                  idtaux: new FormControl({ value: x.taux, disabled: false }), //this.formParamRisque.get("ChiffreDaffaire")?.value > 5000000 this.Smp < 5000000000 


                  checked: new FormControl({
                    value: x.obligatoire ? true : false,
                    disabled: x.obligatoire
                  }),
                  souGarantieArray: new FormArray(
                    x.sousGarantieList.data.map(
                      (sous: any) =>

                        new FormGroup({
                          idPackComplet: new FormControl(sous.idPackComplet),
                          franchise: new FormControl(),
                          idfranchise: new FormControl({ value: sous.franchise, disabled: sous.franchise.descriptionvVal != 'input' ? true : false },),
                          plafond: new FormControl(),
                          idplafond: new FormControl({ value: sous.plafond, disabled: true },),
                          formule: new FormControl(),
                          idformule: new FormControl({ value: sous.formule, disabled: true },),
                          taux: new FormControl(sous.taux || ''),  // Ajout du champ taux pour les sous-garanties
                          idtaux: new FormControl({ value: sous.taux, disabled: true },),
                          idSousProduits: new FormControl(),
                          checked: new FormControl({ value: true, disabled: sous.obligatoire }),
                          valeur: new FormControl((this.codeProduit == '95' && sous.valeurGarantie != null) ? sous.valeurGarantie : ''),
                        })

                    ))
                })

            )
          );


          // this.changeAllGarentierState(this.formPackGaranties, this.acctuelPack)

          this.formPackGaranties.valueChanges.subscribe(() => {
            this.errorPackForm = false
          });

          this.loadTable = true

          this.objectDevis(true)

        }
      },
      error: (error) => {

        //console.log(error);

      }
    });

  }

  // changeAllGarentierState(formGroupe: FormArray, items: any) {
  //   let arrayOfEllementTodelete :any[] = []
  //   formGroupe.controls.forEach((control: AbstractControl) => {

  //     // Type casting to FormGroup
  //     const group = control as FormGroup;
  //    const index =  items.garantie.findIndex((garen:any)=> {
  //       return   group.value.idPackComplet == garen.idPackComplet

  //     })
  //     //get the garantie
  //     const garantie = items.garantie[index] ;

  //     // Safely access the 'checked' FormControl

  //     const checkedControl = group.get('checked') as FormControl;

  //     if (checkedControl) {
  //       if(garantie.obligatoire){
  //         checkedControl.disable();
  //         checkedControl.setValue(true);
  //       }else {
  //         if(!this.devis.optional){
  //           if(garantie.active){
  //             checkedControl.enable();
  //             checkedControl.setValue(false);

  //           }else {
  //             checkedControl.disable();
  //             checkedControl.setValue(false);
  //             const index = formGroupe.controls.indexOf(group);
  //             arrayOfEllementTodelete.push(index)
  //           }
  //         }else {
  //           checkedControl.enable();
  //           checkedControl.setValue(false);
  //         }

  //       }
  //       if(this.codeProduit=="95"){
  //         checkedControl.setValue(true);
  //       }

  //     }
  //   });
  //   arrayOfEllementTodelete.forEach((index:any)=> {
  //     if (index !== -1) {
  //       formGroupe.removeAt(index);
  //      this.dataSource.data.splice(index , 1);

  //       this.dataSource._updateChangeSubscription();
  //     }
  //   })
  // }

  selectedPack: any = null;
  hasPlafondVisible(plafondArray: any[]): boolean {
    return plafondArray.some(p => p.valeur !== 0);
  }// …

  get garantiefiltre(){
    return this.dataSource.data.filter(e=> e.codeGarantie !== 'G09' && e.codeGarantie !== 'G55')
  }

  getNonZeroPlafonds(el: any) {
    return (el?.plafond || []).filter((p: any) => Number(p?.valeur) > 0);
  }

  isPlafondVisible(el: any): boolean {
    return this.getNonZeroPlafonds(el).length > 0;
  }

  firstNonZeroPlafond(el: any) {
    const list = this.getNonZeroPlafonds(el);
    return list.length ? list[0] : null;
  }

  loadPacks(): void {
    this.packService.getAllPack().subscribe({
      next: (allPacks: any[]) => {
        // Ne garder que les 4 packs voulus
        const allowedDescriptions = ['classic', 'Classic Plus', 'Tout en 1', 'Tout en 1 Limitée'];
        this.packs = allPacks.filter(pack => allowedDescriptions.includes(pack.description));
      },
      error: (error) => {
        console.error('Erreur lors du chargement des packs :', error);
      }
    });
  }


  //   onCaptchaResolved(token: any) {
  //   console.log("reCAPTCHA token:", token);
  //   this.token = token;
  // }

captchaValidated = false;
captchaError = false;
onCaptchaResolved(token: string | null) {
  this.captchaValidated = !!token;
  this.captchaError = false;
}

validateStep() {
  if (!this.captchaValidated) {
    this.captchaError = true;
    return;
  }
  // logiques existantes...
  this.generateCalcul();
  this.goToResume();
  this.setDonneesResume();
}
  getPackMulti(idPack: any, groupe: any) {
    this.packService.getPackById(idPack).subscribe({
      next: (data: any) => {


        this.idPackComplet = data.idPackComplet;
        this.garantiesNew = data.garantie;

        this.groupesPacks.push({ group: groupe, pack: data })
        this.garantieNull = false;

      },
      error: (error) => {

        //console.log(error);

      }
    });
  }

  // getpackCompletByid(){

  //   this.packService.getPackCById(this.idPackComplet).subscribe({
  //     next: (data: any) => {

  //      //console.log("dataNew");
  //     //console.log(data);
  //     },
  //     error: (error) => {

  //       //console.log(error);

  //     }
  //   });
  // }
  getControl(index: number, controlName: string): FormControl {
    this.actualControlGarantie = index
    return (this.formPackGaranties.at(index) as FormGroup).get(controlName) as FormControl;
  }
dateNaissanceMaxValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) return null;
    // Ignore si valeur vide
    const today = new Date();
    today.setHours(0,0,0,0); // pour ignorer l'heure
    const inputDate = new Date(control.value);
    inputDate.setHours(0,0,0,0);
    if (inputDate > today) {
      return { dateFuture: true };
    }
    return null;
  };
}



  getSousGarantieControl(index: number, controlName: string): FormControl {

    let mainFormGroup = this.formPackGaranties.at(this.actualControlGarantie) as FormGroup;
    let souGarantieArray = mainFormGroup.get('souGarantieArray') as FormArray;

    return (souGarantieArray.at(index) as FormGroup).get(controlName) as FormControl;
  }
  changeTypeClient(value: any) {

    this.typeClient = value.description
    //personne moral
    if (this.typeClient == "personne morale") {

      this.formInfosAssure.get("prenom")?.setValidators([])
      this.formInfosAssure.get("dateNaissance")?.setValidators([])
      this.formInfosAssure.get("email")?.setValidators([Validators.required, Validators.pattern(Patterns.email)])

      this.labelNom = "Raison Social"
    } else {
      this.labelNom = "Nom"
      this.formInfosAssure.get("prenom")?.setValidators([Validators.required, Validators.pattern(Patterns.nom)])
      this.formInfosAssure.get("email")?.setValidators([Validators.pattern(Patterns.email)])
      this.formInfosAssure.get("dateNaissance")?.setValidators([Validators.required, ageValidator, ageSup107Validator])
    }
    this.formInfosAssure.get('prenom').updateValueAndValidity();
    this.formInfosAssure.get('dateNaissance').updateValueAndValidity();
    this.formInfosAssure.get('email').updateValueAndValidity();
  }
  goBack() {
    this.myStepper.previous();
  }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  diselectAll() {
    this.selection.clear();
    this.dataSource.data.forEach((row: any) => {
      this.formPackGaranties.controls.map((garantie: any) => {
        if (!row.obligatoire)
          garantie.value.idPackComplet == row.idPackComplet ? garantie.controls.checked.value = false : "";
      })
    });

  }

  toggleRadio(index: number, element: any): void {
    const control = this.getControl(index, 'checked');
    control.setValue(!control.value);          // on inverse true/false
    this.checkGarantie(element, { value: control.value });
  }



  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {

    this.isAllSelected() ?
      this.diselectAll() :
      this.dataSource.data.forEach((row: any) => {
        this.formPackGaranties.controls.map((garantie: any) => {

          garantie.value.idPackComplet == row.idPackComplet ? garantie.controls.checked.value = true : "";
        })
        this.selection.select(row)
      });
  }


  get isStepValid(): boolean {
    // 1. Vérification du champ "Nombre de pages output" si applicable
    if (this.codeProduit === '97' && this.isBOUser && this.selectedSousProduit === 'CTI') {
      if (!this.nbrPages.value || this.nbrPages.invalid) return false;
    }

    // 2. Parcours de chaque garantie
    for (let i = 0; i < this.dataSource.data.length; i++) {
      const checked = this.getControl(i, 'checked').value;
      if (checked) {
        const garantie = this.dataSource.data[i];

        // ----- P L A F O N D -----
        const plafList = garantie.plafond;
        const plafControl = this.getControl(i, 'plafond');
        if (plafList?.length) {
          if (plafList.length > 1) {
            // Sélection obligatoire pour un select
            if (!plafControl.value) return false;
          } else if (plafList[0].descriptionvVal === 'input') {
            // Saisie obligatoire pour un input
            if (!plafControl.value || +plafControl.value <= 0) return false;
          }
          // (Cas statique, input disabled, rien à vérifier)
        }

        // ----- F R A N C H I S E -----
        const franchiseList = garantie.franchise;
        const franchiseControl = this.getControl(i, 'franchise');
        if (franchiseList?.length) {
          if (franchiseList.length > 1) {
            if (!franchiseControl.value) return false;
          } else if (franchiseList[0].descriptionvVal === 'input') {
            if (!franchiseControl.value || +franchiseControl.value <= 0) return false;
          }
        }

        // ----- F O R M U L E -----
        const formuleList = garantie.formule;
        const formuleControl = this.getControl(i, 'formule');
        if (formuleList?.length) {
          if (formuleList.length > 1) {
            if (!formuleControl.value) return false;
          } else if (formuleList[0].descriptionvVal === 'input') {
            if (!formuleControl.value || +formuleControl.value <= 0) return false;
          }
        }
      }
    }
    return true;
  }

  readonly groupGarantie = ['G16', 'G17', 'G18'];

  checkGarantie(row: any, value: any) {
    this.tarifReady = false;
    this.selection.toggle(row);

    // === LOGIQUE GROUPE G17/G18/G19 ===
    if (this.groupGarantie.includes(row.codeGarantie)) {
      // Vérifie l'état à appliquer (cocher ou décocher)
      const checked = value.checked;
      this.dataSource.data.forEach((el, idx) => {
        if (this.groupGarantie.includes(el.codeGarantie)) {
          // Mets à jour la case (sans boucler sur l'event !)
          this.getControl(idx, 'checked').setValue(checked, { emitEvent: false });
          // Mets aussi à jour la sélection
          if (checked) {
            this.selection.select(el);
          } else {
            this.selection.deselect(el);
          }
        }
      });
      // On sort ici pour éviter l’appel doublé du reste
      return;
    }

    // === Ton code existant pour G50 etc... ===
    if (value.checked && row.codeGarantie == "G50") {
      const sg = row.sousGarantieList.data.find(
        (sg: any) => sg.codeSousGarantie == "SG91"
      );
      if (sg) {
        this.getListParamRisque(sg.idListParamRisque, sg.idSousGarantie);
      }
    }
  }

  onNextStep() {
    this.dateDelivrance = this.formInfosAssure.value.dateDelivrance;
    console.log("📌 Date de délivrance enregistrée :", this.dateDelivrance);


  }

  submitInfosAssure() {

    //console.log("cond",this.risqueArrayReady , ((this.multiRisque && this.risqueStep==1) || !this.multiRisque))
    //console.log("cond",this.formInfosAssure)
    if (this.formInfosAssure.valid) {
      this.myStepper.next();
      this.duree = this.formInfosAssure.get("duree").value
      //************* info assure
      this.devis.typeClient = this.typeClients.find((type: any) => type.code == "PH")?.idParam
      console.log("this.formInfosAssure.get('typeClient').value.idParam : ", this.formInfosAssure.get('typeClient'))
      //this.devis.produit = this.idProduit // auto static
      this.devis.produit = 1 // auto static
      // if (this.typeClient != 'personne physique') {
      //   this.devis.raisonSocial = this.formInfosAssure.get('nom').value
      //   this.devis.prenom = ""
      //   this.devis.nom = ""
      //   this.devis.dateAssure = ""

      // }
      // else {
      this.devis.prenom = this.formInfosAssure.get('prenom').value
      this.devis.nom = this.formInfosAssure.get('nom').value
      this.devis.dateAssure = moment(this.formInfosAssure.get("dateNaissance").value).format('YYYY-MM-DD[T]HH:mm:ss.000Z')
      console.log('this.devis.dateAssure =====', this.devis.dateAssure);
      this.devis.raisonSocial = ''
      // }

      this.devis.telephone = this.formInfosAssure.get('tel').value
      this.devis.email = this.formInfosAssure.get('email').value
      this.devis.duree = this.formInfosAssure.get('duree').value
      this.devis.agence = this.formInfosAssure.get('agence').value
      // this.devis.sousProduit=this.formInfosAssure.get('idSousProduits').value //
      if (this.codeProduit == '97') {
        this.devis.sousProduit = this.IDSOUSPROD
      }


      //console.log("aqli da",this.devis.sousProduit,this.formInfosAssure)
      //get('idSousProduits').value

    } else {
      const invalid = [];
      const controls = this.formInfosAssure.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          invalid.push(name);
        }
      }

    }

      if (this.formInfosAssure.invalid) {
    this.formInfosAssure.markAllAsTouched();
    return;
  }

    // trying to controlnbrVhehicule case not Bo cl catnat
    const roles = localStorage.getItem('roles') || '';
    this.isBOUser = roles.includes("BO");

    if (this.codeProduit == '97' && this.selectedSousProduit == "CTI" && !this.isBOUser) {

      this.devis.tailleRisque = 1;
    }

    console.log("form ", this.paramByProduit)

    this.paramByProduit.map((param: any) => {
      if (param.codeParam == "P54" && param.typeValeur.code == "CP67") {

        this.formParamRisque.get(param.formName).setValue(this.formInfosAssure.get("dateDelivrance")?.value)
      }
      if (param.codeParam == "P55" && param.typeValeur.code == "CP67") {

        this.formParamRisque.get(param.formName).setValue(this.formInfosAssure.get("dateNaissance")?.value)
      }

      if (param.codeParam == "P24" && param.typeValeur.code == "CP67") {
        let value = param.reponses.find((genre: any) => genre.code == this.formInfosAssure.get("sexe")?.value)
        this.formParamRisque.get(param.formName).setValue(value)
      }
      if (param.codeParam == "P56" && param.typeValeur.code == "CP67") {
        console.log("param ", param)
        let value = param.reponses.find((wilaya: any) => wilaya.code == "16")
        this.formParamRisque.get(param.formName).setValue(value)
      }


    })

  }
  
  getAllParamRisque() {
    let existInBoth = false
    let validators: any = []
    let realData: any = [];//no
    let enabled: any = null;///no

    this.paramRisqueService.getParamByProduit(this.idProduit).subscribe({
      next: (data: any) => {

        realData = data;




        this.paramRisqueService.getWorkFlowByProduit(this.idProduit, this.idDevisWorkFlow).subscribe({
          next: (dataWorkFlow: any) => {
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

              // if (param.paramRisque.idParamRisque == 50) {

              // }



              paramRisque.sousProduit = param.sousProduit;
              paramRisque.idParamRisque = param.paramRisque.idParamRisque
              paramRisque.libelle = param.paramRisque.libelle


              paramRisque.formName = param.paramRisque.libelle.split(' ').map((word: any) => word.charAt(0).toUpperCase() + word.substring(1)).join('').replace(/[°']/g, '')

              paramRisque.orderChamp = param.paramRisque.orderChamp
              paramRisque.position = param.paramRisque.position
              paramRisque.typeChamp = param.paramRisque.typeChamp
              paramRisque.sizeChamp = param.paramRisque.sizeChamp
              paramRisque.codeParam = param.paramRisque.codeParam

              //console.log('2i wanna die', param.sousProduit);
              //console.log('i wanna die', paramRisque);
              paramRisque.reponses = param.paramRisque.categorie?.paramDictionnaires
              paramRisque.typeValeur = param.iddictionnaire
              paramRisque.obligatoire = obligatoire
              paramRisque.enable = enabled
              paramRisque.category = param.paramRisque.categorieParamRisque?.description
              paramRisque.parent = param.paramRisque.paramRisqueParent
              paramRisque.isParent = param.paramRisque.isParent
              param?.iddictionnaire?.description == 'valeur minimum' ? paramRisque.valeurMin = param.valeur : ''
              param?.iddictionnaire?.description == 'valeur maximum' ? paramRisque.valeurMax = param.valeur : ''

              // figé le champs pour usage a affaire uniquement 
              // figé le champs pour usage a affaire uniquement 
              // figé le champs pour usage a affaire uniquement 
              // figé le champs pour usage a affaire uniquement 
              // figé le champs pour usage a affaire uniquement 
              // figé le champs pour usage a affaire uniquement 
              // figé le champs pour usage a affaire uniquement 
              // figé le champs pour usage a affaire uniquement 
              // figé le champs pour usage a affaire uniquement 
              // figé le champs pour usage a affaire uniquement 
              // figé le champs pour usage a affaire uniquement 
              //if(paramRisque.codeParam == "P54") {
              // console.log("date delivrance :::::" , this.formInfosAssure.get('dateDelivrance')?.value)
              //  paramRisque.defaultValue = this.formInfosAssure.get('dateDelivrance')?.value
              //  }

              switch (paramRisque.codeParam) {
                case "P52":
                  paramRisque.defaultValue = paramRisque.reponses?.find((r: any) => r.code == "100")
                  break;

                case "P50":
                  paramRisque.defaultValue = paramRisque.reponses?.find((r: any) => r.code == "CP245")
                  break;

                case "P31":
                  paramRisque.defaultValue = paramRisque.reponses?.find((r: any) => r.code == "R184")
                  break;

                case "P32":
                  paramRisque.defaultValue = paramRisque.reponses?.find((r: any) => r.code == "CP225")
                  break;

                case "P38":
                  paramRisque.defaultValue = "xxxxxxxx"
                  break;


                default:
                  paramRisque.defaultValue = param.valeur
                  break;
              }


              if (this.paraRisqueProduit.find(o => param.paramRisque.idParamRisque === o.idParamRisque) == undefined && existInBoth) {
                if (paramRisque.codeParam == 'P25') {
                  this.getMarque();
                }
                if (paramRisque.sizeChamp != 0 && paramRisque.sizeChamp != undefined)
                  this.formParamRisque.addControl(paramRisque.formName, new FormControl(paramRisque.defaultValue, [Validators.required, Validators.minLength(paramRisque.sizeChamp), Validators.maxLength(paramRisque.sizeChamp)]));
                else
                  if (paramRisque.obligatoire)
                    this.formParamRisque.addControl(paramRisque.formName, new FormControl(paramRisque.defaultValue, [Validators.required]));
                  else
                    this.formParamRisque.addControl(paramRisque.formName, new FormControl(paramRisque.defaultValue));


                this.paraRisqueProduit.push(paramRisque);


                // if (paramRisque.parent != null) {

                //   this.formParamRisque.get(paramRisque.formName).disable();
                // }

                // this.paraRisqueProduit.push(paramRisque)
                // if (this.multiRisque) {
                //   this.innerColumnsRisque.push({
                //     "formName": paramRisque.formName,
                //     "libelle": paramRisque.libelle,
                //   })

                //   // this.displayedColumnsRisque = this.innerColumnsRisque.map((col: any) => col.formName);
                //   this.displayedColumnsRisque = ['risqueNum', 'NDImmatriculation', 'groupe', 'action'];

                // }
                //parent



                if (this.multiRisque && this.codeProduit != '97') {
                  this.innerColumnsRisque.push({
                    "formName": paramRisque.formName,
                    "libelle": paramRisque.libelle,
                  });
                  this.displayedColumnsRisque = ['risqueNum', 'NDImmatriculation', 'groupe', 'action'];
                } else {
                  if (this.codeProduit == '97' && this.selectedSousProduit == "CTI") {
                    //&& this.selectedSousProduit=='9'
                    //console.log('je rentre ici klj', this.displayedColumnsRisque)
                    this.displayedColumnsRisque = ['risqueNum', 'site', 'groupe', 'action'];

                    //console.log('je rentre ici klj', this.displayedColumnsRisque)


                  } else {
                    //console.log('je rentre ici 245', this.displayedColumnsRisque)
                    this.displayedColumnsRisque = ['risqueNum', 'action'];
                  }
                }

                if (param.paramRisque.typeChamp.code == "L08" && param.paramRisque.paramRisqueParent == null) {

                  //EXP EN ATTENTE NOM TABLE EN RETOUR 
                  this.paramRisqueService.getTableParamParent(paramRisque.idParamRisque).subscribe({
                    next: (data: any) => {
                      paramRisque.reponses = data

                    },
                    error: (error) => {

                      //console.log(error);

                    }
                  })
                }
              }
              else if (existInBoth) {
                const control = this.formParamRisque.get(paramRisque.formName); // Vérification que le contrôle existe avant d'ajouter des validateurs
                // if (control) {
                //   if (param?.iddictionnaire?.description == 'valeur minimum') {
                //     console.log("paramRisque.valeurMin ", paramRisque.valeurMin)
                //     control.addValidators([Validators.min(paramRisque.valeurMin)]);
                //     control.updateValueAndValidity();
                //   } else if (param?.iddictionnaire?.description == 'valeur maximum') {
                //     console.log("paramRisque.valeurMin ", paramRisque.valeurMin)
                //     control.addValidators([Validators.max(paramRisque.valeurMax)]);
                //     control.updateValueAndValidity();
                //   }
                // } else {
                //   console.error(`Contrôle de formulaire ${paramRisque.formName} non trouvé`);
                // }

                if (control) {
                  if (param?.iddictionnaire?.description == 'valeur maximum') {
                    console.log("paramRisque.valeurMin ", paramRisque.valeurMin)
                    control.addValidators([Validators.max(9999999)]);
                    control.updateValueAndValidity();
                  }
                } else {
                  console.error(`Contrôle de formulaire ${paramRisque.formName} non trouvé`);
                }
              }
              existInBoth = false
              validators = []
              this.paramByProduit.push(paramRisque)
            })
            if (this.multiRisque) {
              this.formParamRisque.addControl("groupe", new FormControl('', [Validators.required]));
              this.formParamRisque.addControl("newGroupe", new FormControl('', []));

            }

            this.paraRisqueProduitCategory = this.paraRisqueProduit.reduce((x: any, y: any) => {

              (x[y.category] = x[y.category] || []).push(y);

              return x;

            }, {});

            this.paraRisqueProduitCategory = Object.values(this.paraRisqueProduitCategory)

            this.paraRisqueProduitCategory.map(risqueCategory => {
              risqueCategory.sort((a: any, b: any) => (a.orderChamp < b.orderChamp ? -1 : 1));
            })
            console.log("this.formParamRisque ", this.formParamRisque)

            //console.log("inessssss", this.paraRisqueProduitCategory);


            this.risqueArrayReady = true
            this.getDureeByProduit()

          },
          error: (error) => {

            //console.log(error);

          }
        })


      },
      error: (error) => {

        //console.log(error);

      }
    });


  }



  getAllConventions() {
    this.conventionService.getAllConventions().subscribe({
      next: (data: any) => {

        this.conventions = data


      },
      error: (error) => {

        //console.log(error);

      }
    });
  }
  getAllReductions() {
    this.filterReduction.typeReduction = 262
    this.filterReduction.produit = this.idProduit

    this.reductionService.reductionFiltre(this.filterReduction).subscribe({
      next: (data: any) => {
        this.reductions = data
      },
      error: (error) => {
        //console.log(error);
      }
    });
  }
  getReductionByConvention(idConvention: any) {

    if (idConvention != 'aucuneConvention') {
      this.formReduction.get("reduction").setValidators([Validators.required])
      this.reductionService.getReductionByConvention(idConvention).subscribe({
        next: (data: any) => {
          if (data.length != 0) {
            this.reductions = data.filter((reduc: any) => reduc.produit == JSON.parse(localStorage.getItem('products') || '{}').find((parametre: any) => parametre.codeProduit == this.route.snapshot.paramMap.get('codeProduit')).description)
            this.errorHandler.error = false

            this.errorHandler.msg = ""
          } else {
            this.errorHandler.error = true

            this.errorHandler.msg = "cette convention n'a aucune rÃ©duction."
          }

        },
        error: (error) => {

          //console.log(error);

        }
      });
    } else {
      this.errorHandler.error = false

      this.errorHandler.msg = ""
      this.formReduction.get("reduction").setValidators([])
      this.getAllReductions()
    }

  }
  async submitReduction() {

    // if (this.formReduction.get("reduction").value == 'aucuneReduction') {

    //   this.myStepper.next();
    //   this.errorHandler.error = false
    //   this.errorHandler.msg = ""
    // } else 
    if (this.formReduction.valid && this.formReduction.get("convention").value != 'aucuneConvention') {
      // Object.assign(this.returnedTarif, {idReduction: this.formReduction.get("reduction").value});
      if (this.formReduction.get("reduction").value != 'aucuneReduction') {
        this.basicTarif.idConvention = this.formReduction.get("convention").value
        this.basicTarif.idReduction = this.formReduction.get("reduction").value
        this.basicTarif.nbrPages = this.nbrPages.value;

        this.basicTarif.auditUser = 1102
        this.basicTarif.canal = 100

        const hmac = await this.cryptoService.generateHmac(this.tkn, this.basicTarif);
        const stringifiedDevis1 = JSON.stringify(this.basicTarif);
        const dataDevis1 = {
          stringJson: stringifiedDevis1,
          signature: hmac
        }
        this.reductionService.applyReduction(dataDevis1).subscribe({
          next: (data: any) => {

            this.returnedTarif = data

            this.errorHandler.error = false
            this.errorHandler.msg = ""
            this.myStepper.next();

          },
          error: (error) => {
            //console.log(error)
            this.handleError(error)

          }
        });
      }

    } else if (this.formReduction.get("convention").value == 'aucuneConvention' && this.formReduction.valid) {
      if (this.formReduction.get("reduction").value == 'aucuneReduction') {

        this.myStepper.next();
        this.errorHandler.error = false
        this.errorHandler.msg = ""
        this.basicTarif.idConvention = 0
        this.basicTarif.idReduction = 0
        this.basicTarif.nbrPages = this.nbrPages.value;

      } else {
        this.basicTarif.idConvention = 0
        this.basicTarif.idReduction = 0
        this.basicTarif.auditUser = 1102
        this.basicTarif.canal = 100

        const hmac = await this.cryptoService.generateHmac(this.tkn, this.basicTarif);
        const stringifiedDevis2 = JSON.stringify(this.basicTarif);
        const dataDevis2 = {
          stringJson: stringifiedDevis2,
          signature: hmac
        }

        this.reductionService.applyReduction(dataDevis2).subscribe({
          next: (data: any) => {
            this.returnedTarif = data


            this.errorHandler.error = false
            this.errorHandler.msg = ""
            this.myStepper.next();

          },
          error: (error) => {
            //console.log(error)
            this.handleError(error)

          }
        });
      }
    }
  }



  changeTypeContact(value: any) {
    if (value == 'fixe')
      this.formInfosAssure.get("tel").setValidators([Validators.pattern(Patterns.fixe), Validators.required])
    else
      this.formInfosAssure.get("tel").setValidators([Validators.pattern(Patterns.mobile), Validators.required])

    this.formInfosAssure.get("tel").updateValueAndValidity();
  }
  clearValidators(paramFormName: string) {
    this.paraRisqueProduit.map((param: any) => {
      if (paramFormName == param.formName) {
        if (param.obligatoire)
          this.formParamRisque.controls[param.formName].setValidators([Validators.required])
        else
          this.formParamRisque.controls[param.formName].setValidators([])
        this.formParamRisque.controls[param.formName].updateValueAndValidity();

      }

    })
  }
  getMarque() {
    this.vehiculeService.getAllMarque().subscribe({
      next: (data: any) => {
        this.marques = data
      },
      error: (error) => {
        //console.log(error);
      }
    });
  }
  getModeleByMarque(marque: any) {
    this.vehiculeService.getModelByMarque(marque.idParam).subscribe({
      next: (data: any) => {
        this.modeles = data
      },
      error: (error) => {
        //console.log(error);
      }
    });


  }
  submitParamRisque(formParamRisque: any) {

    const smp = this.formParamRisque.get("SMP")?.value;
    //console.log('je sui smp agui ',smp)



    if (this.codeProduit == '97' && this.taillersq >= 1 &&
      (this.selectedSousProduit == "CTH" || (this.selectedSousProduit == "CTI" && this.isBOUser == false))) {





      Swal.fire(
        'Vous n’avez pas le privilège pour faire ce devis  la taille du risque depasse 1',
        '',
        'error'
      ).then(() => {

        this.myStepper.previous();
        this.formParamRisque.disable()

      });


    } else


      //console.log('jerentre 01');
      //console.log('ahhha', this.formParamRisque);
      this.loaderControles = true
    // this.clearValidators()
    this.controleDevis = []
    // this.devis.paramList = []
    this.warningMessage = []

    const invalid = [];
    const controls = this.formParamRisque.controls;
    for (const name in controls) {

      if (controls[name].status == "INVALID" && controls[name].errors.bloquant) {
        this.clearValidators(name)
      }
    }


    if ((this.multiRisqueArray.length == this.nmbVehicule.value && this.multiRisque && this.codeProduit == '97')) {
      //console.log('jerentre 04');
      Swal.fire(
        "le nombre de risque a atteint le nombre de risques indiqué",
        `error`
      )
      // this._snackBar.open("le nombre de risque a atteint le nombre de risques indiqué", 'fermer', {
      //   horizontalPosition: "end",
      //   panelClass: ['danger-snackbar']
      // })
    } else {
      if (this.formParamRisque.valid) {
        // check unicité du N° chassis dans le cas de 45F
        let doublonsExist
        if (this.codeProduit == '45F' || this.codeProduit == '45L') {
          let formNameChassis = this.paraRisqueProduit.filter((param: any) => param.codeParam == "P30")[0].formName
          let formNameMatricule = this.paraRisqueProduit.filter((param: any) => param.codeParam == "P38")[0].formName
          doublonsExist = this.checkDoublons(this.formParamRisque.get(formNameChassis).value, this.formParamRisque.get(formNameMatricule).value)

        }
        if (((this.codeProduit == '45F' || this.codeProduit == '45L') && !doublonsExist) || this.codeProduit != '45F') {        // this.myStepper.next();
          if (this.route.snapshot.paramMap.get('codeProduit') == "45A") {
            this.valeurVenale = this.formParamRisque.get("ValeurVénal").value
            this.dateMiseCirculation = moment(this.formParamRisque.get("DateDeMiseEnCirculation").value).format('YYYY-MM-DD')
          }


          if (this.idPack != 0) {

            this.dataSourceListParamRisque = []
            this.devis.list = []
            this.dataSourceListOfListes.data = []
            //FIX ME CEST QUOI CA
            this.getPack(this.idPack)
          }
          // let paramListTemp: ParamList[] = [];
          let idparam
          let idreponse
          let description = "debase"
          // let controlElement: any
          //  this.devis.paramList = []
          //************* param risque

          // let risque: any = {}
          // risque.paramList = []
          // let groupeList: any = []
          let paramElement: any;
          let controlElement: any = null;
          let risque: any = {};
          risque.paramList = [];
          let groupeList: any = [];

          // })
          this.paraRisqueProduit.forEach((param: any) => {
            Object.keys(this.formParamRisque.value).forEach((paramFormName: any) => {
              if (paramFormName == param.formName) {
                //console.log("dnekini",param)
                let idparam = param.idParamRisque;
                let codeParam = param.codeParam
                let idreponse = null;
                let description = '';

                if (param.typeChamp?.description == 'Liste of values' || param.typeChamp?.description == 'Boolean') {
                  idreponse = this.formParamRisque.get(paramFormName).value.idParam;
                  description = '';
                  controlElement = {
                    "idParam": idparam,
                    "codeParam": codeParam,
                    "valeur": idreponse
                  };
                  Object.assign(this.risqueConsult, {
                    [param.libelle]: this.formParamRisque.get(paramFormName).value.description
                  });
                } else {
                  idreponse = null;
                  if (param.typeChamp?.description == 'From Table') {
                    description = this.formParamRisque.get(paramFormName).value.id;
                    Object.assign(this.risqueConsult, {
                      [param.libelle]: this.formParamRisque.get(paramFormName).value.description
                    });
                  } else if (param.typeChamp?.description != 'date') {
                    if (param.idParamRisque == 34)
                      description = String(Number(this.formParamRisque.get(paramFormName).value));
                    else if (paramFormName == 'Marque' || paramFormName == 'Modèle') {
                      idreponse = this.formParamRisque.get(paramFormName).value.idParam;
                      description = '';
                      if (paramFormName == 'Marque') {
                        Object.assign(this.risqueConsult, {
                          [param.libelle]: this.formParamRisque.get(paramFormName).value.marque
                        });
                      } else {
                        Object.assign(this.risqueConsult, {
                          [param.libelle]: this.formParamRisque.get(paramFormName).value.modele
                        });
                      }
                    } else {
                      description = this.formParamRisque.get(paramFormName).value;
                      Object.assign(this.risqueConsult, { [param.libelle]: description });
                    }
                  } else {
                    description = moment(this.formParamRisque.get(paramFormName).value).format('YYYY-MM-DD[T]HH:mm:ss.000Z');
                    Object.assign(this.risqueConsult, { [param.libelle]: description });
                    if (codeParam == "P28")
                      this.datemisen = this.formParamRisque.get(paramFormName).value
                    console.log("la date de mise en circulation : ", this.datemisen);
                  }

                  controlElement = {
                    "idParam": idparam,
                    "codeParam": codeParam,
                    "valeur": "" + description
                  };
                }

                paramElement = {
                  "idParam": idparam,
                  "codeParam": codeParam,
                  "reponse": {
                    "idReponse": idreponse,
                    "description": description
                  }
                };

                // Ajout uniquement si paramElement et controlElement ont été définis
                if (paramElement) {
                  risque.paramList.push(paramElement);
                }
                if (controlElement) {
                  this.controleDevis.push(controlElement);
                }
              }
            });
          });
          this.risqueIndexBody = this.risqueIndexBody + 1
          groupeList.push({
            "numRisque": this.risqueIndexBody,
            "risque": risque
          })

          if (this.multiRisque) {
            if (this.formParamRisque.get('groupe').value == 'new') {
              this.formParamRisque.get('groupe').setValue(this.formParamRisque.get('newGroupe').value);
              this.groupArray.push(this.formParamRisque.get('newGroupe').value);

              let data = this.groupArray.length == 1 ? [] : this.dataSourceGroupePack.data;
              data.push({
                group: this.formParamRisque.get('newGroupe').value,
                pack: this.packs[0]
              });
              this.dataSourceGroupePack = new MatTableDataSource(data);
            }

            let groupExist = false;
            this.devisGroupe.forEach((groupe: any) => {
              if (groupe.description == this.formParamRisque.get('groupe').value) {
                groupExist = true;
              }
            });

            if (!groupExist) {
              this.devisGroupe.push({
                "description": this.formParamRisque.get('groupe').value,
                "idPack": this.idPack,
                "groupeList": groupeList,
              });
            } else {
              this.devisGroupe
                .filter((groupe: any) => groupe.description == this.formParamRisque.get('groupe').value)[0]
                ?.groupeList.push({
                  "risque": risque
                });
            }
          }
          else {
            this.devisGroupe = [{
              "description": "mono",
              "groupeList": groupeList,
            }]
          }

          this.devisService.controleDevis([this.controleDevis], this.codeProduit).subscribe({
            next: (data: any) => {
              this.loaderControles = false



              data[0].forEach((paramData: any) => {
                this.paraRisqueProduit.forEach((param: any) => {
                  if (param.idParamRisque == paramData.idParam) {
                    if (paramData.bloquant) {
                      this.formParamRisque.controls[param.formName].addValidators([
                        customParam(paramData.bloquant, paramData.message)
                      ]);
                      this.formParamRisque.controls[param.formName].updateValueAndValidity();
                    } else if (paramData.message != null) {
                      this.warningMessage.push({
                        "idParam": param.idParamRisque,
                        "msg": paramData.message
                      });

                      if (param.codeParam == "P40" || param.codeParam == "P116") {
                        this.devis.statue = 1;
                      }
                    } else if (param.codeParam == "P40" || param.codeParam == "P116") {
                      this.devis.statue = 0;
                    }
                  }
                });
              });
              if (this.warningMessage.length != 0)
                Swal.fire(
                  this.warningMessage[0].msg,
                  '',
                  'warning'
                )
              // this._snackBar.open(this.warningMessage[0].msg, 'fermer', {
              //   horizontalPosition: "end",
              //   panelClass: ['warning-snackbar']
              // })

              if (data[0].filter((paramData: any) => paramData.bloquant === true).length == 0) {
                this.devis.groupes = this.devisGroupe
                if (this.multiRisque) {
                  if (paramElement) {
                    this.multiRisqueTab(paramElement, formParamRisque);
                  } else {
                    console.error('paramElement est null ou indéfini');
                  }
                }
                else {


                  this.myStepper.next();
                }
                this.getAllPack()

              }


            },
            error: (error) => {
              this.handleError(error)
              //console.log(error);


            }
          });
        } else if (this.codeProduit == '45F' && doublonsExist) {
          let msg = ""
          switch (doublonsExist) {
            case 'P30':
              msg = "Numéro de Châssis doit etre unique."
              break;
            case 'P38':
              msg = "Le N° d'Immatriculation doit etre unique."
              break;
            case 'both':
              msg = "Le N° d'Immatriculation ainsi que le numéro de Châssis doivent etre uniques."
              break;
            default:
              break;
          }
          Swal.fire(
            msg,
            ``,
            `error`,

          )
        }
      }
    }

  }


  removeDuplicateParams(paramList: any[]): any[] {
    // Suppression des doublons basés sur l'idParam
    const uniqueParams = new Map();
    for (const param of paramList) {
      uniqueParams.set(param.idParam, param);
    }
    return Array.from(uniqueParams.values());
  }
  checkDoublons(numChassis: any, matricule: any) {
    const chassisExists = this.devis.groupes.some((groupe: any) =>
      groupe.groupeList.some((rs: any) =>
        rs.risque.paramList.some((param: any) =>
          param.reponse.description === numChassis
        )
      )
    );
    const matriculeExists = this.devis.groupes.some((groupe: any) =>
      groupe.groupeList.some((rs: any) =>
        rs.risque.paramList.some((param: any) =>
          param.reponse.description === matricule
        )
      )
    );
    if (matriculeExists && chassisExists) {
      return "both";
    } else if (matriculeExists) {
      return "P38";
    } else if (chassisExists) {
      return "P30";
    } else {
      return false;
    }
  }
  multiNext() {
    if (this.multiRisqueArray.length != 0) {
      this.myStepper.next();
      this.getAllPack()
    }
  }
  multiRisqueTab(paramElement: any, formParamRisque: any) {

    let objectParam = this.formParamRisque.value

    Object.keys(this.formParamRisque.value).map((element: any) => {


      if (typeof this.formParamRisque.controls[element].value === "object") {
        if (element == "Marque")
          objectParam[element] = this.formParamRisque.controls[element].value?.marque
        else if (element == "Modèle")
          objectParam[element] = this.formParamRisque.controls[element].value?.modele
        else

          objectParam[element] = this.formParamRisque.controls[element].value?.description
      } else {
        // if (element == "Wilaya")
        //   objectParam[element] = this.wilayas.filter((wilaya: any) => wilaya.idWilaya == this.formParamRisque.controls[element].value)[0].description
        // else if (element == "Commune")
        //   objectParam[element] = this.communes.filter((commune: any) => commune.idCommune == this.formParamRisque.controls[element].value)[0].description
        // else
        objectParam[element] = this.formParamRisque.controls[element].value
      }

    });

    Object.assign(objectParam, { risqueNum: this.risqueIndex = this.risqueIndex + 1 });

    if (this.taillersq >= 1 && this.codeProduit == '97' && ((this.selectedSousProduit == "CTH") || (this.selectedSousProduit == "CTI" && this.isBOUser == false))) {
      //console.log('je push pas ')
    } else
      this.multiRisqueArray.push(objectParam)
    this.dataSourceRisque = new MatTableDataSource(this.multiRisqueArray)
    //console.log('je rentre dans datarisque ',this.dataSourceRisque)




    if (this.codeProduit == '97') {
      //console.log("0000",formParamRisque)
      //console.log('je rentre dans la condition qui permet de reenitialiser uniquement certain champs')
      const preserveFields = ['SMP', 'ActivitéEst-elleEnregistréeAuCNRC?', 'ActivitéExercéeDevrait-elleÊtreEnregistréeAuCNRC'];
      // Les champs à ne pas réinitialiser

      // Capture automatiquement les valeurs des champs à préserver
      const preservedValues: any = {};
      preserveFields.forEach(field => {
        preservedValues[field] = this.formParamRisque.get(field)?.value;
      });



      // Réinitialise le formulaire
      this.formParamRisque.reset();
      this.formParamRisque.get('ZoneSismique').setValidators([])
      this.formParamRisque.get('ZoneSismique').updateValueAndValidity();
      this.formParamRisque.get('Longitude').setValidators([])
      this.formParamRisque.get('Longitude').updateValueAndValidity();
      this.formParamRisque.get("Latitude").setValidators([])
      this.formParamRisque.get("Latitude").updateValueAndValidity();
      // adde this to make zone sis not required





      // Restaurer les valeurs automatiquement pour les champs à préserver
      this.formParamRisque.patchValue(preservedValues);
      // const preservedValues: any = {};
      this.taillersq = this.dataSourceRisque.data.length
      //console.log('la taille inos',this.taillersq)
      //console.log('la taille ',this.dataSourceRisque.data.length)

    }

    else {
      //console.log('je reenitialise tout echhheeeeccc')

      formParamRisque.resetForm()

      //ending idea
    }
    //add validator
    this.paraRisqueProduit.map((paramRisque: any) => {
      if (paramRisque.sizeChamp != 0 && paramRisque.sizeChamp != undefined)
        this.formParamRisque.get(paramRisque.formName).setValidators([Validators.required, Validators.minLength(paramRisque.sizeChamp), Validators.maxLength(paramRisque.sizeChamp)])
      else
        if (paramRisque.obligatoire)
          //  this.formParamRisque.addControl(paramRisque.formName, new FormControl(paramRisque.defaultValue, [Validators.required]));
          this.formParamRisque.get(paramRisque.formName).setValidators([Validators.required])
        else
          //  this.formParamRisque.addControl(paramRisque.formName, new FormControl(paramRisque.defaultValue));
          this.formParamRisque.get(paramRisque.formName).setValidators([])

    })

  }

  // getRelation(typeChamp: any, isParent: boolean, idParamRisque: number, idReponse: number, formName: any) {
  //   if (isParent == true)
  //     if (typeChamp == 'L01') {

  //       this.paramRisqueService.getParamRelation(idParamRisque, idReponse).subscribe({
  //         next: (data: any) => {

  //           this.paraRisqueProduit.filter((param: any) => {
  //             if (param.idParamRisque == data[0].idParamRisque) {

  //               param.reponses = data[0].categorie.paramDictionnaires
  //               this.formParamRisque.controls[param.formName].enable()

  //             }
  //           })

  //         },
  //         error: (error) => {

  //           //console.log(error);

  //         }
  //       })
  //     } else {

  //       let idRisqueChild = this.paraRisqueProduit.find((rs: any) => rs.parent?.idParamRisque == idParamRisque)?.idParamRisque

  //       if (idRisqueChild)
  //         this.paramRisqueService.getTableParamChild(idRisqueChild, idReponse).subscribe({
  //           next: (data: any) => {
  //             this.paraRisqueProduit.filter((param: any) => {
  //               if (param.idParamRisque == idRisqueChild) {
  //                 param.reponses = data
  //                 this.formParamRisque.controls[param.formName].enable()
  //               }

  //             })
  //             // this.paraRisqueProduit.filter((param: any) => {
  //             //   if (param.idParamRisque == data[0].idParamRisque) {

  //             //     param.reponses = data[0].categorie.paramDictionnaires
  //             //     this.formParamRisque.controls[param.formName].enable()

  //             //   }
  //             // })

  //           },
  //           error: (error) => {

  //             //console.log(error);

  //           }
  //         })
  //     }

  //   // if (this.formParamRisque.get(formName)?.value?.is_medical) {
  //   //   this.isListParam = true;
  //   //   let idListparam = this.paramRisqueList.find((p: any) => p.idParamRisquePere?.idParamRisque == idParamRisque)?.idListParamRisque

  //   //   this.getListParamRisque(idListparam, "");
  //   // }
  // }
  getNomPack(pack: number): string {
    const noms: Record<number, string> = {
      6: 'Classic Plus',
      7: 'Tout en 1 limitée',
      8: 'Tout en 1',
      64: 'Classic'
    };
    return noms[pack] || 'Pack Inconnu';
  }
  get orderedPacks(): any[] {
    const desiredOrder = ['Tout en 1', 'Tout en 1 limitée', 'Classic Plus', 'Classic'];

    // Vérification que la date est bien définie
    if (!this.datemisen) {
      return []; // ou tu peux retourner les 4 packs si tu préfères
    }

    const dateCirculation = new Date(this.datemisen);
    const today = new Date();

    const diffYears =
      today.getFullYear() - dateCirculation.getFullYear() -
      (today.getMonth() < dateCirculation.getMonth() ||
        (today.getMonth() === dateCirculation.getMonth() && today.getDate() < dateCirculation.getDate()) ? 1 : 0);

    // Si le véhicule a moins de 12 ans, on affiche tous les packs dans l'ordre
    const allowedPacks = diffYears < 12
      ? desiredOrder
      : ['Classic Plus', 'Classic']; // seulement ces deux si >= 12 ans

    return this.packs
      ?.filter(p => allowedPacks.includes(this.getNomPack(p.idPack0)))
      ?.sort(
        (a, b) =>
          desiredOrder.indexOf(this.getNomPack(a.idPack0)) -
          desiredOrder.indexOf(this.getNomPack(b.idPack0))
      );
  }


  setDonneesResume(): void {
    if (!this.returnedTarif) {
      console.warn('returnedTarif non encore disponible.');
      return;
    }

    this.donnees = {
      nom: this.returnedTarif.nom || '',
      prenom: this.returnedTarif.prenom || '',
      dateAssure: this.returnedTarif.dateAssure || null,
      typeClient: this.returnedTarif.typeClient || '',
      dateEffetAvenant: this.returnedTarif.dateEffetAvenant || null
    };

    console.log('🔎 returnedTarif complet :', this.returnedTarif.primeList);
  }


  getRelation(typeChamp: any, isParent: boolean, idParamRisque: number, idReponse: number, formName: any, codeParam: any) {
    //console.log("prinatge22.0",this.formParamRisque)
    // const ZoneSis=this.formListParamRisque.FormGroup.controls.commune.value.zone_sis
    // //console.log("je suis la zone-siisi",this.formListParamRisque.FormGroup.controls.commune.value.zone_sis)

    if (this.codeProduit == '97' && codeParam == 'P262' && this.devis.idSousProduit != 'CTH') {
      //console.log("je rentre bien dans cette condition pour modifier le cnrc")
      //console.log("devis ====>",this.devis,this.dataSourceRisque)// la
      // //console.log("a ines",this.formParamRisque.get(formName).value)
      this.devis.groupes[0]?.groupeList?.map((rsq: any) => {
        rsq.risque.paramList.find((param: any) => param.idParam == idParamRisque).reponse.idParam = this.formParamRisque.get(formName).value.idParam
      })

      this.dataSourceRisque.data.map((rsqs: any) => rsqs["ActivitéEst-elleEnregistréeAuCNRC?"] = this.formParamRisque.get(formName).value.description)
    }
    // ughaled 
    //console.log("dddd",codeParam);
    if (this.codeProduit == '97' && codeParam == 'P264') {
      //console.log("prinatge55555555",this.formParamRisque)

      //console.log("nnnnnnnnnnnnnnnnnnnnnn ", this.formParamRisque.get(formName).value)
      const zone_sis = this.formParamRisque.get(formName).value.zone_sis;
      this.zone_sis = zone_sis;
      //console.log('im zone sis',this.zone_sis)
      this.formParamRisque.get("ZoneSismique")?.setValue(this.zone_sis)



      //daguiiii


      const latitude = this.formParamRisque.get(formName).value.latitude;
      this.latitude = latitude;
      //console.log('im latitude', this.latitude)
      this.formParamRisque.get("Latitude")?.setValue(this.latitude)

      const longitude = this.formParamRisque.get(formName).value.longitude;
      this.longitude = longitude;
      this.formParamRisque.get("Longitude")?.setValue(this.longitude)
      //console.log('imlongitude', this.longitude)


      // //console.log('teste me',this.formParamRisque.FormGroup .value.Commune.zone_sis)
      //8888 
      // const commune = this.formParamRisque.get(formName).value?.Commune;
      //value.Commune


      // if (commune.id == idReponse) {
      // //console.log('teste me', this.formParamRisque.get(formName).value?.Commune.zone_sis);
      // } else {
      //   //console.log('id de la commune ne correspond pas à idResponse');
      // }
    }


    else {
      //console.log('Commune non définie dans le formulaire');
    }


    // fin test me 

    if (this.codeProduit == '97' && codeParam == 'P261') {
      // //console.log("a ines",this.formParamRisque.get(formName).value)
      this.devis.groupes[0]?.groupeList?.map((rsq: any) => {
        rsq.risque.paramList.find((param: any) => param.idParam == idParamRisque).reponse.idParam = this.formParamRisque.get(formName).value.idParam
      })

      this.dataSourceRisque.data.map((rsqs: any) => rsqs["ActivitéExercéeDevrait-elleÊtreEnregistréeAuCNRC	"] = this.formParamRisque.get(formName).value.description)
    }







    if (isParent == true)
      if (typeChamp == 'L01') {

        this.paramRisqueService.getParamRelation(idParamRisque, idReponse).subscribe({
          next: (data: any) => {

            this.paraRisqueProduit.filter((param: any) => {
              if (param.idParamRisque == data[0].idParamRisque) {

                param.reponses = data[0].categorie.paramDictionnaires
                this.formParamRisque.controls[param.formName].enable()

              }
            })

          },
          error: (error) => {

            //console.log(error);

          }
        })
      } else {
        let idRisqueChild = this.paraRisqueProduit.find((rs: any) => rs.parent?.idParamRisque == idParamRisque)?.idParamRisque
        if (idRisqueChild)
          this.paramRisqueService.getTableParamChild(idRisqueChild, idReponse).subscribe({
            next: (data: any) => {
              //console.log('Résultat de getTableParamChild:', data);

              // zone sis tu sera ici 
              this.paraRisqueProduit.filter((param: any) => {
                if (param.idParamRisque == idRisqueChild) {
                  param.reponses = data


                  // on vas cree uune function qui vas recuperer zonsisi sellon l'id param











                  this.formParamRisque.controls[param.formName].enable()
                  //console.log("zone sis",this.formParamRisque)


                  // alert(this.formListParamRisque.FormGroup.controls.commune.value.zone_sis)

                }

              })
              // this.paraRisqueProduit.filter((param: any) => {
              //   if (param.idParamRisque == data[0].idParamRisque) {

              //     param.reponses = data[0].categorie.paramDictionnaires
              //     this.formParamRisque.controls[param.formName].enable()

              //   }
              // })

            },
            error: (error) => {

              //console.log(error);

            }
          })
      }


    //ActivitéEst-elleEnregistréeAuCNRC?

    // ajouter cnrc qst






    // if (this.formParamRisque.get(formName)?.value?.is_medical) {
    //   this.isListParam = true;
    //   let idListparam = this.paramRisqueList.find((p: any) => p.idParamRisquePere?.idParamRisque == idParamRisque)?.idListParamRisque

    //   this.getListParamRisque(idListparam, "");
    // }
  }

  objectDevis(withRemplissage: boolean) {
    const smp = this.formParamRisque.get("SMP")?.value;
    //console.log('je sui smp agui ',smp)

    let garantieObligatoire = false
    let sousGarantieObligatoire = false
    let packCompletOne: any = []
    let categoryOfGaranti: any = []
    let sousCategorieList = null

    if (!this.multiRisque || this.codeProduit == "97") {
      //DEBUT RECHERCHE
      this.garantieAll.map((garantie: any) => {
        Object.values(this.formPackGaranties.controls).map((row: any) => {
          //EXP ajout des sous garantie de la garantie

          //EXP garantie
          if (garantie.idPackComplet == row.value.idPackComplet) {
            // //console.log(" cond01 je suis 1951")


            if (row.controls.checked.value || ((this.route.snapshot.paramMap.get('codeProduit') == "96" || this.route.snapshot.paramMap.get('codeProduit') == "95") &&
              withRemplissage)) {
              // //console.log(" cond02 je suis 1955")

              garantieObligatoire = true

              // taux

              //  //console.log(this.pa)
              if (row.controls.idtaux.value.length != 0) {
                //console.log("row taux",row)

                // list of value
                if (row.controls.idtaux.value.length > 1) {
                  //console.log("row taux2",row)


                  sousCategorieList = null

                  this.gestionErreurPack(row.value.idPackComplet, "taux", this.formPackGaranties, withRemplissage)
                  if (!this.errorPackForm) {

                    if (row.value.taux?.sousCategorieList?.length != undefined && row.value.taux?.sousCategorieList?.length != 0)


                      sousCategorieList = {


                        "idSousCategoriePackComplet": row.value.taux?.sousCategorieList[0]?.idParamSCPackComplet,
                        "valeur": row.value.taux.valeur
                      }
                    categoryOfGaranti.push(
                      {
                        "idCategoriePackComplet": row.value?.taux?.idParamPackComplet,
                        "valeur": withRemplissage ? null : row.value.taux.valeur,
                        "sousCategorieList": sousCategorieList
                      }
                    )
                  }


                }
                else {
                  //input


                  // //console.log(" bahou " ,row)

                  // //console.log(" bahou 99 "+row)

                  // //console.log("vvv", row.value.taux)
                  // //console.log("00000000000000000000000", this.paraRisqueProduitCategory[0])
                  // //console.log("yaaaaaaaaaaaa",this.paraRisqueProduit)
                  //bed


                  if (row.value.taux != null) {

                    //console.log(" bahou 12 "+row.controls.idtaux.value[0].sousCategorieList )


                    sousCategorieList = null



                    // if (row.controls.idtaux.value[0].sousCategorieList?.length != undefined && row.controls.idtaux.value[0].sousCategorieList?.length != 0)
                    if (row.controls.idtaux.value[0].sousCategorieList?.length != 0) {
                      //console.log(" bahou 13 ")

                    }




                    sousCategorieList = {
                      "idSousCategoriePackComplet": row.controls.idtaux.value[0].sousCategorieList[0]?.idParamSCPackComplet,
                      "valeur": row.controls.idtaux.value[0].valeur,
                    }
                    categoryOfGaranti.push(
                      {
                        "idCategoriePackComplet": row.controls.idtaux?.value[0]?.idParamPackComplet,
                        "valeur": row.value.taux,

                        //"valeur": withRemplissage ? null : row.controls.idtaux.value[0].valeur,
                        "sousCategorieList": sousCategorieList
                      }
                    )

                    if (row.controls.idtaux.value[0].sousCategorieList?.length != undefined && row.controls.idtaux.value[0].sousCategorieList?.length != 0)

                      sousCategorieList = {
                        "idSousCategoriePackComplet": row.controls.idtaux?.value[0]?.sousCategorieList[0]?.idParamSCPackComplet,
                        "valeur": row.controls.idtaux.value[0].valeur
                      }
                    categoryOfGaranti.push(
                      {
                        "idCategoriePackComplet": row.controls.idtaux?.value[0]?.idParamPackComplet,
                        "valeur": withRemplissage ? null : row.controls.idtaux.value[0].valeur,
                        "sousCategorieList": sousCategorieList
                      }
                    )
                  }

                }




              } else

                if (row.controls.idformule.value.length != 0) {
                  //console.log(" cond03 je suis 1959")


                  // list of value
                  if (row.controls.idformule.value.length > 1) {
                    //console.log(" cond04 je suis 1964")
                    sousCategorieList = null

                    console.log("row 0,", this.formPackGaranties)
                    this.gestionErreurPack(row.value.idPackComplet, "formule", this.formPackGaranties, withRemplissage)
                    console.log("!this.errorPackForm ", this.errorPackForm)
                    if (!this.errorPackForm) {
                      //console.log(" cond05 je suis 1970")

                      if (row.controls.formule?.value?.sousCategorieList?.length != undefined && row.controls.formule?.value?.sousCategorieList?.length != 0)
                        //console.log(" cond06 je suis 1973")

                        sousCategorieList = {


                          "idSousCategoriePackComplet": row.controls.formule?.value?.sousCategorieList[0]?.idParamSCPackComplet,
                          "valeur": row.controls.formule.value.valeur // MODIFICATION PAR LAJOUT DE CONTROLS ET VALUE
                        }
                      categoryOfGaranti.push(
                        {
                          "idCategoriePackComplet": row.controls?.formule?.value?.idParamPackComplet,
                          "valeur": withRemplissage ? null : row.controls.formule.value.valeur,
                          "sousCategorieList": sousCategorieList
                        }
                      )
                    }


                  } else {
                    //input
                    //console.log(" cond07 je suis 1993")

                    if (row.value.formule != null) {
                      //console.log(" cond08 je suis 1993")

                      sousCategorieList = null
                      if (row.controls.idformule.value[0].sousCategorieList?.length != undefined && row.controls.idformule.value[0].sousCategorieList?.length != 0)
                        //console.log(" cond09")

                        sousCategorieList = {
                          "idSousCategoriePackComplet": row.controls.idformule.value[0].sousCategorieList[0]?.idParamSCPackComplet,
                          "valeur": row.controls.formule.value
                        }
                      categoryOfGaranti.push(
                        {
                          "idCategoriePackComplet": row.controls.idformule?.value[0]?.idParamPackComplet,
                          "valeur": withRemplissage ? null : row.controls.formule.value,
                          "sousCategorieList": sousCategorieList
                        }
                      )
                    } else {
                      //input non saisie


                      if (row.controls.idformule.value[0].descriptionvVal == "input" && !withRemplissage) {

                        this.errorPackForm = true
                      }
                      //valeur ou non saisie
                      sousCategorieList = null

                      if (row.controls.idformule.value[0].sousCategorieList?.length != undefined && row.controls.idformule.value[0].sousCategorieList?.length != 0)
                        //console.log(" cond12")

                        sousCategorieList = {
                          "idSousCategoriePackComplet": row.controls.idformule?.value[0]?.sousCategorieList[0]?.idParamSCPackComplet,
                          "valeur": row.controls.idformule.value[0].valeur
                        }
                      categoryOfGaranti.push(
                        {
                          "idCategoriePackComplet": row.controls.idformule?.value[0]?.idParamPackComplet,
                          "valeur": withRemplissage ? null : row.controls.idformule.value[0].valeur,
                          "sousCategorieList": sousCategorieList
                        }
                      )
                    }

                  }
                } if (row.controls.idfranchise.value.length != 0) {
                  //console.log(" cond13")

                  // list of value
                  if (row.controls.idfranchise.value.length > 1) {
                    //console.log(" cond14")

                    sousCategorieList = null

                    if (row.value.franchise?.sousCategorieList?.length != undefined && row.value.franchise.sousCategorieList?.length != 0)
                      //console.log(" cond15")

                      sousCategorieList = {
                        "idSousCategoriePackComplet": row.controls.franchise?.value.sousCategorieList[0]?.idParamSCPackComplet,
                        "valeur": row.controls.franchise.value.valeur
                      }

                    categoryOfGaranti.push(
                      {
                        "idCategoriePackComplet": row.controls?.franchise?.value?.idParamPackComplet,
                        "valeur": withRemplissage ? null : row.controls.franchise.value.valeur,
                        "sousCategorieList": sousCategorieList
                      }
                    )

                  } else {
                    //console.log(" cond16")

                    if (row.value.franchise != null) {
                      //console.log(" cond17")

                      sousCategorieList = null
                      if (row.controls.idfranchise.value[0].sousCategorieList?.length != undefined && row.controls.idfranchise.value[0].sousCategorieList?.length != 0)
                        //console.log(" cond18")

                        sousCategorieList = {
                          "idSousCategoriePackComplet": row.controls.idfranchise?.value[0]?.sousCategorieList[0]?.idParamSCPackComplet,
                          "valeur": row.value.franchise
                        }
                      categoryOfGaranti.push(
                        {
                          "idCategoriePackComplet": row.controls.idfranchise?.value[0]?.idParamPackComplet,
                          "valeur": withRemplissage ? null : row.value.franchise,
                          "sousCategorieList": sousCategorieList
                        }
                      )
                    } else {
                      //console.log(" cond19")

                      //input non saisie
                      if (row.controls.idfranchise.value[0].descriptionvVal == "input" && !withRemplissage) {
                        //console.log(" cond20")
                        this.errorPackForm = true
                      }
                      //valeur
                      sousCategorieList = null
                      if (row.controls.idfranchise.value[0].sousCategorieList?.length != undefined && row.controls.idfranchise.value[0].sousCategorieList?.length != 0)
                        //console.log(" cond21")

                        sousCategorieList = {
                          "idSousCategoriePackComplet": row.controls.idfranchise?.value[0]?.sousCategorieList[0]?.idParamSCPackComplet,
                          "valeur": row.controls.idfranchise.value[0].valeur
                        }
                      categoryOfGaranti.push(
                        {
                          "idCategoriePackComplet": row.controls.idfranchise?.value[0]?.idParamPackComplet,
                          "valeur": withRemplissage ? null : row.controls.idfranchise.value[0].valeur,
                          "sousCategorieList": sousCategorieList
                        }
                      )
                    }
                  }///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                } if (row.controls.idplafond.value.length != 0) {

                  //console.log(" cond22")



                  if (row.controls.idplafond.value.length > 1) {
                    //console.log(" cond23")


                    sousCategorieList = null
                    if (row.value.plafond?.sousCategorieList?.length != undefined && row.value.plafond?.sousCategorieList?.length != 0)
                      //console.log(" cond24")

                      sousCategorieList = {
                        "idSousCategoriePackComplet": row.controls.plafond?.value.sousCategorieList[0]?.idParamSCPackComplet,
                        "valeur": row.controls.plafond.value.valeur
                      }
                    categoryOfGaranti.push(
                      {
                        "idCategoriePackComplet": row.controls?.plafond?.value?.idParamPackComplet,
                        "valeur": withRemplissage ? null : row.controls.plafond.value.valeur,
                        "sousCategorieList": sousCategorieList
                      }
                    )

                  } else {
                    //console.log(" cond25")


                    if (row.value.plafond != null) {
                      //console.log(" cond26")


                      sousCategorieList = null
                      if (row.controls.idplafond.value[0].sousCategorieList?.length != undefined && row.controls.idplafond.value[0].sousCategorieList?.length != 0)
                        //console.log(" cond27")

                        sousCategorieList = {
                          "idSousCategoriePackComplet": row.controls.idplafond?.value[0]?.sousCategorieList[0]?.idParamSCPackComplet,
                          "valeur": row.value.plafond
                        }
                      categoryOfGaranti.push(
                        {
                          "idCategoriePackComplet": row.controls.idplafond?.value[0]?.idParamPackComplet,
                          "valeur": withRemplissage ? null : row.value.plafond,
                          "sousCategorieList": sousCategorieList
                        }
                      )
                    } else {
                      //console.log(" cond28")


                      //input non saisie
                      if (row.controls.idplafond.value[0].descriptionvVal == "input" && !withRemplissage) {
                        //console.log(" cond29")

                        this.errorPackForm = true

                      }
                      //valeur
                      sousCategorieList = null

                      if (row.controls.idplafond.value[0].sousCategorieList?.length != undefined && row.controls.idplafond.value[0].sousCategorieList?.length != 0) {
                        //console.log(" cond30")

                        sousCategorieList = {
                          "idSousCategoriePackComplet": row.controls.idplafond?.value[0]?.sousCategorieList[0]?.idParamSCPackComplet,
                          "valeur": row.controls.idplafond.value[0].valeur
                        }
                      }
                      categoryOfGaranti.push(
                        {
                          "idCategoriePackComplet": row.controls.idplafond?.value[0]?.idParamPackComplet,
                          "valeur": withRemplissage ? null : row.controls.idplafond.value[0].valeur,
                          "sousCategorieList": sousCategorieList
                        }
                      )
                    }

                  }
                }
              //console.log('valeur recherché',row.controls.idtaux.value)
              //console.log('valeur recherché',row.value.taux.valeur)








              // fin taux

              if (garantieObligatoire && !this.errorPackForm) {
                //console.log(" cond31")

                packCompletOne.push({
                  "idPackComplet": garantie.idPackComplet,
                  "prime": "",
                  "categorieList": categoryOfGaranti
                })
                categoryOfGaranti = []


              }
              //EXP SOUS GARANTIE :
              garantie.sousGarantieList.forEach((sousGarantie: any) => {

                row.get('souGarantieArray').controls.forEach((sousGarantieRow: any) => {

                  if (sousGarantie.idPackComplet == sousGarantieRow.value.idPackComplet) {
                    //console.log(" cond32")

                    if (sousGarantieRow.controls.checked.value || ((this.route.snapshot.paramMap.get('codeProduit') == "96" || this.route.snapshot.paramMap.get('codeProduit') == "95") && withRemplissage)) {

                      //console.log(" cond33")


                      sousGarantieObligatoire = true

                      if (sousGarantieRow.controls.idformule.value.length != 0) {
                        //console.log(" cond34")


                        // list of value
                        if (sousGarantieRow.controls.idformule.value.length > 1) {
                          //console.log(" cond35")

                          sousCategorieList = null

                          this.gestionErreurPack(sousGarantieRow.value.idPackComplet, "formule", row.get('souGarantieArray'), withRemplissage)
                          if (!this.errorPackForm) {
                            //console.log(" cond36")


                            if (sousGarantieRow.value.formule?.sousCategorieList?.length != undefined && sousGarantieRow.value.formule?.sousCategorieList?.length != 0)
                              //console.log(" cond37")


                              sousCategorieList = {
                                "idSousCategoriePackComplet": sousGarantieRow.value?.formule?.sousCategorieList[0]?.idParamSCPackComplet,
                                "valeur": sousGarantieRow?.value?.formule?.valeur
                              }
                            categoryOfGaranti.push(
                              {
                                "idCategoriePackComplet": sousGarantieRow.value?.formule?.idParamPackComplet,
                                "valeur": withRemplissage ? null : sousGarantieRow.value.formule.valeur,
                                "sousCategorieList": sousCategorieList
                              }

                            )

                          }


                        } else {
                          //console.log(" cond38")

                          //input
                          if (sousGarantieRow.value.formule != null) {
                            //console.log(" cond39")

                            sousCategorieList = null
                            if (sousGarantieRow.controls.idformule.value[0].sousCategorieList?.length != undefined && sousGarantieRow.controls.idformule.value[0].sousCategorieList?.length != 0)
                              //console.log(" cond40")

                              sousCategorieList = {
                                "idSousCategoriePackComplet": sousGarantieRow.controls.idformule?.value[0]?.sousCategorieList[0]?.idParamSCPackComplet,
                                "valeur": sousGarantieRow.value.formule
                              }
                            categoryOfGaranti.push(
                              {
                                "idCategoriePackComplet": sousGarantieRow.controls.idformule?.value[0]?.idParamPackComplet,
                                "valeur": withRemplissage ? null : sousGarantieRow.value.formule,
                                "sousCategorieList": sousCategorieList
                              }
                            )
                          } else {
                            //console.log(" cond41")

                            //input non saisie
                            if (sousGarantieRow.controls.idformule.value[0].descriptionvVal == "input" && !withRemplissage) {
                              //console.log(" cond42")

                              this.errorPackForm = true
                            }
                            //valeur ou non saisie
                            sousCategorieList = null
                            if (row.controls.idformule.value[0].sousCategorieList?.length != undefined && sousGarantieRow.idformule.value[0].sousCategorieList?.length != 0)
                              //console.log(" cond43")


                              sousGarantieRow = {
                                "idSousCategoriePackComplet": sousGarantieRow.controls.idformule?.value[0]?.sousCategorieList[0]?.idParamSCPackComplet,
                                "valeur": withRemplissage ? null : sousGarantieRow.controls.idformule.value[0].valeur
                              }
                            categoryOfGaranti.push(
                              {
                                "idCategoriePackComplet": sousGarantieRow.controls.idformule?.value[0]?.idParamPackComplet,
                                "valeur": withRemplissage ? null : sousGarantieRow.controls.idformule.value[0].valeur,
                                "sousCategorieList": sousCategorieList
                              }
                            )
                          }

                        }
                      } if (sousGarantieRow.controls.idfranchise.value.length != 0) {
                        //console.log(" cond44")

                        // list of value
                        if (sousGarantieRow.controls.idfranchise.value.length > 1) {
                          //console.log(" cond45")

                          sousCategorieList = null
                          if (sousGarantieRow.value.franchise.sousCategorieList?.length != undefined && row.value.franchise.sousCategorieList?.length != 0)
                            //console.log(" cond46")

                            sousCategorieList = {
                              "idSousCategoriePackComplet": sousGarantieRow.value.franchise.sousCategorieList[0]?.idParamSCPackComplet,
                              "valeur": sousGarantieRow.value.franchise.valeur
                            }
                          categoryOfGaranti.push(
                            {
                              "idCategoriePackComplet": sousGarantieRow.value.franchise.idParamPackComplet,
                              "valeur": sousGarantieRow.value.franchise.valeur,
                              "sousCategorieList": sousCategorieList
                            }
                          )

                        } else {
                          //console.log(" cond47")

                          if (sousGarantieRow.value.franchise != null) {
                            sousCategorieList = null
                            //console.log(" cond48")

                            if (sousGarantieRow.controls.idfranchise.value[0].sousCategorieList?.length != undefined && sousGarantieRow.controls.idfranchise.value[0].sousCategorieList?.length != 0)
                              //console.log(" cond49")

                              sousCategorieList = {
                                "idSousCategoriePackComplet": sousGarantieRow.controls.idfranchise.value[0].sousCategorieList[0]?.idParamSCPackComplet,
                                "valeur": sousGarantieRow.value.franchise
                              }
                            categoryOfGaranti.push(
                              {
                                "idCategoriePackComplet": sousGarantieRow.controls.idfranchise.value[0].idParamPackComplet,
                                "valeur": sousGarantieRow.value.franchise,
                                "sousCategorieList": sousCategorieList
                              }
                            )
                          } else {
                            //console.log(" cond50")

                            //input non saisie
                            if (sousGarantieRow.controls.idfranchise.value[0].descriptionvVal == "input" && !withRemplissage) {
                              //console.log(" cond51")

                              this.errorPackForm = true
                            }
                            //valeur
                            sousCategorieList = null
                            if (sousGarantieRow.controls.idfranchise.value[0].sousCategorieList?.length != undefined && sousGarantieRow.controls.idfranchise.value[0].sousCategorieList?.length != 0)
                              //console.log(" cond52")

                              sousCategorieList = {
                                "idSousCategoriePackComplet": sousGarantieRow.controls.idfranchise.value[0].sousCategorieList[0]?.idParamSCPackComplet,
                                "valeur": sousGarantieRow.controls.idfranchise.value[0].valeur
                              }
                            categoryOfGaranti.push(
                              {
                                "idCategoriePackComplet": sousGarantieRow.controls.idfranchise.value[0].idParamPackComplet,
                                "valeur": sousGarantieRow.controls.idfranchise.value[0].valeur,
                                "sousCategorieList": sousCategorieList
                              }
                            )
                          }
                        }///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                      } if (sousGarantieRow.controls.idplafond.value.length != 0) {
                        //console.log(" cond53")


                        if (sousGarantieRow.controls.idplafond.value.length > 1) {

                          //console.log(" cond54")

                          sousCategorieList = null
                          if (sousGarantieRow.value.plafond.sousCategorieList?.length != undefined && sousGarantieRow.value.plafond.sousCategorieList?.length != 0)
                            //console.log(" cond55")

                            sousCategorieList = {
                              "idSousCategoriePackComplet": sousGarantieRow.value.plafond.sousCategorieList[0]?.idParamSCPackComplet,
                              "valeur": sousGarantieRow.value.plafond.valeur
                            }
                          categoryOfGaranti.push(
                            {
                              "idCategoriePackComplet": sousGarantieRow.value.plafond.idParamPackComplet,
                              "valeur": sousGarantieRow.value.plafond.valeur,
                              "sousCategorieList": sousCategorieList
                            }
                          )

                        } else {

                          //console.log(" cond56")

                          if (sousGarantieRow.value.plafond != null) {
                            //console.log(" cond57")


                            sousCategorieList = null
                            if (sousGarantieRow.controls.idplafond.value[0].sousCategorieList?.length != undefined && sousGarantieRow.controls.idplafond.value[0].sousCategorieList?.length != 0)
                              //console.log(" cond58")

                              sousCategorieList = {
                                "idSousCategoriePackComplet": sousGarantieRow.controls.idplafond.value[0].sousCategorieList[0]?.idParamSCPackComplet,
                                "valeur": sousGarantieRow.value.plafond
                              }
                            categoryOfGaranti.push(
                              {
                                "idCategoriePackComplet": sousGarantieRow.controls.idplafond.value[0].idParamPackComplet,
                                "valeur": sousGarantieRow.value.plafond,
                                "sousCategorieList": sousCategorieList
                              }
                            )

                          } else {
                            //console.log(" cond59")


                            //input non saisie
                            if (sousGarantieRow.controls.idplafond.value[0].descriptionvVal == "input" && !withRemplissage) {
                              //console.log(" cond60")

                              this.errorPackForm = true

                            }
                            //valeur
                            sousCategorieList = null

                            if (sousGarantieRow.controls.idplafond.value[0].sousCategorieList?.length != undefined && sousGarantieRow.controls.idplafond.value[0].sousCategorieList?.length != 0) {
                              //console.log(" cond61")

                              sousCategorieList = {
                                "idSousCategoriePackComplet": sousGarantieRow.controls.idplafond.value[0].sousCategorieList[0]?.idParamSCPackComplet,
                                "valeur": sousGarantieRow.controls.idplafond.value[0].valeur
                              }
                            }
                            categoryOfGaranti.push(
                              {
                                "idCategoriePackComplet": sousGarantieRow.controls.idplafond.value[0].idParamPackComplet,
                                "valeur": sousGarantieRow.controls.idplafond.value[0].valeur,
                                "sousCategorieList": sousCategorieList
                              }
                            )
                          }
                        }

                      }
                      sousCategorieList = null

                      let sousGarantieExist = packCompletOne.some((packComplet: any) => packComplet.idPackComplet === sousGarantie.idPackComplet)

                      if (sousGarantieObligatoire && !this.errorPackForm && !sousGarantieExist) {

                        //console.log(" cond62")

                        packCompletOne.push({
                          "idPackComplet": sousGarantie.idPackComplet,
                          "prime": "",
                          "categorieList": categoryOfGaranti
                        })

                        categoryOfGaranti = []

                      }
                    }

                  }



                })

              });
            }


          }

        })
        categoryOfGaranti = []
        garantieObligatoire = false
      })
      console.log("this.errorPackForm ", this.errorPackForm)
      if (!this.errorPackForm) {
        //console.log("555",this.devisGroupe[0].groupeList[0]?.risque)
        //console.log("666",packCompletOne)

        //[0].categorieList[1]
        if (this.codeProduit == '97') {
          packCompletOne.find((el: any) => el.idPackComplet == 1541).categorieList?.filter((item: any) =>
            item.idCategoriePackComplet == 2118 && item.valeur == "0"
          );
          //console.log("pckcmp", packCompletOne)

          //mimi

          const pack = packCompletOne.find((el: any) => el.idPackComplet === 1541);

          // Check if the pack exists and then filter the categorieList
          if (pack && this.codeProduit == '97') {
            pack.categorieList = pack.categorieList.filter((item: any) => {
              if (item.idCategoriePackComplet == 2118)
                return !(item.valeur === "0");
              return true; // conserver les autres éléments
            });

          }

          // Display the updated packCompletOne
          //console.log("le pack apres suppretion ",packCompletOne);

        }



        // this.devisGroupe[0].groupeList[0].risque.packCompletList = packCompletOne

        // this.devisGroupe[0].groupeList[0].risque.packCompletList = packCompletOne
        if (this.codeProduit == '97') {
          this.devisGroupe[0]?.groupeList?.map((array: any) => {
            array.risque.packCompletList = packCompletOne;
          });
        } else


          this.devisGroupe[0].groupeList[0].risque.packCompletList = packCompletOne
        this.devisGroupe[0].groupeList[0].risque.primeList = []
        this.devisGroupe[0].groupeList[0].risque.taxeList = []
      }


    }




    else {

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

        this.devisGroupe.map((groupe: any) => {

          if (groupe.description == gp.group)
            groupe.groupeList.map((array: any) => {

              array.risque.packCompletList = packCompletOne
              array.risque.primeList = []
              array.risque.taxeList = []
            })
        })


        packCompletOne = []

      })

    }


    // this.devis.primeList = []
    // this.devis.taxeList = []

    if ((this.route.snapshot.paramMap.get('codeProduit') == "96" || this.route.snapshot.paramMap.get('codeProduit') == "95") && withRemplissage) {

      this.remplissageTarif()
      if (this.route.snapshot.paramMap.get('codeProduit') == "95")
        this.openDialogMRP();
    }

  }

  openDialogMRP() {
    this.indexSousGarantieMrp = 0
    if (this.indexGarantieMrp < this.garantieAll.length) {
      if (this.garantieAll[this.indexGarantieMrp].list && this.formPackGaranties.controls.find((g: any) => g.controls.idPackComplet.value == this.garantieAll[this.indexGarantieMrp].idPackComplet)?.controls.checked.value) {
        if (this.garantieAll[this.indexGarantieMrp].codeGarantie == "G53" && !this.formParamRisque.get("ActivitéProfessionnelle")?.value?.is_medical) {
          this.indexSousGarantieMrp = 0;
          this.checkListSousGaranties(this.garantieAll[this.indexGarantieMrp].sousGarantieList, this.formPackGaranties.controls.find((g: any) => g.controls.idPackComplet.value == this.garantieAll[this.indexGarantieMrp].idPackComplet)?.controls?.souGarantieArray)
        }
        else {
          this.getListParamRisque(this.garantieAll[this.indexGarantieMrp].idListParamRisque, this.garantieAll[this.indexGarantieMrp].idGarantie)
        }
      }
      else {
        this.indexSousGarantieMrp = 0;
        this.checkListSousGaranties(this.garantieAll[this.indexGarantieMrp].sousGarantieList, this.formPackGaranties.controls.find((g: any) => g.controls.idPackComplet.value == this.garantieAll[this.indexGarantieMrp].idPackComplet)?.controls?.souGarantieArray)
      }
    }
  }

  checkListSousGaranties(sousGarantie: any, formSousGarantie: any) {

    if (this.indexSousGarantieMrp < sousGarantie.length) {
      if (sousGarantie[this.indexSousGarantieMrp].list && formSousGarantie.controls.find((g: any) => g.controls.idPackComplet.value == sousGarantie[this.indexSousGarantieMrp].idPackComplet)?.controls.checked.value) {
        this.getListParamRisque(sousGarantie[this.indexSousGarantieMrp].idListParamRisque, sousGarantie[this.indexSousGarantieMrp].idSousGarantie)
      }
      else {
        this.indexSousGarantieMrp++;
        this.checkListSousGaranties(sousGarantie, formSousGarantie)
      }
    }
    else {
      this.indexGarantieMrp++;
      this.openDialogMRP()
    }
  }

  remplissageTarif() {

    this.devisService.remplissageDevis(this.devis).subscribe({
      next: (data: any) => {

        this.garantieTab.map((garantie: any) => {
          garantie.prime = null
          data.groupes[0].groupeList[0].risque.packCompletList.map((garantieData: any) => {
            // garanties
            if (garantie.idPackComplet == garantieData.idPackComplet) {
              garantie.plafond.forEach((plafondElement: any) => {
                garantieData.categorieList.forEach((elementCategory: any) => {

                  if (plafondElement.idParamPackComplet === elementCategory.idCategoriePackComplet) {
                    plafondElement.valeur = elementCategory.valeur
                  }
                });
              });

            }
            // sousgaranties

            garantie.sousGarantieList.data?.map((sousGarantie: any) => {

              if (sousGarantie.idPackComplet == garantieData.idPackComplet) {
                sousGarantie.plafond.forEach((plafondElement: any) => {
                  garantieData.categorieList.forEach((elementCategory: any) => {

                    if (plafondElement.idParamPackComplet === elementCategory.idCategoriePackComplet) {
                      plafondElement.valeur = elementCategory.valeur
                    }
                  });
                });

              }
            })

          })
        })

      },
      error: (error) => {

        //console.log(error);

      }
    });
  }

  async submitDevis() {

    this.returnedTarif.idReduction = 0
    this.returnedTarif.idConvention = 0
    this.returnedTarif.nbrPages = null
    //console.log("dureeeeeeee",this.formInfosAssure)
    this.returnedTarif.duree = this.formInfosAssure.value.duree

    this.returnedTarif.auditUser = 1102

    this.loaderDevis = true
    // const hmac = await this.cryptoService.generateHmac("XVxtWzI6T1RITUFORScYPHxBDww6dA9EUg==", this.returnedTarif);
    // const dataDevis = {
    //   stringJson:JSON.stringify(this.returnedTarif),
    //   // signature: hmac 
    // }



    // const hmac = await this.cryptoService.generateHmac(this.tkn, this.returnedTarif);
    // const stringifiedDevis3 = JSON.stringify(this.returnedTarif);
    // const dataDevis3 = {
    //   stringJson: stringifiedDevis3,
    //   signature: hmac
    // }


    this.devisService.createDevis({ UID: this.uid }).subscribe({
      next: (data: any) => {
        this.successDevis = true
        this.returnedDevis = data
        this.errorHandler.error = false
        this.errorHandler.msg = ""

        this.saveDevis = false
        this.idDevis = data.idDevis
        this.loaderDevis = false
        this.idDevis = data.idDevis
        // Swal.fire(
        //   `Le devis N° ${data.idDevis} a été créer avec succés.`,
        //   ``,
        //   `success`,

        // )
        // this.dataSourceGarantie = new MatTableDataSource(data)
        console.log('devis numéro : ==== ', this.idDevis);
        const token = localStorage.getItem('token');
        if (token) {
          this.envoyerDevisParMail(this.idDevis, token).subscribe({
            next: (res) => {
              console.log('📧 Mail envoyé avec succès', res);
            },

          });
        } else {
          console.warn('❗ Token introuvable pour envoi de mail');
        }


      },
      error: (error) => {
        this.loaderDevis = false
        this.handleError(error)
        //console.log(error);

      }
    });





  }

  envoyerDevisParMail(idDevis: string, token: string): Observable<any> {
const url = `${Constants.API_ENDPOINT_DEVIS_MAIL}/${idDevis}`;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'canal': 'DW' // ✅ Ajout dans les headers
    });
             this.downloadDevis(this.returnedDevis);

    return this.http.post(url, null, { headers }); // body = null
  }

  async generateCalcul() {

    if (this.codeProduit == '97' || this.codeProduit == '45F') {
      this.devis.nbrPages = this.nbrPages.value;
      // Vous pouvez décommenter ou ajouter d'autres propriétés si nécessaire
      // this.devis.sousProduit = 11;
      // Test sur nbrPages ou autres opérations spécifiques
    }
    // if(this.formPackGaranties.valid){
    //if ((this.multiRisque && this.nmbVehicule.value > 10 && this.fileSuccess) || (this.multiRisque && this.nmbVehicule.value < 10) || !this.multiRisque) {
    this.objectDevis(false)
    console.log('objetcdevis', this.objectDevis);
    console.log('this.devis :  ===== ', this.devis);


    if (this.devis.tailleRisque !== 0 && this.devis.groupes.length > 0) {
      for (let j = 0; j < this.devis.groupes?.[0].groupeList?.[0]?.risque?.packCompletList?.length; j++) {
        let exo = this.devis.groupes?.[0].groupeList?.[0]?.risque?.packCompletList?.[j];

        for (let i = 0; i < this.devis.groupes?.[0]?.groupeList?.[0]?.risque?.paramList?.length; i++) {
          let element = this.devis.groupes?.[0]?.groupeList?.[0]?.risque?.paramList?.[i];

          this.garantiesNew.forEach((garantie: any) => {
            garantie.categorieList.forEach((code: any) => {
              if (code.code === 'C7') {
                if (garantie.paramRisquePlafond) {
                  if (garantie.paramRisquePlafond.idParamRisque === element.idParam) {
                    exo.categorieList.forEach((d: any) => {
                      if (d.idCategoriePackComplet == code.idParamPackComplet) {
                        d.valeur = element.reponse.description;
                      }
                    });
                  }
                }
              }
            });
          });
        }
      }
    }

    // Mise à jour de la liste des garanties si nécessaire
    const listElement = this.devis.list.find((el: any) => el.idListParamRisque == 1);
    if (listElement) {
      listElement.idGarantie = 87;
    } //addd

    if (!this.errorPackForm) {
      this.devis.canal = 99

      this.devis.auditUser = 1102
      this.loaderTarif = true
      const hmac = await this.cryptoService.generateHmac(this.tkn, this.devis);
      const stringifiedDevis4 = JSON.stringify(this.devis);

      const dataDevis4 = {
        stringJson: stringifiedDevis4,
        signature: hmac
      }

      this.devisService.generateTarif(dataDevis4).subscribe({
        next: (data: any) => {
          this.errorHandler.error = false
          this.errorHandler.msg = ""
          this.uid = data.uid
          this.returnedTarif = data.tarificationResponse
          this.basicTarif = data.tarificationResponse
          this.tarifReady = true
          this.loaderTarif = false
          this.saveDevis = true
          this.loaderDevis = false
          this.garantieNull = false;
          //console.log('this.garantieTab')
          //console.log(this.garantieTab)

          // enregistrement du devis submitDevis
          // enregistrement du devis submitDevis
          // enregistrement du devis submitDevis
          // enregistrement du devis submitDevis
          this.submitDevis();

          //console.log('donne tarif',data)
          // garantie: this.garantieAll.find((g: any) => g.idGarantie == idGarantie),
          const TEMP = data.groupes[0]?.groupeList[0]?.risque?.paramList.find(
            (E: any) => E.codeParam == "P152"
          );

          //console.log('nekini temp', TEMP);

          this.valAss = TEMP?.reponse?.description


          if ((this.valAss >= 5000000000 && this.isBOUser == false)) {

            Swal.fire(
              "La valeur assurée dépasse 5 000 000 000 DA , vous ne pouvez pas continuer ",
              `error`
            )
            this.goBack();
            this.goBack();

          }








          /*
                 
           */







          //console.log('this.garantieTab');
          //console.log(this.garantieTab);



          if (this.multiRisque) {
            const hasNullPrime = data.groupes.some((group: any) => {
              return group.groupeList.some((risque: any) => {
                return risque.risque.packCompletList.some((garantie: any) => garantie.prime === 0);
              });
            });

            // if (hasNullPrime) {
            //   this.garantieNull = true
            //   Swal.fire(
            //       "Vous ne pouvez pas continuer. les primes des garanties ne peuvent pas être nul",
            //       '',
            //       'error'
            //   );
            // }


            if (hasNullPrime) {
              //console.log("je sus vamass",this.valAss)
              if ((this.valAss >= 5000000000 && this.isBOUser == false)) {

                Swal.fire(
                  "La valeur assurée dépasse 5 000 000 000 DA , vous ne pouvez pas continuer ",
                  `error`
                )
                this.goBack();
                this.goBack();

              } else {
                this.garantieNull = true;
                Swal.fire(
                  "Vous ne pouvez pas continuer. Les primes des garanties ne peuvent pas être nulles.",
                  '',
                  'error'
                );
              }
            }
          }

          this.garantieTab.forEach((garantie: any) => {
            let garantieData = data.groupes[0].groupeList[0].risque.packCompletList.find((garantieData: any) => garantie.idPackComplet === garantieData.idPackComplet);

            //console.log("garantieData")
            //console.log(garantieData)

            // if (garantieData) {
            //   //console.log("garantieData.prime")
            //   if(garantieData.prime == 0)
            //   {
            //     this.garantieNull = true
            //     Swal.fire(
            //       "Vous ne pouvez pas continuer. les primes des garanties ne peuvent pas etre nul",
            //       '',
            //       'error'
            //     )
            //   }
            //   else
            //   {
            //     this.garantieNull = false
            //     garantie.prime = garantieData.prime;
            //   }

            // }



            if (garantieData) {
              //console.log("garantieData.prime");
              if (garantieData.prime == 0) {

                if ((this.valAss >= 5000000000 && this.isBOUser == false)) {

                  Swal.fire(
                    "La valeur assurée dépasse 5 000 000 000 DA , vous ne pouvez pas continuer ",
                    `error`
                  )
                  this.goBack();
                  this.goBack();

                }
              } else {
                garantie.prime = garantieData.prime;
              }
            }
            garantie.sousGarantieList?.data?.forEach((sousgarantie: any, idx: any) => {
              let sousGarantieData = data.groupes[0].groupeList[0].risque.packCompletList.find((sousgarantieData: any) => sousgarantie.idPackComplet === sousgarantieData.idPackComplet);

              if (sousGarantieData) {
                sousgarantie.prime = sousGarantieData.prime;
                if (sousGarantieData?.categorieList.length != 0) {
                  sousGarantieData?.categorieList.map((categorie: any) => {
                    let formule: any = sousgarantie.formule.find(
                      (cat: any) => cat.idParamPackComplet == categorie.idCategoriePackComplet)

                    let franchise: any = sousgarantie.franchise.find(
                      (cat: any) => cat.idParamPackComplet == categorie.idCategoriePackComplet)

                    let plafond: any = sousgarantie.plafond.find(
                      (cat: any) => cat.idParamPackComplet == categorie.idCategoriePackComplet)

                    let taux: any = sousgarantie.taux.find(
                      (cat: any) => cat.idParamPackComplet == categorie.idCategoriePackComplet
                    )
                    if (formule) formule.valeur = categorie.valeur;
                    if (franchise) franchise.valeur = categorie.valeur;
                    if (plafond) plafond.valeur = categorie.valeur;
                    if (taux) taux.valeur = categorie.valeur;

                  })
                }
              }
            });
          });

          // this.returnedTarif.primeList.map(primeReturned())
          // this.devis.primeList.map((prime:any)=>{
          //   if(prime.typePrime==)
          // })


          this.PrimeTotale = data.primeList.find((prime: any) => prime.description == 'Prime nette')?.prime

          this.dataSource = new MatTableDataSource(this.garantieTab)
          if (this.multiRisque && !this.garantieNull)
            this.myStepper.next();

        },
        error: (error) => {
          this.loaderTarif = false
          this.handleError(error)

        }
      });
    }
    // }else{
    //   const invalid = [];
    //   const controls = this.formPackGaranties.controls;
    //   for (const name in controls) {
    //       if (controls[name].invalid) {
    //           invalid.push(name);
    //       }
    //   }

    // }
    if (!this.formPackGaranties.valid) {
      // this.formPackGaranties.controls[0].valueChanges.subscribe(() => { 

      // }
    }

    //}
      
  }


  goBackReduc() {
    this.returnedTarif = this.basicTarif
    this.myStepper.previous();
  }
  buildTableBody(data: any, columns: any) {
    var body = [];

    if (columns.includes("text1"))
      body.push(["", "", ""])
    else {
      if (columns.includes("prime")) {
        columns = columns.map((col: any) => {
          col.text = col
          col.style = "headerTable"
        })
        body.push(columns);
      }
      else
        body.push(columns);
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
      layout: columns.includes("text1") ? 'noBorders' : '',
      style: "table",
      table: {
        headerRows: 1,
        widths: width,
        margin: [5, 5, 5, 5],
        body: this.buildTableBody(data, columns)
      }
    }];
  }
  /*  downloadDevis(devis: any) {
  
  
  
  
  
      //get devis 
      //get paramDevis  
    
           this.devisService.getDevisById(devis.idDevis).subscribe({
            next: async(data: any) => {  
  
              await  this.devisService.getPackIdRisque(devis.idDevis, data.groupes[0].risques[0].idRisque).subscribe({
              next: (dataPack: any) => {      
            data.paramDevisList= dataPack.garantieList
            data.pack = dataPack.pack  
  
          
            this.devisService.generatePdf(data)
             // devis=data
            },
            error: (error: any) => {    
              //console.log(error);    
            }
          });
      },
      error: (error: any) => {    
        //console.log(error);    
      }
    });
      
    }
  */
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

              await this.devisService.generatePdfAuto(this.devisOutput)
            },
            error: (error: any) => {
              //console.log(error);
            }
          });
      },
      error: (error: any) => {
        //console.log(error);
      }
    });

  }

  // addRisqueToGroup(event: any, group: any, risque: any, index: any) {

  //   if (!risque.toGroup) {
  //     this.multiRisqueArray.filter((rs: any) => rs.NDImmatriculation == risque.NDImmatriculation)[0].toGroup = true
  //     this.multiRisqueArray.filter((rs: any) => rs.NDImmatriculation == risque.NDImmatriculation)[0].group = group

  //   } else {

  //   }

  // }
  goToResume() {

    if (!this.multiRisque)
      this.myStepper.next();
    else {

      this.generateCalcul();
    }
  }
  // //validation 
  // custom(bloquant:boolean): ValidatorFn {
  //   return { 'bloquant': bloquant };
  // }
  gestionErreurPack(idPackComplet: any, typeCategory: any, typeGarantieForm: any, withRemplissage: boolean) {
    if (!withRemplissage)
      typeGarantieForm.controls.forEach((garantie: any) => {
        if (garantie.value.idPackComplet == idPackComplet) {
          if (
            (typeCategory == "formule" && garantie.controls.formule.value == null) ||
            (typeCategory == "plafond" && garantie.controls.plafond.value == null) ||
            (typeCategory == "franchise" && garantie.controls.franchise.value == null)
          ) {
            console.log("this.errorPackForm ", this.errorPackForm, "typeCategory ", typeCategory)
            this.errorPackForm = true;
          }
        }
      });
  }

  //version de test 
  // convertToContract() {
  //   this.router.navigateByUrl("creation-contrat/dommage/" + this.route.snapshot.paramMap.get('codeProduit') + '/' + this.route.snapshot.paramMap.get('produit') + '/' + this.idDevis);


  // }
  convertToContract() {
    this.router.navigateByUrl("creation-contrat/" + this.route.snapshot.paramMap.get('codeProduit') + '/' + this.route.snapshot.paramMap.get('produit') + '/' + this.idDevis);


  }
  isPlafondDisabled(element: any): boolean {
  // Adapte le champ selon tes données : 'fixe', 'readonly', etc.
  return element.plafond?.every((p: any) => p.fixe);
}

isFranchiseDisabled(element: any): boolean {
  return element.franchise?.every((f: any) => f.fixe);
}

isFormuleDisabled(element: any): boolean {
  return element.formule?.every((f: any) => f.fixe);
}


  openDialog(risqueNum: any) {


    let dialogRef = this.dialog.open(DialogRisqueComponent, {
      width: '60%',
      data: {
        risque: this.multiRisqueArray.filter((risque: any) => risque.risqueNum == risqueNum)[0]
      }
    });
    dialogRef.afterClosed().subscribe((result: any) => {

    });
  }


  openDialogList(idGarantie: any) {

    let dialogRef = this.dialog.open(ListRisqueDialogComponent, {
      width: '60%',
      data: {
        displayedColumnsListParamRisque: this.displayedColumnsListParamRisque,
        idListParamList: this.idListParamList,
        listParamRisque: this.listParamRisque,
        formListParamRisque: this.formListParamRisque,
        garantie: this.garantieAll.find((g: any) => g.idGarantie == idGarantie),
        dataSourceListParamRisque: this.dataSourceListParamRisque,
        numberEffective: this.formParamRisque.get("Effectif").value

      }
    });
    dialogRef.afterClosed().subscribe((result: any) => {

      if (result) {
        const data = JSON.parse(JSON.stringify(result.data));
        this.dataSourceListParamRisque = data
        const ids = this.idsListParams;
        const codes = this.codesListParams;
        this.displayedColumnsListParamRisque.splice(-1, 1);

        this.paramList = data.filter((value: any) => { return this.displayedColumnsListParamRisque.every((cle: any) => value.hasOwnProperty(cle)) }).map((item: { [x: string]: any; }) => {
          let result = [];
          let keys = Object.keys(item);
          let idreponse = null
          let description = "debase"

          for (let i = 0; i < keys.length; i++) {
            if (this.listParamRisque.find((p: any) => p.formName == keys[i])?.typeChamp?.description == 'Liste of values') {
              idreponse = item[keys[i]].idParam
              description = item[keys[i]].code

            } else {

              idreponse = null
              if (this.listParamRisque.find((p: any) => p.formName == keys[i])?.typeChamp?.description == 'From Table') {

                description = item[keys[i]].code

              } else if (this.listParamRisque.find((p: any) => p.formName == keys[i])?.typeChamp?.description != 'date') {

                if (this.listParamRisque.find((p: any) => p.formName == keys[i])?.idParamRisque == 34)
                  description = String(Number(item[keys[i]]))
                else
                  if (keys[i] == 'Marque' || keys[i] == 'Modèle') {

                    idreponse = item[keys[i]]
                    description = ''
                  } else {
                    description = item[keys[i]]
                  }



              } else {
                description = item[keys[i]]
              }
            }

            result.push({
              idParam: ids[i],
              codeParam: codes[i],
              reponse: {
                "idReponse": idreponse,
                "description": description
              }
            });
          }
          //console.log("result",result);
          //console.log(result);
          return result;
        });
        const list = {
          idListParamRisque: this.idListParamList,
          idGarantie: idGarantie,
          paramList: []
        } as any;

        this.paramList.map(param => {
          list.paramList.push({
            prime: '',
            paramListsValues: param
          })
        })

        let devisExist = this.devis.list.findIndex((l: any) => l.idListParamRisque == list.idListParamRisque)
        let description = this.garantieAll.find((g: any) => g.idGarantie == idGarantie)?.codeGarantie == "G53" ? "Effectifs" : "Matériel informatique"
        if (devisExist != -1) {
          this.devis.list[devisExist] = list
          this.dataSourceListOfListes.data[devisExist] = { idListParamRisque: this.idListParamList, idGarantie: idGarantie, description: description }
        }
        else {
          this.devis.list.push(list);
          const newData = [...this.dataSourceListOfListes.data, { idListParamRisque: this.idListParamList, idGarantie: idGarantie, description: description }];
          this.dataSourceListOfListes.data = newData
        }

        this.formListParamRisque.reset();
        if (idGarantie != '') {
          this.garantieAll.findIndex((g: any) => g.idGarantie == idGarantie) == -1 ? this.indexSousGarantieMrp++ : '';
          this.checkListSousGaranties(this.garantieAll[this.indexGarantieMrp].sousGarantieList, this.formPackGaranties.controls.find((g: any) => g.controls.idPackComplet.value == this.garantieAll[this.indexGarantieMrp].idPackComplet)?.controls?.souGarantieArray)
        }
      }
      else {
        let devisExist = this.devis.list.findIndex((l: any) => l.idListParamRisque == this.idListParamList)
        if (devisExist != -1)
          this.devis.list[devisExist].idGarantie = idGarantie
        if (idGarantie != '') {
          this.garantieAll.findIndex((g: any) => g.idGarantie == idGarantie) == -1 ? this.indexSousGarantieMrp++ : '';
          this.checkListSousGaranties(this.garantieAll[this.indexGarantieMrp].sousGarantieList, this.formPackGaranties.controls.find((g: any) => g.controls.idPackComplet.value == this.garantieAll[this.indexGarantieMrp].idPackComplet)?.controls?.souGarantieArray)
        }
      }
    });
  }
  handleError(error: any) {

    switch (error.status) {

      case 500: // 
        this.errorHandler.error = true
        this.errorHandler.msg = "Erreur système, veuillez contacter l'administrateur."
        break;
      case 402: // actif
        this.errorHandler.error = true
        this.errorHandler.msg = "Erreur lors de la validation du devis, veuillez contacter l'administrateur."
        break;
      case 404: // actif
        this.errorHandler.error = true
        this.errorHandler.msg = error.message
        break;
      case 400: // actif
        this.errorHandler.error = true
        this.errorHandler.msg = error.message
        break;
      case "other": // actif
        this.errorHandler.error = true
        this.errorHandler.msg = error
        break;
    }
    if (this.errorHandler.error)
      Swal.fire(
        this.errorHandler.msg,
        '',
        'error'
      )
  }
  // submitNumberVehicule() {
  //   this.devis.tailleRisque = this.nmbVehicule.value;
  //   //dev 
  //   let hasRights = localStorage.getItem('roles')?.includes("DA") || localStorage.getItem('roles')?.includes("CDC")
  //   if (this.nmbVehicule.value > 20 && hasRights) {
  //     Swal.fire(
  //       `Vous n’avez pas le privilège pour faire ce devis veuillez voir avec le BO`,
  //       ``,
  //       `error`,

  //     )
  //     this.risqueStep = 0;
  //   } 
  //   // else if (this.nmbVehicule.value > 10)
  //   //   this.risqueStep = 2
  //   // else
  //   //   this.risqueStep = 1

  //   this.withFile=true

  //   this.devis.file = null;

  // }


  submitNumberVehicule() {


    this.devis.tailleRisque = this.nmbVehicule.value;
    //console.log('555555555555555',  this.devis.tailleRisque)
    //console.log('eee',this.nmbVehicule.value)
    // Retrieve roles from session storage
    const roles = localStorage.getItem('roles') || '';
    const hasRights = roles.includes("DA") || roles.includes("CDC");
    //console.log("rights:", hasRights)

    // if (this.nmbVehicule.value > 50 && hasRights) {
    // //console.log('ma3endich rights')
    //   // Display the error alert and handle reset after the alert is closed
    //   Swal.fire(
    //     'Vous n’avez pas le privilège pour faire ce devis veuillez voir avec le BO',
    //     '',
    //     'error'
    //   ).then(() => {
    //     this.risqueStep = 0;
    //     if (this.myStepper) {
    //       this.myStepper.previous();
    //     } else {
    //       console.warn('Stepper instance is not available.');
    //     }
    //   });

    //   // Prevent further execution of the function
    //   return;
    // }
    //console.log('3endiiiiiii')

    // Continue with the rest of the logic if the condition is not met
    this.withFile = true;
    this.devis.file = null;

  }
  // checkVehiculeNumber() {
  //   if (this.nmbVehicule.value !== this.multiRisqueArray.length) {
  //     Swal.fire(
  //       " le nombre de véhicules ajoutés ne correspond pas au nombre de véhicules indiqué",
  //       `error`
  //     )
  //     // this._snackBar.open(" le nombre de véhicules ajoutés ne correspond pas au nombre de véhicules indiqué", 'fermer', {
  //     //   horizontalPosition: "end",
  //     //   panelClass: ['danger-snackbar']
  //     // })
  //   } else
  //     this.myStepper.next();
  // }

  checkVehiculeNumber() {

    const roles = localStorage.getItem('roles') || '';
    const hasRights = roles.includes("DA") || roles.includes("CDC");

    //console.log("aaaa",this.nmbVehicule)
    //console.log("bbbbb",this.multiRisqueArray)

    this.TOTALE = this.multiRisqueArray?.[0].ValeurTotale;
    //console.log('kkkkkkk',this.TOTALE)


    //console.log('dfddddd',this.nmbVehicule.value !== this.multiRisqueArray.length , this.selectedSousProduit!='CTH', this.codeProduit=='97', this.isBOUser==true)






    if ((this.nmbVehicule.value !== this.multiRisqueArray.length && this.selectedSousProduit != 'CTH' && this.codeProduit != '97')
      || (this.nmbVehicule.value !== this.multiRisqueArray.length && this.selectedSousProduit != 'CTH' && this.codeProduit == '97' && this.isBOUser == true)) {
      if (this.codeProduit == '97') {
        Swal.fire(
          " le nombre de site ajoutés ne correspond pas au nombre de site indiqué",
          `error`
        )
        this.goBack();
      } else
        Swal.fire(
          " le nombre de véhicules ajoutés ne correspond pas au nombre de véhicules indiqué",
          `error`
        )
      this.goBack();
      // this._snackBar.open(" le nombre de véhicules ajoutés ne correspond pas au nombre de véhicules indiqué", 'fermer', {
      //   horizontalPosition: "end",
      //   panelClass: ['danger-snackbar']
      // })
      // //console.log("smp",this.formParamRisque.get("SMP")?.value)
    } else
      this.valAss = this.formParamRisque.get("ValeurAssurée")?.value
    //console.log('dededed',this.valAss)
    if ((this.formParamRisque.get("ValeurAssurée")?.value > 5000000000 && this.isBOUser == false)) {

      Swal.fire(
        "La valeur assurée dépasse 5 000 000 000 DA , vous ne pouvez pas continuer ",
        `error`
      )
      this.goBack();

    } else

      // REVIENS LA POUR LE MESSAGE SMP >50000
      this.myStepper.next();

  }

  onSousProduitSelected(idSousProduits: any | null) {
    this.selectedSousProduit = idSousProduits;
    //console.log('Le sous-produit sélectionné est', this.selectedSousProduit);
    const sousProduitSelectionne = this.sousProduits.find((e: { code: string }) => e.code == this.selectedSousProduit);

    this.IDSOUSPROD = sousProduitSelectionne.idSousProduit;

    if (this.selectedSousProduit) {
      // alert('Le sous-produit sélectionné est ' + this.selectedSousProduit);
    }
    // c'est la que je controle kele passage tu form
    if (this.codeProduit == '97') {
      if (this.selectedSousProduit == 'CTI') {
        const controlernames = [
          'ValeurAssurée',
          'ValeurDéclarée',
          // 'ZoneSismique',
          // 'TypeStructure',

          // 'TotalContenu',
          // 'ValeurTotale',

          'ValeurNormative',
          'TypeHabitation',
          'UnePartieEst-elleLouéePourUsageCommercial?',
          // 'nmbVehicule'


        ];


        this.formParamRisque.get('ZoneSismique').setValidators([])
        this.formParamRisque.get('ZoneSismique').updateValueAndValidity();
        controlernames.forEach(controlName => {
          this.formParamRisque.get(controlName).disable();


        });
        const valaff = [

          'ZoneSismique',
          "Latitude",
          "Longitude",
          // 'TypeToiture'
          // 'SMP',
        ];


        valaff.forEach(controlName => {
          const control = this.formParamRisque.get(controlName);
          if (control) {
            control.clearValidators(); // Removes all validators, including 'required'
            control.updateValueAndValidity(); // Updates the control's validity status
          }
        });

        if (this.codeProduit == '97' && this.isBOUser == false) {
          // this.formParamRisque.get('SMP').disable();
        }

        //console.log("je suis le new control",this.formParamRisque)

      }
      if (this.selectedSousProduit == 'CTH') {
        // this.devis.nmbVehicule.disable();

        const controlernames = [
          // 'TypeStructure',
          // 'UnePartieEst-elleLouéePourUsageCommercial?',
          // 'ValeurNormative',
          // 'ValeurAssurée',
          // 'ZoneSismique',


          'TotalContenu',
          'ValeurContenant',
          'ValeurDeLaMarchandise',
          'ValeurMatérielEtÉquipement',
          'ValeurTotale',
          'Site',



          'ActivitéEst-elleEnregistréeAuCNRC?',

          'ActivitéExercéeDevrait-elleÊtreEnregistréeAuCNRC',
          'groupe',
          //  'SMP',
          // 'nmbVehicule',
          'newGroupe'





        ];
        const valaff = [
          'ValeurNormative',
          'ValeurAssurée',
          'ZoneSismique',
          "Latitude",
          "Longitude",
          'SMP',
          // 'TypeToiture'

        ];
        controlernames.forEach(controlName => {
          this.formParamRisque.get(controlName).disable();


        });
        valaff.forEach(controlName => {
          const control = this.formParamRisque.get(controlName);
          if (control) {
            control.clearValidators(); // Removes all validators, including 'required'
            control.updateValueAndValidity(); // Updates the control's validity status
          }
        });








      }
    }

  }

  isReadonly(): boolean {


    const result = !(
      (this.TOTALE > 5000000000 && this.isBOUser) ||
      (this.selectedSousProduit == "CTH" && this.isBOUser)
    );

    //console.log('isReadonly result:', result);

    return result;
  }

  getCategorieValeur(idPack: number): string | null {
    const packCompletList: PackComplet[] =
      this.returnedTarif?.groupes?.[0]?.groupeList?.[0]?.risque?.packCompletList || [];

    const pack = packCompletList.find((p) => p.idPackComplet === idPack);
    return pack?.categorieList?.[0]?.valeur || null;
  }

  getCategorieValeur2(idPack: number): string | null {
    const packCompletList: PackComplet[] =
      this.returnedTarif?.groupes?.[0]?.groupeList?.[0]?.risque?.packCompletList || [];

    const pack = packCompletList.find((p) => p.idPackComplet === idPack);
    return pack?.prime || null;
  }

  onInput(value: any, codeParam: any) {
    let totale: number;

    // Vérifier si la valeur est bien un nombre
    const isNumeric = (val: any): boolean => !isNaN(Number(val));

    // Cas 1 : Calcul du Total Contenu (P269, P271) pour le produit 97
    if ((codeParam === 'P269' || codeParam === 'P271') && this.codeProduit === '97') {
      const ValeurMatérielEtÉquipement = this.formParamRisque.get('ValeurMatérielEtÉquipement')?.value;
      const ValeurDeLaMarchandise = this.formParamRisque.get('ValeurDeLaMarchandise')?.value;

      if (isNumeric(ValeurMatérielEtÉquipement) && isNumeric(ValeurDeLaMarchandise)) {
        const sum = Number(ValeurMatérielEtÉquipement) + Number(ValeurDeLaMarchandise);
        this.formParamRisque.get('TotalContenu')?.setValue(sum);
      }
    }

    // Cas 2 : Calcul du Total Valeur (P241, P249) pour le produit 97
    if ((codeParam === 'P241' || codeParam === 'P249') && this.codeProduit === '97') {
      const TotalContenu = this.formParamRisque.get('TotalContenu')?.value;
      const ValeurContenant = this.formParamRisque.get('ValeurContenant')?.value;

      if (isNumeric(ValeurContenant) && isNumeric(TotalContenu)) {
        const sum = Number(TotalContenu) + Number(ValeurContenant);
        this.formParamRisque.get('ValeurTotale')?.setValue(sum);
        this.formParamRisque.updateValueAndValidity();

        // Gestion de la valeur SMP pour le produit industriel (CTI)
        if (this.codeProduit === '97' && this.selectedSousProduit === 'CTI') {
          const smpValue = sum * 0.5;
          this.formParamRisque.get('SMP')?.setValue(smpValue);
        }
      }
    }

    // Cas 3 : Calcul pour le produit 95 avec P128
    if (this.codeProduit === '95' && codeParam === 'P128') {
      this.paraRisqueProduit.forEach((param: any) => {
        if (param.codeParam === 'P198') {
          const calculatedValue = value * this.calculCapitaleMRP;
          this.formParamRisque.get(param.formName)?.setValue(calculatedValue);
          this.isFieldReadOnly = true;
        }
      });
    }

    // Cas 4 : Gestion de la mise à jour de SMP pour le produit 97 avec P245
    if (this.codeProduit === '97' && codeParam === 'P245') {
      this.devis.groupes[0]?.groupeList?.forEach((rsq: any) => {
        const param = rsq.risque.paramList.find((param: any) => param.codeParam === 'P245');
        if (param) param.reponse.description = value;
      });

      this.Smp = value;

      // Mise à jour des données dans la dataSourceRisque
      this.dataSourceRisque.data.forEach((rsqs: any) => {
        rsqs.SMP = value;
      });
    }
  }


  selectedIndex = 0;

  get progressPercentage(): number {
    const totalSteps = 4; // remplace 4 par le nombre total de mat-step stepper 
    return (this.selectedIndex / (totalSteps - 1)) * 100;
  }

  getImageForPack(description: string): string {
    switch (description) {
      case 'Classic':
        return 'assets/Classic.jpg';
      case 'Classic Plus':
        return 'assets/Classic+.jpg';
      case 'Tout en 1':
        return 'assets/TT1.jpg';
      case 'Tout en 1 limitée':
        return 'assets/TT1limite.jpg';
      default:
        return 'assets/packs/default.png';
    }
  }

  getDescriptionForPack(description: string): string {
    switch (description) {
      case 'Tout en 1':
        return 'Un contrat, zéro compromis';
      case 'Tout en 1 limitée':
        return 'L’essentiel de la couverture, à prix réduit';
      case 'Classic Plus':
        return 'Le grand « que vous méritez »';
      case 'Classic':
        return 'L’assurance essentielle pensée pour l’essentiel';
      default:
        return '';
    }
  }

  resetStepper(): void {
    // Revenir à la première étape
    window.location.reload();
  }

  goToStep(index: number): void {
    this.myStepper.selectedIndex = index;
  }
  selectPack(pack: any): void {
    this.selectedPack = pack;
    this.getPack(pack.idPack0);
  }

  deleteRisque(idRisque: any) {

    this.multiRisqueArray = this.multiRisqueArray.filter((risque: any) => risque.risqueNum != idRisque)

    this.dataSourceRisque.data = this.multiRisqueArray
    let descriptionGroup: any
    this.devisGroupe.map((groupe: any) => {
      groupe.groupeList = groupe.groupeList.filter((risque: any) => {
        if (risque.numRisque == idRisque) {
          descriptionGroup = groupe.description
        }
        return risque.numRisque != idRisque
      })

    })

    this.groupArray = this.groupArray.filter((groupe: any) => groupe != descriptionGroup)
    this.devisGroupe = this.devisGroupe.filter((groupe: any) => {
      return groupe.description != descriptionGroup
    })
    this.dataSourceGroupePack.data = this.dataSourceGroupePack.data.filter((groupPack: any) => groupPack.group != descriptionGroup)

    this.devis.groupes = this.devisGroupe

  }
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];

    this.uploadExcelFile()
  }
  uploadExcelFile() {
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target != null) {
          let base64String = event.target.result as string;
          const parts = base64String?.split(',');

          if (parts.length === 2)
            base64String = parts[1];
          this.sendToAPI(base64String);
        }
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  sendToAPI(base64: any) {
    let body = {
      "file": base64
    }
    this.devisService.controleDevisMulti(body, this.codeProduit).subscribe({
      next: (data: any) => {
        this.fileControle = data
        const erroFile = this.fileControle.some((lignes: any) => lignes.description.some((desc: any) => desc.length !== 0));

        if (erroFile) {
          this.fileInput.nativeElement.value = null;
          this.fileSuccess = false
        }


        if (this.fileControle.length == this.nmbVehicule.value) {
          this.devis.file = base64
          this.fileSuccess = true
        } else {
          this.fileSuccess = false
          this.fileInput.nativeElement.value = null;
          Swal.fire(
            `Le nombre de lignes ne correspond pas au nombre de risque indiqué, nombre de ligne= ` + this.fileControle.length + `, nombre indiqué= ` + this.nmbVehicule.value + `. veuillez resaisir le fichier ou modifié le nombre de risque`,
            ``,
            `error`,

          )
        }
        if (this.fileControle.length > 20 && (localStorage.getItem('roles')?.includes("DA") || localStorage.getItem('roles')?.includes("CDC"))) {
          Swal.fire(
            `Vous n’avez pas le privilège pour faire ce devis veuillez voir avec le BO`,
            ``,
            `error`,

          )
          this.fileSuccess = false
          this.fileInput.nativeElement.value = null;
        }
        else {
          this.devis.file = base64
          this.fileSuccess = true
        }

      },
      error: (error) => {

        Swal.fire(
          error,
          ``,
          `error`,

        )
        this.fileInput.nativeElement.value = null;
      }
    });
  }


}
// function customParam(control: AbstractControl,bloquant:boolean): { [key: string]: boolean } | null {

//       return { 'bloquant': bloquant };

// }


function customParam(bloquant: boolean, message: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    // return { 'bloquant': bloquant,'msg': message };
    return {
      "bloquant": bloquant,
      "msg": message
    }

  };
}