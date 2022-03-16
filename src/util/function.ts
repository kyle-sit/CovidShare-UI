/**
 * Throttle a function ensures that the function is only called at most once in
 * a specified time period.  Throttling is used to call a function after every
 * particular interval of time, only first call is executed immediately.
 */
function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Debounce is a function that ensures a time-consuming function does not fire so often
 * that it stalls page performance.  Ignores all calls to it until calls have stopped for
 * specified delay period.  If it is called before the delay ends, then it is restarted.
 */
function debounce(fn, delay) {
    let timer;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(context, args);
        }, delay);
    };
}

function pauseEvent(e) {
    e = e || window.event;
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    if (e.preventDefault) {
        e.preventDefault();
    }
    (e as any).cancelBubble = true;
    (e as any).returnValue = false;
    return false;
}

export { throttle, debounce, pauseEvent };
