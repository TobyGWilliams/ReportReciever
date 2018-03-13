import { Component, OnInit, NgZone } from '@angular/core';
import { WindowRef } from '../window/window';
import { MappingService, Mapping, DropboxFolder } from '../mapping/mapping.service';
import { MatSnackBar, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-mapping-new',
  templateUrl: './mapping-new.component.html',
  styleUrls: ['./mapping-new.component.css']
})
export class MappingNewComponent implements OnInit {
  folderIconUrl = 'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.folder';
  mapping: Mapping;
  oAuthToken: string;
  pickerApiLoaded: boolean;
  constructor(
    private mappingService: MappingService,
    private zone: NgZone,
    private window: WindowRef,
    public snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<MappingNewComponent>
  ) { }

  ngOnInit() {
    this.mapping = new Mapping;
    this.mapping.folder = new DropboxFolder();
    console.log(this.mapping);
  }

  openDriveFolder() {
    const windowRef = this.window.getNativeWindow();
    console.log('open folder', this.mapping.folder.url, windowRef);
    windowRef.open(this.mapping.folder.url);
  }

  createMapping() {
    console.log('mapping-new.component', 'createMapping', this.mapping);
    if (this.mapping.folder.selected) {
      if (this.mapping.emailPrefix !== '' && this.mapping.emailPrefix) {
        this.mappingService
          .postMapping(this.mapping)
          .subscribe((d) => {
            console.log('mapping-new.component', 'createMapping', d);
            this.snackBar.open('mapping created successfully', 'closed', { duration: 2000 });
            this.dialogRef.close();
          });
      } else {
        this.snackBar.open('Please provide a prefix for the prefix@email_address.com', 'Close', { duration: 2000 });
      }
    } else {
      this.snackBar.open('Please select a folder', 'Close', { duration: 2000 });
    }
  }

  onApiLoad() {
    const self = this;
    gapi.load('auth', self.onAuthApiLoad.bind(this));
    gapi.load('picker', self.onPickerApiLoad.bind(this));
  }

  onAuthApiLoad() {
    const self = this;
    gapi.auth.authorize(
      {
        'client_id': '153461199437-dp3htp9vlpj82anecnn0g01bq34u546a.apps.googleusercontent.com',
        'scope': ['https://www.googleapis.com/auth/drive.readonly'],
        'immediate': false
      },
      self.handleAuthResult.bind(self)
    );
  }

  handleAuthResult(authResult) {
    console.log('handleAuthResult', authResult);
    if (authResult && !authResult.error) {
      this.oAuthToken = authResult.access_token;
      this.createPicker();
    }
  }

  pickerCallback(data) {
    console.log(data);
    if (data.action === 'loaded') { }
    if (data.action === 'cancel') { }
    if (data.action === 'picked') {
      this.zone.run(() => {
        this.mapping.folder.name = data.docs[0].name;
        this.mapping.folder.id = data.docs[0].id;
        this.mapping.folder.url = data.docs[0].url;
        this.mapping.folder.selected = true;
      });
    }
  }

  onPickerApiLoad() {
    console.log('onPickerApiLoad');
    this.pickerApiLoaded = true;
    this.createPicker();
  }

  createPicker() {
    if (this.pickerApiLoaded && this.oAuthToken) {
      const docsView = new google.picker.DocsView()
        .setIncludeFolders(true)
        // .setEnableTeamDrives(true)
        .setSelectFolderEnabled(true);
      const picker = new google.picker.PickerBuilder()
        // .enableFeature(google.picker.Feature.SUPPORT_TEAM_DRIVES)
        .addView(docsView)
        .setOAuthToken(this.oAuthToken)
        .setCallback(this.pickerCallback.bind(this))
        .build();
      picker.setVisible(true);
    }
  }
}
