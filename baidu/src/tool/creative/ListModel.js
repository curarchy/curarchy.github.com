/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 创意库工具列表数据模型类
 * @author exodia(dengxinxin@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ListModel = require('common/ListModel');
        var Data = require('./Data');
        var UnionData = require('common/global/UnionData');
        var CreativeData = require('creative/Data');

        var util = require('er/util');
        var u = require('underscore');
        var datasource = require('er/datasource');

        var NO_SIZE = -1;
        var ADPOSITION_ID = 791114;

        var creativeTypes = [
            { text: '全部类型', value: '0,1,2,3,10' },
            { text: '文字', value: '0' },
            { text: '图片', value: '1' },
            { text: 'flash', value: '2' },
            { text: '富媒体', value: '3' },
            { text: '网盟创意', value: '10' }
        ];

        var creativeSizes = [
            { text: '全部尺寸', value: 'all' }
        ];

        var statuses = [
            { text: '全部', value: '' },
            { text: '隐藏', value: 0 },
            { text: '显示', value: 1 }
        ];

        /**
         * 获取创意预览 url
         *
         * @param mid 创意id
         * @param vcid 预览id
         * @returns {String}
         */
        function resolveURL(mid, vcid) {
            var search = require('er/URL').serialize(
                {
                    'baidu_dup_preview_sid': ADPOSITION_ID,
                    'baidu_dup_preview_mid': mid,
                    'baidu_dup_preview_vc': vcid,
                    'baidu_dup_preview_ts': (new Date()).getTime()
                }
            );

            return './creative-preview.html?' + search;
        }

        function CreativeListModel() {
            ListModel.apply(this, arguments);
            this.data = new Data();
            this.creativeData = new CreativeData();
            this.unionData = new UnionData();
        }

        util.inherits(CreativeListModel, ListModel);

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        CreativeListModel.prototype.datasource = {
            isUnionServiceOK: function (model) {
                var flag = model.unionData.getUnionService();
                return flag;
            },
            keywordPlaceHolder: datasource.constant('请输入关键字'),
            creativeTypes: datasource.constant(creativeTypes),
            statuses: datasource.constant(statuses),
            creativeSizes: function (model) {
                return model.getSize();
            }
        };

        CreativeListModel.prototype.prepare = function () {
            var url = this.get('url');
            var query = url.getQuery();
            var favorSkin = 'unfavored';

            if (this.get('flag') == 1) {
                favorSkin = 'favored';
                delete query.flag;
            } else {
                query.flag = 1;
            }

            var noOp = this.get('noOperation');
            if (noOp) {
                query.noOperation = noOp;
            }

            var onlyShowStatus = this.get('onlyShowStatus');
            if (onlyShowStatus) {
                query.onlyShowStatus = onlyShowStatus;
                this.set('statuses', [
                    { text: '全部', value: '', disabled: true },
                    { text: '隐藏', value: 0, disabled: true },
                    { text: '显示', value: 1 }
                ]);
            }

            var link = require('er/URL').withQuery(url.getPath(), query);

            this.set('favorSkin', favorSkin);
            this.set('favorFilterLink', '#' + link);

            var CreativeType = require('tool/creative/enum').Type;
            var isUnionServiceOK = this.get('isUnionServiceOK');
            u.each(
                this.get('results'),
                function (item) {
                    // 控件是需要`type`对应的字符串来生成一些特定的样式的，
                    // 但是这个枚举是在业务体系下的，因此要转成字符串给控件
                    var typeText = CreativeType.getAliasFromValue(item.type);
                    item.typeText = typeText.toLowerCase();
                    item.cannotModify = !isUnionServiceOK &&
                        item.type == CreativeType.getValueFromAlias('NOVA');
                }
            );


        };

        /**
         * 获取请求后端时的查询参数
         *
         * @return {Object}
         */
        CreativeListModel.prototype.getQuery = function () {
            var query = ListModel.prototype.getQuery.apply(this, arguments);
            var size = this.get('size');
            if (size) {
                if (size === 'all') {
                    query.size = '';
                }
                else {
                    var sizeElements = size.split('*');
                    query.width = sizeElements[0];
                    query.height = sizeElements[1];
                    delete query.size;
                }
            }

            query.flag = this.get('flag');
            query.type = this.get('type');
            return query;
        };

        /**
         * 批量隐藏前确认
         *
         * @param {Array.<string>} idx id集合
         * @param {string=} entityName 实体名，默认为当前Model管理的实体
         * @return {FakeXHR}
         */
        CreativeListModel.prototype.getRemoveAdvice = function (idx) {
            // 其实我也不想重写，因为只是改变一个文案。。（'删除'变成'隐藏'）
            var Deferred = require('er/Deferred');
            var advice = {
                message: '您确定要隐藏已选择的' + idx.length + '个'
                    + this.get('entityDescription') + '吗？'
            };
            return Deferred.resolved(advice);
        };

        /**
         * 获取所有的创意尺寸类型
         *
         * @return {er/Promise}
         */
        CreativeListModel.prototype.getSize = function () {
            return this.creativeData.size()
                .then(
                function (response) {
                    var hasNoSize = false;
                    var sizeValues = [];
                    u.each(
                        response.creativeSize || [],
                        function (item) {
                            if (item.w == NO_SIZE) {
                                hasNoSize = true;
                                return;
                            }

                            var sizeText = item.w + '*' + item.h;
                            sizeValues.push({
                                text: sizeText,
                                value: sizeText
                            });
                        }
                    );

                    if (hasNoSize) {
                        sizeValues.push({ text: '--', value: '-1*-1' });
                    }

                    return creativeSizes.concat(sizeValues);
                }
            );
        };

        /**
         * 根据索引获取预览创意的相关数据
         *
         * @param {string} 创意的id
         * @returns {er/Promise}
         */
        CreativeListModel.prototype.getPreviewOption = function (id) {
            // TODO: 创意id改字符串后此处用`findWhere`
            var creative = u.find(
                this.get('results'),
                function (item) {
                    return item.id == id;
                }
            );
            var total = this.get('results').length;

            if (!creative) {
                var error = {
                    message: '创意不存在！'
                };
                return require('er/Deferred').rejected(error);
            }

            return this.data.getPreviewID(ADPOSITION_ID, creative.id)
                .then(
                function (response) {
                    var url = resolveURL(creative.id, response.previewId);
                    return {
                        data: creative,
                        previewUrl: url,
                        total: total
                    };
                }
            );
        };


        /**
         * 收藏/取消收藏
         *
         * @param {String | Number} id
         * 待操作的创意 id
         */
        CreativeListModel.prototype.toggleStar = function (id) {
            /* u.findWhere 用的严格比较，id 这里我还不确定是统一都用整型，还是字符串也会混用，
             所以先用find 方法。
             */
            var creative = u.find(
                this.get('results'),
                function (item) {
                    return item.id.toString() == id;
                }
            );

            if (!creative) {
                var deferred = new (require('er/Deferred'))();
                return deferred.reject(id + ' creative does not exist!');
            }

            var processing = creative.flag
                ? this.data.removeStar(creative.id)
                : this.data.addStar(creative.id);

            return processing.done(
                function () {
                    creative.flag = !creative.flag;
                    return creative;
                }
            );
        };

        /**
         * 添加到广告
         * @param {Array} ids
         * @return {er/Promise}
         */
        CreativeListModel.prototype.addToSlot = function (ids) {
            var results = this.get('results');
            var result = u.map(
                ids,
                function (id) {
                    return u.findWhere(results, { id: id});
                }
            );
            this.set('addList', result);
            var Deferred = require('er/Deferred');
            return Deferred.resolved();
        };

        return CreativeListModel;
    }
);