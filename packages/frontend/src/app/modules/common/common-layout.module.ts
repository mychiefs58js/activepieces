import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HighlightService } from './service/highlight.service';
import { JsonViewComponent } from './components/json-view/json-view.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ApImgComponent } from './components/ap-img/ap-img.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatExpansionModule } from '@angular/material/expansion';
import { DefaultFalsePipe } from './pipe/default-false.pipe';
import { DefaultTruePipe } from './pipe/default-true.pipe';
import { OutputLogPipe } from './pipe/output-log';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { StoreModule } from '@ngrx/store';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {
  MatTooltipDefaultOptions,
  MatTooltipModule,
  MAT_TOOLTIP_DEFAULT_OPTIONS,
} from '@angular/material/tooltip';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';
import {
  MatSnackBarModule,
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
} from '@angular/material/snack-bar';
import { DictionaryFormControlComponent } from './components/form-controls/dictionary-form-control/dictionary-form-control.component';
import { OAuth2ConnectControlComponent } from './components/form-controls/o-auth2-connect-control/o-auth2-connect-control.component';
import { ConfigsFormComponent } from './components/configs-form/configs-form.component';
import { CodeArtifactFormControlComponent } from './components/form-controls/code-artifact-form-control/code-artifact-form-control.component';
import { CodeArtifactControlFullscreenComponent } from './components/form-controls/code-artifact-form-control/code-artifact-control-fullscreen/code-artifact-control-fullscreen.component';
import { TestCodeFormModalComponent } from './components/form-controls/code-artifact-form-control/code-artifact-control-fullscreen/test-code-form-modal/test-code-form-modal.component';
import { AddNpmPackageModalComponent } from './components/form-controls/code-artifact-form-control/code-artifact-control-fullscreen/add-npm-package-modal/add-npm-package-modal.component';
import { projectReducer } from '../../../../../ui/common/src/lib/store/project/project.reducer';
import { TrackHoverDirective } from './components/form-controls/dictionary-form-control/track-hover.directive';
import { MatCardModule } from '@angular/material/card';
import {
  MatFormFieldModule,
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { DialogTitleTemplateComponent } from './components/dialog-title-template/dialog-title-template.component';
import { MatDialogModule } from '@angular/material/dialog';
import { JsonViewDialogComponent } from './components/json-view/json-view-dialog/json-view-dialog.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AuthConfigsPipe } from './components/configs-form/auth-configs.pipe';
import { MatToolbarModule } from '@angular/material/toolbar';
import { InterpolatingTextFormControlComponent } from './components/form-controls/interpolating-text-form-control/interpolating-text-form-control.component';
import { QuillModule } from 'ngx-quill';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { StepMentionsListComponent } from './components/form-controls/interpolating-text-form-control/mentions-list/step-mentions-tree/step-mentions-tree.component';
import { MatTreeModule } from '@angular/material/tree';
import { MentionListItemTemplateComponent } from './components/form-controls/interpolating-text-form-control/mentions-list/mention-list-item-template/mention-list-item-template.component';
import { GenericMentionItemComponent } from './components/form-controls/interpolating-text-form-control/mentions-list/generic-mention-item/generic-mention-item.component';
import { CodeStepMentionItemComponent } from './components/form-controls/interpolating-text-form-control/mentions-list/code-step-mention-item/code-step-mention-item.component';
import { MentionsListComponent } from './components/form-controls/interpolating-text-form-control/mentions-list/mentions-list.component';
import { GenericStepMentionItemComponent } from './components/form-controls/interpolating-text-form-control/mentions-list/generic-step-mention-item/generic-step-mention-item.component';
import { PieceStepMentionItemComponent } from './components/form-controls/interpolating-text-form-control/mentions-list/piece-step-mention-item/piece-step-mention-item.component';
import { WebhookTriggerMentionItemComponent } from './components/form-controls/interpolating-text-form-control/mentions-list/webhook-trigger-mention-item/webhook-trigger-mention-item.component';
import { BuilderAutocompleteMentionsDropdownComponent } from './components/form-controls/interpolating-text-form-control/builder-autocomplete-mentions-dropdown/builder-autocomplete-mentions-dropdown.component';
import { ImgFallbackDirective } from './helper/image-fallback.directive';
import { ArrayFormControlComponent } from './components/form-controls/array-form-control/array-form-control.component';
import { AddEditConnectionButtonComponent } from './components/configs-form/add-edit-connection-button/add-edit-connection-button.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BranchConditionFormControlComponent } from './components/form-controls/branch-condition-form-control/branch-condition-form-control.component';
import { BranchConditionsGroupFormControlComponent } from './components/form-controls/branch-conditions-group-form-control/branch-conditions-group-form-control.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { LoopStepMentionItemComponent } from './components/form-controls/interpolating-text-form-control/mentions-list/loop-step-mention-item/loop-step-mention-item.component';
import { CustomPathMentionDialogComponent } from './components/form-controls/interpolating-text-form-control/mentions-list/custom-path-mention-dialog/custom-path-mention-dialog.component';
import { PieceTriggerMentionItemComponent } from './components/form-controls/interpolating-text-form-control/mentions-list/piece-trigger-mention-item/piece-trigger-mention-item.component';
import { UiCommonModule } from '@/ui/common/src';

export const materialTooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 0,
  hideDelay: 0,
  touchendHideDelay: 0,
};

@NgModule({
  declarations: [
    JsonViewComponent,
    ApImgComponent,
    DefaultFalsePipe,
    DefaultTruePipe,
    OutputLogPipe,
    JsonViewComponent,
    DictionaryFormControlComponent,
    OAuth2ConnectControlComponent,
    ConfigsFormComponent,
    CodeArtifactFormControlComponent,
    CodeArtifactControlFullscreenComponent,
    TestCodeFormModalComponent,
    AddNpmPackageModalComponent,
    TrackHoverDirective,
    DialogTitleTemplateComponent,
    JsonViewDialogComponent,
    AuthConfigsPipe,
    InterpolatingTextFormControlComponent,
    StepMentionsListComponent,
    MentionListItemTemplateComponent,
    GenericMentionItemComponent,
    CodeStepMentionItemComponent,
    MentionsListComponent,
    GenericStepMentionItemComponent,
    PieceStepMentionItemComponent,
    WebhookTriggerMentionItemComponent,
    ImgFallbackDirective,
    BuilderAutocompleteMentionsDropdownComponent,
    ArrayFormControlComponent,
    AddEditConnectionButtonComponent,
    BranchConditionFormControlComponent,
    BranchConditionsGroupFormControlComponent,
    LoopStepMentionItemComponent,
    CustomPathMentionDialogComponent,
    PieceTriggerMentionItemComponent,
  ],
  imports: [
    FontAwesomeModule,
    CommonModule,
    ReactiveFormsModule,
    NgxSkeletonLoaderModule,
    MatExpansionModule,
    MatTabsModule,
    CodemirrorModule,
    FormsModule,
    MatMenuModule,
    UiCommonModule,
    QuillModule.forRoot({}),
    StoreModule.forFeature('commonState', {
      projectsState: projectReducer,
    }),
    AngularSvgIconModule,
    MatTooltipModule,
    MonacoEditorModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatSelectModule,
    MatTableModule,
    MatDialogModule,
    MatToolbarModule,
    MatIconModule,
    MatDividerModule,
    MatTreeModule,
    MatButtonToggleModule,
  ],
  exports: [
    JsonViewComponent,
    ApImgComponent,
    DefaultFalsePipe,
    DefaultTruePipe,
    AngularSvgIconModule,
    FontAwesomeModule,
    MatSnackBarModule,
    MatButtonModule,
    OAuth2ConnectControlComponent,
    DictionaryFormControlComponent,
    ConfigsFormComponent,
    CodeArtifactFormControlComponent,
    MatTooltipModule,
    MatSlideToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatSelectModule,
    MatTableModule,
    DialogTitleTemplateComponent,
    MatDialogModule,
    MatToolbarModule,
    InterpolatingTextFormControlComponent,
    MatIconModule,
    StepMentionsListComponent,
    ImgFallbackDirective,
    BuilderAutocompleteMentionsDropdownComponent,
    ArrayFormControlComponent,
    BranchConditionsGroupFormControlComponent,
    MatDividerModule,
    MatButtonToggleModule,
    PieceTriggerMentionItemComponent,
  ],
  providers: [
    HighlightService,
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 3000, panelClass: 'ap-text-center' },
    },
    { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: materialTooltipDefaults },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
  ],
})
export class CommonLayoutModule {}
