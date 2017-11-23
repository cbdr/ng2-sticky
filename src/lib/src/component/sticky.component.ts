import {Component, ElementRef, Input, Output, EventEmitter, OnInit, AfterViewInit, HostListener} from '@angular/core';

@Component({
    selector: 'sticky',
    template: '<ng-content></ng-content>'
})
export class StickyComponent implements OnInit, AfterViewInit {

    @Input('sticky-zIndex') zIndex = 10;
    @Input('sticky-width') width = 'auto';
    @Input('sticky-offset-top') offsetTop = 0;
    @Input('sticky-offset-bottom') offsetBottom = 0;
    @Input('sticky-start') start = 0;
    @Input('sticky-class') stickClass = 'sticky';
    @Input('sticky-end-class') endStickClass = 'sticky-end';
    @Input('sticky-media-query') mediaQuery = '';
    @Input('sticky-parent') parentMode = true;
    @Input('sticky-orientation') orientation = 'none';

    @Output() activated = new EventEmitter();
    @Output() deactivated = new EventEmitter();
    @Output() reset = new EventEmitter();

    private isStuck = false;

    private elem: any;
    private container: any;
    private originalCss: any;

    private enableScroll: boolean;
    private scrollPositionTop: number;
    private windowHeight: number;
    private containerHeight: number;
    private elemHeight: number;
    private elemTop: number;
    private containerStart: number;
    private scrollFinish: number;

    constructor(private element: ElementRef) { }

    ngOnInit(): void {
        this.elem = this.element.nativeElement;
    }

    ngAfterViewInit(): void {
        // define scroll container as parent element
        this.container = this.elem.parentNode;
        this.defineOriginalDimensions();
        this.sticker();
    }

    @HostListener('window:scroll', ['$event'])
    @HostListener('window:resize', ['$event'])
    @HostListener('window:orientationchange', ['$event'])
    onChange(): void {
        this.sticker();
    }

    defineOriginalDimensions(): void {
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
    }

    defineDimensions(): void {
        const containerTop = this.getBoundingClientRectValue(this.container, 'top');
        this.windowHeight = window.innerHeight;
        this.elemHeight = this.getCssNumber(this.elem, 'height');
        this.elemTop = this.getBoundingClientRectValue(this.elem, 'top');
        this.containerHeight = this.getCssNumber(this.container, 'height');
        this.containerStart = containerTop + this.scrollbarYPos() - this.offsetTop + this.start;
        if (this.parentMode) {
            this.scrollFinish = this.containerStart - this.start - this.offsetBottom + (this.containerHeight - this.elemHeight);
        } else {
            this.scrollFinish = document.body.offsetHeight;
        }
    }

    resetElement(): void {
        this.elem.classList.remove(this.stickClass);
        Object.assign(this.elem.style, this.originalCss);

        this.reset.next(this.elem);
    }

    stuckElement(): void {
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
    }

    unstuckElement(): void {
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
    }

    matchMediaQuery(): any {
        if (!this.mediaQuery) return true;
        return (
            window.matchMedia('(' + this.mediaQuery + ')').matches ||
            window.matchMedia(this.mediaQuery).matches
        );
    }

    sticker(): void {
        // check media query
        if (this.isStuck && !this.matchMediaQuery()) {
            this.resetElement();
            return;
        }

        // detecting when a container's height changes
        this.defineDimensions();

        // check if the sticky element is above the container
        const currentContainerHeight: number = this.getCssNumber(this.container, 'height');        
        if (this.elemHeight >= currentContainerHeight) {
          return;
        }

        const prevScrollPositionTop = this.scrollPositionTop;
        this.scrollPositionTop = this.scrollbarYPos();

        // unstick
        if (this.isStuck && this.scrollPositionTop < this.containerStart || this.scrollPositionTop > this.scrollFinish) {
            this.resetElement();
            if (this.scrollPositionTop > this.scrollFinish) {
                this.unstuckElement();
            }
            this.isStuck = false;
        }
        // stick
        else if (this.isStuck === false && this.scrollPositionTop > this.containerStart && this.scrollPositionTop < this.scrollFinish) {
            this.stuckElement();
        }

        if (this.isStuck) {
            const scrollDirection = (this.scrollPositionTop - prevScrollPositionTop) || 0;
            this.manageScrolling(this.scrollPositionTop - prevScrollPositionTop);
        }
    }

    private manageScrolling(scrollDirection: number): void {
        const scrollUp = scrollDirection < 0;
        const scrollDown = scrollDirection > 0;

        const viewportOverflowTop = this.elemTop - this.offsetTop;
        const viewportOverflowBottom = window.innerHeight - (this.elemTop + this.elemHeight);

        const tmp = this.getBoundingClientRectValue(this.elem, 'top') - this.getBoundingClientRectValue(this.container, 'top') + 'px';

        if (scrollUp && viewportOverflowTop < 0) {
            this.enableScroll = true;
            Object.assign(this.elem.style, {
                position: 'absolute',
                top: tmp,
                left: 'auto'
            });
        } else if (scrollUp && viewportOverflowTop >= 0 && this.enableScroll) {
            this.enableScroll = false;
            Object.assign(this.elem.style, {
                position: 'fixed',
                top: this.offsetTop + 'px',
                left: 'auto'
            });
        } else if (scrollDown && viewportOverflowBottom < 0) {
            this.enableScroll = true;
            Object.assign(this.elem.style, {
                position: 'absolute',
                top: tmp,
                left: 'auto'
            });
        } else if (scrollDown && viewportOverflowBottom >= 0 && this.enableScroll) {
            this.enableScroll = false;
            Object.assign(this.elem.style, {
                position: 'fixed',
                top: (window.innerHeight - this.elem.getBoundingClientRect().height) + 'px',
                left: 'auto'
            });
        }
    }

    private scrollbarYPos(): number {
        return window.pageYOffset || document.documentElement.scrollTop;
    }

    private getBoundingClientRectValue(element: any, property: string): number {
        let result = 0;
        if (element && element.getBoundingClientRect) {
            const rect = element.getBoundingClientRect();
            result = (typeof rect[property] !== 'undefined') ? rect[property] : 0;
        }
        return result;
    }

    private getCssValue(element: any, property: string): any {
        let result: any = '';
        if (typeof window.getComputedStyle !== 'undefined') {
            result = window.getComputedStyle(element, '').getPropertyValue(property);
        }
        else if (typeof element.currentStyle !== 'undefined')  {
            result = element.currentStyle[property];
        }
        return result;
    }

    private getCssNumber(element: any, property: string): number {
        if (typeof element === 'undefined') return 0;
        return parseInt(this.getCssValue(element, property), 10) || 0;
    }
}