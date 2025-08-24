import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Constants } from '../config/constants';

@Injectable({
  providedIn: 'root'
})
export class GenericService {

  constructor(private http: HttpClient) { }

  getAllProduit(): Observable<any> {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      })
    };
    
    return this.http.get<any>(`${Constants.API_ENDPOINT_PRODUIT_CODE}`, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    );
  }
  
  getPorduitById(idProduit:any): Observable<any> {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      })
    };

    return this.http.get<any>(`${Constants.API_ENDPOINT_PRODUIT_BY_ID}/${idProduit}`, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    );
  }

  getParam(id: any): Observable<any> {
    return this.http.get<any>(`${Constants.API_ENDPOINT_dictionnaire}/${id}`).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    );
  }

  getDictionnaire(): Observable<any> {

    return this.http.get<any>(`${Constants.API_ENDPOINT_PARAMETRE}`).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    );
  }

  //get wilaya
  getAllWilayas(idPays=1) {
    return this.http.get<any[]>(`${Constants.API_ENDPOINT_GENERIC_WILAYA}/${idPays}`).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    );
  }

  //get commune by  wilaya
  getAllCommuneByWilaya(numWilaya: any) {
    return this.http.get<any[]>(`${Constants.API_ENDPOINT_GENERIC_COMMUNE}/${numWilaya}`).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    );
  }

   getPays() {
    return this.http.get<any[]>(`${Constants.API_ENDPOINT_GENERIC_PAYS}`).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    );
  }

  logs(response: any) {
  }
}
