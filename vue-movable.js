;(function(Vue){

    var style = {
        position: 'absolute',
        zIndex: 999,
        display: 'none',
        textDecoration: 'none',
        fontSize: '20px',
        fontWeight: 'bolder',
        color: '#000'
    };

    function buildUp() {
        var $up = $('<a class="jsMvBtn up" href="javascript:;">⬆️</a>');

        $up.css($.extend({
            width: '20px',
            height: '26px',
            lineHeight: '26px',
            top: '-26px',
            left: '50%',
            transform: 'translateX(-50%)'
        }, style));

        return $up;
    }

    function buildDown() {
        var $down = $('<a class="jsMvBtn down" href="javascript:;">⬇️</a>');
        $down.css($.extend({
            width: '20px',
            height: '26px',
            lineHeight: '26px',
            bottom: '-26px',
            left: '50%',
            transform: 'translateX(-50%)'
        }, style));

        return $down;
    }

    function buildLeft() {
        var $left = $('<a class="jsMvBtn left" href="javascript:;">⬅️</a>');

        $left.css($.extend({
            width: '26px',
            height: '20px',
            lineHeight: '20px',
            top: '50%',
            left: '-26px',
            transform: 'translateY(-50%)'
        }, style));

        return $left;
    }

    function buildRight() {
        var $right = $('<a class="jsMvBtn right" href="javascript:;">➡️</a>');

        $right.css($.extend({
            width: '26px',
            height: '20px',
            lineHeight: '20px',
            top: '50%',
            right: '-26px',
            transform: 'translateY(-50%)'
        }, style));

        return $right;
    }

    function renderButtons($el, opts) {
        var $up, $down, $left, $right, index, offset;

        // 上下左右按钮图标
        $up = buildUp();
        $down = buildDown();
        $left = buildLeft();
        $right = buildRight();

        index = opts.index;
        offset = opts.col;

        // 上边界无上移
        if (index < offset) {
            $up.addClass('useless');
        }

        // 下边界无下移
        if (index + offset >= opts.list.length) {
            $down.addClass('useless');
        }

        // 左边界无左移
        if (index % offset === 0) {
            $left.addClass('useless');
        }

        // 右边界无右移
        if ((index + 1) % offset  === 0) {
            $right.addClass('useless');
        }

        // 垂直移动
        if (opts.col === 1 || opts.dir.vertical) {
            $left.addClass('useless');
            $right.addClass('useless');
        }

        // 水平移动
        if (opts.dir.horizontal) {
            $up.addClass('useless');
            $down.addClass('useless');
        }

        // 将图标添加到每一行
        $el.prepend($right)
            .prepend($up)
            .append($down)
            .append($left);
    }

    function bindEvents($el, opts) {

        // 移动偏移量
        var offset = opts.col || 1;

        $el.find('.up').bind('click', function(){
            var list = opts.list, i = opts.index, target, old;

            // 先将目标移除，并放入偏移索引
            target = opts.list.splice(i, 1);
            opts.list.splice(i - offset, 0, target[0]);

            // 再讲目标后面的元素放入偏移量索引后面
            old = opts.list.splice(i+1 - offset, 1);
            opts.list.splice(i, 0, old[0]);

            opts.callback('up', i, list);
        });

        $el.find('.down').bind('click', function(){
            var list = opts.list, i = opts.index, target, old;

            // 先将目标后面的元素放入偏移量索引后面
            old = opts.list.splice(i + offset, 1);
            opts.list.splice(i, 0, old[0]);

            // 先将目标移除，并放入偏移索引
            target = opts.list.splice(i+1, 1);
            opts.list.splice(i + offset, 0, target[0]);

            opts.callback('down', i, list);
        });

        $el.find('.left').bind('click', function(){
            var list = opts.list, i = opts.index, target;

            // 先将目标移除，并放入偏移索引
            target = opts.list.splice(i, 1);
            opts.list.splice(i - 1, 0, target[0]);

            opts.callback('left', i, list);
        });

        $el.find('.right').bind('click', function(){
            var list = opts.list, i = opts.index, target;

            // 先将目标移除，并放入偏移索引
            target = opts.list.splice(i, 1);
            opts.list.splice(i + 1, 0, target[0]);

            opts.callback('right', i, list);
        });
    }

    /**
     * Vue可移动DOM的指令
     * 示例：callback<div v-jr-movable.vertical="{list: list, index: i, beforeMove: beforeMove, onMove: onMove}" v-for="(item,i) in list" :key="i"></div>
     * 示例：callback<div v-jr-movable.horizontal="{list: list, index: i, beforeMove: beforeMove, onMove: onMove}" v-for="(item,i) in list" :key="i"></div>
     * 说明：
     *      方向：vertical垂直移动，horizontal水平移动；
     *      list：列表数据；
     *      index：当前节点下标；
     *      beforeMove：移动前回调函数；
     *      onMove：移动后回调函数
     */
    Vue.directive('jr-movable', {
        bind: function(el, binding) {

            var $el = $(el), opts;

            $el.addClass('jr_movable').css({position: 'relative'});

            // 必须的参数
            opts = binding.value;
            opts.dir = binding.modifiers;
            opts.list = binding.value.list || [];
            opts.index = binding.value.index;
            opts.col = binding.value.col || 1;
            opts.callback = binding.value.callback || $.noop;

            // 添加按钮
            renderButtons($el, opts);

            // 绑定事件
            bindEvents($el, opts);

            // 点击每一行时显示图标
            $el.bind('click', function(){
                // 显示隐藏按钮
                $('.jsMvBtn').not('.useless').hide();
                $(this).find('.jsMvBtn').not('.useless').show();
            });

            $el.bind({
                mouseenter: function() {
                    // 显示隐藏按钮
                    $('.jsMvBtn').not('.useless').hide();
                    $el.find('.jsMvBtn').not('.useless').show();
                },
                mouseleave: function(e) {
                    var $target = $(e.target);
                    if ($target.closest('.jr_movable').length === 0) {
                        $('.jsMvBtn').not('.useless').hide();
                    }
                }
            });
        },
        inserted: function() {},
        update: function() {},
        componentUpdated: function() {},
        unbind: function() {}
    });

})(window.Vue);
