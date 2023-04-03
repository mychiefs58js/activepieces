import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownComponent } from './components/markdown/markdown.component';
import { MarkdownModule, MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import { EditableTextComponent } from './components/editable-text/editable-text.component';
import {
  MatTooltipDefaultOptions,
  MatTooltipModule,
  MAT_TOOLTIP_DEFAULT_OPTIONS,
} from '@angular/material/tooltip';
import { WarningBoxComponent } from './components/warning-box/warning-box.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { StateIconComponent } from './components/status-icon/state-icon.component';
import { LoadingIconComponent } from './components/loading-icon/loading-icon.component';
import { ApPaginatorComponent } from './components/pagination/ap-paginator.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { IconButtonComponent } from './components/icon-button/icon-button.component';
import { HotspotComponent } from './components/hotspot/hotspot.component';
import { MatButtonModule } from '@angular/material/button';
import { ApButtonComponent } from './components/ap-button/ap-button.component';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';

const exportedImports = [
  CommonModule,
  MatTooltipModule,
  AngularSvgIconModule,
  MatFormFieldModule,
  ReactiveFormsModule,
  MatSelectModule,
  MatInputModule,
  MatMenuModule,
  MatButtonModule,
  MatCardModule,
];
export const materialTooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 0,
  hideDelay: 0,
  touchendHideDelay: 0,
};

export function markedOptionsFactory(): MarkedOptions {
  const renderer = new MarkedRenderer();
  const linkRenderer = renderer.link;

  renderer.link = (href, title, text) => {
    const html = linkRenderer.call(renderer, href, title, text);
    return html.replace(
      /^<a /,
      '<a role="link" tabindex="0" target="_blank" rel="nofollow noopener noreferrer" '
    );
  };

  return {
    renderer,
    gfm: true,
    breaks: false,
    pedantic: false,
    smartLists: true,
    smartypants: false,
  };
}
@NgModule({
  imports: [
    ...exportedImports,
    MarkdownModule.forRoot({
      markedOptions: {
        provide: MarkedOptions,
        useFactory: markedOptionsFactory,
      },
    }),
  ],
  providers: [
    { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: materialTooltipDefaults },
  ],
  declarations: [
    MarkdownComponent,
    EditableTextComponent,
    ApButtonComponent,
    WarningBoxComponent,
    StateIconComponent,
    LoadingIconComponent,
    ApPaginatorComponent,
    HotspotComponent,
    IconButtonComponent,
  ],
  exports: [
    MarkdownComponent,
    EditableTextComponent,
    ApButtonComponent,
    WarningBoxComponent,
    StateIconComponent,
    LoadingIconComponent,
    ApPaginatorComponent,
    HotspotComponent,
    IconButtonComponent,
    ...exportedImports,
  ],
})
export class UiCommonModule {}
