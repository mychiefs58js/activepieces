import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { BuilderSelectors } from '../../../../../store/builder/builder.selector';
import { CollectionActions } from '../../../../../store/collection/collection.action';
import { Config } from '@activepieces/shared';

@Component({
  selector: 'app-configs-list',
  templateUrl: './configs-list.component.html',
})
export class VariableListComponent implements OnInit {
  @Output() selectedVariable: EventEmitter<{ value: Config; index: number }> =
    new EventEmitter<any>();

  variables$: Observable<Config[]>;
  viewMode$: Observable<boolean>;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.viewMode$ = this.store.select(BuilderSelectors.selectReadOnly);
    this.variables$ = this.store.select(BuilderSelectors.selectAllConfigs);
  }

  deleteVariable(index: number) {
    this.store.dispatch(CollectionActions.deleteConfig({ configIndex: index }));
  }
}
