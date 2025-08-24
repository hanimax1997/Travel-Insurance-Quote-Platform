import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap,throwError } from 'rxjs';
import{ Constants } from '../config/constants'; 
@Injectable({
  providedIn: 'root'
})
export class ReductionService {

  constructor(private http: HttpClient) { }

  addReduction(reduction:any) {
    const httpOption : any = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };

    return this.http.post<any>(`${Constants.API_ENDPOINT_TEST_REDUCTION}`, reduction, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    )
  }
  getReductionById(idReduction:any) {
    const httpOption : any = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };

    return this.http.get<any>(`${Constants.API_ENDPOINT_TEST_REDUCTION}/${idReduction}`, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    )
  }

  getAllReduction() {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.get<any>(`${Constants.API_ENDPOINT_TEST_REDUCTION}`, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    )
  }
  reductionFiltre(filtreBody:any){
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<any>(`${Constants.API_ENDPOINT_TEST_REDUCTION_FILTRE}`, filtreBody, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    )
  }
  getReductionByProduit(idFamilleProduit:any) {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.get<any>(`${Constants.API_ENDPOINT_TEST_REDUCTION}/${idFamilleProduit}`, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    )
  }
  getReductionByConvention(idConvention:any) {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.get<any>(`${Constants.API_ENDPOINT_TEST_REDUCTION_BY_CONVENTION}/${idConvention}`, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    )
  }
  desactiverReduction(reduction:any,idReduction:number) {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.put<any>(`${Constants.API_ENDPOINT_TEST_REDUCTION}/${idReduction}`,reduction, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    )
  }
  applyReduction(reduction:any) {
    const httpOption : any = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'skip': ''
      })
    };

    return this.http.post<any>(`${Constants.API_ENDPOINT_TEST_REDUCTION_DEVIS}`, reduction, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    )
  }
  // getTypeReduction() {
  //   const httpOption = {
  //     headers: new HttpHeaders({
  //       'Content-Type': 'application/json'
  //     })
  //   };

  //   return this.http.get<any>(`${Constants.API_ENDPOINT_TEST_TYPE_REDUCTION}`, httpOption).pipe(
  //     tap((response) => this.logs(response)),
  //     catchError((error) => throwError(error.error))
  //   )
  // }
  private logs(response: any) {
     
  }

  
}