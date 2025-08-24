import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { catchError, finalize, Observable, Subscription, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import * as forge from 'node-forge';
import { SpinnerOverlayService } from './spinner-overlay.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  publicKey: string;
    PartnerId: string;
    encryptedHash: string;
    private rsaPublicKey: forge.pki.rsa.PublicKey;


  constructor(private authService: AuthService, private spinnerOverlayService: SpinnerOverlayService) {
    this.PartnerId = this.authService.getPartnerId();
    this.encryptedHash = "";
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    const spinnerSubscription: Subscription =
      this.spinnerOverlayService.spinner$.subscribe();
    const userValue: any = JSON.parse(sessionStorage.getItem('access_token') as string);
    const isLoggedIn = userValue && userValue.access_token;
            

    let user = isLoggedIn ? userValue?.access_token : localStorage.getItem('token');
    const userId = sessionStorage.getItem("userId");
    
    console.log("request ", request);
    console.log("request sat", request.url.includes("satim"));
    if(user != null) {
      if (request.method == 'POST' || request.method == 'PUT') {
        if (request.headers.get('skip') == null)
          request = request.clone({
            setHeaders: {
              Authorization: 'Bearer ' + user,
              'Access-Control-Allow-Origin': '*'
            },
            body: { ...request.body, auditUser: isLoggedIn ? sessionStorage.getItem('userId') : request.body.auditUser },
          });
        else {
          const newHeaders = request.headers.delete('skip');
          request = request.clone({
            headers: newHeaders,
            setHeaders: {
              Authorization: 'Bearer ' + user,
            },
          });
        }
      } else if(!request.url.includes("register.do")){
        request = request.clone({
          setHeaders: {
            Authorization: 'Bearer ' + user,
            'Access-Control-Allow-Origin': '*',
            'canal': userId == null ? 'DW':'DV'
          },
        });
      } else {
        
      }
    }

    return next.handle(request).pipe(
      finalize(() => spinnerSubscription.unsubscribe()),
      catchError(err => {
        if ([401, 403].includes(err.status)) {
          if(this.authService.userValue || sessionStorage.getItem("userId")) 
          {
            this.authService.logout();
          } else {
            localStorage.removeItem("refreshToken")
            localStorage.removeItem("token")
            
            this.getKey();
          }
        }

        return throwError(err);
      })
    );
  }

  Authenticate() {
      let body = {
        "partnerHash": this.PartnerId,
        "encryptedHash": this.encryptedHash
      }
  
      console.log("this.PartnerId ", this.PartnerId);
      console.log("this.encryptedHash ", this.encryptedHash);
      
        this.authService.getAuthenticate(body).subscribe({
          next: (dataWorkFlow: any) => {
            console.log("data ", dataWorkFlow);
            localStorage.setItem("token", dataWorkFlow.token)
            localStorage.setItem("refreshToken", dataWorkFlow.token)
          },
          error: (error) => {
            if(error.message == "Authentication Failed: Invalid client information")
            {
              this.getKey();
            }
          }
        });
    }
  
    getKey() {
      let body = {
        "partnerHash": this.PartnerId
      }
      
      this.authService.getKey(body).subscribe({
        next: (data: any) => {
          console.log("data ", data);
          // this.rsaPublicKey = data.publicKey
          const cle = "-----BEGIN PUBLIC KEY-----\n"+ data.publicKey + "\n-----END PUBLIC KEY-----"
          this.rsaPublicKey = forge.pki.publicKeyFromPem(cle);
          this.encryptedHash = this.encryptData(this.PartnerId, cle);
          console.log("this.encryptedHash ", this.encryptedHash);
          this.Authenticate();
        },
        error: (error: any) => {
        }
      });
    }
  
    encryptData(data: string, publicKey: any) {
      // CryptoJS.AES.encrypt(data, publicKey).base64()
      const encrypted = this.rsaPublicKey.encrypt(data, 'RSAES-PKCS1-V1_5');
      console.log("encrypted", encrypted)
      return forge.util.encode64(encrypted);
    }

  logs(): void {
  }
}
