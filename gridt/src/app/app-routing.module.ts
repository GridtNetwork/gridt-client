import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

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
        loadChildren: './timeline/timeline.module#TimelinePageModule'
      }
    ]
  },
  {
    path: 'movements',
    children:[
      {
        path: '',
        loadChildren: './movements/movements.module#MovementsPageModule' 
      },
      {
        path: ':movementId',
        loadChildren: './movements/movements-detail/movements-detail.module#MovementsDetailPageModule' 
      }
    ]
  },
  {
    path: 'profile',
    loadChildren: './profile/profile.module#ProfilePageModule' },
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
            loadChildren: './login/register/welcome/welcome.module#WelcomePageModule'
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
