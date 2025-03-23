declare namespace H {
  export var API_KEY: string;
  
  export class Map {
    constructor(element: HTMLElement, baseLayer: any, options?: any);
    dispose(): void;
    getViewModel(): any;
    getViewPort(): any;
    addObject(obj: any): void;
    screenToGeo(x: number, y: number): { lat: number; lng: number };
    addEventListener(event: string, callback: (event: any) => void): void;
    removeObject(object: any): void;
  }

  export namespace service {
    export class Platform {
      constructor(options: { apikey: string });
      createDefaultLayers(): any;
      getRoutingService(version: any, options: any): any;
    }
  }

  export namespace mapevents {
    export class MapEvents {
      constructor(map: Map);
    }
    export class Behavior {
      constructor(events: MapEvents);
    }
    export interface Event {
      currentPointer: {
        viewportX: number;
        viewportY: number;
      };
    }
  }

  export namespace ui {
    export class UI {
      static createDefault(map: Map, layers: any): any;
    }
  }

  export namespace map {
    export class Group {
      constructor();
      addObject(obj: any): void;
      addObjects(objs: any[]): void;
      removeAll(): void;
      getBoundingBox(): any;
    }
    export class Polyline {
      constructor(lineString: any, options?: any);
      getBoundingBox(): any;
      setData(data: any): void;
    }
    export class Marker {
      constructor(coords: { lat: number; lng: number }, options?: any);
    }
    export class Icon {
      constructor(html: string, options?: any);
    }
  }

  export namespace geo {
    export class LineString {
      constructor();
      pushPoint(point: { lat: number; lng: number }): void;
      static fromFlexiblePolyline(polyline: string): LineString;
    }
  }
}
