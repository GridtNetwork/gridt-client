import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginGuard } from './login-controller/login.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'movements',
    children: [
      {
        path: '',
        loadChildren: () => import('./movements-controller/movements.module').then(x => x.MovementsPageModule),
        canLoad: [LoginGuard] 
      },
      {
        path: ':movementId',
        loadChildren: () => import('./movements-detail-controller/movements-detail.module').then(x => x.MovementsDetailPageModule),
        canLoad: [LoginGuard]
      },
   
    ]
  },   
  { 
    path: 'add',
    loadChildren: () => import('./add-movement-controller/add-movement.module').then(x => x.AddMovementPageModule),
    canLoad: [LoginGuard]
  },
  {
    path: 'login',
    children: [
      {
        path: '',
        loadChildren: () => import('./login-controller/login.module').then(x => x.LoginPageModule)
      },
      {
        path: ':register',
        children:[
          {
            path:'',
            loadChildren: () => import('./register-controller/register.module').then(x => x.RegisterPageModule)
          }
        ]
      }
    ]
  },
  {
    path: 'home',
    loadChildren: () => import('./home-controller/home.module').then( m => m.HomePageModule),
    canLoad: [LoginGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile-controller/profile.module').then( m => m.ProfilePageModule),
    canLoad: [LoginGuard]
  },
  {
    path: 'about',
    loadChildren: () => import('./about-controller/about.module').then( m => m.AboutPageModule),
    canLoad: [LoginGuard]
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
