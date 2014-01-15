/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 创意表单数据模型基类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var SingleEntityModel = require('common/SingleEntityModel');
        var Data = require('./Data');
        var UnionData = require('common/global/UnionData');
        var util = require('er/util');
        var u = require('underscore');

        /**
         * 创意表单数据模型类
         *
         * @constructor
         * @extends common/FormModel
         */
        function CreativeFormModel() {
            SingleEntityModel.apply(this, arguments);
            this.data = new Data();
            this.unionData = new UnionData();
        }

        util.inherits(CreativeFormModel, SingleEntityModel);


        var CreativeType = require('./enum').Type;


        /**
         * 默认数据源配置
         * 
         * @param {Object}
         * @override
         */
        CreativeFormModel.prototype.datasource = [
            {
                isUnionServiceOK: function (model) {
                    var flag = model.unionData.getUnionService();
                    return flag;
                }
            },
            {
                activeIndex: function (model) {
                    if (model.get('formType') === 'create') {
                        // 默认图片
                        return 1;
                    }

                    var type = model.get('type');
                    // 网盟创意不可以修改类型
                    if (type === CreativeType.NOVA) {
                        return 0;
                    }
                    // 如果不是网盟创意，那么tab里不会包含网盟tab
                    var actionNames = ['text', 'image', 'flash', 'rich'];
                    for (var i = 0; i < actionNames.length; i ++) {
                        if (actionNames[i].toUpperCase() 
                            === CreativeType.getAliasFromValue(type)) {
                            return i;
                        }
                    }
                },
                tabs: function (model) {
                    var formType = model.get('formType');
                    var params = [];
                    // id参数段
                    if (formType === 'update') {
                        params.push('id=' + model.get('id'));
                    }

                    // 轮播类型参数段
                    // 若广告设置了指定的轮播类型，创意需有对应的下来选择框
                    // 接收inturnType参数，判断是何种类型；
                    // 接收inturnValue参数，判断是选择的值；
                    // 其余情况，不传
                    if (model.get('inturnType')) {
                        var inturnTypeParam = ''
                            + 'inturnType=' + model.get('inturnType')
                            + '&inturnValue=' + model.get('inturnValue')
                            + '&inturnMax=' + model.get('inturnMax');

                        params.push(inturnTypeParam);
                    }

                    // var allowContinue = model.get('allowContinue') || false;
                    var actionNames = 
                        ['text', 'image', 'flash', 'rich'];

                    // 网盟开关开的时候才有网盟创意
                    if (model.get('isUnionServiceOK')) {
                        actionNames.push('nova');
                    }
                     // 网盟创意不能修改类型，因此只显示一个action
                    if (formType === 'update') { 
                        if (model.get('type') === CreativeType.NOVA) {
                            actionNames = ['nova'];
                        }
                        else {
                            actionNames = ['text', 'image', 'flash', 'rich']; 
                        }
                    }

                    // 四个tab的actionOptions都不一样。。。
                    // 对于其他的tab只保留可共用的字段
                    var entity =  model.get('entity');
                    // 副本
                    var copyEntity = {
                        name: entity.name,
                        id: entity.id,
                        clickUrl: entity.clickUrl,
                        targetWindow: entity.targetWindow,
                        monitorUrl: entity.monitorUrl,
                        cbExt: entity.cbExt,
                        cbExtFlag: entity.cbExtFlag
                    };

                    var tabs = [];
                    for (var i = 0; i < actionNames.length; i ++) {
                        var actionName = actionNames[i];
                        var alias = actionName.toUpperCase();
                        // 1. actionOptions
                        var actionEntity = u.clone(copyEntity);
                        actionEntity.type = 
                            CreativeType.getValueFromAlias(alias);
                        var actionOptions = null;
                        // 创建状态下没有actionOptions
                        if (formType === 'update') {
                            actionOptions = { entity: actionEntity };
                            if (actionEntity.type === model.get('type')) {
                                actionOptions = { entity: entity };
                            }
                        }

                        // 2. url
                        var url = '/tool/creative/' 
                            + formType + '/' + actionName
                            // + '~allowContinue=' + allowContinue
                            + '~' + params.join('&');

                        var action = {
                            title: CreativeType.getTextFromAlias(alias),
                            id: actionName,
                            url: url,
                            actionOptions: actionOptions
                        };

                        tabs.push(action);
                    }
                    return tabs;
                }
            }
        ];

        return CreativeFormModel;
    }
);