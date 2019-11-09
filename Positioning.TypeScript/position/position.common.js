var position;
(function (position) {
    var PluginBase = (function () {
        function PluginBase(targetSelector, targetElement, options) {
            this.options = null;
            this.target = null;
            this.setTarget(targetSelector, targetElement);
        }
        PluginBase.prototype.initialize = function () {
        };
        PluginBase.prototype.parseIntFromString = function (value) {
            return parseInt(value, 10) || 0;
        };
        PluginBase.prototype.getObjectProp = function (obj, propName) {
            var prop = null;
            if(obj) {
                if(propName in obj) {
                    prop = obj[propName];
                } else if('prototype' in obj) {
                    if(propName in obj.prototype) {
                        prop = obj.prototype[propName];
                    }
                }
            }
            return prop;
        };
        PluginBase.prototype.getObjectFn = function (obj, fnName) {
            var fn = PluginBase.prototype.getObjectProp(obj, fnName);
            return (typeof fn == 'function') ? fn : null;
        };
        PluginBase.prototype.isPropertyInObject = function (obj, propertyName) {
            var isInProto = false;
            if(obj) {
                isInProto = (propertyName in obj);
                if(!isInProto && ('prototype' in obj)) {
                    isInProto = (propertyName in obj.prototype);
                }
            }
            return isInProto;
        };
        PluginBase.prototype.isPropertyInElement = function (elem, propertyName) {
            var isInProto = PluginBase.prototype.isPropertyInObject(elem, propertyName);
            if(!isInProto && elem) {
                if((elem == document)) {
                    if('Document' in window) {
                        isInProto = PluginBase.prototype.isPropertyInObject(window['Document'], propertyName);
                    } else if('HTMLDocument' in window) {
                        isInProto = PluginBase.prototype.isPropertyInObject(window['HTMLDocument'], propertyName);
                    }
                } else {
                    if('HTMLElement' in window) {
                        isInProto = PluginBase.prototype.isPropertyInObject(window['HTMLElement'], propertyName);
                    } else if('HTMLHtmlElement' in window) {
                        isInProto = PluginBase.prototype.isPropertyInObject(window['HTMLHtmlElement'], propertyName);
                    } else if('Node' in window) {
                        isInProto = PluginBase.prototype.isPropertyInObject(window['Node'], propertyName);
                    }
                }
            }
            return isInProto;
        };
        PluginBase.prototype.getElementsByClassName = function (classNames) {
            if(!classNames) {
                return null;
            }
            var results = [];
            var i = 0;
            var el;
            var rx = new RegExp(classNames.replace(" ", "|"));
            if(PluginBase.prototype.isPropertyInElement(document, 'all')) {
                for(var n = 0; n < document.all.length; n++) {
                    if("className" in document.all[n]) {
                        el = document.all[n];
                        if(rx.test(el.className)) {
                            results.push(el);
                            i++;
                        }
                    }
                }
            } else {
            }
            return results;
        };
        PluginBase.prototype.getElements = function (targetSelector, node) {
            var target = [];
            var selectors = targetSelector.split(',');
            var i = selectors.length;
            var el;
            var nodelist;
            var id;
            var classname;
            var tagname;
            var parentnode;
            if(node) {
                parentnode = node;
            } else {
                parentnode = document;
            }
            while(i--) {
                if(/[#]/.test(selectors[i])) {
                    id = selectors[i].split('#')[1];
                    el = document.getElementById(id);
                    if(el) {
                        target.push(el);
                    }
                } else if(/[\.]/.test(selectors[i])) {
                    classname = selectors[i].split('.')[1];
                    tagname = selectors[i].split('.')[0].toUpperCase();
                    if(PluginBase.prototype.isPropertyInElement(parentnode, 'getElementsByClassName')) {
                        nodelist = parentnode.getElementsByClassName(classname);
                    } else {
                        nodelist = this.getElementsByClassName(classname);
                    }
                    if(nodelist) {
                        for(var j = 0; j < nodelist.length; j++) {
                            if(tagname) {
                                if(tagname == (nodelist[j]).tagName.toUpperCase()) {
                                    target.push(nodelist[j]);
                                }
                            } else {
                                target.push(nodelist[j]);
                            }
                        }
                    }
                } else {
                    nodelist = parentnode.getElementsByTagName(selectors[i]);
                    if(nodelist) {
                        for(var j = 0; j < nodelist.length; j++) {
                            target.push(nodelist[j]);
                        }
                    }
                }
            }
            if(target.length < 1) {
                target = null;
            }
            return target;
        };
        PluginBase.prototype.setTarget = function (targetSelector, targetElement) {
            if(!targetSelector && !targetElement) {
                return;
            }
            if(targetElement) {
                this.target = [];
                this.target.push(targetElement);
            } else {
                this.target = this.getElements(targetSelector);
            }
        };
        PluginBase.prototype.setOptions = function (options) {
            if(options) {
                if(!this.options) {
                    this.options = {
                    };
                }
                for(var i in options) {
                    this.options[i] = options[i];
                }
            }
        };
        return PluginBase;
    })();
    position.PluginBase = PluginBase;    
})(position || (position = {}));
(function (position) {
    position.getElements = position.PluginBase.prototype.getElements;
    position.getElementsByClassName = position.PluginBase.prototype.getElementsByClassName;
    position.processCommand = function (selector, command, options) {
        var elements;
        var i, fn, isCreate = false;
        switch(command) {
            case "create":
                elements = new position.Position(selector, null, options);
                break;
            case "processElement":
                elements = position.getElements(selector);
                if(elements) {
                    isCreate = !("dataPosition" in elements[0]);
                }
                if(!isCreate) {
                    i = elements.length;
                    while(i--) {
                        fn = elements[i]["dataPosition"];
                        fn(options);
                    }
                } else {
                    return position.processCommand(selector, "create", options);
                }
                break;
        }
        return elements;
    };
})(position);
