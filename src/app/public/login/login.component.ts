import { Component } from '@angular/core';
import { AppComponent } from '../../app.component';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Patterns } from '../../core/validators/patterns';
import { AuthService } from '../../core/services/auth.service';
import { first } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  formAuthentification: FormGroup;
  message: boolean = false;
  hide: boolean = true;
  submitted = false
  loading = false
  errorAuth: Boolean;
  
  constructor(private formBuilderAuth: FormBuilder ,private appComponent: AppComponent, private router: Router, private authentificationService: AuthService) {   
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("token")

    this.formAuthentification = this.formBuilderAuth.group({
      username: ['', [Validators.required, Validators.pattern(Patterns.email)]],
      password: ['', [Validators.required, Validators.minLength(0)]],
    });
  }

  ngOninit() {
    
  }

  submitAuth() {
    if (this.formAuthentification.valid) {


      this.submitted = true;

      this.loading = true;
      let formData: FormData = new FormData();
      this.authentificationService.authBody.username = this.formAuthentification.get('username')?.value
      this.authentificationService.authBody.password = this.formAuthentification.get('password')?.value
      this.authentificationService.login().pipe(first())
      .subscribe({
        next: (data: any) => {

          this.authentificationService.setLoggedIn(true);
          
          // this.router.navigate(['/dashboard']);
        },
        error: (error: any) => {
          console.log("error ", error);
          sessionStorage.setItem('error_auth', "true");
          if (error.status == 403)
            this.errorAuth = true;

          Swal.fire({
            title: 'Veuillez vérifier les informations d’identification saisies',
            icon: 'info',
            allowOutsideClick: false,
            confirmButtonText: `Ok`
          }).then((result) => {
            if (result.isConfirmed) {
            }
          })
        }
      });
    }
  }
}
