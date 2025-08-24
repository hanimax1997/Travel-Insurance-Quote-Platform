import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { BehaviorSubject, catchError, Observable, of, tap, throwError } from 'rxjs';
import{ Constants } from '../config/constants'; 
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class VehiculeService {

  constructor(private http: HttpClient) { }

  getAllMarque():Observable<any> {
    return this.http.get<any>(`${Constants.API_ENDPOINT_marque}`).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => this.handleEroor(error,error?.error))
    );
  }

  getModelByMarque(marque: any):Observable<any> {
   return this.http.get<any>(`${Constants.API_ENDPOINT_marque}/${marque}`).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => this.handleEroor(error,error?.error))
    );
  }
  private objectSubject = new BehaviorSubject<any>(null);
  object$ = this.objectSubject.asObservable();

  send(obj: any) {
    this.objectSubject.next(obj);
  }
  filterVehicule(filters:any) {
    
    return this.http.get<any>(`${Constants.API_ENDPOINT_vehicule}/marque/${filters.get('Marque').value}/modele/${filters.get('Modèle').value}/puissance/${filters.get('Puissance').value}`).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => this.handleEroor(error,error?.error))
    );
  }

  private logs(response: any) {
     
  }



//ajouter 
addMarque(body: any): Observable<any> {
  return this.http.post<any>(`${Constants.API_ENDPOINT_marque_save}`, body).pipe(
    tap((response) => {
      this.logs(response);
    }),
    catchError((error) => {
      this.handleEroor(error, error?.error);
      error.message=error; 
      console.log("error",error);
      // Add an alert when an error occurs
      return throwError(error);
    })
  );
}

addModele(body: any): Observable<any> {

  return this.http.post<any>(`${Constants.API_ENDPOINT_modele_save}`, body).pipe(
    tap((response) => this.logs(response)),
    catchError((error) => {
      this.handleEroor(error, error?.error);
      error.message=error; 
      console.log("error",error);
      // Add an alert when an error occurs
      return throwError(error);
    }));
}
getAllVehicules(): Observable<any> {
  return this.http.get<any>(`${Constants.API_ENDPOINT_vehicule}`).pipe(
    tap((response) => this.logs(response)),
    catchError((error) => this.handleEroor(error, error?.error))
  );
}
getVehiculeById(idVehicule:any): Observable<any> {
  return this.http.get<any>(`${Constants.API_ENDPOINT_vehicule}/${idVehicule}`).pipe(
    tap((response) => this.logs(response)),
    catchError((error) => this.handleEroor(error, error?.error))
  );
}

/*filtresDevis(filterObject: any) {
  const httpOption = {
      headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
      })
  };

  return this.http.post<any[]>(`${Constants.API_ENDPOINT_DEVIS_FILTER}`, filterObject, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
  );
}*/

filtresVehicule(body: any): Observable<any> {
  return this.http.post<any>(`${Constants.API_ENDPOINT_vehicule_filtre}`, body).pipe(
    tap((response) => this.logs(response)),
    catchError((error) => this.handleEroor(error, error?.error))
  );
}
  addVehicule(body: any): Observable<any> {

    return this.http.post<any>(`${Constants.API_ENDPOINT_vehicule}`, body).pipe(
      tap((response) => this.logs(response)),

      catchError((error) => {
        this.handleEroor(error, error?.error);
        error.message=error; 
        console.log("error",error);
        // Add an alert when an error occurs
        return throwError(error);
      })
    //  catchError((error) => this.handleEroor(error, error?.error))
    );
  }

  editVehicule(body: any, idVehicule: any): Observable<any> {
    return this.http.put<any>(`${Constants.API_ENDPOINT_vehicule_modifier}/${idVehicule}`, body).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => this.handleEroor(error, error?.error))
    );
  }

  deleteVehicule(idVehicule: any): Observable<any> {
    return this.http.put(`${Constants.API_ENDPOINT_vehicule}/delete/${idVehicule}`, null).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => this.handleEroor(error, error?.error))
    );
  }



///////////////////////
  private handleEroor(error: Error, errorValue: any) {
    return of(errorValue);
  }
}
