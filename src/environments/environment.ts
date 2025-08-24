let user = sessionStorage.getItem("userId")
export const environment = {
  production: false,
  //url: 'https://'+(window.location as Location).hostname,
   url: 'https://dv-saga',
  portSatim: 8980,
  portProduit: user == null ? 8980 : 18989,
  portGeneric: user == null ? 8980 : 18989,
  portPersonne: user == null ? 8980 : 18989,
  portAgence: user == null ? 8980 : 18989,
  portDevis: user == null ? 8980 : 18989,
  portTarification: user == null ? 8980 : 18989,
  portControles: user == null ? 8980 : 18989,
  portContrat: user == null ? 8980 : 18989,
  portUser: user == null ? 8980 : 18989,
  portSinistre: user == null ? 8980 : 18989,
  keyForExchange : "XVxtWzI6T1RITUFORScYPHxBDww6dA9EUg==",
  siteKey: "6Ldis8YqAAAAAFrQXwDr4tNNEL5LS-Wi9fIJ4md2"
};

  