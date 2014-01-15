/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告位资源广告行控件
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var moment = require('moment');
        var u = require('underscore');
        var InputControl = require('esui/InputControl');

        var PriceModel = require('delivery/enum').PriceModel;
        var PriceUnit = require('delivery/enum').PriceUnit;
        var DateType = require('common/enum').DateType;

        require('esui/Select');
        require('esui/TextBox');
        require('esui/RangeCalendar');
        require('esui/RichCalendar');
        require('esui/Validity');

        var DATE_FORMAT = 'YYYYMMDD';
        var DATE_TEXT_FORMAT = 'YYYY-MM-DD';
        var INFINITE_DATE = '99990101';

        /**
         * 广告位资源广告行控件
         *
         * @param {Object=} options 初始化参数
         * @extends esui/InputControl
         * @constructor
         */
        function DeliveryLine(options) {
            InputControl.apply(this, arguments);
        }

        DeliveryLine.prototype.type = 'DeliveryLine';

        /**
         * 创建主元素
         *
         * @return {HTMLElement}
         * @override
         * @protected
         */
        DeliveryLine.prototype.createMain = function () {
            return document.createElement('div');
        };

        /**
         * 初始化参数
         *
         * @param {Object=} options 构造函数传入的参数
         * @override
         * @protected
         */
        DeliveryLine.prototype.initOptions = function (options) {
            var properties = {
                mode: 'edit'
            };
            lib.extend(properties, options);
            this.setProperties(properties);
        };

        /**
         * 初始化DOM结构
         *
         * @override
         * @protected
         */
        DeliveryLine.prototype.initStructure = function () {
            // 先生成一行
            var html = [
                this.helper.getPartHTML('content', 'div'),
                this.helper.getPartHTML('validation', 'footer')
            ];
            this.main.innerHTML = html.join('');
        };

        /**
         * 以编辑模式渲染控件
         */
        DeliveryLine.prototype.renderAsEdit = function () {
            // 可能直接调用这个方法，因此同步模式
            this.mode = 'edit';

            this.helper.disposeChildren();
            var container = this.helper.getPart('content');
            container.innerHTML = getEditHTML.call(this);
            this.helper.initChildren();

            // 设置售卖方式数据源
            var priceModels = PriceModel.toArray();
            this.getChild('priceModel').set('datasource', priceModels);
            // 设置日历开始日期为今天
            var dateRange = { begin: moment().startOf('day').toDate() };
            this.getChild('rangeDate').set('range', dateRange);
            this.getChild('richDate').set('range', dateRange);
            // 默认连续时间
            this.switchToRangeDate();

            initEditEvents.call(this);

            syncValue(this);
        };

        /**
         * 以只读模式渲染控件
         *
         * 需要注意的是，即便在只读模式下，“折扣率”依旧是可以修改的
         */
        DeliveryLine.prototype.renderAsRead = function () {
            this.mode = 'read';

            this.helper.disposeChildren();
            var container = this.helper.getPart('content');
            container.innerHTML = getReadHTML.call(this);
            this.helper.initChildren();

            // 折扣可修改，要联动总价
            var discount = this.getChild('discount');
            discount.on('input', this.updateTotalPrice, this);
        };

        function getEditHTML() {
            var content = [
                '<td>',
                    this.helper.getPartHTML('name', 'div'),
                '</td>',
                '<td>',
                    this.helper.getPartHTML('status', 'div'),
                '</td>',
                '<td>',
                    this.helper.getPartHTML('size', 'div'),
                '</td>',
                '<td>',
                    this.helper.getPartBeginTag('price-model', 'div'),
                        '<div data-ui-type="Select" ',
                            'data-ui-child-name="priceModel"',
                            'data-ui-validity-label='
                                + '"${id}-price-model-validity">',
                        '</div>',
                    this.helper.getPartEndTag('price-model', 'div'),
                '</td>',
                '<td>',
                    this.helper.getPartBeginTag('group', 'div'),
                        '<input data-ui-type="TextBox" ',
                            'data-ui-child-name="group" ',
                            'data-ui-title="投放分组" ',
                            'data-ui-width="40" ',
                            'data-ui-pattern="^&#92;d*$" ',
                            'data-ui-pattern-error-message='
                                + '"投放分组请输入1-100的整数" ',
                            'data-ui-min="1" ',
                            'data-ui-min-error-message="'
                                + '投放分组请输入1-100的整数" ',
                            'data-ui-max="100" ',
                            'data-ui-max-error-message="'
                                + '投放分组请输入1-100的整数" ',
                            'data-ui-validity-label="${id}-group-validity" ',
                        '/>',
                    this.helper.getPartEndTag('group', 'div'),
                '</td>',
                '<td>',
                    this.helper.getPartBeginTag('amount', 'div'),
                        '<input data-ui-type="TextBox" ',
                            'data-ui-child-name="amount" ',
                            'data-ui-title="售卖量" ',
                            'data-ui-width="130" ',
                            'data-ui-required="required" ',
                            'data-ui-pattern="^&#92;d*$" ',
                            'data-ui-pattern-error-message='
                                + '"售卖量请输入1~1,000,000,000的整数" ',
                            'data-ui-min="1" ',
                            'data-ui-pattern-min-message='
                                + '"售卖量请输入1~1,000,000,000的整数" ',
                            'data-ui-max="100000000" ',
                            'data-ui-pattern-max-message='
                                + '"售卖量请输入1~1,000,000,000的整数" ',
                            'data-ui-validity-label="${id}-amount-validity" ',
                        '/>',
                    this.helper.getPartEndTag('amount', 'div'),
                '</td>',
                '<td>',
                    this.helper.getPartBeginTag('discount', 'div'),
                        '<input data-ui-type="TextBox" ',
                            'data-ui-child-name="discount" ',
                            'data-ui-width="40" ',
                            'data-ui-title="折扣率" ',
                            'data-ui-required="required" ',
                            'data-ui-pattern="^(\\d+(\\.\\d{1,2})?)?$" ',
                            'data-ui-pattern-error-message='
                                + '"折扣率请填写≥0且≤100数字，'
                                + '最多可保存至小数点后两位" ',
                            'data-ui-min="0" ',
                            'data-ui-min-error-message='
                                + '"折扣率请填写≥0且≤100数字，'
                                + '最多可保存至小数点后两位" ',
                            'data-ui-max="100" ',
                            'data-ui-max-error-message='
                                + '"折扣率请填写≥0且≤100数字，'
                                + '最多可保存至小数点后两位" ',
                            'data-ui-validity-label="${id}-discount-validity" ',
                        '/>',
                        '/',
                        this.helper.getPartHTML('min-discount', 'span'),
                    this.helper.getPartEndTag('discount', 'div'),
                '</td>',
                '<td>',
                    this.helper.getPartHTML('price', 'div'),
                '</td>',
                '<td>',
                    this.helper.getPartHTML('total', 'div'),
                '</td>',
                '<td>',
                    this.helper.getPartBeginTag('date', 'div'),
                        getDateFieldHTML.call(this),
                    this.helper.getPartEndTag('date', 'div'),
                '</td>',
                '<td>',
                    this.helper.getPartBeginTag('operation', 'div'),
                        this.helper.getPartBeginTag('remove', 'span'),
                            '移除',
                        this.helper.getPartEndTag('remove', 'span'),
                    this.helper.getPartEndTag('operation', 'div'),
                '</td>'
            ];


            var html = [
                '<table>',
                    '<tbody>',
                        '<tr>',
                            content.join(''),
                        '</tr>',
                    '</tbody>',
                '</table>'
            ];

            return lib.format(html.join(''), { id: this.id });
        }

        function getReadHTML() {
            var content = [
                '<td>',
                    this.helper.getPartHTML('name', 'div'),
                '</td>',
                '<td>',
                    this.helper.getPartHTML('status', 'div'),
                '</td>',
                '<td>',
                    this.helper.getPartHTML('size', 'div'),
                '</td>',
                '<td>',
                    this.helper.getPartHTML('price-model', 'div'),
                '</td>',
                '<td>',
                    this.helper.getPartHTML('group', 'div'),
                '</td>',
                '<td>',
                    this.helper.getPartHTML('amount', 'div'),
                '</td>',
                '<td>',
                    this.helper.getPartBeginTag('discount', 'div'),
                        '<input data-ui-type="TextBox" ',
                            'data-ui-child-name="discount" ',
                            'data-ui-title="折扣率" ',
                            'data-ui-width="40" ',
                            'data-ui-required="required" ',
                            'data-ui-pattern="^(\\d+(\\.\\d{1,2})?)?$" ',
                            'data-ui-pattern-error-message='
                                + '"折扣率请填写≥0且≤100数字，'
                                + '最多可保存至小数点后两位" ',
                            'data-ui-min="0" ',
                            'data-ui-min-error-message='
                                + '"折扣率请填写≥0且≤100数字，'
                                + '最多可保存至小数点后两位" ',
                            'data-ui-max="100" ',
                            'data-ui-max-error-message='
                                + '"折扣率请填写≥0且≤100数字，'
                                + '最多可保存至小数点后两位" ',
                            'data-ui-validity-label="${id}-discount-validity" ',
                        '/>',
                        '/',
                        this.helper.getPartHTML('min-discount', 'span'),
                    this.helper.getPartEndTag('discount', 'div'),
                '</td>',
                '<td>',
                    this.helper.getPartHTML('price', 'div'),
                '</td>',
                '<td>',
                    this.helper.getPartHTML('total', 'div'),
                '</td>',
                '<td>',
                    this.helper.getPartHTML('date', 'div'),
                '</td>',
                '<td>',
                    this.helper.getPartHTML('operation', 'div'),
                '</td>'
            ];

            var html = [
                '<table>',
                    '<tbody>',
                        '<tr>',
                            content.join(''),
                        '</tr>',
                    '</tbody>',
                '</table>'
            ];

            return lib.format(html.join(''), { id: this.id });
        }

        function getValidityLabelHTML(childName) {
            return '<label data-ui-type="Validity" '
                + 'data-ui-id="' + this.id + '-' + childName + '-validity" '
                + 'data-ui-child-name="' + childName + '-validity" >'
                + '</label>';
        }

        function getValidationHTML() {
            var labels = [];

            if (this.mode === 'edit') {
                labels.push(
                    getValidityLabelHTML.call(this, 'price-model'),
                    getValidityLabelHTML.call(this, 'group'),
                    getValidityLabelHTML.call(this, 'amount'),
                    getValidityLabelHTML.call(this, 'discount'),
                    getValidityLabelHTML.call(this, 'time')
                );
            }
            else {
                labels.push(getValidityLabelHTML.call(this, 'discount'));
            }

            return labels.join('');
        }

        function getDateFieldHTML() {
            var rangeDateHTML = [
                this.helper.getPartBeginTag('range-date', 'div'),
                    '<div data-ui-type="RangeCalendar" ',
                        'data-ui-child-name="rangeDate">',
                    '</div>',
                    this.helper.getPartBeginTag('switch-to-rich-date', 'span'),
                        '使用不连续时间段',
                    this.helper.getPartEndTag('switch-to-rich-date', 'span'),
                this.helper.getPartEndTag('range-date', 'div')
            ];

            var richDateHTML = [
                this.helper.getPartBeginTag('rich-date', 'div'),
                    '<div data-ui-type="RichCalendar" ',
                        'data-ui-child-name="richDate">',
                    '</div>',
                    this.helper.getPartBeginTag('switch-to-range-date', 'span'),
                        '使用连续时间段',
                    this.helper.getPartEndTag('switch-to-range-date', 'span'),
                this.helper.getPartEndTag('rich-date', 'div')
            ];

            return rangeDateHTML.join('') + richDateHTML.join('');
        }

        function syncAmountUnit() {
            var priceModel = this.getChild('priceModel').getRawValue();
            var unitText = PriceUnit.getTextFromValue(priceModel);
            this.getChild('amount').set('hint', unitText);
        }

        function syncAmountInputType() {
            var priceModel = this.getChild('priceModel').getRawValue();
            if (priceModel === PriceModel.CPD) {
                this.getChild('amount').disable();
            }
            else {
                this.getChild('amount').enable();
            }

            syncDateToAmount.call(this);
        }

        function clearAmount() {
            this.getChild('amount').setValue('');
            this.updateTotalPrice();
        }

        /**
         * 当CPD售卖时，同步选择的日期到售卖量
         */
        function syncDateToAmount() {
            if (this.getChild('priceModel').getRawValue() === PriceModel.CPD) {
                this.getChild('amount').setValue(this.getTotalDays() + '');
                this.updateTotalPrice();
            }
        }

        /**
         * 将连续日期同步到非连续
         */
        function syncRangeDateToRich() {
            var times = [this.getChild('rangeDate').getRawValue()];
            this.getChild('richDate').setRanges(times);
        }

        /**
         * 控制刊例价是否显示
         */
        function syncPriceDisplay() {
            var priceModel = this.getRuntimePriceModelValue();
            var field = this.helper.getPart('price');
            if (priceModel === this.rawValue.slot.priceModel) {
                field.innerHTML = this.rawValue.slot.rate
                    ? this.rawValue.slot.rate
                    : '--';
            }
            else {
                field.innerHTML = '--';
            }
        }

        function initEditEvents() {
            // 日期类型切换
            this.helper.addDOMEvent(
                'switch-to-rich-date',
                'click',
                DeliveryLine.prototype.switchToRichDate
            );
            this.helper.addDOMEvent(
                'switch-to-range-date',
                'click',
                DeliveryLine.prototype.switchToRangeDate
            );

            // 刊例总价连动
            var amount = this.getChild('amount');
            amount.on('input', this.updateTotalPrice, this);
            var discount = this.getChild('discount');
            discount.on('input', this.updateTotalPrice, this);

            // 售卖方式影响售卖量单位
            var priceModel = this.getChild('priceModel');
            priceModel.on('change', syncAmountUnit, this);

            // 售卖方式改变后删除售卖量
            priceModel.on('change', clearAmount, this);

            // CPD下售卖量不能手动填写
            priceModel.on('change', syncAmountInputType, this);

            // 售卖方式改变后控制刊登价和总价是否显示
            priceModel.on('change', syncPriceDisplay, this);
            priceModel.on('change', this.updateTotalPrice, this);

            // CPD下日期和售卖量同步
            var rangeDate = this.getChild('rangeDate');
            var richDate = this.getChild('richDate');
            rangeDate.on('change', syncDateToAmount, this);
            richDate.on('change', syncDateToAmount, this);

            // 连续日期同步到非连续
            rangeDate.on('change', syncRangeDateToRich, this);

            // 触发`change`事件
            var delegate = require('mini-event').delegate;
            delegate(amount, 'change', this, 'amountchange');
            delegate(discount, 'change', this, 'discountchange');
            delegate(priceModel, 'change', this, 'pricemodelchange');
            delegate(rangeDate, 'change', this, 'timechange');
            delegate(richDate, 'change', this, 'timechange');

            this.helper.addDOMEvent(
                'remove',
                'click',
                function () {
                    this.fire('remove');
                    this.destroy();
                }
            );
        }

        function setFieldValue(fieldName, value) {
            // 根据编辑或只读模式，使用的是文本框或者普通标签
            var control = this.getChild(fieldName);
            if (control) {
                if (typeof control.setRawValue === 'function') {
                    control.setRawValue(value);
                }
                else {
                    control.setText(value);
                }
            }
            else {
                // NOTE: 这个的前提是`fieldName`里没大写字母，不然要转成横线分隔
                var part = this.helper.getPart(fieldName);
                if (part) {
                    part.innerHTML = u.escape(value);
                }
            }
        }

        function getFieldValue(fieldName) {
            // 根据编辑或只读模式，使用的是文本框或者普通标签
            var control = this.getChild(fieldName);
            if (control) {
                if (typeof control.getRawValue === 'function') {
                    return control.getRawValue();
                }
                else {
                    return control.getText();
                }
            }
            else {
                // 参考上面方法的说明
                var part = this.helper.getPart(fieldName);
                if (part) {
                    return lib.getText(part);
                }
            }

            return null;
        }

        function syncValue(line, rawValue) {
            if (!rawValue) {
                return;
            }

            var nameField = line.helper.getPart('name');
            var name = lib.encodeHTML(rawValue.name);
            nameField.innerHTML = 
                '<span title="' + name + '">' + name + '</span>';

            // 尺寸在广告位行上，此处没有

            // 售卖方式特殊处理，不是普通的文本框
            if (line.mode === 'edit') {
                var priceModelField = line.getChild('priceModel');
                var priceModelValue = rawValue.priceModel == null
                    ? (rawValue.slot && rawValue.slot.priceModel)
                    : rawValue.priceModel;
                priceModelField.setValue(priceModelValue);
            }
            else {
                var priceModelText = 
                    PriceModel.getTextFromValue(rawValue.priceModel);
                line.helper.getPart('price-model').innerHTML = priceModelText;
            }

            setFieldValue.call(line, 'group', rawValue.group || '');

            // CPD且没有结束时间的情况下，是不计算总量的
            if (require('delivery/util').hasValidAmount(rawValue)) {
                var amount = rawValue.amount || '';
                if (amount && line.mode === 'read') {
                    amount += PriceUnit.getTextFromValue(rawValue.priceModel);
                }
                setFieldValue.call(line, 'amount', amount);
            }
            else {
                setFieldValue.call(line, 'amount', '');
            }

            setFieldValue.call(
                line,
                'discount',
                rawValue.discount == null ? '100' : rawValue.discount
            );
            if (rawValue.id && !rawValue.authority) {
                line.getChild('discount').disable();
            }

            var minDiscountField = line.helper.getPart('min-discount');
            minDiscountField.innerHTML = rawValue.minDiscount
                ? rawValue.minDiscount + '%'
                : '100%';

            syncPriceDisplay.call(line);

            line.updateTotalPrice();

            var dates = u.map(
                u.parseDateRanges(rawValue.time || []),
                function (range) {
                    var begin = moment(range[0], DATE_FORMAT);
                    var end = moment(range[1], DATE_FORMAT);

                    // TODO: 去掉`INFINITE_DATE`
                    if (range[1] && range[1] !== INFINITE_DATE) {
                        return { begin: begin.toDate(), end: end.toDate() };
                    }
                    else {
                        return { begin: begin.toDate() };
                    }
                }
            );
            if (!dates.length) {
                var today = moment().startOf('day').toDate();
                dates = [{ begin: today, end: today }];
            }

            if (line.mode === 'edit') {
                if (dates.length > 1) {
                    line.switchToRichDate();
                    line.getChild('richDate').setRanges(dates);
                }
                else {
                    line.switchToRangeDate();
                    line.getChild('rangeDate').setRawValue(dates[0]);
                    syncRangeDateToRich.call(line);
                }
            }
            else {
                var beginTag = '<span class="'
                    + line.helper.getPartClassName('date-line')
                    + '">';
                var endTag = '</span>';
                var dateText = u.map(
                    dates,
                    function (range) {
                        if (range.end) {
                            return beginTag
                                + moment(range.begin).format(DATE_TEXT_FORMAT)
                                + ' 至 '
                                + moment(range.end).format(DATE_TEXT_FORMAT)
                                + endTag;
                        }
                        else {
                            return beginTag
                                + moment(range.begin).format(DATE_TEXT_FORMAT)
                                + ' 起'
                                + endTag;
                        }
                    }
                );
                var datePart = line.helper.getPart('date');
                datePart.innerHTML = '<span>'
                    + dateText.join('</span><span>')
                    + '</span>';
            }

            // 同步控件间的关系
            if (line.mode === 'edit') {
                syncAmountUnit.call(line);
                syncAmountInputType.call(line);
            }
        }

        DeliveryLine.prototype.switchToRangeDate = function () {
            this.helper.removePartClasses('date-type-rich', 'date');
            this.helper.addPartClasses('date-type-range', 'date');
            this.getChild('rangeDate').enable();
            this.getChild('richDate').disable();
        };

        DeliveryLine.prototype.switchToRichDate = function () {
            this.helper.removePartClasses('date-type-range', 'date');
            this.helper.addPartClasses('date-type-rich', 'date');
            this.getChild('richDate').enable();
            this.getChild('rangeDate').disable();
        };

        /**
         * 更新总价项
         */
        DeliveryLine.prototype.updateTotalPrice = function () {
            var delivery = this.getRawValue();

            var totalPrice = '--';
            if (require('delivery/util').hasValidAmount(delivery)) {
                totalPrice = this.getTotalPrice();
                if (isNaN(totalPrice)) {
                    totalPrice = '--';
                }
            }

            var totalPriceField = this.helper.getPart('total');
            totalPriceField.innerHTML = totalPrice;
        };

        /**
         * 获取选择总天数
         *
         * @return {number}
         */
        DeliveryLine.prototype.getTotalDays = function () {
            var times = this.getDateType() === DateType.RANGE
                ? [this.getChild('rangeDate').getRawValue()]
                : this.getChild('richDate').getRanges();

            return u.reduce(
                times,
                function (sum, range) {
                    var diff = range.end - range.begin;
                    // 起始和结束是同一天的话，算是1天，所以要加上1
                    var days = moment.duration(diff).asDays() + 1;
                    return sum + days;
                },
                0
            );
        };

        DeliveryLine.prototype.getRuntimePriceModelValue = function () {
            if (this.mode === 'edit') {
                return this.getChild('priceModel').getRawValue();
            }
            else {
                return this.rawValue.priceModel;
            }
        };

        /**
         * 获取总价
         *
         * @return {number}
         */
        DeliveryLine.prototype.getTotalPrice = function () {
            var priceModel = this.getRuntimePriceModelValue();
            if (priceModel !== this.rawValue.slot.priceModel) {
                return NaN;
            }

            var priceField = this.helper.getPart('price');
            var price = parseInt(priceField.innerHTML, 10);
            var amount = parseInt(getFieldValue.call(this, 'amount'), 10);
            var discount = parseFloat(getFieldValue.call(this, 'discount'));

            var totalPrice = price * amount * (discount / 100);
            // CPM要再除以1000
            if (priceModel === PriceModel.CPM) {
                totalPrice /= 1000;
            }
            return parseFloat(totalPrice.toFixed(2));
        };

        /**
         * 获取日期段的类型
         *
         * @return {common/enum/DateType}
         */
        DeliveryLine.prototype.getDateType = function () {
            var part = this.helper.getPart('date');
            var rangeClass = this.helper.getPartClasses('date-type-range')[0];
            return lib.hasClass(part, rangeClass)
                ? DateType.RANGE
                : DateType.RICH;
        };

        DeliveryLine.prototype.getRawValue = function () {
            // 如果原来没给数据，那连广告位的id都拿不到，不可能给任何值
            if (!this.rawValue) {
                return null;
            }

            var rawValue = {
                slotId: this.rawValue.slot.id,
                discount: parseFloat(getFieldValue.call(this, 'discount')),
                // 最低折扣用于验证，是必须的字段
                minDiscount: this.rawValue.minDiscount
            };

            // 只读模式只有折扣是能改的，其它一概直接从原来的值里取
            if (this.mode === 'read') {
                u.defaults(rawValue, this.rawValue);
                return rawValue;
            }

            rawValue.priceModel = this.getChild('priceModel').getRawValue();
            rawValue.group =
                parseInt(getFieldValue.call(this, 'group'), 10) || null;

            if (this.getDateType() === DateType.RANGE) {
                rawValue.time = [this.getChild('rangeDate').getRawValue()];
            }
            else {
                rawValue.time = this.getChild('richDate').getRanges();
            }

            // 转成一维数组
            rawValue.time = u.map(
                rawValue.time,
                function (range) {
                    return [
                        moment(range.begin).format(DATE_FORMAT),
                        moment(range.end).format(DATE_FORMAT)
                    ];
                }
            );
            rawValue.time = u.flatten(rawValue.time);

            // 如果是CPD卖，日期由日历决定
            if (rawValue.priceModel === PriceModel.CPD) {
                rawValue.amount = this.getTotalDays();
            }
            else {
                rawValue.amount = 
                    parseInt(getFieldValue.call(this, 'amount'), 10);
            }

            return rawValue;
        };

        /**
         * 渲染自身
         *
         * @override
         * @protected
         */
        DeliveryLine.prototype.repaint = helper.createRepaint(
            InputControl.prototype.repaint,
            {
                name: 'mode',
                paint: function (line, mode) {
                    if (mode === 'edit') {
                        line.renderAsEdit();
                    }
                    else if (mode === 'read') {
                        line.renderAsRead();
                    }
                    else {
                        throw new Error('Invalid mode value "' + mode + '"');
                    }

                    var validationPanel = line.helper.getPart('validation');
                    validationPanel.innerHTML = getValidationHTML.call(line);
                    line.helper.initChildren(validationPanel);
                }
            },
            {
                name: 'rawValue',
                paint: syncValue
            }
        );

        /**
         * 清空验证信息
         *
         * @param {string} name 字段名称
         */
        function clearValidity(name) {
            var validityLabel = this.getChild(name + '-validity');
            var Validity = require('esui/validator/Validity');
            var validity = new Validity();
            validityLabel.set('validity', validity);
        }

        /**
         * 显示验证信息
         *
         * @param {esui.Validity} validityLabel 验证标签控件实例
         * @param {string} message 验证消息
         */
        function showValidity(validityLabel, message) {
            var Validity = require('esui/validator/Validity');
            var ValidityState = require('esui/validator/ValidityState');
            var validity = new Validity();
            var state = new ValidityState(false, message);
            validity.addState('custom', state);
            validityLabel.set('validity', validity);
        }

        /**
         * 验证CPM广告最大长度不能超过2年
         *
         * @return {boolean}
         */
        function validateTime() {
            var delivery = this.getRawValue();

            if (!delivery.time.length) {
                var validityLabel = this.getChild('time-validity');
                showValidity.call(this, validityLabel, '请选择投放时间');
                return false;
            }

            if (delivery.priceModel !== PriceModel.CPM) {
                // 清掉已有的验证信息
                clearValidity.call(this, 'time');
                // TODO: 还要加上开始时间不能早于今天的限制
                return true;
            }

            var totalDays = this.getTotalDays();
            if (totalDays > 365 * 2) {
                var validityLabel = this.getChild('time-validity');
                showValidity.call(this, validityLabel, 'CPM广告时间不能超过2年');
                return false;
            }

            return true;
        }

        DeliveryLine.prototype.checkValidity = function () {
            var isValid = u.reduce(
                this.children,
                function (isValid, child) {
                    if (child.getCategory() === 'input') {
                        var result = result && child.checkValidity();
                        isValid = isValid && result;
                    }

                    return isValid;
                },
                true
            );

            // TODO: 加上额外验证逻辑

            return isValid;
        };

        DeliveryLine.prototype.validate = function () {
            // 先清掉所有自定义信息
            u.chain(this.children)
                .where({ type: 'Validity', skin: 'custom' })
                .invoke('destroy');

            var isValid = u.reduce(
                this.children,
                function (isValid, child) {
                    if (child.getCategory() === 'input'
                        && !child.isDisabled()
                    ) {
                        var result = child.validate();
                        isValid = isValid && result;
                    }

                    return isValid;
                },
                true
            );

            if (this.mode === 'edit') {
                isValid = validateTime.call(this) && isValid;
            }
            // TODO: 加上额外验证逻辑

            return isValid;
        };

        /**
         * 显示自定义错误
         *
         * @param {Object} error 错误信息
         * @param {string} error.field 错误的字段
         * @param {string} error.message 错误信息
         */
        DeliveryLine.prototype.showCustomError = function (error) {
            var target = this.getChild(error.field);

            if (target) {
                var Validity = require('esui/validator/Validity');
                var ValidityState = require('esui/validator/ValidityState');
                var validity = new Validity();
                var state = new ValidityState(false, error.message);
                validity.addState('custom', state);
                target.showValidity(validity);
            }
            else {
                var validityLabel = require('esui').create(
                    'Validity',
                    {
                        viewContext: this.viewContext,
                        skin: 'custom'
                    }
                );
                this.addChild(validityLabel);
                validityLabel.appendTo(this.helper.getPart('validation'));
                showValidity(validityLabel, error.message);
            }
        };

        lib.inherits(DeliveryLine, InputControl);
        require('esui').register(DeliveryLine);
        return DeliveryLine;
    }
);
