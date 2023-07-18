import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormBuilder,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable, tap } from 'rxjs';
import { CodeArtifactControlFullscreenComponent } from './code-artifact-control-fullscreen/code-artifact-control-fullscreen.component';
import { MatTooltip } from '@angular/material/tooltip';
import { Artifact } from '@activepieces/ui/common';
import { CodemirrorComponent } from '@ctrl/ngx-codemirror';
import { CollectionBuilderService } from '@activepieces/ui/feature-builder-store';

export interface CodeArtifactForm {
  content: FormControl<string>;
  package: FormControl<string>;
}

@Component({
  selector: 'app-code-artifact-form-control',
  templateUrl: './code-artifact-form-control.component.html',
  styleUrls: ['./code-artifact-form-control.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: CodeArtifactFormControlComponent,
    },
  ],
})
export class CodeArtifactFormControlComponent
  implements ControlValueAccessor, OnInit, AfterViewInit
{
  updateComponentValue$: Observable<
    Partial<{
      content: string;
      package: string;
    }>
  >;
  refreshCodeMirror$: Observable<void>;
  @ViewChild('codeMirror') codeMirror: CodemirrorComponent;
  @ViewChild('tooltip') tooltip: MatTooltip;
  hideDelayForFullscreenTooltip = 2000;
  codeArtifactForm: FormGroup<CodeArtifactForm>;
  codeEditorOptions = {
    minimap: { enabled: false },
    theme: 'apTheme',
    language: 'typescript',
    readOnly: false,
    automaticLayout: true,
  };
  constructor(
    private formBuilder: FormBuilder,
    private dialogService: MatDialog,
    private builderService: CollectionBuilderService
  ) {
    this.codeArtifactForm = this.formBuilder.group({
      content: new FormControl('', { nonNullable: true }),
      package: new FormControl('', { nonNullable: true }),
    });
    this.refreshCodeMirror$ = this.builderService.refreshCodeMirror$
      .asObservable()
      .pipe(
        tap(() => {
          this.codeMirror.codeMirror?.refresh();
        })
      );
  }
  ngOnInit(): void {
    this.setupValueListener();
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.tooltip.show();
      this.hideDelayForFullscreenTooltip = 0;
    }, 100);
  }
  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.codeArtifactForm.disable();
      this.codeEditorOptions.readOnly = true;
    }
  }
  onChange: (val: unknown) => void = (val) => {
    val;
    //ignored
  };
  onTouched: () => void = () => {
    //ignored
  };

  writeValue(artifact: Artifact): void {
    if (artifact && (artifact.content || artifact.package)) {
      this.codeArtifactForm.patchValue(artifact, { emitEvent: false });
    }
  }

  registerOnChange(change: (val: unknown) => void): void {
    this.onChange = change;
  }
  registerOnTouched(touched: () => void): void {
    this.onTouched = touched;
  }
  showFullscreenEditor() {
    this.dialogService.open(CodeArtifactControlFullscreenComponent, {
      data: {
        codeFilesForm: this.codeArtifactForm,
        readOnly: this.codeEditorOptions.readOnly,
      },
      panelClass: 'fullscreen-dialog',
    });
  }

  setupValueListener() {
    this.updateComponentValue$ = this.codeArtifactForm.valueChanges.pipe(
      tap((artifact) => {
        this.onChange(artifact);
      })
    );
  }
}
