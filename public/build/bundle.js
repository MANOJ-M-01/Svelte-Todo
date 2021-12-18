
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.3' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\components\Header.svelte generated by Svelte v3.44.3 */

    const file$7 = "src\\components\\Header.svelte";

    function create_fragment$7(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "To Do List";
    			attr_dev(div, "class", "header svelte-mup1xg");
    			add_location(div, file$7, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    /* src\components\TaskList.svelte generated by Svelte v3.44.3 */
    const file$6 = "src\\components\\TaskList.svelte";

    function create_fragment$6(ctx) {
    	let div2;
    	let div0;
    	let t0_value = /*details*/ ctx[0].task + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2_value = /*details*/ ctx[0].date + "";
    	let t2;
    	let t3;
    	let button;
    	let div2_class_value;
    	let div2_intro;
    	let div2_outro;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			button = element("button");
    			button.textContent = "x";
    			attr_dev(div0, "class", "head svelte-5oydm4");
    			add_location(div0, file$6, 15, 2, 371);
    			attr_dev(div1, "class", "sub svelte-5oydm4");
    			add_location(div1, file$6, 16, 2, 413);
    			attr_dev(button, "class", "svelte-5oydm4");
    			add_location(button, file$6, 17, 2, 454);
    			attr_dev(div2, "class", div2_class_value = "box shade_" + /*details*/ ctx[0].priority + " svelte-5oydm4");
    			add_location(div2, file$6, 14, 0, 287);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div2, t3);
    			append_dev(div2, button);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*details*/ 1) && t0_value !== (t0_value = /*details*/ ctx[0].task + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*details*/ 1) && t2_value !== (t2_value = /*details*/ ctx[0].date + "")) set_data_dev(t2, t2_value);

    			if (!current || dirty & /*details*/ 1 && div2_class_value !== (div2_class_value = "box shade_" + /*details*/ ctx[0].priority + " svelte-5oydm4")) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div2_outro) div2_outro.end(1);
    				div2_intro = create_in_transition(div2, scale, {});
    				div2_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div2_intro) div2_intro.invalidate();
    			div2_outro = create_out_transition(div2, fade, { duration: 500 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching && div2_outro) div2_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TaskList', slots, []);
    	let { details = [] } = $$props;
    	const dispatch = createEventDispatcher();

    	const handleclose = taskId => {
    		dispatch("close-task", taskId);
    	};

    	const writable_props = ['details'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TaskList> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handleclose(details.id);

    	$$self.$$set = $$props => {
    		if ('details' in $$props) $$invalidate(0, details = $$props.details);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		scale,
    		createEventDispatcher,
    		details,
    		dispatch,
    		handleclose
    	});

    	$$self.$inject_state = $$props => {
    		if ('details' in $$props) $$invalidate(0, details = $$props.details);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [details, handleclose, click_handler];
    }

    class TaskList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { details: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TaskList",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get details() {
    		throw new Error("<TaskList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set details(value) {
    		throw new Error("<TaskList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // Unique ID creation requires a high quality random # generator. In the browser we therefore
    // require the crypto API and do not support built-in fallback to lower quality random number
    // generators (like Math.random()).
    var getRandomValues;
    var rnds8 = new Uint8Array(16);
    function rng() {
      // lazy load so that environments that need to polyfill have a chance to do so
      if (!getRandomValues) {
        // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
        // find the complete implementation of crypto (msCrypto) on IE11.
        getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);

        if (!getRandomValues) {
          throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
        }
      }

      return getRandomValues(rnds8);
    }

    var REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

    function validate(uuid) {
      return typeof uuid === 'string' && REGEX.test(uuid);
    }

    /**
     * Convert array of 16 byte values to UUID string format of the form:
     * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
     */

    var byteToHex = [];

    for (var i = 0; i < 256; ++i) {
      byteToHex.push((i + 0x100).toString(16).substr(1));
    }

    function stringify(arr) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      // Note: Be careful editing this code!  It's been tuned for performance
      // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
      var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
      // of the following:
      // - One or more input array values don't map to a hex octet (leading to
      // "undefined" in the uuid)
      // - Invalid input values for the RFC `version` or `variant` fields

      if (!validate(uuid)) {
        throw TypeError('Stringified UUID is invalid');
      }

      return uuid;
    }

    function v4(options, buf, offset) {
      options = options || {};
      var rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

      rnds[6] = rnds[6] & 0x0f | 0x40;
      rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

      if (buf) {
        offset = offset || 0;

        for (var i = 0; i < 16; ++i) {
          buf[offset + i] = rnds[i];
        }

        return buf;
      }

      return stringify(rnds);
    }

    /* src\components\Button.svelte generated by Svelte v3.44.3 */

    const file$5 = "src\\components\\Button.svelte";

    function create_fragment$5(ctx) {
    	let button;
    	let button_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			button.disabled = /*disabled*/ ctx[1];
    			attr_dev(button, "type", /*type*/ ctx[2]);
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*style*/ ctx[0]) + " svelte-1gtxm6k"));
    			add_location(button, file$5, 6, 0, 121);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*disabled*/ 2) {
    				prop_dev(button, "disabled", /*disabled*/ ctx[1]);
    			}

    			if (!current || dirty & /*type*/ 4) {
    				attr_dev(button, "type", /*type*/ ctx[2]);
    			}

    			if (!current || dirty & /*style*/ 1 && button_class_value !== (button_class_value = "" + (null_to_empty(/*style*/ ctx[0]) + " svelte-1gtxm6k"))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, ['default']);
    	let { style = "primary" } = $$props;
    	let { disabled = disable } = $$props;
    	let { type = "submit" } = $$props;
    	const writable_props = ['style', 'disabled', 'type'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('style' in $$props) $$invalidate(0, style = $$props.style);
    		if ('disabled' in $$props) $$invalidate(1, disabled = $$props.disabled);
    		if ('type' in $$props) $$invalidate(2, type = $$props.type);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ style, disabled, type });

    	$$self.$inject_state = $$props => {
    		if ('style' in $$props) $$invalidate(0, style = $$props.style);
    		if ('disabled' in $$props) $$invalidate(1, disabled = $$props.disabled);
    		if ('type' in $$props) $$invalidate(2, type = $$props.type);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [style, disabled, type, $$scope, slots];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { style: 0, disabled: 1, type: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Priority.svelte generated by Svelte v3.44.3 */
    const file$4 = "src\\components\\Priority.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let t1;
    	let ul;
    	let li0;
    	let input0;
    	let input0_checked_value;
    	let t2;
    	let label0;
    	let t4;
    	let li1;
    	let input1;
    	let input1_checked_value;
    	let t5;
    	let label1;
    	let t7;
    	let li2;
    	let input2;
    	let input2_checked_value;
    	let t8;
    	let label2;
    	let t10;
    	let li3;
    	let input3;
    	let input3_checked_value;
    	let t11;
    	let label3;
    	let t13;
    	let li4;
    	let input4;
    	let input4_checked_value;
    	let t14;
    	let label4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Task Priority";
    			t1 = space();
    			ul = element("ul");
    			li0 = element("li");
    			input0 = element("input");
    			t2 = space();
    			label0 = element("label");
    			label0.textContent = "1";
    			t4 = space();
    			li1 = element("li");
    			input1 = element("input");
    			t5 = space();
    			label1 = element("label");
    			label1.textContent = "2";
    			t7 = space();
    			li2 = element("li");
    			input2 = element("input");
    			t8 = space();
    			label2 = element("label");
    			label2.textContent = "3";
    			t10 = space();
    			li3 = element("li");
    			input3 = element("input");
    			t11 = space();
    			label3 = element("label");
    			label3.textContent = "4";
    			t13 = space();
    			li4 = element("li");
    			input4 = element("input");
    			t14 = space();
    			label4 = element("label");
    			label4.textContent = "5";
    			attr_dev(div, "class", "t-head");
    			add_location(div, file$4, 11, 0, 254);
    			attr_dev(input0, "type", "radio");
    			input0.checked = input0_checked_value = /*selected*/ ctx[0] === 1;
    			attr_dev(input0, "name", "priority");
    			input0.value = "1";
    			attr_dev(input0, "id", "option-1");
    			attr_dev(input0, "class", "svelte-17wqpei");
    			add_location(input0, file$4, 14, 4, 359);
    			attr_dev(label0, "for", "option-1");
    			attr_dev(label0, "class", "svelte-17wqpei");
    			add_location(label0, file$4, 15, 4, 473);
    			attr_dev(li0, "class", "option__box svelte-17wqpei");
    			add_location(li0, file$4, 13, 2, 329);
    			attr_dev(input1, "type", "radio");
    			input1.checked = input1_checked_value = /*selected*/ ctx[0] === 2;
    			attr_dev(input1, "name", "priority");
    			input1.value = "2";
    			attr_dev(input1, "id", "option-2");
    			attr_dev(input1, "class", "svelte-17wqpei");
    			add_location(input1, file$4, 18, 4, 547);
    			attr_dev(label1, "for", "option-2");
    			attr_dev(label1, "class", "svelte-17wqpei");
    			add_location(label1, file$4, 19, 4, 661);
    			attr_dev(li1, "class", "option__box svelte-17wqpei");
    			add_location(li1, file$4, 17, 2, 517);
    			attr_dev(input2, "type", "radio");
    			input2.checked = input2_checked_value = /*selected*/ ctx[0] === 3;
    			attr_dev(input2, "name", "priority");
    			input2.value = "3";
    			attr_dev(input2, "id", "option-3");
    			attr_dev(input2, "class", "svelte-17wqpei");
    			add_location(input2, file$4, 22, 4, 735);
    			attr_dev(label2, "for", "option-3");
    			attr_dev(label2, "class", "svelte-17wqpei");
    			add_location(label2, file$4, 23, 4, 849);
    			attr_dev(li2, "class", "option__box svelte-17wqpei");
    			add_location(li2, file$4, 21, 2, 705);
    			attr_dev(input3, "type", "radio");
    			input3.checked = input3_checked_value = /*selected*/ ctx[0] === 4;
    			attr_dev(input3, "name", "priority");
    			input3.value = "4";
    			attr_dev(input3, "id", "option-4");
    			attr_dev(input3, "class", "svelte-17wqpei");
    			add_location(input3, file$4, 26, 4, 923);
    			attr_dev(label3, "for", "option-4");
    			attr_dev(label3, "class", "svelte-17wqpei");
    			add_location(label3, file$4, 27, 4, 1037);
    			attr_dev(li3, "class", "option__box svelte-17wqpei");
    			add_location(li3, file$4, 25, 2, 893);
    			attr_dev(input4, "type", "radio");
    			input4.checked = input4_checked_value = /*selected*/ ctx[0] === 5;
    			attr_dev(input4, "name", "priority");
    			input4.value = "5";
    			attr_dev(input4, "id", "option-5");
    			attr_dev(input4, "class", "svelte-17wqpei");
    			add_location(input4, file$4, 30, 4, 1111);
    			attr_dev(label4, "for", "option-5");
    			attr_dev(label4, "class", "svelte-17wqpei");
    			add_location(label4, file$4, 31, 4, 1225);
    			attr_dev(li4, "class", "option__box svelte-17wqpei");
    			add_location(li4, file$4, 29, 2, 1081);
    			attr_dev(ul, "class", "option__container svelte-17wqpei");
    			add_location(ul, file$4, 12, 0, 295);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(li0, input0);
    			append_dev(li0, t2);
    			append_dev(li0, label0);
    			append_dev(ul, t4);
    			append_dev(ul, li1);
    			append_dev(li1, input1);
    			append_dev(li1, t5);
    			append_dev(li1, label1);
    			append_dev(ul, t7);
    			append_dev(ul, li2);
    			append_dev(li2, input2);
    			append_dev(li2, t8);
    			append_dev(li2, label2);
    			append_dev(ul, t10);
    			append_dev(ul, li3);
    			append_dev(li3, input3);
    			append_dev(li3, t11);
    			append_dev(li3, label3);
    			append_dev(ul, t13);
    			append_dev(ul, li4);
    			append_dev(li4, input4);
    			append_dev(li4, t14);
    			append_dev(li4, label4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*onChange*/ ctx[1], false, false, false),
    					listen_dev(input1, "change", /*onChange*/ ctx[1], false, false, false),
    					listen_dev(input2, "change", /*onChange*/ ctx[1], false, false, false),
    					listen_dev(input3, "change", /*onChange*/ ctx[1], false, false, false),
    					listen_dev(input4, "change", /*onChange*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selected*/ 1 && input0_checked_value !== (input0_checked_value = /*selected*/ ctx[0] === 1)) {
    				prop_dev(input0, "checked", input0_checked_value);
    			}

    			if (dirty & /*selected*/ 1 && input1_checked_value !== (input1_checked_value = /*selected*/ ctx[0] === 2)) {
    				prop_dev(input1, "checked", input1_checked_value);
    			}

    			if (dirty & /*selected*/ 1 && input2_checked_value !== (input2_checked_value = /*selected*/ ctx[0] === 3)) {
    				prop_dev(input2, "checked", input2_checked_value);
    			}

    			if (dirty & /*selected*/ 1 && input3_checked_value !== (input3_checked_value = /*selected*/ ctx[0] === 4)) {
    				prop_dev(input3, "checked", input3_checked_value);
    			}

    			if (dirty & /*selected*/ 1 && input4_checked_value !== (input4_checked_value = /*selected*/ ctx[0] === 5)) {
    				prop_dev(input4, "checked", input4_checked_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(ul);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Priority', slots, []);
    	let selected = 1;
    	let dispatch = createEventDispatcher();

    	const onChange = e => {
    		$$invalidate(0, selected = e.currentTarget.value);
    		dispatch("priority-no", selected);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Priority> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		selected,
    		dispatch,
    		onChange
    	});

    	$$self.$inject_state = $$props => {
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    		if ('dispatch' in $$props) dispatch = $$props.dispatch;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selected, onChange];
    }

    class Priority extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Priority",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\AddTask.svelte generated by Svelte v3.44.3 */
    const file$3 = "src\\components\\AddTask.svelte";

    // (61:2) <Button disabled={btnDisable} type="submit">
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("ADD");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(61:2) <Button disabled={btnDisable} type=\\\"submit\\\">",
    		ctx
    	});

    	return block;
    }

    // (63:0) {#if message}
    function create_if_block(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*message*/ ctx[3]);
    			attr_dev(div, "class", "alert svelte-60nu1b");
    			add_location(div, file$3, 63, 2, 1821);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*message*/ 8) set_data_dev(t, /*message*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(63:0) {#if message}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let form;
    	let label0;
    	let t1;
    	let input0;
    	let t2;
    	let label1;
    	let t4;
    	let input1;
    	let t5;
    	let priority;
    	let t6;
    	let button;
    	let t7;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	priority = new Priority({ $$inline: true });
    	priority.$on("priority-no", /*prioritySelect*/ ctx[6]);

    	button = new Button({
    			props: {
    				disabled: /*btnDisable*/ ctx[2],
    				type: "submit",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block = /*message*/ ctx[3] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			form = element("form");
    			label0 = element("label");
    			label0.textContent = "Task Details";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			label1 = element("label");
    			label1.textContent = "Task Date";
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			create_component(priority.$$.fragment);
    			t6 = space();
    			create_component(button.$$.fragment);
    			t7 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(label0, "for", "task-data");
    			attr_dev(label0, "class", "t-head");
    			add_location(label0, file$3, 55, 2, 1382);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "task-data");
    			attr_dev(input0, "class", "text-box svelte-60nu1b");
    			add_location(input0, file$3, 56, 2, 1444);
    			attr_dev(label1, "for", "task-date");
    			attr_dev(label1, "class", "t-head");
    			add_location(label1, file$3, 57, 2, 1551);
    			attr_dev(input1, "type", "date");
    			attr_dev(input1, "id", "task-date");
    			attr_dev(input1, "class", "text-box svelte-60nu1b");
    			add_location(input1, file$3, 58, 2, 1610);
    			add_location(form, file$3, 54, 0, 1332);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, label0);
    			append_dev(form, t1);
    			append_dev(form, input0);
    			set_input_value(input0, /*taskdetaile*/ ctx[0]);
    			append_dev(form, t2);
    			append_dev(form, label1);
    			append_dev(form, t4);
    			append_dev(form, input1);
    			set_input_value(input1, /*taskdate*/ ctx[1]);
    			append_dev(form, t5);
    			mount_component(priority, form, null);
    			append_dev(form, t6);
    			mount_component(button, form, null);
    			insert_dev(target, t7, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[7]),
    					listen_dev(input0, "input", /*handleChange*/ ctx[4], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[8]),
    					listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[5]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*taskdetaile*/ 1 && input0.value !== /*taskdetaile*/ ctx[0]) {
    				set_input_value(input0, /*taskdetaile*/ ctx[0]);
    			}

    			if (dirty & /*taskdate*/ 2) {
    				set_input_value(input1, /*taskdate*/ ctx[1]);
    			}

    			const button_changes = {};
    			if (dirty & /*btnDisable*/ 4) button_changes.disabled = /*btnDisable*/ ctx[2];

    			if (dirty & /*$$scope*/ 4096) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (/*message*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(priority.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(priority.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_component(priority);
    			destroy_component(button);
    			if (detaching) detach_dev(t7);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AddTask', slots, []);
    	let taskdetaile = '';
    	let taskdate = false;
    	let btnDisable = true;
    	let min = 10;
    	let message;
    	let priorityNo = 1;
    	const dispatch = createEventDispatcher();

    	const handleChange = e => {
    		if (taskdetaile.trim().length <= min) {
    			$$invalidate(3, message = "task length should be higher than 10 character");
    			$$invalidate(2, btnDisable = true);
    		} else {
    			$$invalidate(2, btnDisable = false);
    			$$invalidate(3, message = false);
    		}
    	};

    	const handleSubmit = () => {
    		if (taskdetaile.trim().length <= min) {
    			$$invalidate(3, message = "task length should be higher than 10 character");
    			$$invalidate(2, btnDisable = true);
    		}

    		if (!taskdate) {
    			$$invalidate(3, message = "select task date");
    			$$invalidate(2, btnDisable = false);
    			return;
    		}

    		if (taskdetaile.trim().length > min) {
    			$$invalidate(2, btnDisable = true);
    			$$invalidate(3, message = false);

    			let datas = {
    				id: v4(),
    				task: taskdetaile,
    				date: taskdate,
    				priority: priorityNo
    			};

    			dispatch("new-task", datas);
    			$$invalidate(1, taskdate = "");
    			$$invalidate(0, taskdetaile = "");
    			priorityNo = 1;
    		}
    	};

    	const prioritySelect = e => {
    		priorityNo = e.detail;
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AddTask> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		taskdetaile = this.value;
    		$$invalidate(0, taskdetaile);
    	}

    	function input1_input_handler() {
    		taskdate = this.value;
    		$$invalidate(1, taskdate);
    	}

    	$$self.$capture_state = () => ({
    		uuid: v4,
    		createEventDispatcher,
    		Button,
    		Priority,
    		taskdetaile,
    		taskdate,
    		btnDisable,
    		min,
    		message,
    		priorityNo,
    		dispatch,
    		handleChange,
    		handleSubmit,
    		prioritySelect
    	});

    	$$self.$inject_state = $$props => {
    		if ('taskdetaile' in $$props) $$invalidate(0, taskdetaile = $$props.taskdetaile);
    		if ('taskdate' in $$props) $$invalidate(1, taskdate = $$props.taskdate);
    		if ('btnDisable' in $$props) $$invalidate(2, btnDisable = $$props.btnDisable);
    		if ('min' in $$props) min = $$props.min;
    		if ('message' in $$props) $$invalidate(3, message = $$props.message);
    		if ('priorityNo' in $$props) priorityNo = $$props.priorityNo;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		taskdetaile,
    		taskdate,
    		btnDisable,
    		message,
    		handleChange,
    		handleSubmit,
    		prioritySelect,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class AddTask extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddTask",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\TaskCounts.svelte generated by Svelte v3.44.3 */

    const file$2 = "src\\components\\TaskCounts.svelte";

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(/*count*/ ctx[0]);
    			t1 = text("Tasks");
    			attr_dev(div0, "class", "count-bar svelte-1uzp9re");
    			add_location(div0, file$2, 4, 4, 77);
    			attr_dev(div1, "class", "count-container svelte-1uzp9re");
    			add_location(div1, file$2, 3, 0, 42);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*count*/ 1) set_data_dev(t0, /*count*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TaskCounts', slots, []);
    	let { count = '' } = $$props;
    	const writable_props = ['count'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TaskCounts> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('count' in $$props) $$invalidate(0, count = $$props.count);
    	};

    	$$self.$capture_state = () => ({ count });

    	$$self.$inject_state = $$props => {
    		if ('count' in $$props) $$invalidate(0, count = $$props.count);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [count];
    }

    class TaskCounts extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { count: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TaskCounts",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get count() {
    		throw new Error("<TaskCounts>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set count(value) {
    		throw new Error("<TaskCounts>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Tasks.svelte generated by Svelte v3.44.3 */
    const file$1 = "src\\components\\Tasks.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (42:2) {#each Items as item (item.id)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let tasklist;
    	let current;

    	tasklist = new TaskList({
    			props: { details: /*item*/ ctx[4] },
    			$$inline: true
    		});

    	tasklist.$on("close-task", /*handleclose*/ ctx[2]);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(tasklist.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(tasklist, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const tasklist_changes = {};
    			if (dirty & /*Items*/ 1) tasklist_changes.details = /*item*/ ctx[4];
    			tasklist.$set(tasklist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tasklist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tasklist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(tasklist, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(42:2) {#each Items as item (item.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let t0;
    	let div;
    	let addtask;
    	let t1;
    	let taskcounts;
    	let t2;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	addtask = new AddTask({ $$inline: true });
    	addtask.$on("new-task", /*handleNew*/ ctx[3]);

    	taskcounts = new TaskCounts({
    			props: { count: /*taskcount*/ ctx[1] },
    			$$inline: true
    		});

    	let each_value = /*Items*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[4].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			t0 = space();
    			div = element("div");
    			create_component(addtask.$$.fragment);
    			t1 = space();
    			create_component(taskcounts.$$.fragment);
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			document.title = "Tasks";
    			attr_dev(div, "class", "container svelte-jo2nyz");
    			add_location(div, file$1, 38, 0, 820);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(addtask, div, null);
    			append_dev(div, t1);
    			mount_component(taskcounts, div, null);
    			append_dev(div, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const taskcounts_changes = {};
    			if (dirty & /*taskcount*/ 2) taskcounts_changes.count = /*taskcount*/ ctx[1];
    			taskcounts.$set(taskcounts_changes);

    			if (dirty & /*Items, handleclose*/ 5) {
    				each_value = /*Items*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(addtask.$$.fragment, local);
    			transition_in(taskcounts.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(addtask.$$.fragment, local);
    			transition_out(taskcounts.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			destroy_component(addtask);
    			destroy_component(taskcounts);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let taskcount;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tasks', slots, []);

    	let Items = [
    		{
    			id: 1,
    			task: "buy grocery on friday",
    			date: "12/12/2021",
    			priority: 3
    		},
    		{
    			id: 2,
    			task: "party on saturday",
    			date: "13/12/2021",
    			priority: 2
    		},
    		{
    			id: 3,
    			task: "lundary on sunday",
    			date: "14/12/2021",
    			priority: 1
    		}
    	];

    	const handleclose = e => {
    		let taskId = e.detail;
    		$$invalidate(0, Items = Items.filter(Item => Item.id != taskId));
    	};

    	const handleNew = e => {
    		let newTask = e.detail;
    		$$invalidate(0, Items = [newTask, ...Items]);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tasks> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		TaskList,
    		AddTask,
    		TaskCounts,
    		Items,
    		handleclose,
    		handleNew,
    		taskcount
    	});

    	$$self.$inject_state = $$props => {
    		if ('Items' in $$props) $$invalidate(0, Items = $$props.Items);
    		if ('taskcount' in $$props) $$invalidate(1, taskcount = $$props.taskcount);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*Items*/ 1) {
    			$$invalidate(1, taskcount = Items.length);
    		}
    	};

    	return [Items, taskcount, handleclose, handleNew];
    }

    class Tasks extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tasks",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.44.3 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let header;
    	let t;
    	let tasks;
    	let current;
    	header = new Header({ $$inline: true });
    	tasks = new Tasks({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(header.$$.fragment);
    			t = space();
    			create_component(tasks.$$.fragment);
    			add_location(main, file, 5, 0, 120);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t);
    			mount_component(tasks, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(tasks.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(tasks.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(tasks);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Header, Tasks });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
