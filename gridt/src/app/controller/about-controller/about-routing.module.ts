import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AboutPage } from './about.page';

const routes: Routes = [
  {
    path: '',
    component: AboutPage
  },
  {
    path: 'privacy-controller',
    loadChildren: () => import('src/app/controller/privacy-controller/privacy.module').then(m => m.PrivacyPageModule)
  },
  {
    path: 'tutorial-controller',
    loadChildren: () => import('src/app/controller/tutorial-controller/tutorial.module').then( m => m.TutorialPageModule)
  },
  {
    path: 'credits-controller',
    loadChildren: () => import('src/app/controller/credits-controller/credits.module').then( m => m.CreditsPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AboutPageRoutingModule {}
