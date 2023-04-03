import { Component, OnInit } from '@angular/core';
import { CollectionBuilderService } from '../../../service/collection-builder.service';
import { RightSideBarType } from '../../../../common/model/enum/right-side-bar-type.enum';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { CollectionActions } from '../../../store/collection/collection.action';
import { map, Observable, tap } from 'rxjs';
import { BuilderSelectors } from '../../../store/builder/builder.selector';
import { FlowsActions } from '../../../store/flow/flows.action';
import {
  ChevronDropdownOption,
  ChevronDropdownOptionType,
} from '../../../components/chevron-dropdown-menu/chevron-dropdown-option';
import { Collection, Instance } from '@activepieces/shared';
import { Title } from '@angular/platform-browser';
import { ThemeService } from '../../../../common/service/theme.service';
import { fadeIn400ms } from '../../../../../../../../ui/common/src/lib/animation/fade-in.animations';
import { MagicWandDialogComponent } from './magic-wand-dialog/magic-flow-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-flow-builder-header',
  templateUrl: './flow-builder-header.component.html',
  styleUrls: ['./flow-builder-header.component.scss'],
  animations: [fadeIn400ms],
})
export class FlowBuilderHeaderComponent implements OnInit {
  editing = false;
  collection$: Observable<Collection>;
  flowsCount$: Observable<number>;
  viewMode$: Observable<boolean>;
  collectionActions$: Observable<ChevronDropdownOption[]>;
  newCollectionCheck$: Observable<Params>;
  magicWandEnabled$: Observable<boolean>;
  collectionInstance$: Observable<Instance | undefined>;
  collectionNameHovered = false;
  constructor(
    public dialog: MatDialog,
    private store: Store,
    public themeService: ThemeService,
    private router: Router,
    public collectionBuilderService: CollectionBuilderService,
    private route: ActivatedRoute,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.collectionInstance$ = this.store.select(
      BuilderSelectors.selectCurrentCollectionInstance
    );
    this.collection$ = this.store.select(
      BuilderSelectors.selectCurrentCollection
    );
    this.flowsCount$ = this.store.select(BuilderSelectors.selectFlowsCount);
    this.viewMode$ = this.store.select(BuilderSelectors.selectReadOnly);
    this.collectionActions$ = this.collection$.pipe(
      map((collection) => [
        {
          id: 'RENAME',
          name: 'Rename',
          cssClasses: '',
          type: ChevronDropdownOptionType.NORMAL,
        },
        {
          id: 'SEP_1',
          type: ChevronDropdownOptionType.SEPARATOR,
          cssClasses: '',
        },
        {
          id: 'COPY_ID',
          name: collection.id.toString(),
          cssClasses: '',
          type: ChevronDropdownOptionType.COPY_ID,
        },
      ])
    );
    this.magicWandEnabled$ = this.route.queryParams.pipe(
      map((params) => {
        return !!params['magicWand'];
      })
    );
    this.newCollectionCheck$ = this.route.queryParams.pipe(
      tap((params) => {
        if (params['newCollection']) {
          this.editing = true;
          //remove query params after activating editing for new collection name
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {},
          });
        }
      })
    );
  }
  actionHandler(actionId: string) {
    if (actionId === 'VERSIONS') {
      this.openCollectionVersionsLists();
    } else if (actionId === 'RENAME') {
      this.editing = true;
    }
  }

  guessAi() {
    this.dialog.open(MagicWandDialogComponent);
  }

  openCollectionVersionsLists() {
    this.store.dispatch(
      FlowsActions.setRightSidebar({
        sidebarType: RightSideBarType.COLLECTION_VERSIONS,
        props: {},
      })
    );
  }

  changeEditValue(event: boolean) {
    this.editing = event;
  }

  savePieceName(newPieceName: string) {
    this.store.dispatch(
      CollectionActions.changeName({ displayName: newPieceName })
    );
    this.titleService.setTitle(`AP-${newPieceName}`);
  }

  redirectHome(newWindow: boolean) {
    if (newWindow) {
      const url = this.router.serializeUrl(this.router.createUrlTree([``]));
      window.open(url, '_blank');
    } else {
      const urlArrays = this.router.url.split('/');
      urlArrays.splice(urlArrays.length - 1, 1);
      const fixedUrl = urlArrays.join('/');
      this.router.navigate([fixedUrl]);
    }
  }
}
