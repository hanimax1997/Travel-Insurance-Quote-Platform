import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { Constants } from '../config/constants';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ParamRisque } from '../models/param-risque';

@Injectable({
  providedIn: 'root'
})
export class ParamRisqueService {

  constructor(private http: HttpClient) { }

  getAllParamRisque(): Observable<ParamRisque[]> {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.get<ParamRisque[]>(`${Constants.API_ENDPOINT_param_risque}`,httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error))
    );
  }
  getParamRisqueById(id: number): Observable<ParamRisque> {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.get<ParamRisque>(`${Constants.API_ENDPOINT_param_risque}/${id}`,httpOption);
  }

  getParamRisqueByTypeRisque(idTypeRisque: number): Observable<ParamRisque[]> {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.get<ParamRisque[]>(`${Constants.API_ENDPOINT_param_risque}/byTypeRisque/${idTypeRisque}`,httpOption);
  }

  getParamByProduit(idProduit: number): Observable<null> {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      })
    };

    return this.http.get(`${Constants.API_ENDPOINT_param_risque_all}/${idProduit}`, httpOption).pipe(
      tap((response) => this.logs(response)),
   
      catchError((error) => this.handleEroor(error, null))
    )
    
  }

  //aaaa
  getWorkFlowByProduit(idProduit: number, idTypeWorkFlow: number): Observable<null> {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      })
    };

    return this.http.get(`${Constants.API_ENDPOINT_param_risque_devis_workflow}/${idProduit}/${idTypeWorkFlow}`, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => this.handleEroor(error, null))
    )
  }

  getParamRelation(idParam: number, idReponse: number): Observable<null> {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.get(`${Constants.API_ENDPOINT_param_risque_relation}/${idParam}/${idReponse}`, httpOption).pipe(
      tap((response) => response),
      catchError((error) => this.handleEroor(error, null))
    )
  }

  getTableParamParent(idParamRisque: number): Observable<null> {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.get(`${Constants.API_ENDPOINT_param_risque_TABLE_PARENT}/${idParamRisque}`, httpOption).pipe(
      tap((response) => response),
      catchError((error) => this.handleEroor(error, null))
    )
  }

  getTableParamChild(idParamRisque: number, parentId: any): Observable<null> {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.get(`${Constants.API_ENDPOINT_param_risque_TABLE_PARENT}/${idParamRisque}/${parentId}`, httpOption).pipe(
      tap((response) => response),
      catchError((error) => this.handleEroor(error, null))
    )
  }

  getListParamRisque(idList: any): Observable<ParamRisque[]> {
    return this.http.get<ParamRisque[]>(`${Constants.API_ENDPOINT_details_param_risque_list}/${idList}`).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => this.handleEroor(error, error.error))
    );
  }

  getParamRisqueList(): Observable<ParamRisque[]> {
    return this.http.get<ParamRisque[]>(`${Constants.API_ENDPOINT_param_risque_list}`).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => this.handleEroor(error, error.error))
    );
  }

  private handleEroor(error: Error, errorValue: any) {
    return of(errorValue);
  }

  logs(response: any) {
  }
}
