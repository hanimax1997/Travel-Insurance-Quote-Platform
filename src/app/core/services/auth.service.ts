import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import { Constants } from '../config/constants';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {



  private userSubject: BehaviorSubject<any>;

  public user: Observable<any>;

  constructor(private router: Router, private http: HttpClient) {
    this.userSubject = new BehaviorSubject<any>(null); // Initialize with null
    this.user = this.userSubject.asObservable();
  }

  public get userValue(): any {
    return this.userSubject.value;
  }

  authBody = {
    "username": "",
    "password": "",
  }

  public async loadUserFromStorage(): Promise<void> {
    return new Promise<void>((resolve) => {
      const storedToken = sessionStorage.getItem('access_token');
      console.log(storedToken)
      if (storedToken) {
        this.userSubject.next(JSON.parse(storedToken));
      }

      console.log(this.userValue)
      resolve();
    });
  }

  private loggedIn = new BehaviorSubject<boolean>(false);

  setLoggedIn(value: boolean) {
    this.loggedIn.next(value);
  }

  getLoggedIn() {
    return this.loggedIn.asObservable();
  }

  login() {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      })
    };


    return this.http.post<any[]>(Constants.API_ENDPOINT_AUTH, this.authBody, httpOption)
      .pipe(map((user: any) => {

        sessionStorage.setItem('access_token', JSON.stringify(user));
        this.userSubject.next(user);

        this.startRefreshTokenTimer();
        return user;
      }));
  }

  getPartnerId(): string {
    return '96b436bc30fcc598775663b31a4b23e4f327da077623031b717c7ffeede13cca';
  }

  getUserId(userEmail: any) {
    const httpOption = {
      headers: new HttpHeaders({

        'Access-Control-Allow-Origin': '*',

      })
    };

    return this.http.get<any>(`${Constants.API_ENDPOINT_GET_USERID}/${userEmail}`, httpOption).pipe(
      tap((response) => response),
      catchError((error) => throwError(error))
    )
  }

  refreshToken() {
    return this.http.get<any>(`${Constants.API_ENDPOINT_REFRESH_TOKEN}`)
      .pipe(map((user) => {
        console.log(user)
        sessionStorage.setItem('access_token', JSON.stringify(user));
        this.userSubject.next(user);
        this.startRefreshTokenTimer();
        return user;
      },

      ));
  }

  getToken() {
    return sessionStorage.getItem('access_token');
  }

  logout() {
    this.stopRefreshTokenTimer();
    this.userSubject.next(null);
    sessionStorage.removeItem('access_token');

    sessionStorage.removeItem('roles');
    this.router.navigate(['/login']);
    sessionStorage.removeItem('isUserIn')
    sessionStorage.removeItem('userEmail')
    sessionStorage.removeItem('userId')
    sessionStorage.removeItem("agence")
  }

  resetPass(body: any) {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    return this.http.post<any[]>(`${Constants.API_ENDPOINT_RESET_PASSWORD}`, body, httpOption).pipe(
      tap((response) => response),
      catchError((error) => throwError(error))
    );
  }

  private refreshTokenTimeout: any

  public startRefreshTokenTimer() {

    let jwtSplit: string | null | undefined

    jwtSplit = this.userValue?.access_token?.split('.')[1];

    const jwtToken = JSON.parse(atob(jwtSplit!));
    sessionStorage.setItem('roles', JSON.stringify(jwtToken.roles))

    sessionStorage.setItem('userEmail', JSON.stringify(jwtToken.sub))
    this.getUserId(jwtToken.sub).subscribe(data => {
      console.log("data.agences ", data)
      sessionStorage.setItem("userId", JSON.stringify(data.userid))
      sessionStorage.setItem("agence", JSON.stringify(data.agences[0]))

      window.location.href = "/dashboard"
    })

    const expires = new Date(jwtToken.exp * 1000);



    const timeout = (expires.getTime() - Date.now()) - (8 * 60 * 1000);
    console.log(timeout)
    // const timeout = (expires.getTime() - Date.now() - (62 * 60000));
    this.refreshTokenTimeout = setTimeout(() => {
      this.refreshToken().subscribe();
    }, timeout);
  }

  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }

  get isLoggedIn(): boolean {
    let authToken = sessionStorage.getItem('access_token');
    let user = authToken !== null ? true : false
    sessionStorage.setItem('isUserIn', String(user))
    return authToken !== null ? true : false;
  }

  getKey(body: any): any {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    return this.http.post<any[]>(`${Constants.API_ENDPOINT_GET_KEY}`, body, httpOption).pipe(
      tap((response) => this.logs(response)),
      catchError((error) => throwError(error.error))
    );
  }

  getAuthenticate(body: any): Observable<any> {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    return this.http.post<any[]>(`${Constants.API_ENDPOINT_AUTHENTICATE}`, body, httpOption).pipe(
      tap((response: any) => {
        localStorage.setItem("token", response.token)
        localStorage.setItem("refreshToken", response.token)
      }),
      catchError((error) => throwError(error.error))
    );
  }

  RefreshToken(body: any) {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    return this.http.post<any[]>(`${Constants.API_ENDPOINT_REFRESH}`, body, httpOption).pipe(
      tap((response: any) => {
        localStorage.setItem("token", response.token)
        localStorage.setItem("refreshToken", response.token)
      }),
      catchError((error) => throwError(error.error))
    );
  }

  ForgetPass(email: any) {
    const httpOption = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
      })
    };

    return this.http
      .get<any>(
        `${Constants.API_ENDPOINT_FORGET_PASSWORD}/${email}`,
        httpOption
      )
      .pipe(
        tap((response) => response),
        catchError((error) => throwError(error.error))
      );
  }

  logs(response: unknown): void {
  }



    private apiUrl = 'https://voyage.axa.dz:8980/api/authentification/activateUser'; // Base URL



  private getlocalToken(): string | null {
    return localStorage.getItem('token');
  }

  // Méthode pour activer le compte
activateAccount(email: string): Observable<any> {
  const encodedEmail = encodeURIComponent(email); // transforme @ en %40
  const url = `${this.apiUrl}/${encodedEmail}`;

  return this.http.post(url, {}, {
    responseType: 'text' // <- important car backend renvoie du texte brut
  });
}
}
