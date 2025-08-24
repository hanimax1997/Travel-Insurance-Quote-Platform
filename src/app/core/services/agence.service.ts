import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { Constants } from '../config/constants';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AgenceService {

  constructor(private http: HttpClient) { }
  getAllAgence() {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    let user = sessionStorage.getItem("userId")
    
    let uri = user == null ? environment.url + ':8980/api/agence/AllVoyagiste' : environment.url + ':18989/api/agence/AllVoyagiste'
    return this.http.get<any[]>(`${uri}`,httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    );
  }
  logs(response: unknown): void {
  }

  getAgenceById(idAgence: any) {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    
    return this.http.get<any[]>(`${Constants.API_ENDPOINT_AGENCE}/${idAgence}`,httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    );
  }
}
