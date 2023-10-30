import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';

import { EmbeddingService } from '../embedding.service';
import { Observable, map, tap } from 'rxjs';

@Component({
  selector: 'ap-iframe-listener',
  templateUrl: './iframe-listener.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IframeListenerComponent {
  embeddingListener$: Observable<void>;

  constructor(
    private router: Router,
    private embeddingService: EmbeddingService
  ) {
    this.embeddingListener$ = this.embeddingService.getState$().pipe(
      tap((val) => {
        console.log(val);
        if (val.isEmbedded) {
          window.addEventListener('message', this.listenToVendorRouteChanges);
        }
      }),
      map(() => void 0)
    );
  }

  listenToVendorRouteChanges = (
    event: MessageEvent<{
      type: 'VENDOR_ROUTE_CHANGED';
      data: {
        vendorRoute: string;
      };
    }>
  ) => {
    if (
      event.source === window.parent &&
      event.data.type === 'VENDOR_ROUTE_CHANGED'
    ) {
      console.log('VENDOR_ROUTE_CHANGED');
      const targetRoute = event.data.data.vendorRoute;
      const routeToNavigateTo = targetRoute.endsWith('/')
        ? targetRoute
        : `/${targetRoute}`;
      console.log('navigate: ' + routeToNavigateTo);
      this.router.navigate([routeToNavigateTo], { skipLocationChange: true });
      window.parent.postMessage(
        {
          type: 'CLIENT_ROUTE_CHANGED',
          data: {
            route: routeToNavigateTo,
          },
        },
        '*'
      );
    }
  };
}
