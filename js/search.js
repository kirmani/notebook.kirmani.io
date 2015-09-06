$(document).ready(function() {
/*document.write('<script type="text/javascript" src="//code.jquery.com/jquery-1.10.2.js"></script>');

document.write('<script type="text/javascript" src="//code.jquery.com/ui/1.11.2/jquery-ui.js"></script>');*/

new Element("script", {src: "//code.jquery.com/jquery-1.10.2.js", type: "text/javascript"});

new Element("script", {src: "//code.jquery.com/ui/1.11.2/jquery-ui.js", type: "text/javascript"});

$("#search input").autocomplete({
    source: function (request, response) {
        var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
		var service_url = 'https://www.googleapis.com/freebase/v1/search';
		var params = {
			'query': $("#search input").val(),
			'limit': 10,
			'indent': true
		};
        $.ajax({
            url: service_url + '?callback=?',
            dataType: "json",
			data: params,
            success: function (json) {
				 var data = [];
	$.each(json.result, function(i, result) {
			data.push({'MainName':result['name'],'MainItemID':result['id']});
	});
                response($.map(data, function(v,i){
                    var text = v.MainName;
                    if ( text && ( !request.term || matcher.test(text) ) ) {
						
                        return {
                                label: v.MainName,
                                value: v.MainItemID
                               };
						}
					}));
				}
			});
		}
	});
});