import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable, of, switchMap, tap, map, catchError } from 'rxjs';
import {
  GenericSnackbarTemplateComponent,
  PieceMetadataService,
} from '@activepieces/ui/common';
import { CodeService } from '@activepieces/ui/feature-builder-store';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-install-community-piece-modal',
  templateUrl: './install-community-piece-modal.component.html',
})
export class InstallCommunityPieceModalComponent implements OnInit {
  risksMarkdown = `
  **Warning: Installing a piece is a risk.**

  - This piece is not reviewed or maintained by Activepieces.
  - It may not be compatible with the current version of Activepieces.
  - It has access to all the data provided in the flow.
  
  Please exercise caution and ensure that you trust the author of the piece before installing it.
  <br>
  To install a piece, you must provide the name of the npm package that contains the piece.
  `;

  npmForm: FormGroup<{ packageName: FormControl<string> }>;
  loading = false;
  npmPackage$: Observable<PieceMetadataService | null>;
  submitted = false;
  packageNameChanged$: Observable<string>;
  constructor(
    private formBuilder: FormBuilder,
    private codeService: CodeService,
    private pieceMetadataService: PieceMetadataService,
    private dialogRef: MatDialogRef<InstallCommunityPieceModalComponent>,
    private snackBar: MatSnackBar
  ) {
    this.npmForm = this.formBuilder.group({
      packageName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });
  }
  ngOnInit(): void {
    const packaageNameControl = this.npmForm.controls.packageName;
    this.packageNameChanged$ = packaageNameControl.valueChanges.pipe(
      tap((val) => {
        if (val) packaageNameControl.setErrors(null);
      })
    );
  }
  hide() {
    this.dialogRef.close();
  }
  lookForNpmPackage() {
    this.submitted = true;
    if (this.npmForm.valid && !this.loading) {
      this.loading = true;
      this.npmPackage$ = this.codeService
        .getLatestVersionOfNpmPackage(this.npmForm.controls.packageName.value)
        .pipe(
          switchMap((pkg) => {
            if (pkg) {
              return this.pieceMetadataService
                .installCommunityPiece({
                  pieceName: Object.keys(pkg)[0],
                  pieceVersion: Object.values(pkg)[0],
                })
                .pipe(
                  catchError((err) => {
                    this.loading = false;
                    this.npmForm.controls.packageName.setErrors({
                      failedInstall: true,
                    });
                    throw err;
                  }),
                  tap(() => {
                    this.snackBar.openFromComponent(
                      GenericSnackbarTemplateComponent,
                      {
                        data: `<b>${Object.keys(pkg)[0]}</b> added`,
                      }
                    );
                    this.dialogRef.close(pkg);
                  }),
                  map(() => {
                    return null;
                  })
                );
            } else {
              this.npmForm.controls.packageName.setErrors({ invalid: true });
              return of(null);
            }
          }),
          tap(() => {
            this.loading = false;
          })
        );
    }
  }
}
