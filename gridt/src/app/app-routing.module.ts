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
    path: 'timeline',
    children: [
      {
        path: '',
        loadChildren: './timeline/timeline.module#TimelinePageModule',
        canLoad: [LoginGuard]
      }
    ]
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
      }
    ]
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

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
