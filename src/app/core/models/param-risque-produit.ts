
import { Dictionnaire } from "./dictionnaire";

export class  ParamRisqueProduit {

    idParamRisque: any | undefined;
    libelle: String | undefined;
    descriptionChamp: String | undefined;
    formName: String | undefined ;
    orderChamp: number | undefined ;
    position: String | undefined;
    typeChamp: Dictionnaire | undefined;
    sizeChamp: 0 | undefined;
    reponses: any[] | undefined;
    typeValeur: Dictionnaire | undefined;
    defaultValue: any | undefined;
    obligatoire: boolean | undefined;
    enable: boolean | undefined;
    category: any | undefined;
    codeCategory: any | undefined;
    parent: any | undefined;
    isParent: any | undefined;
    codeParam: any | undefined;
    valeurMin: any | undefined;
    valeurMax: any | undefined;
    sousProduit: any | undefined;
}
export class  ParamList {

        idParam: Number | undefined;       
        codeRisque?: Number | undefined;       
        codeParam?: Number | undefined;       
        reponse: {
            idReponse: Number | String | null,
            description: String | null
        } | undefined;
    
}
