import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { Duree } from '../models/duree';
import { Constants } from '../config/constants';
@Injectable({
  providedIn: 'root'
})
export class DureeService {

  constructor(private http: HttpClient) { }

  getAllDuree(): Observable<Duree[]> {
    return this.http.get<Duree[]>(`${Constants.API_ENDPOINT_DUREE}`).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => this.handleEroor(error,error.error))
    );
  }

  getDureeById(id: number): Observable<Duree> {
    return this.http.get<Duree>(`${Constants.API_ENDPOINT_DUREE}/${id}`);
  }

  getDureeByIdProduit(id: number): Observable<Duree> {
    return this.http.get<Duree>(`${Constants.API_ENDPOINT_DUREE_BY_PRODUIT}/${id}`);
  }
  addDuree(duree: Duree): Observable<Duree> {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<Duree>(`${Constants.API_ENDPOINT_DUREE}`, duree, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => this.handleEroor(error,error.error))
    )
  }

  updateDuree(dureeEdited: Duree, idDuree: number): Observable<null> {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.put(`${Constants.API_ENDPOINT_DUREE}/${idDuree}`, dureeEdited, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => this.handleEroor(error,error.error))
    )
  }

  private logs(response: any) {
     
  }

  private handleEroor(error: Error, errorValue: any) {
    return of(errorValue);
  }
}
