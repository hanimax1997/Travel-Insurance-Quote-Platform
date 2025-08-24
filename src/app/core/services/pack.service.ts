import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constants } from '../config/constants';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PackService {

  constructor(private http: HttpClient) { }

  getPackVoyage(body:any): Observable<any> {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwicGFydG5lckhhc2giOiI5NmI0MzZiYzMwZmNjNTk4Nzc1NjYzYjMxYTRiMjNlNGYzMjdkYTA3NzYyMzAzMWI3MTdjN2ZmZWVkZTEzY2NhIiwiaWF0IjoxNzMzODM3ODUxLCJleHAiOjE3MzM4NDE0NTF9.izkpoNhcFFa-EYzJ7AId21XhKmpv6nWuzQLuXWdVdVU'

      })
    };
    return this.http.post<any>(`${Constants.API_ENDPOINT_GET_PACK_VOYAGE}`,body, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    )

   
  }
  
  getPackById(idPack: any) {

    return this.http.get<any>(`${Constants.API_ENDPOINT_PACK_DESC}/${idPack}`).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    )
  }

  getPackByProduitParam(idProduit: any,param:any) {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'skip': ''
      })
    };

    return this.http.post<any>(`${Constants.API_ENDPOINT_PACK_BY_PRODUIT_PARAM}/${idProduit}`,param, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    )
  }

  getPackByProduit(idProduit: any) {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.get<any>(`${Constants.API_ENDPOINT_PACK_BY_PRODUIT}/1`, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    )
  }

  getAllPack(): Observable<any> {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.get<any>(`${Constants.API_ENDPOINT_GET_PACK}`, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    )
  }

  logs(response: any) {
  }
}
