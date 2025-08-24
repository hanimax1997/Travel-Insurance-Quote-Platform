import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, Event, NavigationEnd } from '@angular/router';
import * as $ from 'jquery';
import { IStaticMethods } from 'preline/preline';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AuthService } from './core/services/auth.service';
import * as CryptoJS from 'crypto-js';
import * as forge from 'node-forge';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'newSiteWeb';
  publicKey: string;
  PartnerId: string;
  encryptedHash: string;
  private rsaPublicKey: forge.pki.rsa.PublicKey;

  constructor(private authService: AuthService) {
    this.PartnerId = this.authService.getPartnerId();
    this.encryptedHash = "";

  }

  ngOnInit() {

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

}
