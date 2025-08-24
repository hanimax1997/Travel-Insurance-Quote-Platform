import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import{ Constants } from '../config/constants'; 

@Injectable({
  providedIn: 'root'
})
export class PersonneService {
  constructor(private http: HttpClient) {}

  getAllPersonne():Observable<any> {
    return this.http.get<any>(`${Constants.API_ENDPOINT_personne}`).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => this.handleEroor(error,error?.error))
    );
  }
  getAllPersonneIndex(index:any,size:any):Observable<any> {
    return this.http.get<any>(`${Constants.API_ENDPOINT_personne}?pageNumber=${index}&pageSize=${size}`).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => this.handleEroor(error,error?.error))
    );
  }
  addPersonne(personne : any, type: string):Observable<any>{
    const httpOption = {
      headers : new HttpHeaders({
        'Content-Type':'application/json'
      })
    };

   return this.http.post<any>(`${Constants.API_ENDPOINT_personne}/personne-${type}`,personne, httpOption).pipe(
      tap((response)=>this.logs(response)),
      catchError((error)=>this.handleEroor(error,error?.error))
    )
  }

  getPersonneById(id: any): Observable<any>{
    return this.http.get<any>(`${Constants.API_ENDPOINT_personne}/${id}`).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => this.handleEroor(error,error?.error))
    );
  }

  getBenificiaireByPersonne(id: any): Observable<any>{
    return this.http.get<any>(`${Constants.API_ENDPOINT_personne}/${id}/benificiaire`).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => this.handleEroor(error,error?.error))
    );
  }

  updatePersonne(personneEdited : any,id: number, type: string): Observable<null> {
    const httpOption = {
      headers : new HttpHeaders({
        'Content-Type':'application/json'
      })
    };

   return this.http.post(`${Constants.API_ENDPOINT_personne}/personne-${type}/${id}`,personneEdited, httpOption).pipe(
      tap((response)=>this.logs(response)),
      catchError((error)=>this.handleEroor(error,error?.error))
    )
 }

 filterPersonne(filters:any) {
  const httpOption = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };
  return this.http.post<any[]>(`${Constants.API_ENDPOINT_personne}/filtre`, filters, httpOption).pipe(
    tap((response) => this.logs(response)),
    catchError((error) => this.handleEroor(error,error?.error))
  );
}

getAllPersonneMorale(): Observable<any> {
  const httpOption = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };
  return this.http.get<any>(`${Constants.API_ENDPOINT_personne_morale}`).pipe(
    tap((response) => this.logs(response)),
    catchError((error) => this.handleEroor(error, []))
  );
}

  private logs(response: any) {
     
  }

  private handleEroor(error: Error, errorValue: any) {
    return of(errorValue);
  }
}