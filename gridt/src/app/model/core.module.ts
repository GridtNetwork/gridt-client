import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from './services/api.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { SecureStorageService } from './services/secure-storage.service';
import { SwapService } from './services/swap.service';

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
    SwapService,
  ]
})
export class CoreModule { }
