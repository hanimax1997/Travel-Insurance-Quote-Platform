import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  userEmail: any = sessionStorage.getItem("userEmail");

  constructor(private authService: AuthService, private router: Router) {
        
  }

  revenir() {
    window.location.href ='https://www.axa.dz/'
  }

  ngOnInit() {
    let login: any = this.authService.getLoggedIn();
    // console.log("getLoggedIn ", login.source.value);
    if(!login.source.value)
      this.userEmail = sessionStorage.getItem("userEmail"); 
  }

  logOut() {
    this.authService.logout();
  }

  login() {
    this.router.navigate(['/login']);
  }
  dashboard() {
    window.location.href ='/dashboard'
  }
}
