
angular.module("CommonServiceMod", [])
    .filter('cutString', function() {
        return function (value, max, tail) {
            var judgeLength = 0,cutString = new String();
            var re = /^[\u4E00-\u9FA5]$/;
            if (!value){
                return ''
            };
            max = parseInt(max);
            for (var i = 0; i < value.length; i++) {
                if (judgeLength >= max) {
                    cutString = cutString.substr(0, cutString.length-1);
                    cutString = cutString.concat(tail||"..");
                    return cutString;
                }

                var singleChar = value.charAt(i);
                if (re.test(singleChar)) {
                    judgeLength+=2;
                    console.log(singleChar);
                }
                else{
                    judgeLength++;
                }
                cutString = cutString.concat(singleChar);
            }
            return cutString;
        };
    });