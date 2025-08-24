import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthguardService {

  constructor(
    private router: Router,
    private authenticationService: AuthService
) { }

canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const user = sessionStorage.getItem("userId")

    if (user) {
        // logged in so return true
        return true;
    } else {
        // not logged in so redirect to login page with the return url
        this.router.navigate(['/login']);
        return false;
    }
}
}
