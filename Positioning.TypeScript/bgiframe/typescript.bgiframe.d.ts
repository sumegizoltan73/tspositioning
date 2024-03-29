﻿// Type definitions for typescript.bgiframe 1.0
// Project: https://github.com/sumegizoltan/BgiFrame
// Definitions by: Zoltan Sumegi <https://github.com/sumegizoltan>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/*! The plugin based on:
 *
 *       bgiframe for IE6
 *       https://github.com/brandonaaron/bgiframe
 *
 *       Copyrights for the jQuery plugin:
 *       Copyright (c) 2013 Brandon Aaron (http://brandonaaron.net)
 */

module BgiFrame {
    interface ISettings {
        top: string;
        left: string;
        width: string;
        height: string;
        opacity: bool;
        src: string;
        conditional: bool;
    }

    interface IBgiframe {
        s: ISettings;
        createIframe(): HTMLElement;
        fire(element: HTMLElement): void;
        getIframe(element: HTMLElement): HTMLElement;
        prop(n: any): string;
    }

    interface BgiframeStatic extends IBgiframe {
        (element?: HTMLElement): void;
    }

    declare var Bgiframe: BgiFrame.BgiframeStatic;
}