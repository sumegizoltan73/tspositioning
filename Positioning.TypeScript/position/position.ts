// Type definitions for Position
// Project: https://bitbucket.org/zoli73/tspositioning
// Definitions by: Zoltan Sumegi <https://github.com/sumegizoltan>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/*!   based on   http://api.jquery.com/position
 *               jquery.position() plugin
 */
 
/// <reference path="../bgiframe/typescript.bgiframe.d.ts"/>
/// <reference path="./position.d.ts"/>
/// <reference path="./position.common.ts"/>

module position {

    // required classes

    class PositionOptions implements IPositionOptions {
        public of: HTMLElement = null;
        public my: string = "";
        public at: string = "";
        public offset: string = "0 0";
        public collision: string = "flip";
        public using: Function = null;
    }

    class PositionBound implements IPositionBound {
        public top: number = 0;
        public left: number = 0;
    }

    export class PositionOffset implements IPositionOffset {

        constructor() {
        }

        public getBoundFromParents(node: HTMLElement): IPositionBound {
            var bound = new PositionBound();
            var parent: Node = node;

            do {
                bound.top += (<HTMLElement>parent).offsetTop || 0;
                bound.left += (<HTMLElement>parent).offsetLeft || 0;

                parent = parent.parentNode;
            }
            while (parent && (parent !== document))

            return bound;
        }

        public getOffset(elem: HTMLElement, options?: any): IPositionBound {
            var isElemNotDefined: bool = !elem;
            if (elem) {
                if ('ownerDocument' in elem) {
                    isElemNotDefined = (!elem.ownerDocument)
                }
            }
            if (isElemNotDefined) {
                return null;
            }

            var bound: IPositionBound = new PositionBound();

            if (options) {
                this.setOffset(elem, options);
            }

            var isFnInProto = PluginBase.prototype.isPropertyInElement(elem, 'getBoundingClientRect');

            if (('getBoundingClientRect' in elem) || isFnInProto) {
                var clientRect = elem.getBoundingClientRect();
                bound.top = parseInt(clientRect.top + '', 10);
                bound.left = parseInt(clientRect.left + '', 10);
            } else {
                bound = this.getBoundFromParents(elem);
            }

            return bound;
        }

        public setOffset(elem: HTMLElement, options: any): void {
            // set position first, in-case top/left are set even on static elem
            if (elem.style.position != 'absolute') {
                elem.style.position = 'absolute';
            }
            var curOffset: IPositionBound = this.getOffset(elem);

            var curTop: number = parseInt(elem.style.top, 10) || 0;
            var curLeft: number = parseInt(elem.style.left, 10) || 0;
            var props = {
                top: (options.top - curOffset.top) + curTop,
                left: (options.left - curOffset.left) + curLeft
            };

            var isUsing = false;
            if ('using' in options) {
                isUsing = (typeof (options.using) == 'function');
            }

            if (isUsing) {
                options.using.call(elem, props);
            }
            else {
                elem.style.top = props.top + 'px';
                elem.style.left = props.left + 'px';
            }
        }
    }
    
    class PositionUI extends PositionOffset implements IPositionUI {
        public position: {
            fit: IPositionFitNFlip;
            flip: IPositionFitNFlip;
        };
        public bgiframe: BgiFrame.IBgiframe = null;

        constructor() {
            super();

            this.position = {
                fit: new PositionFit(),
                flip: new PositionFlip()
            };

            if (BgiFrame) {
                if ('Bgiframe' in BgiFrame) {
                    this.bgiframe = new BgiFrame.Bgiframe();
                }
            }
        }
    }

    class PositionFitNFlipBase implements IPositionFitNFlipBase {
        public getWindowDimension(dimensionType: string): number {
            var dimension: number = 0;
            var isSuccess: bool = false;

            if ('inner' + dimensionType in window) {
                if (typeof (window['inner' + dimensionType]) == 'number') {
                    dimension = window['inner' + dimensionType];
                    isSuccess = true;
                }
            }
            if (!isSuccess) {
                if ('documentElement' in document) {
                    if (document.documentElement && document.documentElement['client' + dimensionType]) {
                        dimension = document.documentElement['client' + dimensionType];
                        isSuccess = true;
                    }
                }
            }
            if (!isSuccess) {
                if ('body' in document) {
                    if ('client' + dimensionType in document.body) {
                        dimension = document.body['client' + dimensionType];
                    }
                    else if ('client' + dimensionType in document.body.parentNode) {
                        dimension = document.body.parentNode['client' + dimensionType];
                    }
                }
            }

            return dimension;
        }
        public getWindowScrollPosition(coordinate: string): number {
            var pos: number = 0;
            var isSucces: bool = false;
            var coord: string;
            var dir: string;
            var pageFn: string;
            var scrollFn: string;
            var fn: Function;

            if (coordinate.toUpperCase() == 'X') {
                coord = 'X';
                dir = 'Left';
            }
            else {
                coord = 'Y';
                dir = 'Top';
            }
            pageFn = 'page' + coord + 'Offset';
            scrollFn = 'scroll' + dir;

            fn = PluginBase.prototype.getObjectFn(window, pageFn);
            if (fn) {
                pos = fn();
                isSucces = true;
            }

            if (!isSucces) {
                if ('body' in document) {
                    fn = PluginBase.prototype.getObjectFn(document.body, scrollFn);
                    if (fn) {
                        pos = fn();
                        isSucces = true;
                    }
                    if (!isSucces) {
                        fn = PluginBase.prototype.getObjectFn(document.body.parentNode, scrollFn);
                        if (fn) {
                            pos = fn();
                            isSucces = true;
                        }
                    }
                }
            }
            if (!isSucces) {
                if ('documentElement' in document) {
                    fn = PluginBase.prototype.getObjectFn(document.documentElement, scrollFn);
                    if (fn) {
                        pos = fn();
                        isSucces = true;
                    }
                }
            }

            return pos;
        }
        public getWindowWidth(): number {
            return this.getWindowDimension('Width');
        }
        public getWindowHeight(): number {
            return this.getWindowDimension('Height');
        }
        public getWindowScrollLeft(): number {
            return this.getWindowScrollPosition('X');
        }
        public getWindowScrollTop(): number {
            return this.getWindowScrollPosition('Y');
        }
    }

    class PositionFit extends PositionFitNFlipBase implements IPositionFitNFlip {
        public left(position: IPositionBound, data): IPositionBound {
            var over = position.left + data.elemWidth - this.getWindowWidth() - this.getWindowScrollLeft();
            position.left = over > 0 ? position.left - over : Math.max(0, position.left);
            return position;
        }

        public top(position: IPositionBound, data): IPositionBound {
            var over = position.top + data.elemHeight - this.getWindowHeight() - this.getWindowScrollTop();
            position.top = over > 0 ? position.top - over : Math.max(0, position.top);
            return position;
        }
    }

    class PositionFlip extends PositionFitNFlipBase implements IPositionFitNFlip {
        public left(position: IPositionBound, data): IPositionBound {
            if (data.at[0] != 'center') {
                var over = position.left + data.elemWidth - this.getWindowWidth() - this.getWindowScrollLeft();
                var myOffset = data.my[0] == 'left' ? -data.elemWidth :
                                                      data.my[0] == 'right' ? data.elemWidth : 0;
                var offset = -2 * data.offset[0];
                position.left += position.left < 0 ? myOffset + data.targetWidth + offset :
                                                     over > 0 ? myOffset - data.targetWidth + offset : 0;
            }
            return position;
        }

        public top(position: IPositionBound, data): IPositionBound {
            if (data.at[1] != 'center') {
                var over = position.top + data.elemHeight - this.getWindowHeight() - this.getWindowScrollTop();
                var myOffset = data.my[1] == 'top' ? -data.elemHeight :
                                                     data.my[1] == 'bottom' ? data.elemHeight : 0;
                var atOffset = data.at[1] == 'top' ? data.targetHeight : -data.targetHeight;
                var offset = -2 * data.offset[1];
                position.top += position.top < 0 ? myOffset + data.targetHeight + offset :
                                                   over > 0 ? myOffset + atOffset + offset : 0;
            }
            return position;
        }
    }

    export class PositionBase extends PluginBase implements IPositionBase {
        public horizontalDefault: string;
        public horizontalPositions: RegExp;
        public ui: IPositionUI;
        public verticalPositions: RegExp;
        public verticalDefault: string;

        constructor(targetSelector: string, targetElement?: HTMLElement, options?: any) {
            super(targetSelector, targetElement, options);
        }

        initialize(): void {
            super.initialize();

            this.horizontalPositions = /left|center|right/;
            this.verticalPositions = /top|center|bottom/;
            this.horizontalDefault = 'center';
            this.verticalDefault = 'center';
            this.ui = new PositionUI();
        }
    }
    
    // plugin Position

    export class Position extends PositionBase implements IPosition {
        public options: IPositionOptions;

        public target: HTMLElement[];
        public collision: string[];
        public offset: number[];
        public targetWidth: number;
        public targetHeight: number;
        public basePosition: IPositionBound = new PositionBound();

        constructor(targetSelector: string, targetElement?: HTMLElement, options?: IPositionOptions) {
            super(targetSelector,  targetElement, options);

            if (this.target) {
                this.setDefaults();
                this.options = new PositionOptions();
                this.setOptions(options);
                this.initialize();
            }

            return this.target;
        }

        initialize(): void {
            super.initialize();

            this.setPlugin();
            this.setPlugin();
        }

        setDefaults(): void {
            if (!this.collision) this.collision = ["flip"];
            if (!this.offset) this.offset = [0, 0];
            if (!this.targetWidth) this.targetWidth = 0;
            if (!this.targetHeight) this.targetHeight = 0;
        }

        public setPlugin(options?: IPositionOptions): void {
            if (options) {
                this.setOptions(options);
            }

            if (this.options.collision) {
                this.collision = this.options.collision.split(' ');
            }

            if (this.options.offset) {
                var offset = this.options.offset.split(' ');
                this.offset = [];
                for (var i = 0; i < offset.length; i++) {
                    this.offset.push(parseInt(offset[i]));
                }
                while (this.offset.length < 2) {
                    this.offset.push(0);
                }
            }

            this.setDimension();
            this.setPosition("my"); // set options.my
            this.setPosition("at"); // set options.at
            this.normalize();
            this.setBasePosition();

            var i = this.target.length;
            while (i--) {
                if (!("dataPosition" in this.target[i])) {
                    if (i == (this.target.length - 1)) {
                        var plugin = this;
                        this.target[i]["dataPosition"] = function () { plugin.setPlugin.apply(plugin, arguments); };
                    }
                    else {
                        this.target[i]["dataPosition"] = function () { return; };
                    }
                }
                this.processElement(this.target[i]);
            }
        }

        normalize(): void {
            // normalize collision option
            if (this.collision.length == 1) {
                this.collision[1] = this.collision[0];
            }

            // normalize offset option
            this.offset[0] = this.parseIntFromString(this.offset[0]);
            if (this.offset.length == 1) {
                this.offset[1] = this.offset[0];
            }
            this.offset[1] = this.parseIntFromString(this.offset[1]);
        }

        setDimension(): void {
            this.basePosition = new PositionBound();

            var isDocument: bool = false;
            var isScreenView: bool = false;

            if ('nodeType' in this.options.of) {
                isDocument = (this.options.of.nodeType === 9);
            }
            else {
                isDocument = (<any>this.options.of === document);
            }

            if ('document' in this.options.of) {
                isScreenView = (this.options.of.document !== null && (this.options.of.document !== undefined));
            }

            if (isDocument) {

                var isDocElement: bool = this.isPropertyInObject(document, 'documentElement');
                if (isDocElement) {
                    if (this.isPropertyInObject(document.documentElement, 'offsetWidth')) {
                        this.targetWidth = document.documentElement.offsetWidth;
                        this.targetHeight = document.documentElement.offsetHeight;
                    }
                    else {
                        isDocElement = false;
                    }
                }
                if (!isDocElement) {
                    if (document.body && this.isPropertyInObject(document.body, 'offsetWidth')) {
                        this.targetWidth = this.getObjectProp(document.body, 'offsetWidth') || 0;
                        this.targetHeight = this.getObjectProp(document.body, 'offsetHeight') || 0;
                    } else {
                        this.targetWidth = this.getObjectProp(this.options.of, 'offsetWidth') || 0;
                        this.targetHeight = this.getObjectProp(this.options.of, 'offsetHeight') || 0;
                    }
                    if (!this.targetWidth) {
                        this.targetWidth = this.getObjectProp(document.body.parentNode, 'offsetWidth') || 0;
                    }
                    if (!this.targetHeight) {
                        this.targetHeight = this.getObjectProp(document.body.parentNode, 'offsetHeight') || 0;
                    }
                }
            } else if (("scrollTo" in this.options.of) && isScreenView) {
                // ScreenView
                this.targetWidth = this.getObjectProp(this.options.of, 'offsetWidth') || 0;
                this.targetHeight = this.getObjectProp(this.options.of, 'offsetHeight') || 0;
                this.basePosition.top = this.getObjectProp(this.options.of, 'scrollTop') || 0;
                this.basePosition.left = this.getObjectProp(this.options.of, 'scrollLeft') || 0;
            } else if ("preventDefault" in this.options.of) {
                // MouseEvent
                // force left top to allow flipping
                this.options.at = 'left top';
                this.targetWidth = 0;
                this.targetHeight = 0;
                this.basePosition.top = this.getObjectProp(this.options.of, 'pageY') ||
                                        this.getObjectProp(this.options.of, 'clientY') || 0;
                this.basePosition.left = this.getObjectProp(this.options.of, 'pageX') ||
                                         this.getObjectProp(this.options.of, 'clientX') || 0;
            } else {
                this.targetWidth = this.getObjectProp(this.options.of, 'offsetWidth') || 0;
                this.targetHeight = this.getObjectProp(this.options.of, 'offsetHeight') || 0;
                this.basePosition = this.ui.getOffset(this.options.of); 
            }

            if (!(this.basePosition.left + this.basePosition.top) ||
                !(this.targetWidth + this.targetHeight)) {

                if (this.isPropertyInObject(this.options.of, 'getBoundingClientRect')) {
                    var fnRect = this.getObjectFn(this.options.of, 'getBoundingClientRect');
                    var clientRect = fnRect();

                    if ('left' in clientRect) {
                        if (!(this.basePosition.left + this.basePosition.top)) {
                            this.basePosition.left = parseInt(clientRect.left + '', 10) || 0;
                            this.basePosition.top = parseInt(clientRect.top + '', 10) || 0;
                        }
                        if (!(this.targetWidth + this.targetHeight)) {
                            this.targetWidth = parseInt(clientRect.width + '', 10) || 0;
                            this.targetHeight = parseInt(clientRect.height + '', 10) || 0;
                        }
                    }
                }
            }
        }

        setPosition(tag: string): void {
            var pos: string[] = null;

            if (typeof (this.options[tag]) == "string") {
                pos = (this.options[tag] || '').split(' ');
            }
            else {
                pos = this.options[tag];
            }

            pos = pos.length == 1
                    ? this.horizontalPositions.test(pos[0])
                    ? pos.concat([this.verticalDefault])
                    : this.verticalPositions.test(pos[0])
                    ? [this.horizontalDefault].concat(pos)
                    : [this.horizontalDefault, this.verticalDefault]
                    : pos;
            pos[0] = this.horizontalPositions.test(pos[0]) ? pos[0] : this.horizontalDefault;
            pos[1] = this.verticalPositions.test(pos[1]) ? pos[1] : this.verticalDefault;
            this.options[tag] = pos;
        }

        setBasePosition(): void {
            switch (this.options.at[0]) {
                case 'right':
                    this.basePosition.left += this.targetWidth;
                    break;
                case this.horizontalDefault:
                    this.basePosition.left += this.targetWidth / 2;
                    break;
            }

            switch (this.options.at[1]) {
                case 'bottom':
                    this.basePosition.top += this.targetHeight;
                    break;
                case this.verticalDefault:
                    this.basePosition.top += this.targetHeight / 2;
                    break;
            }

            this.basePosition.left += this.offset[0];
            this.basePosition.top += this.offset[1];
        }

        public processElement(elem: HTMLElement): void {
            var elemWidth: number = 0;
            var elemHeight: number = 0;
            var position: IPositionBound = new PositionBound();

            if (this.isPropertyInElement(elem, 'offsetWidth')) {
                elemWidth = elem.offsetWidth || 0;
            }
            if (this.isPropertyInElement(elem, 'offsetHeight')) {
                elemWidth = elem.offsetHeight || 0;
            }

            position.left = this.basePosition.left;
            position.top = this.basePosition.top;

            switch (this.options.my[0]) {
                case 'right':
                    position.left -= elemWidth;
                    break;
                case this.horizontalDefault:
                    position.left -= elemWidth / 2;
                    break;
            }

            switch (this.options.my[1]) {
                case 'bottom':
                    position.top -= elemHeight;
                    break;
                case this.verticalDefault:
                    position.top -= elemHeight / 2;
                    break;
            }

            // collision
            var dirs: string[] = ['left', 'top'];
            var collisionOpt = {
                targetWidth: this.targetWidth,
                targetHeight: this.targetHeight,
                elemWidth: elemWidth,
                elemHeight: elemHeight,
                offset: this.offset,
                my: this.options.my,
                at: this.options.at
            };
            var j: number = dirs.length;
            while (j--) {
                var dir: string = dirs[j];
                if (this.ui.position[this.collision[j]]) {
                    position = this.ui.position[this.collision[j]][dir](position, collisionOpt);
                }
            }

            if (this.ui.bgiframe) {
                this.ui.bgiframe.fire(elem);
            }

            position["using"] = this.options.using;
            this.ui.getOffset(elem, position);
        }

        public setOptions(options: IPositionOptions): void {
            super.setOptions(options);
        }
    }
}
