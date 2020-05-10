import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AboutPage } from './about.page';

const routes: Routes = [
  {
    path: '',
    component: AboutPage
  },
  {
    path: 'tutorial',
    loadChildren: () => import('./tutorial/tutorial.module').then( m => m.TutorialPageModule)
  },
  {
    path: 'privacy',
    loadChildren: () => import('./privacy/privacy.module').then( m => m.PrivacyPageModule)
  },
  {
    path: 'credits',
    loadChildren: () => import('./credits/credits.module').then( m => m.CreditsPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AboutPageRoutingModule {}
