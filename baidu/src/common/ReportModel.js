/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 报表数据模型基类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseModel = require('common/BaseModel');
        var util = require('er/util');
        var u = require('underscore');
        var m = require('moment');
        var ReportDownloadType = require('common/enum').ReportDownloadType;


        /**
         * 报表数据模型类
         *
         * @param {string} entityName 负责的实体名称
         * @param {Object=} context 用于初始化的数据
         * @constructor
         * @extends common/BaseModel
         */
        function ReportModel(entityName, context) {
            BaseModel.apply(this, arguments);
        }
        util.inherits(ReportModel, BaseModel);

        var user = require('common/global/user');

        ReportModel.prototype.defaultDatasource = {
            // 总列表数据
            list: [
                {
                    revisedQuery: function (model) {
                        var url = model.get('url');
                        var query = url.getQuery();
                        query = u.purify(query, null, true);

                        // 区间校正，
                        // 如果需要校正，则返回校正后的值，
                        // 如果不需要，则返回false
                        return model.reviseQuery(query);
                    }
                },
                {
                    // 报告展示区间
                    time: function (model) {
                        var url = model.get('url');
                        var query = url.getQuery();
                        var revisedQuery = model.get('revisedQuery');
                        if (revisedQuery) {
                            query = revisedQuery.query;
                        }
                        var startTime = query.startTime;
                        var endTime = query.endTime;

                        var time = model.getDisplayDuration(startTime, endTime);
                        return time;
                    }
                },
                {
                    retrieve: function (model) {
                        var id = model.get('id');
                        var query = model.getQuery();
                        query = u.purify(query, null, true);
                        var revisedQuery = model.get('revisedQuery');
                        if (revisedQuery) {
                            query = revisedQuery.query;
                        }
                        var target = model.data;
                        return target.list(query, id);
                    },
                    dump: true
                },
                // 时间参数要跟随链接，这里保存到model里，方便取用
                {
                    timeParam: function (model) {
                        var paramTime = formatToParamDate.call(model);
                        return 'startTime=' + paramTime.begin 
                            + '&endTime=' + paramTime.end;
                    }
                },
                // 下载报告的地址
                {
                    downloadUrl: function (model) {
                        var data = model.data;
                        var entityName =  u.pluralize(data.getEntityName());
                        var path = data.path;
                        var url = '/api/js/' 
                            + entityName + '/' + path + '/download';

                        if (model.get('id')) {
                            url += '/' + model.get('id');
                        }
                        url += '?' + model.get('timeParam');
                        return url + '&type=' + ReportDownloadType.CSV;
                    }
                },
                {
                    name: 'tableDataAll',
                    retrieve: function (model) {
                        return model.getTableDataAll();
                    }
                },
                {
                    name: 'pageSize',
                    retrieve: function (model) {
                        return user.pageSize;
                    }
                },
                {
                    name: 'needPager',
                    retrieve: function (model) {
                        return model.checkNeedPager();
                    }
                },
                {
                    name: 'tableData',
                    retrieve: function (model) {
                        return model.refreshTableData({ pageNo: model.pageNo });
                    }
                },
                {
                    name: 'totalCount',
                    retrieve: function (model) {
                        var tableDataAll = model.get('tableDataAll') || [];
                        return tableDataAll.length;
                    }
                },
                {
                    name: 'chartData',
                    retrieve: function (model) {
                        return model.getChartData();
                    }
                },
                // 横轴
                {
                    name: 'xSeries',
                    retrieve: function (model) {
                        return model.getXSeries();
                    }
                }
            ],
            // 报告允许选择的时间区间
            range: function (model) {
                return model.getSelectableRange();
            },
            //清除搜索选项的html
            listWithoutKeywordURL: function (model) {
                var url = model.get('url');
                var path = url.getPath();
                var query = url.getQuery();
                query = u.omit(query, 'keyword');
                var template = '#' + require('er/URL').withQuery(path, query);
                return template;
            },
            // 面包屑路径配置信息
            // 为什么会有这个东西呢？简单说下历史
            // 报告是会有浏览路径的，
            // 比如对于创意报告而言，它的路径最长可以是：
            // 客户报告的分订单报告
            //   -> 订单报告的分广告报告
            //     -> 广告报告的分创意报告
            //       -> 创意报告
            // 这一系列的浏览都要通过面包屑展现出来，即
            // 广告客户报告 > 广告客户：xxx > 订单：xxx > 广告：xxx > 创意：xxx
            // 从不同入口点进入报告返回的数据都不一样，后端通过前端的请求参数
            // 来判断返回何种数据。
            // 因此，前端要维护一张层级表，来和后端返回的crumbInfo中的字段左匹配
            // 匹配上了，就会生成相应的面包屑信息
            crumbConfig: function (model) {
                return model.crumbConfig;
            },
            chartColors: function (model) {
                return model.chartColors;
            }
        };

        /**
         * 错误处理
         *
         * @param {Object} error 错误信息
         * @param {string} [error.name] 对应的数据键名
         * @param {Mixed} error.error 错误对象
         */
        ReportModel.prototype.handleError = function (error) {
            if (error.error.status === 503) {
                var results = util.parseJSON(error.error.responseText);
                results.isTimeout = true;
                return results;
            }
            throw error;
        };

        /**
         * 把参数信息整合到表格数据里
         *
         * @param {string} newKey 不在面包屑信息里但是要加进来的key
         * @return {Array} 新的表格数据
         */
        ReportModel.prototype.mergeCrumbInfoToTable = function (newKey) {
            var tableDataAll = this.get('tableDataAll') || [];
            var param = this.buildCrumbParam(newKey);
            u.each(tableDataAll, function (data) { data.crumbInfo = param; });
            return tableDataAll;
        };

        /**
         * 创建参数信息，用在二级菜单的链接和表格内链接
         *
         * @param {string} newKey 不在面包屑信息里但是要加进来的key
         * @return {string} 参数串
         * @return {bolean} 是否不附带时间参数（其实是为了不改别的地方的代码）
         * deliveryId=232233&id=1234
         */
        ReportModel.prototype.buildCrumbParam = function (newKey, notWithTime) {
            // 可能还有更上级的面包屑信息
            // { orderId: xxx, orderName: xxx }
            var crumbInfo = u.clone(this.get('crumbInfo')) || {};
            if (newKey) {
                crumbInfo[newKey] = this.get('id');
            }
            var param = [];
            for (var key in crumbInfo) {
                // 只收集id
                if (crumbInfo[key] && key.indexOf('Id') >= 0 || key === 'id') {
                    param.push(key + '=' + crumbInfo[key]);
                }
            }
            if (!notWithTime) {
                param = u.union(param, this.getTimeQueryString());
            }
            return param.join('&');
        };

        /**
         * 获取时间参数
         *
         */
        ReportModel.prototype.getTimeQueryString = function () {
            var param = [];
            var paramTime = formatToParamDate.call(this);
            param.push('startTime=' + paramTime.begin);
            param.push('endTime=' + paramTime.end);
            return param;
        };

        /**
         * 创建面包屑信息，根据配置信息和数据拼接最后结果
         *
         * @param {Array} crumbConfig 面包屑配置，按照显示层级排列
         * [{ text: '订单', key: 'order' }, { text: '广告', key: 'delivery' }]
         * @param {Object} crumbInfo 面包屑数据
         * { orderId: '1', orderName: 'x', deliverId: '3', deliverName: 'y' }
         * @return {Array} crumbInfo 面包屑数据源
         * [
         *   { text: '订单报告', href: '#/report/order' },
         *   { title: '订单：', text: 'x', href: '#/report/order/date~id=1' },
         *   { title: '广告：', text: 'y', href: '#/report/delivery/date~id=1' }
         * ]
         */
        ReportModel.prototype.buildCrumb = function () {
            var crumbConfigKey = this.crumbConfigKey;
            var crumbConfig = this.get('crumbConfig')[crumbConfigKey];
            var crumbInfo = this.get('crumbInfo');
            var path = [];
            var model = this;
            var timeString = this.getTimeQueryString().join('&');
            if (crumbInfo) {
                var upperIdItems = [];
                u.each(crumbConfig, function (crumbItem) {
                    if (crumbInfo[crumbItem.key + 'Id']) {
                        if (!path.length) {
                            // 第一级面包屑决定面包屑的标题
                            path.push({
                                text: crumbItem.text + '报告',
                                href: '#/report/' + crumbItem.key 
                                    + '~' + timeString
                            });
                        }
                        var upperIdParams = '';
                        if (upperIdItems.length) {
                            upperIdParams = '&' + upperIdItems.join('&');
                        }
                        path.push({
                            title: crumbItem.text + '：',
                            text: crumbInfo[crumbItem.key + 'Name'],
                            href: '#/report/' + crumbItem.key 
                                + '/' + model.defaultModule + '~id='
                                + crumbInfo[crumbItem.key + 'Id']
                                + upperIdParams
                                + '&' + timeString
                        });
                        upperIdItems.push(
                            crumbItem.key 
                                + 'Id=' + crumbInfo[crumbItem.key + 'Id']
                        );
                    }
                });
            }
            // 有的时候没有上层信息，则直接就是当前报告大标题
            var topCategory = this.get('topCategory');
            if (!path.length) {
                path.push(
                    { 
                        text: topCategory.text + '报告', 
                        href: '#/report/' + topCategory.key
                            + '~' + timeString 
                    }
                );
            }
            path.push({ text: topCategory.text + '：'  + this.get('name') });
            return path;
        };

        /**
         * 创建y轴全部数据集合
         * 生成格式：
         * {
         *     click: {
         *         data: [2000, 4000, 5000],
         *         name: '1',
         *         label: '点击量',
         *         format: 'int'
         *     },
         *     view: {
         *         data: [2000, 4000, 5000],
         *         name: '2',
         *         label: '展现量',
         *         format: 'int'
         *     },
         *     ...
         * }
         *
         * @return {object} 加入data信息的keys
         */
        ReportModel.prototype.buildChartYSeriesAll = function () {   
            var properties = this.get('properties');
            var keys = u.map(properties, function (property) {
                return {
                    name: property.value,
                    label: property.name,
                    format: property.format
                };
            });
            var chartData = this.get('chartData');
            var ySeriesAll = {};
            u.each(keys, function (key) {
                key.data = u.map(chartData, function (data) {
                    return data[key.name];
                });
                ySeriesAll[key.name] = key;
            });
            return ySeriesAll;
        };


        /**
         * 从全集数据中抽取出要展示的数据
         *
         * @param {string} leftKey 第一个选框的选值 
         * @param {string} rightKey 第二个选框的选值
         */
        ReportModel.prototype.buildChartYSeries = 
            function (leftKey, rightKey) {
                var ySeriesAll = this.get('ySeriesAll');
                var ySeries = [];
                var ySerieLeft = u.clone(ySeriesAll[leftKey]);
                ySerieLeft.color = this.chartColors[0];
                ySeries.push(ySerieLeft);
                if (rightKey) {
                    var ySerieRight = u.clone(ySeriesAll[rightKey]);
                    ySerieRight.color = this.chartColors[1];
                    ySeries.push(ySerieRight);
                }
                return ySeries;
            };

        /**
         * 刷新图表
         *
         * @param {string} leftKey 第一个选框的选值 
         * @param {string} rightKey 第二个选框的选值
         */
        ReportModel.prototype.refreshChartData = function (leftKey, rightKey) {
            var ySeries = this.buildChartYSeries(leftKey, rightKey);
            this.set('ySeries', ySeries);
        };

        /**
         * 加载数据
         *
         * @param {er/Promise}
         */
        ReportModel.prototype.load = function () {
            return BaseModel.prototype.load.apply(this, arguments);
        };
        
        function formatToParamDate() {
            var pattern = this.paramDateFormat;
            var time = this.get('time');
            var begin = m(time.begin).format(pattern);
            var end = m(time.end).format(pattern);
            return {
                begin: begin,
                end: end
            };
        }

        /**
         * 获取请求后端时的查询参数
         * 这个是在url已生成的情况下从url中提取出来的
         *
         * @return {Object}
         */
        ReportModel.prototype.getQuery = function () {
            var url = this.get('url');
            var query = url.getQuery();
            query = u.omit(query, 'id');

            var paramTime = formatToParamDate.call(this);
            query = u.extend(query, {
                startTime: paramTime.begin,
                endTime: paramTime.end,
                keyword: this.get('keyword')
            });
            return query;
        };


        /**
         * 更新全局每页显示条数
         *
         * @param {number} pageSize 每页显示条数
         * @return {er/Promise}
         */
        ReportModel.prototype.updatePageSize = function (pageSize) {
            var updating = this.request(
                'global/pageSize',
                { pageSize: pageSize },
                {
                    method: 'PUT',
                    url: '/users/current/pageSize'
                }
            );
            return updating.then(function () { user.setPageSize(pageSize); });
        };

        return ReportModel;
    }
);
