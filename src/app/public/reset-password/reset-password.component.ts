import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  formPass : FormGroup;
  bodyChange : any ={}
  hide: boolean = true;
  hide1: boolean = true;
  key: any
  setError = 'Les mots de passe ne correspondent pas';

  constructor(private formBuilder: FormBuilder,private authentificationService: AuthService, private route: ActivatedRoute,private router: Router){
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("token")
    this.formPass = this.formBuilder.group({      
      newPass: ['', [Validators.required,  this.customPasswordValidator]],
      confirmNewPass: ['', [Validators.required]],
    
    });
  }
  
  ngOnInit(): void {
    this.initformchagePass()
    if (this.key !== null) {
      this.key = this.route.snapshot.paramMap.get('key');   
    }
   
  }

  initformchagePass(){
    
  }

  customPasswordValidator(control: any){
    const password = control.value;

  if (!password) {
    // Handle empty password if needed
    return { 'required': true };
  }

  // Password must be at least 14 characters long
  if (password.length < 14) {
    return { 'minlength': true };
  }

  // Password must contain at least one number
  if (!/\d/.test(password)) {
    return { 'missingNumber': true };
  }

  // Password must contain at least one special character
  if (!/[A-Z]/.test(password)) {
    return { 'missingSpecialChar': true };
  }

  // Password is valid
  return null;

  }

  submit(){
   
    this.bodyChange = {};    
   
    if (this.formPass.valid) {
      let newPass = this.formPass.get("newPass")?.value;
      let confirmPass = this.formPass.get("confirmNewPass")?.value;

     
      if(newPass === confirmPass){
      
        this.bodyChange = {};           
        this.bodyChange.password = newPass; 
        this.bodyChange.key = this.key; 
        

         this.authentificationService.resetPass(this.bodyChange).subscribe({
          next: (data: any) => {
           
            Swal.fire({
              title: 'Votre mot de passe a été changé ! \n <a href="/login" class="font-semibold underline" target="_blank">Cliquez ici </a> pour vous connecter',
              icon: 'success',
              allowOutsideClick: false,           
              confirmButtonText: `Ok`,          
            
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigate(['/login']);
              }
            })
          },
          error: (error) => {
            Swal.fire({
              title: error?.error?.text,
              icon: 'info',
              allowOutsideClick: false,           
              confirmButtonText: `Ok`,          
             
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigate(['/login']);
              }
            })
          
          }
        });
      }else {      
        this.formPass.get('confirmNewPass')?.setErrors({ 'customError': 'Wrong password' });
      }
    }
  }
}
