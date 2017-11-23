(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core')) :
	typeof define === 'function' && define.amd ? define(['exports', '@angular/core'], factory) :
	(factory((global.ng2StickyKit = global.ng2StickyKit || {}),global.ng.core));
}(this, (function (exports,_angular_core) { 'use strict';

var StickyComponent = (function () {
    /**
     * @param {?} element
     */
    function StickyComponent(element) {
        this.element = element;
        this.zIndex = 10;
        this.width = 'auto';
        this.offsetTop = 0;
        this.offsetBottom = 0;
        this.start = 0;
        this.stickClass = 'sticky';
        this.endStickClass = 'sticky-end';
        this.mediaQuery = '';
        this.parentMode = true;
        this.orientation = 'none';
        this.activated = new _angular_core.EventEmitter();
        this.deactivated = new _angular_core.EventEmitter();
        this.reset = new _angular_core.EventEmitter();
        this.isStuck = false;
    }
    /**
     * @return {?}
     */
    StickyComponent.prototype.ngOnInit = function () {
        this.elem = this.element.nativeElement;
    };
    /**
     * @return {?}
     */
    StickyComponent.prototype.ngAfterViewInit = function () {
        // define scroll container as parent element
        this.container = this.elem.parentNode;
        this.defineOriginalDimensions();
        this.sticker();
    };
    /**
     * @return {?}
     */
    StickyComponent.prototype.onChange = function () {
        this.sticker();
    };
    /**
     * @return {?}
     */
    StickyComponent.prototype.defineOriginalDimensions = function () {
        this.originalCss = {
            zIndex: this.getCssValue(this.elem, 'zIndex'),
            position: this.getCssValue(this.elem, 'position'),
            top: this.getCssValue(this.elem, 'top'),
            right: this.getCssValue(this.elem, 'right'),
            left: this.getCssValue(this.elem, 'left'),
            bottom: this.getCssValue(this.elem, 'bottom'),
            width: this.getCssValue(this.elem, 'width'),
        };
        if (this.width === 'auto') {
            this.width = this.originalCss.width;
        }
    };
    /**
     * @return {?}
     */
    StickyComponent.prototype.defineDimensions = function () {
        var /** @type {?} */ containerTop = this.getBoundingClientRectValue(this.container, 'top');
        this.windowHeight = window.innerHeight;
        this.elemHeight = this.getCssNumber(this.elem, 'height');
        this.elemTop = this.getBoundingClientRectValue(this.elem, 'top');
        this.containerHeight = this.getCssNumber(this.container, 'height');
        this.containerStart = containerTop + this.scrollbarYPos() - this.offsetTop + this.start;
        if (this.parentMode) {
            this.scrollFinish = this.containerStart - this.start - this.offsetBottom + (this.containerHeight - this.elemHeight);
        }
        else {
            this.scrollFinish = document.body.offsetHeight;
        }
    };
    /**
     * @return {?}
     */
    StickyComponent.prototype.resetElement = function () {
        this.elem.classList.remove(this.stickClass);
        Object.assign(this.elem.style, this.originalCss);
        this.reset.next(this.elem);
    };
    /**
     * @return {?}
     */
    StickyComponent.prototype.stuckElement = function () {
        this.isStuck = true;
        this.elem.classList.remove(this.endStickClass);
        this.elem.classList.add(this.stickClass);
        Object.assign(this.elem.style, {
            zIndex: this.zIndex,
            position: 'fixed',
            top: this.offsetTop + 'px',
            right: 'auto',
            bottom: 'auto',
            left: this.getBoundingClientRectValue(this.elem, 'left') + 'px',
            width: this.width
        });
        this.activated.next(this.elem);
    };
    /**
     * @return {?}
     */
    StickyComponent.prototype.unstuckElement = function () {
        this.isStuck = false;
        this.elem.classList.add(this.endStickClass);
        this.container.style.position = 'relative';
        Object.assign(this.elem.style, {
            position: 'absolute',
            top: 'auto',
            left: 'auto',
            right: this.getCssValue(this.elem, 'float') === 'right' || this.orientation === 'right' ? 0 : 'auto',
            bottom: this.offsetBottom + 'px',
            width: this.width
        });
        this.deactivated.next(this.elem);
    };
    /**
     * @return {?}
     */
    StickyComponent.prototype.matchMediaQuery = function () {
        if (!this.mediaQuery)
            return true;
        return (window.matchMedia('(' + this.mediaQuery + ')').matches ||
            window.matchMedia(this.mediaQuery).matches);
    };
    /**
     * @return {?}
     */
    StickyComponent.prototype.sticker = function () {
        // check media query
        if (this.isStuck && !this.matchMediaQuery()) {
            this.resetElement();
            return;
        }
        // detecting when a container's height changes
        this.defineDimensions();
        // check if the sticky element is above the container
        var /** @type {?} */ currentContainerHeight = this.getCssNumber(this.container, 'height');
        if (this.elemHeight >= currentContainerHeight) {
            return;
        }
        var /** @type {?} */ prevScrollPositionTop = this.scrollPositionTop;
        this.scrollPositionTop = this.scrollbarYPos();
        // unstick
        if (this.isStuck && this.scrollPositionTop < this.containerStart || this.scrollPositionTop > this.scrollFinish) {
            this.resetElement();
            if (this.scrollPositionTop > this.scrollFinish) {
                this.unstuckElement();
            }
            this.isStuck = false;
        }
        else if (this.isStuck === false && this.scrollPositionTop > this.containerStart && this.scrollPositionTop < this.scrollFinish) {
            this.stuckElement();
        }
        if (this.isStuck) {
            var /** @type {?} */ scrollDirection = (this.scrollPositionTop - prevScrollPositionTop) || 0;
            this.manageScrolling(this.scrollPositionTop - prevScrollPositionTop);
        }
    };
    /**
     * @param {?} scrollDirection
     * @return {?}
     */
    StickyComponent.prototype.manageScrolling = function (scrollDirection) {
        var /** @type {?} */ scrollUp = scrollDirection < 0;
        var /** @type {?} */ scrollDown = scrollDirection > 0;
        var /** @type {?} */ viewportOverflowTop = this.elemTop - this.offsetTop;
        var /** @type {?} */ viewportOverflowBottom = window.innerHeight - (this.elemTop + this.elemHeight);
        var /** @type {?} */ tmp = this.getBoundingClientRectValue(this.elem, 'top') - this.getBoundingClientRectValue(this.container, 'top') + 'px';
        if (scrollUp && viewportOverflowTop < 0) {
            this.enableScroll = true;
            Object.assign(this.elem.style, {
                position: 'absolute',
                top: tmp,
                left: 'auto'
            });
        }
        else if (scrollUp && viewportOverflowTop >= 0 && this.enableScroll) {
            this.enableScroll = false;
            Object.assign(this.elem.style, {
                position: 'fixed',
                top: this.offsetTop + 'px',
                left: 'auto'
            });
        }
        else if (scrollDown && viewportOverflowBottom < 0) {
            this.enableScroll = true;
            Object.assign(this.elem.style, {
                position: 'absolute',
                top: tmp,
                left: 'auto'
            });
        }
        else if (scrollDown && viewportOverflowBottom >= 0 && this.enableScroll) {
            this.enableScroll = false;
            Object.assign(this.elem.style, {
                position: 'fixed',
                top: (window.innerHeight - this.elem.getBoundingClientRect().height) + 'px',
                left: 'auto'
            });
        }
    };
    /**
     * @return {?}
     */
    StickyComponent.prototype.scrollbarYPos = function () {
        return window.pageYOffset || document.documentElement.scrollTop;
    };
    /**
     * @param {?} element
     * @param {?} property
     * @return {?}
     */
    StickyComponent.prototype.getBoundingClientRectValue = function (element, property) {
        var /** @type {?} */ result = 0;
        if (element && element.getBoundingClientRect) {
            var /** @type {?} */ rect = element.getBoundingClientRect();
            result = (typeof rect[property] !== 'undefined') ? rect[property] : 0;
        }
        return result;
    };
    /**
     * @param {?} element
     * @param {?} property
     * @return {?}
     */
    StickyComponent.prototype.getCssValue = function (element, property) {
        var /** @type {?} */ result = '';
        if (typeof window.getComputedStyle !== 'undefined') {
            result = window.getComputedStyle(element, '').getPropertyValue(property);
        }
        else if (typeof element.currentStyle !== 'undefined') {
            result = element.currentStyle[property];
        }
        return result;
    };
    /**
     * @param {?} element
     * @param {?} property
     * @return {?}
     */
    StickyComponent.prototype.getCssNumber = function (element, property) {
        if (typeof element === 'undefined')
            return 0;
        return parseInt(this.getCssValue(element, property), 10) || 0;
    };
    return StickyComponent;
}());
StickyComponent.decorators = [
    { type: _angular_core.Component, args: [{
                selector: 'sticky',
                template: '<ng-content></ng-content>'
            },] },
];
/**
 * @nocollapse
 */
StickyComponent.ctorParameters = function () { return [
    { type: _angular_core.ElementRef, },
]; };
StickyComponent.propDecorators = {
    'zIndex': [{ type: _angular_core.Input, args: ['sticky-zIndex',] },],
    'width': [{ type: _angular_core.Input, args: ['sticky-width',] },],
    'offsetTop': [{ type: _angular_core.Input, args: ['sticky-offset-top',] },],
    'offsetBottom': [{ type: _angular_core.Input, args: ['sticky-offset-bottom',] },],
    'start': [{ type: _angular_core.Input, args: ['sticky-start',] },],
    'stickClass': [{ type: _angular_core.Input, args: ['sticky-class',] },],
    'endStickClass': [{ type: _angular_core.Input, args: ['sticky-end-class',] },],
    'mediaQuery': [{ type: _angular_core.Input, args: ['sticky-media-query',] },],
    'parentMode': [{ type: _angular_core.Input, args: ['sticky-parent',] },],
    'orientation': [{ type: _angular_core.Input, args: ['sticky-orientation',] },],
    'activated': [{ type: _angular_core.Output },],
    'deactivated': [{ type: _angular_core.Output },],
    'reset': [{ type: _angular_core.Output },],
    'onChange': [{ type: _angular_core.HostListener, args: ['window:scroll', ['$event'],] }, { type: _angular_core.HostListener, args: ['window:resize', ['$event'],] }, { type: _angular_core.HostListener, args: ['window:orientationchange', ['$event'],] },],
};

var StickyModule = (function () {
    function StickyModule() {
    }
    return StickyModule;
}());
StickyModule.decorators = [
    { type: _angular_core.NgModule, args: [{
                declarations: [StickyComponent],
                exports: [StickyComponent]
            },] },
];
/**
 * @nocollapse
 */
StickyModule.ctorParameters = function () { return []; };

/**
 * Generated bundle index. Do not edit.
 */

exports.StickyComponent = StickyComponent;
exports.StickyModule = StickyModule;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ng2-sticky-kit.umd.js.map
