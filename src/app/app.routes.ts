import { Routes } from '@angular/router';
import { VoyageComponent } from './components/voyage/voyage.component';
import { LoginComponent } from './public/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { ErrorPageComponent } from './shared/error-page/error-page.component';
import { SuccessPageComponent } from './shared/success-page/success-page.component';
import { ForgetPasswordComponent } from './public/forget-password/forget-password.component';
import { ResetPasswordComponent } from './public/reset-password/reset-password.component';
import { AuthguardService } from './core/services/authguard.service';
import { ActiverCompteComponent } from './public/activer-compte/activer-compte.component';
import { MrhComponent } from './components/mrh/mrh.component';
import { CreationDevisComponent } from './components/devis/devis.component';

export const routes: Routes = [
    {
        path: "",
        redirectTo: "voyage",
        pathMatch: "full"
    },
    {
        path: "voyage",
        component: VoyageComponent
    },
    {
        path: "login",
        component: LoginComponent
    },
    {
        path: "dashboard",
        canActivate: [AuthguardService],
        component: DashboardComponent
    },
    {
        path: "home",
        component: HomeComponent
    },
    {
        path: "errorPage",
        component: ErrorPageComponent
    },
    {
        path: "successPage",
        component: SuccessPageComponent
    },
    {
        path: "forgetPassword",
        component: ForgetPasswordComponent
    },
    // {
    //     path: "activeCompte",
    //     component: ActiverCompteComponent
    // },
    {
        path: "reset-password/:key",
        component: ResetPasswordComponent
    },
        {
        path: "activer",
        component: ActiverCompteComponent
    },
    {
        path: "mrh",
        component: MrhComponent
    },
    {
        path: "auto",
        component: CreationDevisComponent
    }
    
];
