import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiCommonModule } from '@activepieces/ui/common';
import { TestPollingTriggerComponent } from './test-polling-trigger/test-polling-trigger.component';
import { TestWebhookTriggerComponent } from './test-webhook-trigger/test-webhook-trigger.component';
import { TestPieceStepComponent } from './test-piece-step/test-piece-step.component';
import { TestCodeStepComponent } from './test-code-step/test-code-step.component';
const exportedDeclarations = [
  TestPollingTriggerComponent,
  TestWebhookTriggerComponent,
  TestPieceStepComponent,
  TestCodeStepComponent,
];
@NgModule({
  imports: [CommonModule, UiCommonModule],
  declarations: exportedDeclarations,
  exports: exportedDeclarations,
})
export class UiFeatureBuilderTestStepsModule {}
