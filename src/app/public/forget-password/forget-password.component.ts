import { Component } from '@angular/core';
import { AppComponent } from '../../app.component';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Patterns } from '../../core/validators/patterns';
import { AuthService } from '../../core/services/auth.service';
import { first } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss'
})
export class ForgetPasswordComponent {
  formAuthentification: FormGroup;
  toast: any = false;
  
  constructor(private formBuilderAuth: FormBuilder ,private appComponent: AppComponent, private router: Router, private authentificationService: AuthService) {
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("token")
    this.formAuthentification = this.formBuilderAuth.group({
      username: ['', [Validators.required, Validators.pattern(Patterns.email)]],
    });
  }

  changeInput(idInput: string) {
    let input = document.getElementById(idInput);
    console.log("fffff", this.formAuthentification.get(idInput));

    if(this.formAuthentification.get(idInput)?.errors != null) {
      input?.classList.remove('border-gray-300');
      input?.classList.remove('focus:border-primary-400');
      input?.classList.remove('focus:ring-primary-400');

      input?.classList.add('border-danger');
      input?.classList.add('focus:border-danger');
      input?.classList.add('focus:ring-danger');
      // input?.classList.add('border-danger');
    } else {
      input?.classList.remove('border-danger');
      input?.classList.remove('focus:border-danger');
      input?.classList.remove('focus:ring-danger');

      input?.classList.add('border-gray-300');
      input?.classList.add('focus:border-primary-400');
      input?.classList.add('focus:ring-primary-400');
    }
  }

  ngOninit() {
    
    
  }

  submitAuth() {
    if (this.formAuthentification.valid) {
      let email = this.formAuthentification.get('username')?.value
      this.authentificationService.ForgetPass(email).subscribe({
        next: (data: any) => {
          Swal.fire({
            title: `Un E-mail de réinitialisation du mot de passe vous a été envoyé à votre adresse`,
            icon: 'info',
            allowOutsideClick: false,           
            confirmButtonText: `Ok`
          }).then((result) => {
            if (result.isConfirmed) {
              this.toast = true;
              this.router.navigate(['/login']);
            }
          })
        },
        error: (error: any) => {
          console.log("error ", error);
          Swal.fire({
            title: error?.text,
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
