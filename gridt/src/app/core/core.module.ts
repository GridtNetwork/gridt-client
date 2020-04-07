import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from './api.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './auth.service';
import { SecureStorageService } from './secure-storage.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  providers: [
    ApiService,
    AuthService,
    SecureStorageService,
  ]
})
export class CoreModule { }
