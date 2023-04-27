
function resetNode(allNodes, newNode, isFirstLoop) {
    if (isFirstLoop) {
        var nodes = []
        allNodes.forEach(item => {
            if (item.data.pId.toString() === "0") { 
                item.data.children=[];
                
                resetNode(allNodes, item.data, false)
                nodes.push(item.data)
            }
        });
        return nodes;
    }
    //console.log('newNode:',newNode)
    allNodes.forEach(function(item2, index) {
        if (item2.data.pId == newNode.id) {
            item2.data.children=[];
            resetNode(allNodes, item2.data, false)
            newNode.children.push(item2.data) 
        }
    })
}



    var loadFiles = {
        js     : [],
        css    : [],
        plugin : []
    };
   
    
    function loadCSS(fileName, callback, into) {
        into       = into     || "head";        
        callback   = callback || function() {};
        
        var css    = document.createElement("link");
        css.type   = "text/css";
        css.rel    = "stylesheet";
        css.onload = css.onreadystatechange = function() {
            loadFiles.css.push(fileName);
            callback();
        };

        css.href   = fileName + ".css";

        if(into === "head") {
            document.getElementsByTagName("head")[0].appendChild(css);
        } else {
            document.body.appendChild(css);
        }
    };
    
    
var isIE    = (navigator.appName == "Microsoft Internet Explorer");
var isIE8   = (isIE && navigator.appVersion.match(/8./i) == "8.");

function loadScript(fileName, callback, into) {

    into          = into     || "head";
    callback      = callback || function() {};

    var script    = null; 
    script        = document.createElement("script");
    script.id     = fileName.replace(/[\./]+/g, "-");
    script.type   = "text/javascript";        
    script.src    = fileName + ".js";

    if (isIE8) 
    {            
        script.onreadystatechange = function() {
            if(script.readyState) 
            {
                if (script.readyState === "loaded" || script.readyState === "complete") 
                {
                    script.onreadystatechange = null; 
                    loadFiles.js.push(fileName);
                    callback();
                }
            } 
        };
    }
    else
    {
        script.onload = function() {
            loadFiles.js.push(fileName);
            callback();
        };
    }

    if (into === "head") {
        document.getElementsByTagName("head")[0].appendChild(script);
    } else {
        document.body.appendChild(script);
    }
    };




// 格式方法
// 公共方法
function transitionJsonToString (jsonObj, callback) {
    // 转换后的jsonObj受体对象
    var _jsonObj = null;
    // 判断传入的jsonObj对象是不是字符串，如果是字符串需要先转换为对象，再转换为字符串，这样做是为了保证转换后的字符串为双引号
    if (Object.prototype.toString.call(jsonObj) !== "[object String]") {
        try {
            _jsonObj = JSON.stringify(jsonObj);
        } catch (error) {
            // 转换失败错误信息
            console.error('您传递的json数据格式有误，请核对...');
            console.error(error);
            callback(error);
        }
    } else {
        try {
            jsonObj = jsonObj.replace(/(\')/g, '\"');
            _jsonObj = JSON.stringify(JSON.parse(jsonObj));
        } catch (error) {
            // 转换失败错误信息
            console.error('您传递的json数据格式有误，请核对...');
            console.error(error);
            callback(error);
        }
    }
    return _jsonObj;
}
// callback为数据格式化错误的时候处理函数
function formatJson (jsonObj, callback) {
    // 正则表达式匹配规则变量
    var reg = null;
    // 转换后的字符串变量
    var formatted = '';
    // 换行缩进位数
    var pad = 0;
    // 一个tab对应空格位数
    var PADDING = '    ';
    // json对象转换为字符串变量
    var jsonString = transitionJsonToString(jsonObj, callback);
    if (!jsonString) {
        return jsonString;
    }
    // 存储需要特殊处理的字符串段
    var _index = [];
    // 存储需要特殊处理的“再数组中的开始位置变量索引
    var _indexStart = null;
    // 存储需要特殊处理的“再数组中的结束位置变量索引
    var _indexEnd = null;
    // 将jsonString字符串内容通过\r\n符分割成数组
    var jsonArray = [];
    // 正则匹配到{,}符号则在两边添加回车换行
    jsonString = jsonString.replace(/([\{\}])/g, '\r\n$1\r\n');
    // 正则匹配到[,]符号则在两边添加回车换行
    jsonString = jsonString.replace(/([\[\]])/g, '\r\n$1\r\n');
    // 正则匹配到,符号则在两边添加回车换行
    jsonString = jsonString.replace(/(\,)/g, '$1\r\n');
    // 正则匹配到要超过一行的换行需要改为一行
    jsonString = jsonString.replace(/(\r\n\r\n)/g, '\r\n');
    // 正则匹配到单独处于一行的,符号时需要去掉换行，将,置于同行
    jsonString = jsonString.replace(/\r\n\,/g, ',');
    // 特殊处理双引号中的内容
    jsonArray = jsonString.split('\r\n');
    jsonArray.forEach(function (node, index) {
        // 获取当前字符串段中"的数量
        var num = node.match(/\"/g) ? node.match(/\"/g).length : 0;
        // 判断num是否为奇数来确定是否需要特殊处理
        if (num % 2 && !_indexStart) {
            _indexStart = index
        }
        if (num % 2 && _indexStart && _indexStart != index) {
            _indexEnd = index
        }
        // 将需要特殊处理的字符串段的其实位置和结束位置信息存入，并对应重置开始时和结束变量
        if (_indexStart && _indexEnd) {
            _index.push({
                start: _indexStart,
                end: _indexEnd
            })
            _indexStart = null
            _indexEnd = null
        }
    })
    // 开始处理双引号中的内容，将多余的"去除
    _index.reverse().forEach(function (item, index) {
        var newArray = jsonArray.slice(item.start, item.end + 1)
        jsonArray.splice(item.start, item.end + 1 - item.start, newArray.join(''))
    })
    // 奖处理后的数组通过\r\n连接符重组为字符串
    jsonString = jsonArray.join('\r\n');
    // 将匹配到:后为回车换行加大括号替换为冒号加大括号
    jsonString = jsonString.replace(/\:\r\n\{/g, ':{');
    // 将匹配到:后为回车换行加中括号替换为冒号加中括号
    jsonString = jsonString.replace(/\:\r\n\[/g, ':[');
    // 将上述转换后的字符串再次以\r\n分割成数组
    jsonArray = jsonString.split('\r\n');
    // 将转换完成的字符串根据PADDING值来组合成最终的形态
    jsonArray.forEach(function (item, index) {
        console.log(item)
        var i = 0;
        // 表示缩进的位数，以tab作为计数单位
        var indent = 0;
        // 表示缩进的位数，以空格作为计数单位
        var padding = '';
        if (item.match(/\{$/) || item.match(/\[$/)) {
            // 匹配到以{和[结尾的时候indent加1
            indent += 1
        } else if (item.match(/\}$/) || item.match(/\]$/) || item.match(/\},$/) || item.match(/\],$/)) {
            // 匹配到以}和]结尾的时候indent减1
            if (pad !== 0) {
                pad -= 1
            }
        } else {
            indent = 0
        }
        for (i = 0; i < pad; i++) {
            padding += PADDING
        }
        formatted += padding + item + '\r\n'
        pad += indent
       })
    // 返回的数据需要去除两边的空格
    return formatted.trim();
}

function formateXml(xmlStr){
    text = xmlStr;
    //使用replace去空格
    text = '\n' + text.replace(/(<\w+)(\s.*?>)/g,function($0, name, props){
        return name + ' ' + props.replace(/\s+(\w+=)/g," $1");
    }).replace(/>\s*?</g,">\n<");
    //处理注释
    text = text.replace(/\n/g,'\r').replace(/<!--(.+?)-->/g,function($0, text){
        var ret = '<!--' + escape(text) + '-->';
        return ret;
    }).replace(/\r/g,'\n');
    //调整格式  以压栈方式递归调整缩进
    var rgx = /\n(<(([^\?]).+?)(?:\s|\s*?>|\s*?(\/)>)(?:.*?(?:(?:(\/)>)|(?:<(\/)\2>)))?)/mg;
    var nodeStack = [];
    var output = text.replace(rgx,function($0,all,name,isBegin,isCloseFull1,isCloseFull2 ,isFull1,isFull2){
        var isClosed = (isCloseFull1 == '/') || (isCloseFull2 == '/' ) || (isFull1 == '/') || (isFull2 == '/');
        var prefix = '';
        if(isBegin == '!'){//!开头
            prefix = setPrefix(nodeStack.length);
        }else {
            if(isBegin != '/'){///开头
                prefix = setPrefix(nodeStack.length);
                if(!isClosed){//非关闭标签
                    nodeStack.push(name);
                }
            }else{
                nodeStack.pop();//弹栈
                prefix = setPrefix(nodeStack.length);
            }
        }
        var ret =  '\n' + prefix + all;
        return ret;
    });
    var prefixSpace = -1;
    var outputText = output.substring(1);
    //还原注释内容
    outputText = outputText.replace(/\n/g,'\r').replace(/(\s*)<!--(.+?)-->/g,function($0, prefix,  text){
        if(prefix.charAt(0) == '\r')
            prefix = prefix.substring(1);
        text = unescape(text).replace(/\r/g,'\n');
        var ret = '\n' + prefix + '<!--' + text.replace(/^\s*/mg, prefix ) + '-->';
        return ret;
    });
    outputText= outputText.replace(/\s+$/g,'').replace(/\r/g,'\r\n');
    return outputText;
}
     
//计算头函数 用来缩进
function setPrefix(prefixIndex) {
    var result = '';
    var span = '    ';//缩进长度
    var output = [];
    for(var i = 0 ; i < prefixIndex; ++i){
        output.push(span);
    }
    result = output.join('');
    return result
}