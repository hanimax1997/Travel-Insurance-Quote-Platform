import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
//import { environment } from 'src/environments/environment.testing';
@Injectable()
// dev

export class Constants {
  //satim
  public static API_ENDPOINT_PAIEMENT_SATIM: string = environment.url + ':' + environment.portSatim + '/api/monitic/epaiement';
  public static API_ENDPOINT_CONFIRM_SATIM: string = environment.url + ':' + environment.portSatim + '/api/monitic/confirm';
  public static API_ENDPOINT_SEND_MAIL: string = environment.url + ':' + environment.portSatim + '/api/Mail/TransfertAttestationBancaire';

  //param risques
  public static API_ENDPOINT_param_risque: string = environment.url + ':' + environment.portProduit + '/api/produit/risqueParametre';
  public static API_ENDPOINT_param_risque_all: string = environment.url + ':' + environment.portProduit + '/api/produit/risqueParametre/all';
  public static API_ENDPOINT_param_risque_devis_workflow: string = environment.url + ':' + environment.portProduit + '/api/produit/risqueParametre/workflow';
  public static API_ENDPOINT_param_risque_relation: string = environment.url + ':' + environment.portProduit + '/api/produit/risqueParametre/byParentParamRisque';
  public static API_ENDPOINT_param_risque_TABLE_PARENT: string = environment.url + ':' + environment.portProduit + '/api/produit/risqueParametre/fromtable';
  public static API_ENDPOINT_details_param_risque_list: string = environment.url + ':' + environment.portProduit + '/api/produit/risqueParametre/details';
  
  //authentification
  public static API_ENDPOINT_FORGET_PASSWORD: string = environment.url + ':18989/api/authentification/forgetpassword'
  public static API_ENDPOINT_RESET_PASSWORD: string = environment.url + ':18989/api/authentification/resetPassword/'

  //generic
  public static API_ENDPOINT_dictionnaire: string = environment.url + ':' + environment.portGeneric + '/api/generic/parametre/dictionnaire';
  public static API_ENDPOINT_PARAMETRE: string = environment.url + ':' + environment.portGeneric + '/api/generic/parametre/categorie';
  public static API_ENDPOINT_PRODUIT_CODE: string = environment.url + ':' + environment.portProduit + '/api/produit/reduit';
  public static API_ENDPOINT_PRODUIT_BY_ID: string = environment.url + ':' + environment.portProduit + '/api/produit';
  public static API_ENDPOINT_parametre: string = environment.url + ':' + environment.portGeneric + '/api/generic/parametre';
  public static API_ENDPOINT_pays: string = environment.url + ':' + environment.portGeneric + '/api/generic/pays';
  public static API_ENDPOINT_communes: string = environment.url + ':' + environment.portGeneric + '/api/generic/wilaya/commune';
  public static API_ENDPOINT_GENERIC: string = environment.url + ':' + environment.portGeneric + '/api/generic'
  public static API_ENDPOINT_GENERIC_WILAYA: string = Constants.API_ENDPOINT_GENERIC + "/pays/wilaya-by-pays"
  public static API_ENDPOINT_GENERIC_COMMUNE: string = Constants.API_ENDPOINT_GENERIC + "/pays/wilaya/commune-by-wilaya"
  public static API_ENDPOINT_GENERIC_PAYS: string = Constants.API_ENDPOINT_GENERIC + "/pays"

  //controle
  public static API_ENDPOINT_CONTROLE_FILE: string = environment.url + ":" + environment.portControles + "/api/controle/file/produit";

  //agence
  public static API_ENDPOINT_AGENCE: string = environment.url + ":" + environment.portAgence + "/api/agence"

  //pack
  public static API_ENDPOINT_PACK_DESC: string = environment.url + ':' + environment.portProduit + '/api/produit/packComplet/description';// TEST
  public static API_ENDPOINT_GET_PACK: string = environment.url + ':' + environment.portProduit + '/api/produit/pack0'; // TEST
  public static API_ENDPOINT_GET_PACK_VOYAGE: string = environment.url + ':' + environment.portProduit + '/api/controle/pack'; // TEST
  
  //tarif
  public static API_ENDPOINT_TARIF: string = environment.url + ":" + environment.portTarification + "/api/tarification/prime"; // 
  public static API_ENDPOINT_TARIF_REMPLISSAGE: string = environment.url + ":" + environment.portTarification + "/api/tarification/remplissage"

  //control
  public static API_ENDPOINT_CONTROLE: string = environment.url + ":" + environment.portControles + "/api/controle/produit"; //

  //devis
  public static API_ENDPOINT_DEVIS: string = environment.url + ":" + environment.portDevis + "/api/devis" //
  public static API_ENDPOINT_DEVIS_MAIL: string = environment.url + ":" + environment.portDevis + "/api/Mail/TransfertDevisVoyage"
 
  // auth
  public static API_ENDPOINT_AUTH: string = environment.url + ":18989/api/authentification/login" //
  public static API_ENDPOINT_REFRESH_TOKEN: string = environment.url + ":" + environment.portUser + "/api/authentification/token/refresh" //
  public static API_ENDPOINT_GET_USERID: string = environment.url + ":18989/api/authentification/get" //

  // AUTH KEY PUBLIC/PRIVATE
  public static API_ENDPOINT_GET_KEY: string = environment.url + ":" + environment.portUser + "/api/partners-auth/getKey" //
  public static API_ENDPOINT_AUTHENTICATE: string = environment.url + ":" + environment.portUser + "/api/partners-auth/authenticate" //
  public static API_ENDPOINT_REFRESH: string = environment.url + ":" + environment.portUser + "/api/partners-auth/refresh" //

  //contrat
  public static API_ENDPOINT_CONTRAT: string = environment.url + ':' + environment.portContrat + "/api/contrat" //
  public static API_ENDPOINT_CONTRAT_MAIL: string = environment.url + ":" + environment.portDevis + "/api/Mail/TransfertContratVoyage"
  public static API_ENDPOINT_CONTRAT_FILTRE: string = environment.url + ':18989/api/contrat/filtre';
  public static API_ENDPOINT_QUITTANCE: string = environment.url + ':' + environment.portContrat + "/api/contrat/quittance" //

  //reduction
  public static API_ENDPOINT_TEST_REDUCTION_BY_CONVENTION: string = environment.url + ':' + environment.portProduit + '/api/produit/reduction/convention';
  public static API_ENDPOINT_TEST_REDUCTION_DEVIS: string = environment.url + ':' + environment.portTarification + '/api/tarification/reduction';

  //convention
  public static API_ENDPOINT_TEST_CONVENTION: string = environment.url + ':' + environment.portProduit + '/api/produit/convention';
  public static API_ENDPOINT_TEST_CONVENTION_MODIF: string = environment.url + ':' + environment.portProduit + '/api/produit/convention/modification';
  public static API_ENDPOINT_TEST_CONVENTION_FILTER: string = environment.url + ':' + environment.portProduit + '/api/produit/convention/filtre';

  //Produit
  public static API_ENDPOINT_DUREE: string = environment.url + ':' + environment.portProduit + '/api/produit/duree';
  public static API_ENDPOINT_DUREE_BY_PRODUIT: string = environment.url + ':' + environment.portProduit + '/api/produit/ProduitDuree/getProduitDureeByProduit';
  public static API_ENDPOINT_param_risque_list: string = environment.url + ':' + environment.portProduit + '/api/produit/risqueParametre/listparam';
  public static API_ENDPOINT_PACK_BY_PRODUIT_PARAM: string = environment.url + ':' + environment.portProduit + '/api/produit/pack0/produit';
  public static API_ENDPOINT_PACK_BY_PRODUIT: string = environment.url + ':' + environment.portProduit + '/api/produit/pack0/getPack0ByIdProduit';

  //Personne
  public static API_ENDPOINT_personne: string = environment.url + ':' + environment.portPersonne + '/api/personne';
  public static API_ENDPOINT_personne_morale: string = environment.url + ':' + environment.portPersonne + '/api/personne/personne-morale ';

  //reduction
  public static API_ENDPOINT_TEST_REDUCTION: string = environment.url + ':' + environment.portProduit +'/api/produit/reduction';
  public static API_ENDPOINT_TEST_REDUCTION_FILTRE: string = environment.url + ':' + environment.portProduit + '/api/produit/reduction/filtre';

  //vehicule
  public static API_ENDPOINT_vehicule: string = environment.url + ':' + environment.portGeneric + '/api/generic/vehicule';
  public static API_ENDPOINT_marque: string = environment.url + ':' + environment.portGeneric + '/api/generic/vehicule/marque';
  public static API_ENDPOINT_marque_save: string = environment.url + ':' + environment.portGeneric + '/api/generic/vehicule/marque/save';
  public static API_ENDPOINT_modele_save: string = environment.url + ':' + environment.portGeneric + '/api/generic/vehicule/modele/save';
  public static API_ENDPOINT_vehicule_filtre: string = environment.url + ':' + environment.portGeneric + '/api/generic/vehicule/filtre';
  public static API_ENDPOINT_vehicule_modifier: string = environment.url + ':' + environment.portGeneric + '/api/generic/vehicule/modification';
}


