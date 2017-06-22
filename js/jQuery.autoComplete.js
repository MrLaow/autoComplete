/**
 * @PluginName jQuery.autoComplete
 * @Author wang.tao
 * @Version 1.0
 * @DATE 2017-06-08
 * @Functions
 **/

(function ($) {

    $.fn.autoComplete = function (options) {
        var method = arguments[0];
        if ((method =$.fn.autoComplete.methods[method])) {
            arguments = Array.prototype.slice.call(arguments, 1);
        } else if (typeof method === "object" || !method) {
            method = $.fn.autoComplete.methods.init;
        } else {
            $.error("Method " + method + " does not exist!");
            return this;
        }
        return method.apply(this, arguments);
    };
    $.fn.autoComplete.constants = {

    };
    $.fn.autoComplete.options = {

    };

    $.fn.autoComplete.methods ={

        init:function (options) {
            var $_this_ = $(this);
            /**
             *  插件中不能自定义的常量
             */
            var constants ={
                panelId: "auto_complete_panel", /* 面板ID */
                panelULId:"resultUL",           /* 面板下ul的id */
                panelObj: null,                 /* 面板元素jquery对象 */
                optionULObj:null,               /* 选中元素的父元素UL的jquery对象 */
                outDiv:null,                    /* 最外围的DIV的jquery对象 */
                resultData:[]                   /* 回调函数的返回值*/
            };

            /**
             *  插件对外暴露的属性，可以自定义，或者使用默认值
             */
            var defaults = {
                dataAttr: ['id'],                             /* 每行数据的属性 */
                rowNum: 16,                                   /* 默认限制结果集数据量为15条 */
                optionWidth:80,                               /* 选中元素的宽度 */
                optionHeight:20,                              /* 选中元素的宽度 */
                optionBgColor:"#DEE7F8",                      /* 选中元素的背景色 */
                multiple:false,                               /* 是否多选，默认为单选 */
                width: $_this_.width(),                       /* 面板默认宽度 */
                height: 300,                                  /* 面板默认高度 */
                borderColor:"black",                          /* 边框颜色 */
                limitStr: 4,                                  /* 面板每一行字符串长度(超出部分用"..."显示) */
                tip:"请输入关键字…",                            /* 提示语信息*/
                localData:null,                               /* 本地数据 */
                callBack: function (data) {                   /* 回调函数(选择后要执行的方法) */
                } ,
                url:null,                                     /* ajax请求url */
                data:{},                                      /* ajax请求入参 */
                type:"post",                                  /* ajax请求类型 */
                dataType:"json",                              /* ajax请求预期服务器返回的数据类型 */
                contentType:"application/json;chartset=UTF-8" /* ajax请求发送信息至服务器时内容编码类型*/
            };

            var options = $.extend(defaults, options);

            constants.panelObj = $("<div class='"+constants.panelId+"'><div class='data_content'></div></div>");
            /**
             * 初始化结果集面板
             */
            $(function () {

                constants.optionULObj = $_this_.parent().parent();
                constants.optionULObj.addClass("option_ul");
                constants.outDiv = constants.optionULObj.parent();
                constants.outDiv.addClass("out_div").css({width:options.width,"border-color":options.borderColor});

                $_this_.bind("focus", function () {
                    this.value == options.tip ? this.value = "" : "";
                }).bind("blur", function () {
                    this.value == "" && constants.optionULObj.find("li").size() ==1 ? this.value = options.tip : this.value = "";
                    if (constants.panelObj.find("li").size() == 0) constants.panelObj.hide();
                }).blur().css({
                    border:"none",
                    width:options.width,
                    outline:"none",
                    display:"inline"
                }).parent().css({display:"inline"});

                setTimeout(function () {
                    constants.panelObj.insertAfter(constants.outDiv).hide();
                },0);
                var key = $_this_.attr("id");
                $.fn.autoComplete.constants[key] = constants;
                $.fn.autoComplete.options[key] = options;
            });

            /**
             * 输入框绑定监听器input propertychange
             */
            $_this_.bind('keyup', function() {
                var currentContext = $_this_.val();
                if (currentContext == options.tip) return;
                if (!currentContext.length) {
                    constants.panelObj.hide();
                }else {
                    constants.panelObj.css({
                        left: constants.outDiv.offset().left + "px",
                        top: constants.outDiv.offset().top + constants.outDiv.height() + 4 + "px",
                        height:options.height+"px",
                        width:options.width+"px"
                    });
                    results.search($_this_,options,constants,currentContext);
                }
            });
            return $_this_;
        },
        getValue:function () {
            return $.fn.autoComplete.constants[$(this).attr("id")].resultData;
        },
        setValue:function (obj) {
            if(obj && typeof obj === "object") {
                var options = $.fn.autoComplete.options[$(this).attr("id")];
                results.addElement($(this), obj, obj.text,options.multiple);
            }
        },
        setValues:function (objs) {
            if(objs && typeof objs === "object") {
                var options = $.fn.autoComplete.options[$(this).attr("id")];
                for (var i = 0, size = objs.length; i < size; i++) {
                    var obj = objs[i];
                    results.addElement($(this), obj, obj.text, options.multiple);
                }
            }
        },
        clear:function () {
            var constans = $.fn.autoComplete.constants[$(this).attr("id")],
                options = $.fn.autoComplete.options[$(this).attr("id")];
            constans.resultData = [];
            constans.optionULObj.find("li.inner-select-opt").remove();
            constans.panelObj.hide();
            $(this).css("width", options.width).val(options.tip);
        }
    } ;

    /**
     * 查询结果集处理函数
     */
    var results = {
        search:function ($_this_,options,constants,key) {

            if( options.localData ) {
                results.listAll($_this_, options, constants, key,options.localData );
                return;
            }
            $.ajax({
                url:options.url,
                data:(options.data.autoKey = key) ? options.data :"",
                type:options.type,
                dataType:options.dataType,
                contentType:options.contentType,
                success:function (data) {
                    results.listAll($_this_, options, constants,key, data);
                }
            });
        },
        listAll:function ($_this_, options, constants,key,data) {
            if (data && data.length > 0) {
                results.show($_this_,options,constants,key,data);

                constants.panelObj.show().find("li").bind("click", function () {
                    var data = results.data(options,$(this));
                    results.select($_this_,options,constants,$(this),data);
                }).bind("click", function () {
                    setTimeout(function () {
                        options.callBack($.fn.autoComplete.constants[$_this_.attr("id")].resultData);
                    }, 0);
                });
            } else {
                constants.panelObj.hide();
            }
        },
        show:function ($_this_,options,constants,key,dataList) {
            var opStr = "<ul class='"+constants.panelULId+"'>";
            for (var j = 0 , len = dataList.length ; j < len/* && j< options.rowNum  */; j++) {
                var data = dataList[j],
                    size = options.dataAttr.length;

                if(!results.filter(key,data)) continue; /* 过滤结果集 */

                opStr = opStr+ "<li ";
                for(var k=0 ; k < size;k++) {
                    var attrName = options.dataAttr[k];
                    opStr = opStr + attrName + "='" + data[attrName] + "' ";
                }
                opStr = opStr+ ">"+data["text"]+"</li>";
            }
            opStr += "</ul>";

            constants.panelObj.find("div.data_content").html(opStr);

            $("."+constants.panelULId+" li").each(function () {
                $(this).hover(function () {
                    $(this).addClass("hoverClass");
                }, function () {
                    $(this).removeClass("hoverClass");
                })
            });
        },
        select:function ($_this_,options,constants,$this,data) {
            $_this_.val("");
            if ( options.multiple ) {/* 多选处理方式 */
                var selected = (function (data) {/* 判断选项是否被选中 */
                    for (var i =0 ,size = constants.resultData.length ; i<size;i++) {
                        if(constants.resultData[i]["id"] == data["id"]) return true;
                    }
                    return false;
                })(data);

                if (!selected) {
                    results.addElement($_this_,data,$this.text(),options.multiple);
                }
            }else{
                results.addElement($_this_,data,$this.text(),options.multiple);
            }
            constants.panelObj.hide();
        },
        addElement:function ($_this_,data,content,multiple) {

            var options = $.fn.autoComplete.options[$_this_.attr("id")],
                constants =$.fn.autoComplete.constants[$_this_.attr("id")],
                option = $("<li class='inner-select-opt' data='"+data+"'><span class='text-context'></span><span class='close-select-opt'>×</span></li>"),
                optionContext = option.find("span.text-context"),
                optionLi = $_this_.parent().parent().find("li");

            optionContext.attr("title", content).text(content);
            $_this_.css("width", "40px").val("");
            if ( !multiple && (optionLi.size() == 2)) {
                optionLi.first().attr("data",data).find("span.text-context").attr("title", data.text).text(data.text);
                constants.resultData[0] = data;
            }else{
                constants.resultData.push(data);
                $_this_.parent().before(option);
            }


            setTimeout(function () {
                option.css({"width": options.optionWidth,"height":options.optionHeight,"background-color":options.optionBgColor})
                    .find("span.close-select-opt").bind("click",function () {
                    var $this = $(this).parent();
                    results.unSelect($_this_,options,constants,$this,data);
                });
                option.find("span.text-context").css("width", options.optionWidth-20);
            }, 0);
            return option;
        },
        unSelect:function ($_this_,options,constants,$this,data) {
            $this.remove();
            for (var i =0 ,size = constants.resultData.length ; i<size;i++) {
                if(constants.resultData[i]["id"] == data["id"]) {
                    constants.resultData.splice(i,1);
                    break;
                }
            }
            setTimeout(function () {
                if (constants.resultData.length == 0  ) {
                    $_this_.css("width", options.width).blur();
                    constants.panelObj.hide();
                }
                options.callBack(constants.resultData);
            }, 0);
        },
        data:function (options,$this) {
            var data ={"text":$this.text()};
            for (var i =0 ,size = options.dataAttr.length; i< size ;i++) {
                var attrName = options.dataAttr[i];
                data[attrName] = $this.attr(attrName);
            }
            return data;
        },
        filter:function (key,data) {
            for (var name in data) {
            	if (name == "text") {
            		continue;
            	}
                if (data[name].indexOf(key) != -1) return true;
            }
            return false;
        }
    };
})(jQuery);