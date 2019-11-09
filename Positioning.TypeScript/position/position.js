var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var position;
(function (position) {
    var PositionOptions = (function () {
        function PositionOptions() {
            this.of = null;
            this.my = "";
            this.at = "";
            this.offset = "0 0";
            this.collision = "flip";
            this.using = null;
        }
        return PositionOptions;
    })();    
    var PositionBound = (function () {
        function PositionBound() {
            this.top = 0;
            this.left = 0;
        }
        return PositionBound;
    })();    
    var PositionOffset = (function () {
        function PositionOffset() {
        }
        PositionOffset.prototype.getBoundFromParents = function (node) {
            var bound = new PositionBound();
            var parent = node;
            do {
                bound.top += (parent).offsetTop || 0;
                bound.left += (parent).offsetLeft || 0;
                parent = parent.parentNode;
            }while(parent && (parent !== document));
            return bound;
        };
        PositionOffset.prototype.getOffset = function (elem, options) {
            var isElemNotDefined = !elem;
            if(elem) {
                if('ownerDocument' in elem) {
                    isElemNotDefined = (!elem.ownerDocument);
                }
            }
            if(isElemNotDefined) {
                return null;
            }
            var bound = new PositionBound();
            if(options) {
                this.setOffset(elem, options);
            }
            var isFnInProto = position.PluginBase.prototype.isPropertyInElement(elem, 'getBoundingClientRect');
            if(('getBoundingClientRect' in elem) || isFnInProto) {
                var clientRect = elem.getBoundingClientRect();
                bound.top = parseInt(clientRect.top + '', 10);
                bound.left = parseInt(clientRect.left + '', 10);
            } else {
                bound = this.getBoundFromParents(elem);
            }
            return bound;
        };
        PositionOffset.prototype.setOffset = function (elem, options) {
            if(elem.style.position != 'absolute') {
                elem.style.position = 'absolute';
            }
            var curOffset = this.getOffset(elem);
            var curTop = parseInt(elem.style.top, 10) || 0;
            var curLeft = parseInt(elem.style.left, 10) || 0;
            var props = {
                top: (options.top - curOffset.top) + curTop,
                left: (options.left - curOffset.left) + curLeft
            };
            var isUsing = false;
            if('using' in options) {
                isUsing = (typeof (options.using) == 'function');
            }
            if(isUsing) {
                options.using.call(elem, props);
            } else {
                elem.style.top = props.top + 'px';
                elem.style.left = props.left + 'px';
            }
        };
        return PositionOffset;
    })();
    position.PositionOffset = PositionOffset;    
    var PositionUI = (function (_super) {
        __extends(PositionUI, _super);
        function PositionUI() {
                _super.call(this);
            this.bgiframe = null;
            this.position = {
                fit: new PositionFit(),
                flip: new PositionFlip()
            };
            if(BgiFrame) {
                if('Bgiframe' in BgiFrame) {
                    this.bgiframe = new BgiFrame.Bgiframe();
                }
            }
        }
        return PositionUI;
    })(PositionOffset);    
    var PositionFitNFlipBase = (function () {
        function PositionFitNFlipBase() { }
        PositionFitNFlipBase.prototype.getWindowDimension = function (dimensionType) {
            var dimension = 0;
            var isSuccess = false;
            if('inner' + dimensionType in window) {
                if(typeof (window['inner' + dimensionType]) == 'number') {
                    dimension = window['inner' + dimensionType];
                    isSuccess = true;
                }
            }
            if(!isSuccess) {
                if('documentElement' in document) {
                    if(document.documentElement && document.documentElement['client' + dimensionType]) {
                        dimension = document.documentElement['client' + dimensionType];
                        isSuccess = true;
                    }
                }
            }
            if(!isSuccess) {
                if('body' in document) {
                    if('client' + dimensionType in document.body) {
                        dimension = document.body['client' + dimensionType];
                    } else if('client' + dimensionType in document.body.parentNode) {
                        dimension = document.body.parentNode['client' + dimensionType];
                    }
                }
            }
            return dimension;
        };
        PositionFitNFlipBase.prototype.getWindowScrollPosition = function (coordinate) {
            var pos = 0;
            var isSucces = false;
            var coord;
            var dir;
            var pageFn;
            var scrollFn;
            var fn;
            if(coordinate.toUpperCase() == 'X') {
                coord = 'X';
                dir = 'Left';
            } else {
                coord = 'Y';
                dir = 'Top';
            }
            pageFn = 'page' + coord + 'Offset';
            scrollFn = 'scroll' + dir;
            fn = position.PluginBase.prototype.getObjectFn(window, pageFn);
            if(fn) {
                pos = fn();
                isSucces = true;
            }
            if(!isSucces) {
                if('body' in document) {
                    fn = position.PluginBase.prototype.getObjectFn(document.body, scrollFn);
                    if(fn) {
                        pos = fn();
                        isSucces = true;
                    }
                    if(!isSucces) {
                        fn = position.PluginBase.prototype.getObjectFn(document.body.parentNode, scrollFn);
                        if(fn) {
                            pos = fn();
                            isSucces = true;
                        }
                    }
                }
            }
            if(!isSucces) {
                if('documentElement' in document) {
                    fn = position.PluginBase.prototype.getObjectFn(document.documentElement, scrollFn);
                    if(fn) {
                        pos = fn();
                        isSucces = true;
                    }
                }
            }
            return pos;
        };
        PositionFitNFlipBase.prototype.getWindowWidth = function () {
            return this.getWindowDimension('Width');
        };
        PositionFitNFlipBase.prototype.getWindowHeight = function () {
            return this.getWindowDimension('Height');
        };
        PositionFitNFlipBase.prototype.getWindowScrollLeft = function () {
            return this.getWindowScrollPosition('X');
        };
        PositionFitNFlipBase.prototype.getWindowScrollTop = function () {
            return this.getWindowScrollPosition('Y');
        };
        return PositionFitNFlipBase;
    })();    
    var PositionFit = (function (_super) {
        __extends(PositionFit, _super);
        function PositionFit() {
            _super.apply(this, arguments);

        }
        PositionFit.prototype.left = function (position, data) {
            var over = position.left + data.elemWidth - this.getWindowWidth() - this.getWindowScrollLeft();
            position.left = over > 0 ? position.left - over : Math.max(0, position.left);
            return position;
        };
        PositionFit.prototype.top = function (position, data) {
            var over = position.top + data.elemHeight - this.getWindowHeight() - this.getWindowScrollTop();
            position.top = over > 0 ? position.top - over : Math.max(0, position.top);
            return position;
        };
        return PositionFit;
    })(PositionFitNFlipBase);    
    var PositionFlip = (function (_super) {
        __extends(PositionFlip, _super);
        function PositionFlip() {
            _super.apply(this, arguments);

        }
        PositionFlip.prototype.left = function (position, data) {
            if(data.at[0] != 'center') {
                var over = position.left + data.elemWidth - this.getWindowWidth() - this.getWindowScrollLeft();
                var myOffset = data.my[0] == 'left' ? -data.elemWidth : data.my[0] == 'right' ? data.elemWidth : 0;
                var offset = -2 * data.offset[0];
                position.left += position.left < 0 ? myOffset + data.targetWidth + offset : over > 0 ? myOffset - data.targetWidth + offset : 0;
            }
            return position;
        };
        PositionFlip.prototype.top = function (position, data) {
            if(data.at[1] != 'center') {
                var over = position.top + data.elemHeight - this.getWindowHeight() - this.getWindowScrollTop();
                var myOffset = data.my[1] == 'top' ? -data.elemHeight : data.my[1] == 'bottom' ? data.elemHeight : 0;
                var atOffset = data.at[1] == 'top' ? data.targetHeight : -data.targetHeight;
                var offset = -2 * data.offset[1];
                position.top += position.top < 0 ? myOffset + data.targetHeight + offset : over > 0 ? myOffset + atOffset + offset : 0;
            }
            return position;
        };
        return PositionFlip;
    })(PositionFitNFlipBase);    
    var PositionBase = (function (_super) {
        __extends(PositionBase, _super);
        function PositionBase(targetSelector, targetElement, options) {
                _super.call(this, targetSelector, targetElement, options);
        }
        PositionBase.prototype.initialize = function () {
            _super.prototype.initialize.call(this);
            this.horizontalPositions = /left|center|right/;
            this.verticalPositions = /top|center|bottom/;
            this.horizontalDefault = 'center';
            this.verticalDefault = 'center';
            this.ui = new PositionUI();
        };
        return PositionBase;
    })(position.PluginBase);
    position.PositionBase = PositionBase;    
    var Position = (function (_super) {
        __extends(Position, _super);
        function Position(targetSelector, targetElement, options) {
                _super.call(this, targetSelector, targetElement, options);
            this.basePosition = new PositionBound();
            if(this.target) {
                this.setDefaults();
                this.options = new PositionOptions();
                this.setOptions(options);
                this.initialize();
            }
            return this.target;
        }
        Position.prototype.initialize = function () {
            _super.prototype.initialize.call(this);
            this.setPlugin();
            this.setPlugin();
        };
        Position.prototype.setDefaults = function () {
            if(!this.collision) {
                this.collision = [
                    "flip"
                ];
            }
            if(!this.offset) {
                this.offset = [
                    0, 
                    0
                ];
            }
            if(!this.targetWidth) {
                this.targetWidth = 0;
            }
            if(!this.targetHeight) {
                this.targetHeight = 0;
            }
        };
        Position.prototype.setPlugin = function (options) {
            if(options) {
                this.setOptions(options);
            }
            if(this.options.collision) {
                this.collision = this.options.collision.split(' ');
            }
            if(this.options.offset) {
                var offset = this.options.offset.split(' ');
                this.offset = [];
                for(var i = 0; i < offset.length; i++) {
                    this.offset.push(parseInt(offset[i]));
                }
                while(this.offset.length < 2) {
                    this.offset.push(0);
                }
            }
            this.setDimension();
            this.setPosition("my");
            this.setPosition("at");
            this.normalize();
            this.setBasePosition();
            var i = this.target.length;
            while(i--) {
                if(!("dataPosition" in this.target[i])) {
                    if(i == (this.target.length - 1)) {
                        var plugin = this;
                        this.target[i]["dataPosition"] = function () {
                            plugin.setPlugin.apply(plugin, arguments);
                        };
                    } else {
                        this.target[i]["dataPosition"] = function () {
                            return;
                        };
                    }
                }
                this.processElement(this.target[i]);
            }
        };
        Position.prototype.normalize = function () {
            if(this.collision.length == 1) {
                this.collision[1] = this.collision[0];
            }
            this.offset[0] = this.parseIntFromString(this.offset[0]);
            if(this.offset.length == 1) {
                this.offset[1] = this.offset[0];
            }
            this.offset[1] = this.parseIntFromString(this.offset[1]);
        };
        Position.prototype.setDimension = function () {
            this.basePosition = new PositionBound();
            var isDocument = false;
            var isScreenView = false;
            if('nodeType' in this.options.of) {
                isDocument = (this.options.of.nodeType === 9);
            } else {
                isDocument = (this.options.of === document);
            }
            if('document' in this.options.of) {
                isScreenView = (this.options.of.document !== null && (this.options.of.document !== undefined));
            }
            if(isDocument) {
                var isDocElement = this.isPropertyInObject(document, 'documentElement');
                if(isDocElement) {
                    if(this.isPropertyInObject(document.documentElement, 'offsetWidth')) {
                        this.targetWidth = document.documentElement.offsetWidth;
                        this.targetHeight = document.documentElement.offsetHeight;
                    } else {
                        isDocElement = false;
                    }
                }
                if(!isDocElement) {
                    if(document.body && this.isPropertyInObject(document.body, 'offsetWidth')) {
                        this.targetWidth = this.getObjectProp(document.body, 'offsetWidth') || 0;
                        this.targetHeight = this.getObjectProp(document.body, 'offsetHeight') || 0;
                    } else {
                        this.targetWidth = this.getObjectProp(this.options.of, 'offsetWidth') || 0;
                        this.targetHeight = this.getObjectProp(this.options.of, 'offsetHeight') || 0;
                    }
                    if(!this.targetWidth) {
                        this.targetWidth = this.getObjectProp(document.body.parentNode, 'offsetWidth') || 0;
                    }
                    if(!this.targetHeight) {
                        this.targetHeight = this.getObjectProp(document.body.parentNode, 'offsetHeight') || 0;
                    }
                }
            } else if(("scrollTo" in this.options.of) && isScreenView) {
                this.targetWidth = this.getObjectProp(this.options.of, 'offsetWidth') || 0;
                this.targetHeight = this.getObjectProp(this.options.of, 'offsetHeight') || 0;
                this.basePosition.top = this.getObjectProp(this.options.of, 'scrollTop') || 0;
                this.basePosition.left = this.getObjectProp(this.options.of, 'scrollLeft') || 0;
            } else if("preventDefault" in this.options.of) {
                this.options.at = 'left top';
                this.targetWidth = 0;
                this.targetHeight = 0;
                this.basePosition.top = this.getObjectProp(this.options.of, 'pageY') || this.getObjectProp(this.options.of, 'clientY') || 0;
                this.basePosition.left = this.getObjectProp(this.options.of, 'pageX') || this.getObjectProp(this.options.of, 'clientX') || 0;
            } else {
                this.targetWidth = this.getObjectProp(this.options.of, 'offsetWidth') || 0;
                this.targetHeight = this.getObjectProp(this.options.of, 'offsetHeight') || 0;
                this.basePosition = this.ui.getOffset(this.options.of);
            }
            if(!(this.basePosition.left + this.basePosition.top) || !(this.targetWidth + this.targetHeight)) {
                if(this.isPropertyInObject(this.options.of, 'getBoundingClientRect')) {
                    var fnRect = this.getObjectFn(this.options.of, 'getBoundingClientRect');
                    var clientRect = fnRect();
                    if('left' in clientRect) {
                        if(!(this.basePosition.left + this.basePosition.top)) {
                            this.basePosition.left = parseInt(clientRect.left + '', 10) || 0;
                            this.basePosition.top = parseInt(clientRect.top + '', 10) || 0;
                        }
                        if(!(this.targetWidth + this.targetHeight)) {
                            this.targetWidth = parseInt(clientRect.width + '', 10) || 0;
                            this.targetHeight = parseInt(clientRect.height + '', 10) || 0;
                        }
                    }
                }
            }
        };
        Position.prototype.setPosition = function (tag) {
            var pos = null;
            if(typeof (this.options[tag]) == "string") {
                pos = (this.options[tag] || '').split(' ');
            } else {
                pos = this.options[tag];
            }
            pos = pos.length == 1 ? this.horizontalPositions.test(pos[0]) ? pos.concat([
                this.verticalDefault
            ]) : this.verticalPositions.test(pos[0]) ? [
                this.horizontalDefault
            ].concat(pos) : [
                this.horizontalDefault, 
                this.verticalDefault
            ] : pos;
            pos[0] = this.horizontalPositions.test(pos[0]) ? pos[0] : this.horizontalDefault;
            pos[1] = this.verticalPositions.test(pos[1]) ? pos[1] : this.verticalDefault;
            this.options[tag] = pos;
        };
        Position.prototype.setBasePosition = function () {
            switch(this.options.at[0]) {
                case 'right':
                    this.basePosition.left += this.targetWidth;
                    break;
                case this.horizontalDefault:
                    this.basePosition.left += this.targetWidth / 2;
                    break;
            }
            switch(this.options.at[1]) {
                case 'bottom':
                    this.basePosition.top += this.targetHeight;
                    break;
                case this.verticalDefault:
                    this.basePosition.top += this.targetHeight / 2;
                    break;
            }
            this.basePosition.left += this.offset[0];
            this.basePosition.top += this.offset[1];
        };
        Position.prototype.processElement = function (elem) {
            var elemWidth = 0;
            var elemHeight = 0;
            var position = new PositionBound();
            if(this.isPropertyInElement(elem, 'offsetWidth')) {
                elemWidth = elem.offsetWidth || 0;
            }
            if(this.isPropertyInElement(elem, 'offsetHeight')) {
                elemWidth = elem.offsetHeight || 0;
            }
            position.left = this.basePosition.left;
            position.top = this.basePosition.top;
            switch(this.options.my[0]) {
                case 'right':
                    position.left -= elemWidth;
                    break;
                case this.horizontalDefault:
                    position.left -= elemWidth / 2;
                    break;
            }
            switch(this.options.my[1]) {
                case 'bottom':
                    position.top -= elemHeight;
                    break;
                case this.verticalDefault:
                    position.top -= elemHeight / 2;
                    break;
            }
            var dirs = [
                'left', 
                'top'
            ];
            var collisionOpt = {
                targetWidth: this.targetWidth,
                targetHeight: this.targetHeight,
                elemWidth: elemWidth,
                elemHeight: elemHeight,
                offset: this.offset,
                my: this.options.my,
                at: this.options.at
            };
            var j = dirs.length;
            while(j--) {
                var dir = dirs[j];
                if(this.ui.position[this.collision[j]]) {
                    position = this.ui.position[this.collision[j]][dir](position, collisionOpt);
                }
            }
            if(this.ui.bgiframe) {
                this.ui.bgiframe.fire(elem);
            }
            position["using"] = this.options.using;
            this.ui.getOffset(elem, position);
        };
        Position.prototype.setOptions = function (options) {
            _super.prototype.setOptions.call(this, options);
        };
        return Position;
    })(PositionBase);
    position.Position = Position;    
})(position || (position = {}));
