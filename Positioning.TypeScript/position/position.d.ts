// Type definitions for Position
// Project: https://bitbucket.org/zoli73/tspositioning
// Definitions by: Zoltan Sumegi <https://github.com/sumegizoltan>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/*!   based on   http://api.jquery.com/position
 *               jquery.position() plugin
 */
 
/// <reference path="../bgiframe/typescript.bgiframe.d.ts"/>

// Position base class

module position {
    interface IPluginBase {
        options: any;
        target: HTMLElement[];

        initialize(): void;

        parseIntFromString(value: any): number;

        getObjectProp(obj: any, propName: string): any;
        getObjectFn(obj: any, fnName: string): Function;
        isPropertyInObject(obj: any, propertyName: string): bool;
        isPropertyInElement(elem: any, propertyName: string): bool;
        getElementsByClassName(classNames: string): NodeList;
        getElements(targetSelector: string, node?: HTMLElement): HTMLElement[];
        setTarget(targetSelector: string, targetElement?: HTMLElement): void;
        setOptions(options: any): void;
    }

    interface IPositionBase extends IPluginBase {
        horizontalPositions: RegExp;
        horizontalDefault: string;
        ui: IPositionUI;
        verticalPositions: RegExp;
        verticalDefault: string;
    }

    interface IPositionOffset {
        getOffset(elem: HTMLElement, options?: any): IPositionBound;
        setOffset(elem: HTMLElement, options: any): void;
    }

    interface IPositionUI extends IPositionOffset {
        position: IPositionUIOver;
        bgiframe: BgiFrame.IBgiframe;
    }

    interface IPositionUIOver {
        fit: IPositionFitNFlip;
        flip: IPositionFitNFlip;
    }

    interface IPositionFitNFlip {
        left(position: IPositionBound, data): IPositionBound;
        top(position: IPositionBound, data): IPositionBound;
    }

    interface IPositionFitNFlipBase {
        getWindowDimension(dimensionType: string): number;
        getWindowScrollPosition(coordinate: string): number;
        getWindowWidth(): number;
        getWindowHeight(): number;
        getWindowScrollLeft(): number;
        getWindowScrollTop(): number;
    }

    interface IPositionBound {
        top: number;
        left: number;
    }

    // Position classes for instance

    interface IPosition extends IPositionBase {
        options: IPositionOptions;

        collision: string[];
        offset: number[];
        targetWidth: number;
        targetHeight: number;
        basePosition: IPositionBound;

        setDefaults(): void;
        setPlugin(options?: IPositionOptions): void;
        normalize(): void;
        setDimension(): void;
        setPosition(tag: string): void;
        setBasePosition(): void;
        processElement(elem: HTMLElement): void;
        setOptions(options: IPositionOptions): void;
    }

    interface IPositionOptions {
        of: HTMLElement;
        my: string;
        at: string;
        offset: string;
        collision: string;
        using?: Function;
    }
}