import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UiCommonModule } from '@activepieces/ui/common';
import { PromptInputComponent } from './prompt-input/prompt-input.component';
import { PromptsTableComponent } from './prompts-table/prompts-table.component';
import { PromptIconsComponent } from './prompts-table/prompt-icons/prompt-icons.component';
import { GuessFlowComponent } from './guess-flow.component';
import { LottieModule } from 'ngx-lottie';
@NgModule({
  declarations: [
    GuessFlowComponent,
    PromptInputComponent,
    PromptsTableComponent,
    PromptIconsComponent,
  ],
  imports: [CommonModule, UiCommonModule, LottieModule],
  exports: [GuessFlowComponent],
})
export class GuessFlowModule {}
export class GuessFlowComponentRef extends GuessFlowComponent {}
