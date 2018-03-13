import { BrowserModule } from '@angular/platform-browser';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatListModule, MatToolbarModule, MatButtonModule, MatGridListModule, MatSnackBarModule, MatTableModule, MatCheckboxModule, MatStepperModule } from '@angular/material';
import { MatIconModule, MatSlideToggleModule, MatFormFieldModule, MatInputModule, MatCardModule, MatProgressSpinnerModule } from '@angular/material';
import { MatDialogModule, MatCheckbox } from '@angular/material';

import { FormsModule } from '@angular/forms';

import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';

import { EmailsService } from './emails/emails.service';
import { UsersService } from './users/users.service';
import { MappingService } from './mapping/mapping.service';

import { MappingListComponent } from './mapping-list/mapping-list.component';
import { MappingNewComponent } from './mapping-new/mapping-new.component';
import { UsersListComponent } from './users-list/users-list.component';
import { EmailsListComponent } from './emails-list/emails-list.component';
import { AppComponent } from './app.component';

import { WindowRef } from './window/window';
import { UserCardComponent } from './user-card/user-card.component';

@NgModule({
  declarations: [
    AppComponent,
    UsersListComponent,
    EmailsListComponent,
    MappingListComponent,
    MappingNewComponent,
    UserCardComponent
  ],
  entryComponents: [MappingNewComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatToolbarModule, MatListModule, MatButtonModule,
    MatIconModule, MatSlideToggleModule, MatFormFieldModule, MatInputModule, MatCardModule, MatGridListModule, MatSnackBarModule,
    MatTableModule, MatDialogModule, MatCheckboxModule, MatProgressSpinnerModule, MatStepperModule,
    HttpClientModule, FormsModule
  ],
  providers: [EmailsService, UsersService, MappingService, WindowRef],
  bootstrap: [AppComponent]
})
export class AppModule { }
