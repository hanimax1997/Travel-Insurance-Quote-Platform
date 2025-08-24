import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule], 
  selector: 'app-activer-compte',
  templateUrl: './activer-compte.component.html'
})
export class ActiverCompteComponent implements OnInit {
  formAuthentification!: FormGroup;

  loading: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("token")
  }

  ngOnInit(): void {
    // Initialisation du formulaire avec validation d'email
    this.formAuthentification = this.fb.group({
      useremail: ['', [Validators.required, Validators.email]]
    });
  }

  // Soumission du formulaire d'activation
activate(): void {
  if (this.formAuthentification.valid) {
    this.loading = true;
    const email = this.formAuthentification.value.useremail;

    this.authService.activateAccount(email).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.showToast(response, 'success'); // success toast
      },
      error: (err: any) => {
        this.loading = false;
        const errorMsg = typeof err.error === 'string' ? err.error : 'Erreur lors de l\'activation du compte.';
        this.showToast(errorMsg, 'error'); // error toast
      }
    });
  }
}

showToast(message: string, type: 'success' | 'error' = 'success'): void {
  Swal.fire({

    title: message,
            icon: 'info',
            allowOutsideClick: false,
            confirmButtonText: `Ok`,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });
}


}
