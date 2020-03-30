import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginGuard } from './login/login.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'movements',
    children: [
      {
        path: '',
        loadChildren: './movements/movements.module#MovementsPageModule',
        canLoad: [LoginGuard] 
      },
      {
        path: ':movementId',
        loadChildren: './movements/movements-detail/movements-detail.module#MovementsDetailPageModule',
        canLoad: [LoginGuard]
      },
   
    ]
  },   
  { 
    path: 'add',
    loadChildren: './movements/add-movement/add-movement.module#AddMovementPageModule',
    canLoad: [LoginGuard]
  },
  {
    path: 'login',
    children: [
      {
        path: '',
        loadChildren: './login/login.module#LoginPageModule'
      },
      {
        path: ':register',
        children:[
          {
            path:'',
            loadChildren: './login/register/register.module#RegisterPageModule'
          }
        ]
      }
    ]
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule),
    canLoad: [LoginGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule),
    canLoad: [LoginGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
