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
    path: 'profile',
    loadChildren: './profile/profile.module#ProfilePageModule',
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
          },
          {
            path: ':welcome',
            loadChildren: './login/register/welcome/welcome.module#WelcomePageModule',
            canLoad: [LoginGuard]
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
    path: 'test',
    loadChildren: () => import('./apitesting/apitesting.module').then( m => m.ApitestingPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
