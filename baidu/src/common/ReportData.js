/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file: 报告数据类
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseData = require('common/BaseData');
        var util = require('er/util');

        function ReportData (path) {
            this.path = path;
            BaseData.call(this, 'report');
        }

        util.inherits(ReportData, BaseData);

        /**
         * 获取一个实体列表（不分页）
         *
         * @param {Object} query 查询参数
         * @return {FakeXHR}
         */
        ReportData.prototype.list = function (query, id) {
            var idParam = '';
            if (id) {
                idParam = '/' + id;
            }
            var name = '$entity/' + this.path;
            return this.request(
                name, 
                query,
                {
                    method: 'GET',
                    url: '/' + name + idParam
                }
            );
        };

        return ReportData;
    }
);        
