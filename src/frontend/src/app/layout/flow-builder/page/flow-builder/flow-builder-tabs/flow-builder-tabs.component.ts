import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Flow } from '../../../../common-layout/model/flow.class';
import { ThemeService } from '../../../../common-layout/service/theme.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { LeftSideBarType } from 'src/app/layout/common-layout/model/enum/left-side-bar-type.enum';
import { exhaustMap, fromEvent, map, Observable, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import { FlowsActions } from '../../../store/action/flows.action';
import { UUID } from 'angular2-uuid';
import { FlowService } from 'src/app/layout/common-layout/service/flow.service';
import { ViewModeEnum } from '../../../store/model/enums/view-mode.enum';
import { BuilderSelectors } from '../../../store/selector/flow-builder.selector';

@Component({
	selector: 'app-flow-builder-tabs',
	templateUrl: './flow-builder-tabs.component.html',
	styleUrls: ['./flow-builder-tabs.component.scss'],
})
export class FlowBuilderTabsComponent implements OnInit, AfterViewInit {
	flows$: Observable<Flow[]>;
	bsModalRef: BsModalRef;
	viewMode$: Observable<ViewModeEnum>;
	isFlowSelected$: Observable<boolean>;
	viewSingleMode: boolean;

	readOnlyMode$: Observable<boolean>;
	selectedFlowId$: Observable<UUID | null>;
	@ViewChild('addFlowBtn') addFlowButton: ElementRef;
	@ViewChildren('flowSpan') flowSpans: QueryList<ElementRef>;

	addFlowButton$: Observable<void> = new Observable<void>();

	constructor(public themeService: ThemeService, private flowService: FlowService, private store: Store) {}

	ngOnInit(): void {
		this.selectedFlowId$ = this.store.select(BuilderSelectors.selectCurrentFlowId);
		this.isFlowSelected$ = this.store.select(BuilderSelectors.selectFlowSelectedId);
		this.viewMode$ = this.store.select(BuilderSelectors.selectViewMode);
		this.readOnlyMode$ = this.store.select(BuilderSelectors.selectReadOnly);
		this.flows$ = this.store.select(BuilderSelectors.selectFlows);
	}

	ngAfterViewInit(): void {
		this.setupAddFlowButtonListener();
	}

	setupAddFlowButtonListener() {
		this.addFlowButton$ = fromEvent(this.addFlowButton.nativeElement, 'click')
			.pipe(exhaustMap(() => this.flowService.createEmptyFlow()))
			.pipe(
				tap(response => {
					if (response) {
						this.scrollToLastTab();
					}
				}),
				map(value => void 0)
			);
	}

	changeSelectedFlow(flow: Flow) {
		this.store.dispatch(FlowsActions.selectFlow({ flowId: flow.id }));
	}

	configsClicked() {
		this.store.dispatch(
			FlowsActions.setLeftSidebar({
				sidebarType: LeftSideBarType.CONFIGS,
			})
		);
	}

	get viewMode() {
		return ViewModeEnum;
	}

	scrollFlowTabsLeft(tabsContainer: HTMLDivElement) {
		tabsContainer.scrollTo({
			left: tabsContainer.scrollLeft - tabsContainer.clientWidth,
			behavior: 'smooth',
		});
	}

	scrollFlowTabsRight(tabsContainer: HTMLDivElement) {
		tabsContainer.scrollTo({
			left: tabsContainer.scrollLeft + tabsContainer.clientWidth,
			behavior: 'smooth',
		});
	}

	shouldShowRightArrow(tabsContainer: HTMLDivElement) {
		return !(tabsContainer.scrollLeft + tabsContainer.clientWidth == tabsContainer.scrollWidth);
	}

	shouldShowLeftArrow(tabsContainer: HTMLDivElement) {
		return tabsContainer.scrollLeft > 0;
	}

	scrollToFlowTab(flowSpanIndex: number) {
		(this.flowSpans.toArray()[flowSpanIndex].nativeElement as HTMLSpanElement).scrollIntoView({
			behavior: 'smooth',
			block: 'end',
			inline: 'end',
		});
		setTimeout(() => {
			(this.flowSpans.toArray()[flowSpanIndex].nativeElement as HTMLSpanElement).scrollIntoView({
				behavior: 'smooth',
				block: 'end',
				inline: 'end',
			});
		}, 100);
	}

	scrollToLastTab() {
		setTimeout(() => {
			(this.flowSpans.last.nativeElement as HTMLSpanElement).scrollIntoView({
				behavior: 'smooth',
				block: 'end',
				inline: 'end',
			});
		}, 400);
	}
}
