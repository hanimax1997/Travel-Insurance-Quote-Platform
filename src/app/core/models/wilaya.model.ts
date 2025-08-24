// wilaya.model.ts
/* ========================================================================== */
/*  Modèle complet correspondant à la réponse JSON de /getAllWilayas          */
/* ========================================================================== */
export interface Pays {
  idPays      : number;
  description : string;
  nationalite : string;
  devise      : string;      // ex. "DZD"
  indicatif   : string;      // ex. "+213"
  zone        : number;      // 1 = Nord, 2 = Sud…
  blackList   : boolean;
  isShengen   : boolean;
  dateDebut   : string | null;
  dateFin     : string | null;
  codePays    : string;      // ex. "DZA"
}

/** Province algérienne     – structure du service getAllWilayas() */
export interface Wilaya {
  idWilaya   : number;        // clé technique
  description: string;        // « Alger », « Tizi Ouzou »…
  dateDebut  : string | null;
  dateFin    : string | null;
  zone       : string;        // « Nord », « Sud »…
  idPays     : Pays;          // objet complet
  codeWilaya : string;        // "16", "03", …
}