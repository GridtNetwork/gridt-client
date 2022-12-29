import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginGuard } from './login/login.guard';

const routes: Routes = [
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
        loadChildren: () => import('./movements/movements.module').then(x => x.MovementsPageModule),
        canLoad: [LoginGuard] 
      },
      {
        path: ':movementId',
        loadChildren: () => import('./movements/movements-detail/movements-detail.module').then(x => x.MovementsDetailPageModule),
        canLoad: [LoginGuard]
      },
   
    ]
  },   
  { 
    path: 'add',
    loadChildren: () => import('./movements/add-movement/add-movement.module').then(x => x.AddMovementPageModule),
    canLoad: [LoginGuard]
  },
  {
    path: 'login',
    children: [
      {
        path: '',
        loadChildren: () => import('./login/login.module').then(x => x.LoginPageModule)
      },
      {
        path: ':register',
        children:[
          {
            path:'',
            loadChildren: () => import('./login/register/register.module').then(x => x.RegisterPageModule)
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
