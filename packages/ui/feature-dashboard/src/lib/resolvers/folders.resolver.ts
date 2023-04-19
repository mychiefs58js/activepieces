import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, forkJoin, map, tap } from 'rxjs';
import { FoldersListDto } from '@activepieces/shared';
import { FoldersService } from '../services/folders.service';
import { Store } from '@ngrx/store';

import { FolderActions } from '../store/folders/folders.actions';
import { FlowService } from '@activepieces/ui/common';
export const ARE_THERE_FLOWS_FLAG = 'areThererFlows';

type FoldersResolverResult = {
  folders: FoldersListDto[];
  allFlowsNumber: number;
  uncategorizedFlowsNumber: number;
};
@Injectable({
  providedIn: 'root',
})
export class FoldersResolver
  implements Resolve<Observable<FoldersResolverResult>>
{
  constructor(
    private foldersService: FoldersService,
    private store: Store,
    private flowsService: FlowService
  ) {}

  resolve(): Observable<FoldersResolverResult> {
    const countAllFlows$ = this.flowsService.count({
      allFlows: 'true',
    });
    const countUncategorizedFlows$ = this.flowsService.count({
      allFlows: 'false',
    });

    const folders$ = this.foldersService.list().pipe(map((res) => res.data));
    return forkJoin({
      allFlowsNumber: countAllFlows$,
      uncategorizedFlowsNumber: countUncategorizedFlows$,
      folders: folders$,
    }).pipe(
      tap((res) => {
        this.store.dispatch(FolderActions.setInitial(res));
      })
    );
  }
}
