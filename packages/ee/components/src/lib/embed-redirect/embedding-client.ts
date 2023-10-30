
//TODO: move this to its own library
enum ActivepiecesClientEventName {
  CLIENT_INIT = "CLIENT_INIT",
  CLIENT_ROUTE_CHANGED = "CLIENT_ROUTE_CHANGED",
}
interface ActivepiecesClientInit {
  type: ActivepiecesClientEventName.CLIENT_INIT;
}
interface ActivepiecesClientRouteChanged {
  type: ActivepiecesClientEventName.CLIENT_ROUTE_CHANGED;
  data: {
    route: string;
  };
}


type ActivepiecesClientEvent =
  | ActivepiecesClientInit
  | ActivepiecesClientRouteChanged;

  enum ActivepiecesVendorEventName {
    VENDOR_INIT = "VENDOR_INIT",
    VENDOR_ROUTE_CHANGED = "VENDOR_ROUTE_CHANGED",
  }

  
  interface ActivepiecesVendorRouteChanged {
    type: ActivepiecesVendorEventName.VENDOR_ROUTE_CHANGED;
    data: {
        vendorRoute: string;
    };
  }
  
  interface ActivepiecesVendorInit {
    type: ActivepiecesVendorEventName.VENDOR_INIT;
    data: {
        prefix: string;
        initialClientRoute:string
    };
  }

class ActivepiecesEmbedded {
   _prefix: string = "";
   _initialClientRoute: string = "";
  handleVendorNavigation?: (data:{route:string}) =>void;
  handleClientNavigation?: (data:{route:string}) =>void;
  parentOrigin = window.location.origin;
  constructor() {
  
  }
  configure({ prefix,initialClientRoute }: { prefix: string,initialClientRoute?: string}) {
    this._prefix = prefix;
    this._initialClientRoute = initialClientRoute || '';
    setIframeChecker(this);
 
  }
}


const setIframeChecker = (client: ActivepiecesEmbedded) =>{
  const iframeChecker=  setInterval(()=> {
        const iframe = document.querySelector("iframe") as HTMLIFrameElement;
        const iframeWindow = iframe?.contentWindow
        if(!iframeWindow) return;
     
        window.addEventListener("message", function (event:MessageEvent<ActivepiecesClientEvent>) {
    
          if (event.source === iframeWindow) {
            switch (event.data.type) {
              case ActivepiecesClientEventName.CLIENT_INIT: {
                const apEvent: ActivepiecesVendorInit = {
                    type: ActivepiecesVendorEventName.VENDOR_INIT,
                    data:{
                        prefix:  client._prefix,
                        initialClientRoute: client._initialClientRoute
                    }
                }
                iframeWindow.postMessage(apEvent,'*')
                break;
              }
            }
          }
        });
        checkForVendorRouteChanges(iframeWindow,client);
        checkForClientRouteChanges(client);
        clearInterval(iframeChecker);
    })
    
}
const checkForClientRouteChanges = (client:ActivepiecesEmbedded) =>{
    window.addEventListener("message", function (event:MessageEvent<ActivepiecesClientRouteChanged>) {
        if(event.data.type === ActivepiecesClientEventName.CLIENT_ROUTE_CHANGED){
            console.log(event.data);
            if(!client.handleClientNavigation)
            {                
                this.history.replaceState({},'',event.data.data.route);
            }
            else
            {
                client.handleClientNavigation({route:event.data.data.route});
            }
        }
    })
}

const checkForVendorRouteChanges = (iframeWindow: Window,client:ActivepiecesEmbedded) => {
    let currentRoute = window.location.href;
    setInterval(() => {
        if(currentRoute !== window.location.href) {
            currentRoute = window.location.href;
            if(client.handleVendorNavigation)
            {
                client.handleVendorNavigation({route:currentRoute});
            }
                const apEvent: ActivepiecesVendorRouteChanged = {
                    type: ActivepiecesVendorEventName.VENDOR_ROUTE_CHANGED,
                    data:{
                    vendorRoute: extractRouteAfterPrefix(currentRoute,client._prefix)
                    }
                }
                iframeWindow.postMessage(apEvent,'*');
       }
    },50);
}

function extractRouteAfterPrefix(href:string,prefix:string){
    return href.split(prefix)[1];
}
let Activepieces = new ActivepiecesEmbedded();
