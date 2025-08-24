import { TYPERISQUE } from "./type-risque";

export class ParamRisque {
    idParamRisque: number | undefined;
    idTypeRisque: number | undefined;
    typeRisque: TYPERISQUE | undefined;
    libelle: string | undefined;
    descriptionChamp: string | undefined;
    orderChamp: string | undefined;
    typeChamp: string | undefined;
    sizeChamp: number | undefined;  //md-12
    tailleChamp: number | undefined; //100
    dateDebut: Date | undefined;
    dateFin: Date | undefined;
    auditUser: string| undefined;
}