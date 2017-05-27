/**
 * Created by Administrator on 2017/5/27 0027.
 */
/*!
 * angular-ui-Aaron-mask
 * https://github.com/zhangming123456/angular-ui-Aaron-mask
 * Version: 1.0.0 - 2017-05-26T16:27:30.992Z
 */


// Version: 1.0.0：以实现在input上输入金额 包含（人民币"RMB",美元"USD",自定义金额"money"）

(function () {
    "use strict";
    angular.module('zm.mask', [])
        .value('zmMaskConfig', {
            maskDefinitions: {
                '9': /\d/,
                'A': /[a-zA-Z]/,
                '*': /[a-zA-Z0-9]/
            },
            clearOnBlur: true,
            clearOnBlurPlaceholder: false,
            escChar: '\\',
            eventsToHandle: ['input', 'keyup', 'click', 'focus'],
            addDefaultPlaceholder: true,
            allowInvalidValue: false
        })
        .factory('zmMask.utils', ["$timeout", "$filter", function ($timeout, $filter) {
            var utils = {
                isFalse: function (bol) {
                    var type = $.type(bol);
                    if (type === 'undefined' || type === 'null') {
                        return true;
                    } else if (type === 'number' && isNaN(bol)) {
                        return true;
                    } else {
                        return false;
                    }
                },
                getIsNullStr: function (str) {
                    if (!this.isFalse(str) && !$.isFunction(str) && $.type(str) !== 'array' && !$.isPlainObject(str) && !$.isEmptyObject($.trim(str))) {
                        return false;
                    } else {
                        return true;
                    }
                },
                moneyFormat: function (number, places, symbol, thousand, decimal) {
                    number = number || 0;
                    places = !isNaN(places = Math.abs(places)) ? places : 2;
                    symbol = this.isFalse(symbol) ? "$" : symbol;
                    thousand = thousand || ",";
                    decimal = decimal || ".";
                    var negative = number < 0 ? "-" : "",
                        i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
                        j = i.length;
                    j = j > 3 ? j % 3 : 0;
                    return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
                },
                setMoney(start, symbol, places){
                    var places = places || 2, str = '';
                    if ($.isNumeric(start)) {
                        return this.moneyFormat(start, places, symbol);
                    } else if ($.type(start) === 'array' && !$.isEmptyObject(start)) {
                        str = start.join("");
                    } else {
                        str = start;
                    }
                    str = str.replace(/^\D+/ig, '');
                    var strLeft = '', strRight = '', index = 0, isStr = !this.isFalse(str) && !this.getIsNullStr(str);
                    if (isStr) {
                        index = str.indexOf('.');
                        strLeft = str.slice(0, index).replace(/\D/ig, '');
                        strRight = str.slice(index + 1, str.length).replace(/\D/ig, '');
                        str = strLeft + "." + strRight;
                        str = parseFloat(str);
                    } else {
                        str = 0;
                    }
                    return str.toFixed(places);
                }
            };
            return utils;
        }])
        .provider('zmMask.Config', function () {
            var options = {};
            this.maskDefinitions = function (maskDefinitions) {
                return options.maskDefinitions = maskDefinitions;
            };
            this.clearOnBlur = function (clearOnBlur) {
                return options.clearOnBlur = clearOnBlur;
            };
            this.clearOnBlurPlaceholder = function (clearOnBlurPlaceholder) {
                return options.clearOnBlurPlaceholder = clearOnBlurPlaceholder;
            };
            this.eventsToHandle = function (eventsToHandle) {
                return options.eventsToHandle = eventsToHandle;
            };
            this.addDefaultPlaceholder = function (addDefaultPlaceholder) {
                return options.addDefaultPlaceholder = addDefaultPlaceholder;
            };
            this.allowInvalidValue = function (allowInvalidValue) {
                return options.allowInvalidValue = allowInvalidValue;
            };
            this.$get = ['zmMaskConfig', function (zmMaskConfig) {
                var tempOptions = zmMaskConfig;
                for (var prop in options) {
                    if (angular.isObject(options[prop]) && !angular.isArray(options[prop])) {
                        angular.extend(tempOptions[prop], options[prop]);
                    } else {
                        tempOptions[prop] = options[prop];
                    }
                }
                return tempOptions;
            }];
        })
        /**
         * ui-aaron-mask-options配置参数
         * ** placeholder = '0',//占位符
         * ** groupSeparator = ',',//数值间隔
         * ** prefix = '',//前缀符号
         * ** rightAlign = false;//文字默认居左
         * ** rightAlign = false;//文字默认居左
         * ** digits = 2; //小数点后默认2位
         * ** digits = 2; //小数点后几位
         */
        .directive('zmMask', ['zmMask.Config', 'zmMask.utils', function (maskConfig, utils) {
            return {
                scope: {ngModel: '=', zmMaskOptions: '='},
                // 默认值false。表示继承父作用域;true。表示继承父作用域，并创建自己的作用域（子作用域）{}。表示创建一个全新的隔离作用域；
                // @:父传子，子不传父；&：方法传递；=：双向数据绑定
                priority: 100,//(数字)，可选参数，指明指令的优先级，若在单个DOM上有多个指令，则优先级高的先执行；
                transclude: true,//true: 指令标签内内容内嵌到指令模板拥有ng-transclude属性标签内
                replace: false,//replace为true时，hello-world这个标签不在了，反之，则存在。
                terminal: false,//（布尔型），可选参数，可以被设置为true或false，若设置为true，则优先级低于此指令的其他指令则无效，不会被调用(优先级相同的还是会执行)
                require: 'ngModel',
                restrict: 'A',//E(元素),A(属性),C(类),M(注释)
                compile: function zmMaskCompilingFunction() {
                    var option = angular.copy(maskConfig);
                    /**
                     * （1）$scope，与指令元素相关联的作用域
                     * （2）$element，当前指令对应的 元素
                     * （3）$attrs，由当前元素的属性组成的对象
                     * （4）$transclude，嵌入链接函数，实际被执行用来克隆元素和操作DOM的函数
                     */
                    return function (scope, iElement, iAttrs, controller) {
                        /**----------------------------------当前指令常用方法--------------------------------**/
                        /**
                         * 判断是否为空字符串
                         * @param str 字符串
                         * @returns {*} true: 原字符串 false: false
                         */
                        function isNullStr(str) {
                            if (!utils.getIsNullStr(str)) {
                                return str;
                            }
                            return false;
                        }

                        /**
                         * 获取间隔符个数
                         * @param num
                         * @param val
                         * @returns {*}
                         */
                        function getSeparatorNum(num, val) {
                            var val = val || 3,
                                intNum = parseInt(num / val),
                                remainder = num % val;
                            if (remainder) {
                                return intNum;
                            } else {
                                return intNum - 1;
                            }
                        }

                        /**
                         * 判断是否为固定过滤配置
                         * @returns {boolean}
                         */
                        function isAge() {
                            var len = inputAliases.length;
                            for (var i = 0; i < len; i++) {
                                if (age === inputAliases[i]) {
                                    return true
                                }
                            }
                            return false;
                        }

                        /**
                         * 计算maxlength中特殊字符个数
                         */
                        function getSpecialStr() {
                            var len = 0;
                            if (parseInt(digits) > 0) {
                                len++;
                            }
                            if (!isAge()) {
                                if (isNullStr(prefix)) {
                                    len = isNullStr(prefix).length + len + 1;
                                }
                            } else {
                                len = len + 2;
                            }
                            return getSeparatorNum(maxLength) + len;
                        }

                        function getSelectionLength(input) {
                            if (!input)
                                return 0;
                            if (input.selectionStart !== undefined) {
                                return (input.selectionEnd - input.selectionStart);
                            }
                            if (window.getSelection) {
                                return (window.getSelection().toString().length);
                            }
                            if (document.selection) {
                                return (document.selection.createRange().text.length);
                            }
                            return 0;
                        }

                        /**
                         * 设置
                         * @param e
                         */
                        function eventHandler(e) {
                            var num = iElement.val(),
                                numStr = null,
                                eventWhich = e && e.which,
                                eventType = e && e.type,
                                isBlur = $.isNumeric(minimum) && (eventType === 'blur' || eventWhich === 13);
                            if (!utils.isFalse(num)) {
                                if (!$.isNumeric(num)) {
                                    num = utils.setMoney(num, null, digits);
                                }
                                if ($.isNumeric(num)) {
                                    numStr = parseFloat(num);
                                    if ($.isNumeric(maximum)) {
                                        numStr > parseFloat(maximum) && (function () {
                                            numStr = parseFloat(maximum);
                                            iElement.val(numStr);
                                        })();
                                    }
                                    if (isBlur) {
                                        numStr <= parseFloat(minimum) && (function () {
                                            numStr = parseFloat(minimum);
                                            iElement.val(numStr);
                                        })();
                                    }
                                    num = numStr.toFixed(digits);
                                }
                            }
                            if (!isBlur)
                                controller.$setViewValue(num);
                            else
                                scope.$apply(function () {
                                    controller.$setViewValue(num)
                                })
                        }

                        function unbindEventListeners() {
                            // iElement.on('focus', eventHandler);
                            iElement.on('blur', eventHandler);
                        }

                        unbindEventListeners();
                        /**----------------------------------初始参数--------------------------------**/
                        var inputAliases = ['myNum', 'RMB', 'USD'],//固定过滤
                            age = inputAliases[0],
                            options = scope.zmMaskOptions || {},//mask指令选项配置
                            configs = isNullStr(iAttrs.zmMaskConfigs) || undefined,//mask指令选项配置
                            placeholder = isNullStr(iAttrs.zmMaskPlaceholder) || '0',//占位符
                            groupSeparator = isNullStr(iAttrs.zmMaskGroupSeparator) || ',',//数值间隔
                            prefix = isNullStr(iAttrs.zmMaskPrefix) || '',//前缀符号
                            digits = '2',//小数点后默认2位
                            allowPlus = false,//允许加号
                            allowMinus = false,//允许减号
                            rightAlign = false;//文字默认居左

                        var maxLength = isNullStr(iAttrs.zmMaskMaxLength) || null,
                            minLength = isNullStr(iAttrs.zmMaskMinLength) || null,
                            maximum = isNullStr(iAttrs.zmMaskMaximum) || null,
                            minimum = isNullStr(iAttrs.zmMaskMinimum) || null,
                            specialStr = 0,
                            regNum = /^\d/;
                        if (!utils.getIsNullStr(iAttrs.zmMask)) {
                            age = iAttrs.zmMask;
                            placeholder = options.placeholder || placeholder;
                            groupSeparator = options.groupSeparator || groupSeparator;
                            prefix = options.prefix || prefix;
                            rightAlign = options.rightAlign || rightAlign;
                        } else {

                        }
                        if (age === 'myNum') {
                            digits = options.digits || 0
                        }
                        if (!utils.getIsNullStr(maxLength)) {
                            specialStr = getSpecialStr();
                            if (parseInt(digits)) {
                                maxLength = parseInt(maxLength) + parseInt(digits);
                            }
                            iElement.attr({'maxLength': maxLength + specialStr})
                        }
                        if (!utils.getIsNullStr(minLength)) {
                            /**
                             * 初始化minLength
                             */
                            iElement.attr({'minLength': minLength})
                        }
                        Inputmask.extendDefaults({
                            'autoUnmask': true
                        });
                        Inputmask.extendDefinitions({
                            'A': {
                                validator: "[A-Za-z\u0410-\u044F\u0401\u0451\u00C0-\u00FF\u00B5]",
                                cardinality: 1,
                                casing: "upper" //auto uppercasing
                            },
                            '+': {
                                validator: "[0-9A-Za-z\u0410-\u044F\u0401\u0451\u00C0-\u00FF\u00B5]",
                                cardinality: 1,
                                casing: "upper"
                            }
                        });

                        /**----------------------------------监听当前scope--------------------------------**/
                        // var jqModel = 0;
                        // if (!utils.getIsNullStr(jqModel))
                        //     iElement.val(jqModel);//初始化ngModel
                        // else jqModel = scope.ngModel;
                        /**
                         * 监听ngModel变化
                         * @param scope.jqModel 双向绑定model值(number)
                         * @param scope.ngModel 双向绑定model值(number|string)
                         */
                        // var num = 0;
                        scope.$watch('ngModel', function (n, o) {
                            eventHandler()
                        });
                        /**----------------------------------配置zmMask--------------------------------**/
                        /**
                         * 自定义配置对象['money']
                         * @type {{money: {alias: string, groupSeparator: (*), autoGroup: boolean, digits: number, digitsOptional: boolean, prefix: string, placeholder: (*)}}}
                         */
                        var inputAliasesObj = {
                            'money': {
                                'alias': 'numeric',
                                'groupSeparator': groupSeparator,
                                'autoGroup': true,
                                'digits': 2,
                                'digitsOptional': false,
                                'prefix': prefix + ' ',
                                'placeholder': placeholder,
                            }
                        };
                        /**
                         * 数值配置myNum
                         * @type {{alias: string, placeholder: string, allowPlus: boolean, allowMinus: boolean, digits: string}}
                         */
                        inputAliasesObj[inputAliases[0]] = {
                            alias: "numeric",
                            placeholder: placeholder,
                            allowPlus: allowPlus,
                            allowMinus: allowMinus,
                            'digits': digits,
                        };
                        /**
                         * 人民币配置RMB
                         * @type {{alias: string, groupSeparator: string, autoGroup: boolean, digits: string, digitsOptional: boolean, prefix: string, placeholder: (*)}}
                         */
                        inputAliasesObj[inputAliases[1]] = {
                            'alias': 'numeric',
                            'groupSeparator': ',',
                            'autoGroup': true,
                            'digits': digits,
                            'digitsOptional': false,
                            'prefix': '¥ ',
                            'placeholder': placeholder,
                        };
                        /**
                         * 美元配置USD
                         * @type {{alias: string, groupSeparator: string, autoGroup: boolean, digits: string, digitsOptional: boolean, prefix: string, placeholder: (*)}}
                         */
                        inputAliasesObj[inputAliases[2]] = {
                            'alias': 'numeric',
                            'groupSeparator': ',',
                            'autoGroup': true,
                            'digits': digits,
                            'digitsOptional': false,
                            'prefix': '$ ',
                            'placeholder': placeholder,
                        };

                        Inputmask.extendAliases(inputAliasesObj);


                        var aliases = age,
                            publicConfig = {},
                            eventConfig = {
                                onKeyDown: onKeyDownChallback,
                                onKeyValidation: onKeyValidationChallback,
                                onBeforeMask: onBeforeMaskChallback,
                                oncleared: onclearedChallback,
                                onincomplete: onincompleteChallback,
                                oncomplete: oncompleteChallback,
                            },
                            defaultConfig = {
                                rightAlign: rightAlign,//将输入对齐到右侧
                                numericInput: false,//数字输入方向 Default：false
                                undoOnEscape: true,//（CTRL-Z）撤销并把焦点还原 Default: true
                                definitions: {}
                            },
                            independentConfig = {
                                radixPoint: '',//（numerics）小数点分隔符
                                groupSeparator: '',//（numerics）数值组分隔符
                            };
                        if (!utils.isFalse(configs)) {
                            configs = JSON.parse(configs);
                            if (!utils.getIsNullStr(configs.mask)) {
                                aliases = undefined;
                            }
                            $.extend(publicConfig, eventConfig, defaultConfig, configs);
                        } else {
                            $.extend(publicConfig, eventConfig, defaultConfig);
                        }
                        if (aliases) {
                            iElement.inputmask(aliases, publicConfig);
                        } else {
                            iElement.inputmask(publicConfig);
                        }
                        /**----------------------------------zmMask事件监听回调--------------------------------**/
                        /**
                         * keyDown前验证事件
                         * @param event
                         * @param startArr 改变前的旧值
                         * @param index 新值索引
                         * @param defaults mask触发的配置
                         */
                        function onKeyValidationChallback(keyCode, obj, defaults) {
                            // console.log(arguments);
                            if (options.onKeyValidation && $.isFalse(options.onKeyValidation)) {
                                options.onKeyValidation(keyCode, obj, defaults);
                            }
                        }

                        /**
                         * KeyDown事件回调
                         * @param event
                         * @param startArr 改变前的旧值
                         * @param index 新值索引
                         * @param defaults mask触发的配置
                         */
                        function onKeyDownChallback(event, startArr, index, defaults) {
                            eventHandler(event);
                            if (event.which === 13 && options.onKeyDownEnter && $.isFalse(options.onKeyDownEnter)) {
                                options.onKeyDownEnter(event, scope.ngModel);
                            }
                            if (options.onKeyDown && $.isFalse(options.onKeyDown)) {
                                options.onKeyDown(event, startArr, index, defaults);
                            }
                        }

                        /**
                         * 在屏蔽初始值之前执行以允许预处理初始值。
                         * @param initialValue 初始值
                         * @param opts 选项
                         * @return processedValue 处理值
                         */
                        function onBeforeMaskChallback(initialValue, opts) {
                            // console.log(initialValue, opts);
                            if (options.onBeforeMask && $.isFalse(options.onBeforeMask)) {
                                options.onBeforeMask(initialValue, opts);
                            }
                        }

                        /**
                         * 数值或字符完成时执行功能
                         * @param event
                         */
                        function oncompleteChallback(event) {
                            // console.log(arguments);
                            if (options.oncomplete && $.isFalse(options.oncomplete)) {
                                options.oncomplete(event);
                            }
                        }

                        /**
                         * 清除为空时执行事件
                         * @param event
                         */
                        function onclearedChallback(event) {
                            // console.log(event);
                            if (options.oncleared && $.isFalse(options.oncleared)) {
                                options.oncleared(event);
                            }
                        }

                        /**
                         * 当mask不完整时执行功能。执行blur。
                         */
                        function onincompleteChallback(event) {
                            console.log(arguments);
                            if (options.onincomplete && $.isFalse(options.onincomplete)) {
                                options.onincomplete(event);
                            }
                        }
                    };
                }
            }
        }]);
}());
