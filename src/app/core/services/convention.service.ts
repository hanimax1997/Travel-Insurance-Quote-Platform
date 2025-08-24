import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { Constants } from '../config/constants';
@Injectable({
  providedIn: 'root'
})
export class ConventionService {

  constructor(private http: HttpClient) { }
  getAllConventions() {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.get<any>(`${Constants.API_ENDPOINT_TEST_CONVENTION}`, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    )
  }
  getOneConvention(idConvention: any) {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.get<any>(`${Constants.API_ENDPOINT_TEST_CONVENTION}/${idConvention}`, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    )
  }
  addConventions(conventionBody: any) {
    const httpOption : any = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };

    return this.http.post<any>(`${Constants.API_ENDPOINT_TEST_CONVENTION}`, conventionBody, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    )
  }
  filterConvention(conventionBody: any) {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<any>(`${Constants.API_ENDPOINT_TEST_CONVENTION_FILTER}`, conventionBody, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    )
  }
  modifConvention(conventionBody: any, idConvention: any) {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.put<any>(`${Constants.API_ENDPOINT_TEST_CONVENTION_MODIF}/${idConvention}`, conventionBody, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    )
  }
  desactiverConvention(idConvention: any, convention: any) {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.put<any>(`${Constants.API_ENDPOINT_TEST_CONVENTION}/${idConvention}`, convention, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    )
  }
  private logs(response: any) {

  }
}