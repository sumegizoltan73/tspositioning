// Type definitions for Position
// Project: https://bitbucket.org/zoli73/tspositioning
// Definitions by: Zoltan Sumegi <https://github.com/sumegizoltan>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/*!   based on   http://api.jquery.com/position
 *               jquery.position() plugin
 */
 
/// <reference path="./position.d.ts"/>

module position {

    // PluginBase
    
    export class PluginBase implements IPluginBase {
        public options: any = null;
        public target: HTMLElement[] = null;

        constructor(targetSelector: string, targetElement?: HTMLElement, options?: any) {
            this.setTarget(targetSelector, targetElement);
        }

        initialize(): void {
        }

        public parseIntFromString(value: any): number {
            return parseInt(value, 10) || 0;
        }

        public getObjectProp(obj: any, propName: string): any {
            var prop: any = null;
            if (obj) {
                if (propName in obj) {
                    prop = obj[propName];
                }
                else if ('prototype' in obj) {
                    if (propName in obj.prototype) {
                        prop = obj.prototype[propName];
                    }
                }
            }
            return prop;
        }

        public getObjectFn(obj: any, fnName: string): Function {
            var fn: Function = PluginBase.prototype.getObjectProp(obj, fnName);
            
            return (typeof fn == 'function') ? fn : null;
        }

        public isPropertyInObject(obj: any, propertyName: string): bool {
            var isInProto: bool = false;
            if (obj) {
                isInProto = (propertyName in obj);
                if (!isInProto && ('prototype' in obj)) {
                    isInProto = (propertyName in obj.prototype);
                }
            }
            return isInProto;
        }

        public isPropertyInElement(elem: any, propertyName: string): bool {
            var isInProto: bool = PluginBase.prototype.isPropertyInObject(elem, propertyName);

            if (!isInProto && elem) {
                if ((elem == document)) {
                    if ('Document' in window) {
                        isInProto = PluginBase.prototype.isPropertyInObject(window['Document'], propertyName);
                    }
                    else if ('HTMLDocument' in window) {
                        isInProto = PluginBase.prototype.isPropertyInObject(window['HTMLDocument'], propertyName);
                    }
                }
                else {
                    if ('HTMLElement' in window) {
                        isInProto = PluginBase.prototype.isPropertyInObject(window['HTMLElement'], propertyName);
                    }
                    else if ('HTMLHtmlElement' in window) {
                        isInProto = PluginBase.prototype.isPropertyInObject(window['HTMLHtmlElement'], propertyName);
                    }
                    else if ('Node' in window) {
                        isInProto = PluginBase.prototype.isPropertyInObject(window['Node'], propertyName);
                    }
                }
            }

            return isInProto;
        }

        public getElementsByClassName(classNames: string): NodeList {
            if (!classNames) {
                return null;
            }
            var results: any = [];
            var i: number = 0;
            var el: HTMLElement;
            var rx = new RegExp(classNames.replace(" ", "|"));

            if (PluginBase.prototype.isPropertyInElement(document, 'all')) {
                for (var n = 0; n < document.all.length; n++) {
                    if ("className" in document.all[n]) {
                        el = <HTMLElement>document.all[n];
                        if (rx.test(el.className)) {
                            results.push(el);
                            i++;
                        }
                    }
                }
            }
            else {
                //TODO recursive children
            }

            return results;
        }

        public getElements(targetSelector: string, node?: HTMLElement): HTMLElement[]{
            var target: HTMLElement[] = [];
            var selectors: string[] = targetSelector.split(',');
            var i: number = selectors.length;
            var el: HTMLElement;
            var nodelist: NodeList;
            var id: string;
            var classname: string;
            var tagname: string;
            var parentnode: any;

            if (node) {
                parentnode = node;
            }
            else {
                parentnode = document;
            }

            while (i--) {
                // process all selector which separated by ','

                if (/[#]/.test(selectors[i])) {
                    // id
                    id = selectors[i].split('#')[1];
                    el = document.getElementById(id);
                    if (el) {
                        target.push(el);
                    }
                }
                else if (/[\.]/.test(selectors[i])) {
                    // className
                    classname = selectors[i].split('.')[1];
                    tagname = selectors[i].split('.')[0].toUpperCase();

                    if (PluginBase.prototype.isPropertyInElement(parentnode, 'getElementsByClassName')) {
                        nodelist = parentnode.getElementsByClassName(classname);
                    }
                    else {
                        nodelist = this.getElementsByClassName(classname);
                    }

                    if (nodelist) {
                        for (var j = 0; j < nodelist.length; j++) {
                            if (tagname) {
                                if (tagname == (<HTMLElement>nodelist[j]).tagName.toUpperCase()) {
                                    target.push(<HTMLElement>nodelist[j]);
                                }
                            }
                            else {
                                target.push(<HTMLElement>nodelist[j]);
                            }
                        }
                    }
                }
                else {
                    // tagName
                    nodelist = parentnode.getElementsByTagName(selectors[i]);
                    if (nodelist) {
                        for (var j = 0; j < nodelist.length; j++) {
                            target.push(<HTMLElement>nodelist[j]);
                        }
                    }
                }
            }

            if (target.length < 1) {
                target = null;
            }

            return target;
        }

        public setTarget(targetSelector: string, targetElement?: HTMLElement): void {
            if (!targetSelector && !targetElement) return;

            if (targetElement) {
                this.target = [];
                this.target.push(targetElement);
            }
            else {
                this.target = this.getElements(targetSelector);
            }
        }

        public setOptions(options: any): void {
            if (options) {
                if (!this.options) {
                    this.options = {};
                }
                for (var i in options) {
                    this.options[i] = options[i];
                }
            }
        }
    }
}


(function (position) {
    position.getElements = position.PluginBase.prototype.getElements;
    position.getElementsByClassName = position.PluginBase.prototype.getElementsByClassName;

    position.processCommand = function (selector, command, options) {
        var elements: HTMLElement[];
        var i, fn, isCreate = false;

        switch (command) {
            case "create":
                elements = new position.Position(selector, null, options);
                break;
            case "processElement":
                elements = position.getElements(selector);
                if (elements) {
                    isCreate = !("dataPosition" in elements[0]);
                }
                if (!isCreate) {
                    i = elements.length;
                    while (i--) {
                        fn = elements[i]["dataPosition"];
                        fn(options);
                    }
                }
                else {
                    return position.processCommand(selector, "create", options);
                }
                break;
        }

        return elements;
    };
})(position);