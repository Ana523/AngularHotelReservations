import { Routes, RouterModule } from "@angular/router";
import { NgModule } from '@angular/core';

import { HomeComponent } from './home/home.component';
import { EditComponent } from './edit/edit-reservation.component';
import { SearchComponent } from './search/search-reservation.component';
import { SignupComponent } from './auth/signup/signup.component';
import { SigninComponent } from './auth/signin/signin.component';
import { AuthGuard } from './auth/auth.guard';

const appRoutes: Routes = [
    { path: '', redirectTo: '/signin', pathMatch: 'full' },
    { path: 'home', component: HomeComponent, canActivate:[AuthGuard] },
    { path: 'new-reservation', component: EditComponent, canActivate:[AuthGuard] },
    { path: ':id/edit-reservation', component: EditComponent, canActivate:[AuthGuard] },
    { path: 'search-reservation', component: SearchComponent, canActivate:[AuthGuard] },
    { path: 'signup', component: SignupComponent },
    { path: 'signin', component: SigninComponent }
]

@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule]
})

export class AppRoutingModule {}