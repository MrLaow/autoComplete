# autoComplete
This is a plugin based on jquery.
Support single select and multiple select.
You can define with object-array,files with suffix .json,and remote service as well.
It's very to use. Let's start!

How to use this plugin?You can choose flowing three methods!
Before these , you should edit you code like this

Code:"<div><ul><li><input id='singleSelect' type='text'/></li></ul></div>"
The input must wrapped by "<div><ul><li></li></ul><div>",and it must has the attribute named id.

First one:This is most easiest example,with localData.

$("#singleSelect").autoComplete({
    localData:[
        {
            "text":"张国立",
            "id":"1",
            "email":"zhangguoli@123.com",
            "url":"./img/1.jpg"
        },
        {
            "text":"张铁林",
            "id":"2",
            "email":"zhangtieli@123.com",
            "url":"./img/2.jpg"
        }
    ],
    dataAttr:["email","url","id"],
    callBack:function (data) {
        console.info(data);
    }
});

Second one:The data is from a file with suffix .json.

$("#singleSelect").autoComplete({
    url: "data.json",
    dataAttr:["email","url","id"],
    multiple:true,
    optionWidth:60,
    optionBgColor:"#6e6e6e",
    borderColor:"blue",
    callBack:function (data) {
        console.info(data);
    }
});

Last : Remote service
$("#singleSelect").autoComplete({
    url: "http://127.0.0.1:8080/auto/listAll",
    dataAttr:["email","url","id"],
    multiple:true,
    optionWidth:60,
    optionBgColor:"#6e6e6e",
    borderColor:"blue",
    callBack:function (data) {
        console.info(data);
    }
});


The plugin supports many attributes and methods for you use.
These attributes you can read resources,which has detailed introduction.
There are four methods for you to use.

1.$("#singleSelect").autoComplete("getValue")
2.$("#singleSelect").autoComplete("setValue",{})
3.$("#singleSelect").autoComplete("setValues",[{},{},{}])
4.$("#singleSelect").autoComplete("clear")