angular.module('sidenavDemo1', ['ngMaterial'])

.controller('AppCtrl', function($scope, $sce) {
	$scope.me = {};
	$scope.loaded = false;
	$scope.loggedIn = false;
	$scope.me.name = "";
	$scope.mail = [];
  	$scope.mail.social = [];
  	$scope.mail.promotions = [];
	$scope.mail.updates = [];
	$scope.mail.forums = [];
	$scope.calendars = [];
	$scope.events = [];
	$scope.predicate = 'time';
	$scope.today = new Date().getDate();
	$scope.now = new Date().getTime() + 0;
	$scope.calendarExpanded = false;
	$scope.prevDate = "NaN";
	$scope.labels = 
	[
		{
			'label':'Social',
			'labelId':'CATEGORY_SOCIAL',
			'color':'#4986e7',
			'scope':$scope.mail.social
		},
		{
			'label':'Promotions',
			'labelId':'CATEGORY_PROMOTIONS',
			'color':'#16a765',
			'scope':$scope.mail.promotions
		},
		{
			'label':'Updates',
			'labelId':'CATEGORY_UPDATES',
			'color':'#e9b330',
			'scope':$scope.mail.updates
		},
		{
			'label':'Forums',
			'labelId':'CATEGORY_FORUMS',
			'color':'#a479e2',
			'scope':$scope.mail.forums
		}
	]

  // Enter a client ID for a web application from the Google Developer Console.
      // The provided clientId will only work if the sample is run directly from
      // https://google-api-javascript-client.googlecode.com/hg/samples/authSample.html
      // In your Developer Console project, add a JavaScript origin that corresponds to the domain
      // where you will be running the script.
      var clientId = '1029377149956-ljrd3gt4dfg5lbfdaf24dg82ghlq9mn6.apps.googleusercontent.com';

      // Enter the API key from the Google Develoepr Console - to handle any unauthenticated
      // requests in the code.
      // The provided key works for this sample only when run from
      // https://google-api-javascript-client.googlecode.com/hg/samples/authSample.html
      // To use in your own application, replace this API key with your own.
      var apiKey = 'AIzaSyAjiKYFG15I2RDyILM4c9E4ZvPXOikV10E';

      // To enter one or more authentication scopes, refer to the documentation for the API.
      var scopes = ['https://www.googleapis.com/auth/gmail.modify','https://www.googleapis.com/auth/calendar'];

      // Use a button to handle authentication the first time.
      $scope.signOut = function() {
		  gapi.auth.signOut();
		  console.log("signing out");
		  $scope.loggedIn = false;
	  }
	  
	  $scope.handleClientLoad = function() {
        gapi.client.setApiKey(apiKey);
        window.setTimeout(checkAuth,1);
      }

      function checkAuth() {
        gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
      }


      function handleAuthResult(authResult) {
        var authorizeButton = document.getElementById('authorize-button');
        if (authResult && !authResult.error) {
          authorizeButton.style.visibility = 'hidden';
		  authorizeButton.style.display = 'none';
          makeApiCall();
		  
        } else {
          authorizeButton.style.visibility = '';
          authorizeButton.onclick = handleAuthClick;
		  $scope.loaded = true;
		  $scope.$apply();
        }
      }

      function handleAuthClick(event) {
        gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
        return false;
      }

      // Load the API and make an API call.  Display the results on the screen.
      function makeApiCall() {
        gapi.client.load('plus', 'v1', function() {
          var request = gapi.client.plus.people.get({
            'userId': 'me'
          });
          request.execute(function(resp) {
            var heading = document.createElement('div');
            var image = document.createElement('img');
			if (resp.image) {
            	image.src = resp.image.url;
			}
            heading.appendChild(image);
			var username = document.createElement('h4')
			username.appendChild(document.createTextNode(resp.displayName))
            heading.appendChild(username);
			$scope.me.name = resp.displayName;

            document.getElementById('user').appendChild(heading);
			
          });
        });
		gapi.client.load('gmail', 'v1', function() {
		 listThreads('me','',['INBOX'], function(resp) {
		 	handleThreads(resp);
		 });
		});
		var result = [];
		gapi.client.load('calendar','v3', function() {
			listCalendars(function(resp) {
				for (var i = 0; i < resp.length; i++) {
					listEvents(resp[i], function(events) {
						$scope.events = $scope.events.concat(events);
					});
				}
				console.log($scope.events);
			});
		});
      }
	  $scope.withinWeek = function(prop){
		return function(item){
		  if (item[prop] > new Date().getTime()  && item[prop] < new Date().getTime() + 604800000 * 4) {
			  return true;
		  }		
		 }
	}
	  function listCalendars(callback) {
		  	var request = gapi.client.calendar.calendarList.list();
			getCalendars(callback, request, []);	
	  }
	  function getCalendars(callback, request, result) {
		request.execute(function (resp) {
		   	result =  result.concat(resp.items);
			callback(result);
	
		});
		};
	  function listEvents(calendar, callback) {
			var request = gapi.client.calendar.events.list({
				'calendarId': calendar.id,
				'singleEvents': true
			});
			getEvents(calendar, callback, request, []);
	  }
	  function getEvents(calendar, callback, request, result) {
		  request.execute(function (resp) {
			for (var i = 0; i< resp.items.length; i++) {
				resp.items[i].backgroundColor = calendar.backgroundColor;
				resp.items[i].foregroundColor = calendar.foreroundColor;
				if (resp.items[i].start) {
					if (resp.items[i].start.dateTime) {
					resp.items[i].startTime = Date.parse(resp.items[i].start.dateTime);
					resp.items[i].endTime = Date.parse(resp.items[i].end.dateTime);
				} else {
					resp.items[i].startTime = Date.parse(resp.items[i].start.date);
					resp.items[i].endTime = Date.parse(resp.items[i].end.date);
				}
				}
			}
			result =  result.concat(resp.items) ;
			callback(result);
		});
	  }
	  var googleDate = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})([+-]\d{2}):(\d{2})$/;

function parseGoogleDate(d) {
    var m = googleDate.exec(d);
    var year   = +m[1];
    var month  = +m[2];
    var day    = +m[3];
    var hour   = +m[4];
    var minute = +m[5];
    var second = +m[6];
    var msec   = +m[7];
    var tzHour = +m[8];
    var tzMin  = +m[9];
    var tzOffset = new Date().getTimezoneOffset() + tzHour * 60 + tzMin;

    return new Date(year, month - 1, day, hour, minute - tzOffset, second, msec);
}
function handleThreads(resp) {
	for (var i = 0; i < resp.length; i++) {
				getThread('me',resp[i].id,  function(resp) {
					var threads = [];
					for (var messageIndex = 0; messageIndex < resp.messages.length; messageIndex++) {
						var message = resp.messages[messageIndex];
						var id = message.id;
						var snippet = message.snippet;
						var subject = 'No Subject';
						var labelIds = message.labelIds;
						var from = '';
						var email = '';
						var date = '';
						var i = 0;
						while ((subject == 'No Subject' || from == '' || date == '') && i < message.payload.headers.length) {
							if (message.payload.headers[i].name == 'Subject') {
								subject = message.payload.headers[i].value;
							}
							if (message.payload.headers[i].name == 'From') {
								from = message.payload.headers[i].value.replace(/["']/g, "");
								email = from;
								
								if (from.indexOf('<') != -1) {
									from = from.substring(0,from.indexOf('<') - 1);
									email = email.substring(email.indexOf('<') + 1, email.indexOf('>') - 1);
									if (from == '') {
										from = email;
									}
								}
							}
							if (message.payload.headers[i].name == 'Date') {
								date = message.payload.headers[i].value;
							}
							i++;
						}
						mailData = {
							'id':id,
							'subject': subject,
							'from': from,
							'email': email,
							'snippet': snippet,
							'date': date,
							'labelIds': labelIds,
							'html':'',
							'open':false,
							'unread':false,
							'reply':""
							
						}
					
						for (var i = 0; i < mailData.labelIds.length; i++) {
							if (mailData.labelIds[i] == 'UNREAD') {
								mailData['unread'] = true;
							}
						}
						threads.push(mailData);
					}
						for (var i = 0; i < threads[0].labelIds.length; i++) {
							
							if (threads[0].labelIds[i] == 'CATEGORY_PERSONAL') {
								var obj = [
										{
											'bundle':'Personal',
											'threads':[threads],
											'open':false,
											'numUnread': 0
										}
										];
								$scope.mail.push(obj);
							}
							for (var j = 0; j < $scope.labels.length; j++) {
								item = $scope.labels[j];
								if (threads[0].labelIds[i] == item.labelId) {
									if (item.scope.length == 0) {
										item.scope.push(threads);
										var obj = [
											{
												'bundle':item.label,
												'color':item.color,
												'threads':item.scope,
												'open':false,
												'numUnread': 0
											}
											];
										$scope.mail.push(obj);
									} else {
										item.scope.push(threads);
									}
								}
							}
						}
						
						for (var i = 0; i < $scope.mail.length; i++) {
							var bundle = $scope.mail[i][0];
							var count = 0;
							for (var j = 0; j < bundle.threads.length; j++) {
								var thread = bundle.threads[j];
								for (var k = 0; k < thread.length; k++) {
									var message = thread[k];
									if (message.unread) {
										count++;
									}
								}
							}
							bundle.numUnread = count;
						}
						/* console.log($scope.mail.social); */
				});
			}
			for (var i = 1; i <= 10; i++) {
				setTimeout(function() {
					$scope.loaded = true;
					$scope.loggedIn = true;
					$scope.$apply(); //this triggers a $digest
			  }, 200 * i);
			}
}
$scope.getColor = function(ch) {
	switch(ch.toLowerCase()) {
		case 'a': return "#F44336";
		case 'b': return "#E91E63";
		case 'c': return "#9C27B0";
		case 'd': return "#673AB7";
		case 'e': return "#3F51B5";
		case 'f': return "#2196F3";
		case 'g': return "#03A9F4";
		case 'h': return "#00BCD4";
		case 'i': return "#009688";
		case 'j': return "#4CAF50";
		case 'k': return "#8BC34A";
		case 'l': return "#CDDC39";
		case 'm': return "#FFEB3B";
		case 'n': return "#FFC107";
		case 'o': return "#FF9800";
		case 'p': return "#FF5722";
		case 'q': return "#795548";
		case 'r': return "#9E9E9E";
		case 's': return "#607D8B";
		case 't': return "#FF5722";
		case 'u': return "#FFC107";
		case 'v': return "#CDDC39";
		case 'w': return "#4CAF50";
		case 'x': return "#00BCD4";
		case 'y': return "#2196F3";
		case 'z': return "#673AB7";
		default: return "#2196F3";
	}
}

/**
 * Retrieve Threads in the user's mailbox matching query.
 *
 * @param  {String} userId User's email address. The special value 'me'
 * can be used to indicate the authenticated user.
 * @param  {String} query String used to filter the Threads listed.
 * @param  {Function} callback Function to call when the request is complete.
 */
 $scope.nextPageToken = null;
 $scope.loadedThreads = [];
function getPageOfThreads(userId, query, labelIds, callback, request, result) {
    request.execute(function (resp) {
       result =  result.concat(resp.threads);
       $scope.nextPageToken = resp.nextPageToken;
	  /*
      if (nextPageToken) {
        request = gapi.client.gmail.users.threads.list({
          'userId': userId,
          'q': query,
          'pageToken': nextPageToken,
		  'labelIds': labelIds
        });
        getPageOfThreads(request, result);
      } else {*/
        callback(result);
      /*}*/
    });
  };
function listThreads(userId, query, labelIds, callback) {
  var request = gapi.client.gmail.users.threads.list({
    'userId': userId,
    'q': query,
	'labelIds': labelIds,
  });
  console.log("getting threads");
  getPageOfThreads(userId, query, labelIds, callback, request, []);
}
$scope.loadNext = function() {
	$scope.loadMoreThreads('me','',['INBOX'], function(resp) { 
		handleThreads(resp)
	});
}
$scope.loadMoreThreads = function(userId, query, labelIds, callback) {
	gapi.client.load('gmail', 'v1', function() {
		if ($scope.nextPageToken) {
			request = gapi.client.gmail.users.threads.list({
			  'userId': userId,
			  'q': query,
			  'pageToken': $scope.nextPageToken,
			  'labelIds': labelIds
			});
			getPageOfThreads(userId, query, labelIds, callback, request, [])
		}
	});
}
/**
 * Get Message with given ID.
 *
 * @param  {String} userId User's email address. The special value 'me'
 * can be used to indicate the authenticated user.
 * @param  {String} messageId ID of Message to get.
 * @param  {Function} callback Function to call when the request is complete.
 */
function getMessage(userId, messageId, callback) {
  var request = gapi.client.gmail.users.messages.get({
    'userId': userId,
    'id': messageId,
  });
  request.execute(callback);
}

/**
 * Get Thread with given ID.
 *
 * @param  {String} userId User's email address. The special value 'me'
 * can be used to indicate the authenticated user.
 * @param  {String} threadId ID of Thread to get.
 * @param  {Function} callback Function to call when the request is complete.
 */
function getThread(userId, threadId, callback) {
  var request = gapi.client.gmail.users.threads.get({
    'userId': userId,
    'id': threadId
  });
  request.execute(callback);
}

	if (localStorage["cards"] == null) {
		localStorage["cards"] = JSON.stringify([]);
	} 
	if (localStorage["todos"] == null) {
		localStorage["todos"] = JSON.stringify([]);
	} 
	
	$scope.cards = JSON.parse(localStorage["cards"]);
	$scope.todos = JSON.parse(localStorage["todos"]);
	$scope.addKnowledgeCard=function() {
		var service_url = 'https://www.googleapis.com/freebase/v1/topic';
      	var params = {};
		var title = "";
		$.getJSON(service_url + $("#search-value input").val() + '?filter=suggest', params, function(topic) {
			var obj = {
			"card":"knowledge",
			"query":$scope.search.query,
			"title": topic.property['/type/object/name'].values[0].text,
			"snippet":topic.property['/common/topic/article'].values[0]['property']['/common/document/text'].values[0].value,
			"time": new Date().toISOString()
		};
		$scope.cards.unshift(obj);
		$scope.setHash();
      });
	}
	
	window.onclick = function() {
		$scope.closeAllBundles();
		$scope.$apply();
      };
	$scope.addYoutubeCard=function(str) {
		var obj = {
			"card":"youtube",
			"id": getId(str),
			"embedURL":"http://www.youtube.com/embed/" + getId(str)
		};
		alert(obj['id']);
		$scope.cards.unshift(obj);
		$scope.setHash();
		
    }
	$scope.addMailCard=function() {
		var obj = {
			"card":"mail",
		};
		var add = true;
		$scope.addCardAtTop('mail', obj);
		$scope.setHash();
		
    }
	$scope.addCalCard=function() {
		var obj = {
			"card":"cal",
		};
		var add = true;
		$scope.addCardAtTop('cal', obj);
		$scope.setHash();
		
    }
	
	$scope.addTodoCard=function() {
		var obj = {
			"card":"todo",
		};
		var add = true;
		$scope.addCardAtTop('todo', obj);
		$scope.setHash();
		
    }
	$scope.addWeatherCard=function() {
		var obj = {
			"card":"weather"
		};
		$scope.addCardAtTop('weather',obj);
		$scope.setHash();
		if (localStorage["latitude"] == null || localStorage["longitude"] == null) {
  		loadWeather('Seattle',''); //@params location, woeid
	} else {
		loadWeather(localStorage["latitude"]+','+localStorage["longitude"]);
	}
	}
	$scope.closeAllBundles = function() {
		for (var i = 0; i < $scope.mail.length; i++) {
			if ($scope.mail[i][0].open) {
				$scope.closeBundle(i);
			}
		}
	}
	$scope.closeBundle = function(index) {
		$scope.mail[index][0].open = false;
		for (var i = 0; i < $scope.mail[index][0].threads.length; i++) {
			$scope.closeThread(index, i);
		}
	}
	$scope.closeAllThreadsInBundle = function(index, excludedIndex) {
		for (var i = 0; i < $scope.mail[index][0].threads.length; i++) {
			if (i != excludedIndex) {
				$scope.closeThread(index, i);
			}
		}
	}
	$scope.closeThread = function(index, threadIndex) {
		for (var i = 0; i < $scope.mail[index][0].threads[threadIndex].length; i++) {
			console.log("closing thread...");
			$scope.closeMail(index, threadIndex, i);
		}	
	}
	$scope.closeAllMailInThread= function(index, threadIndex, excludedIndex) {
		for (var i = 0; i < $scope.mail[index][0].threads[threadIndex].length; i++) {
			console.log('closingMail');
			if (i != excludedIndex) {
				$scope.closeMail(index, threadIndex, i);
			}
		}
	}
	$scope.closeMail = function(index, threadIndex, messageIndex) {
			if ($scope.mail[index][0].threads[threadIndex][messageIndex].open) {
				$scope.mail[index][0].threads[threadIndex][messageIndex].open = false;
			}
			$scope.$apply(); //this triggers a $digest
	}
	$scope.openBundle = function(index, event) {
		if (!$scope.mail[index][0].open) {
			$scope.closeAllBundles();
			$scope.mail[index][0].open = true;
			if ($scope.mail[index][0].threads.length == 1) {
				$scope.openThread(index, 0, event);
			}
			event.stopPropagation();
		}
	}
	$scope.openThread = function(index, threadIndex, event) {
		$scope.closeAllThreadsInBundle(index, threadIndex);
		$scope.openMail(index, threadIndex, $scope.mail[index][0].threads[threadIndex].length - 1, event); 
		event.stopPropagation();
	}
	$scope.threadOpen = function(index, threadIndex) {
		for (var i = 0; i < $scope.mail[index][0].threads[threadIndex].length; i++) {
			if ($scope.mail[index][0].threads[threadIndex][i].open) {
				console.log('thread already open');
				return true;
			}
		}
		return false;
	}
	$scope.openMail = function(index, threadIndex, messageIndex, event) {
		gapi.client.load('gmail', 'v1', function() {
			getMessage('me', $scope.mail[index][0].threads[threadIndex][messageIndex].id, function(resp) {
				for (var i = 0; i <  $scope.mail[index][0].threads[threadIndex].length; i++) {
			if ($scope.mail[index][0].threads[threadIndex][i].open) {
				$scope.mail[index][0].threads[threadIndex][i].open = false;
			}
		}
				$scope.mail[index][0].threads[threadIndex][messageIndex].open = true;
				var part = findPart(resp);
				var encodedHtml = part.body.data;
				var html = $sce.trustAsHtml(atob(decodeUrl(encodedHtml)));
				$scope.mail[index][0].threads[threadIndex][messageIndex].html = html;
				event.stopPropagation();
				console.log('email loaded!');
				$scope.$apply(); //this triggers a $digest
				});
		});
	}
	function findPart(root) {
		if (root.mimeType) {
			if (root.mimeType == "text/html") {
				return root;
			}
		} 
		var keys = [];
		for (var key in root) {
			if (root.hasOwnProperty(key)) {
				if (key == "payload" || key == "result" || key == "part" || key == "parts") {
    				keys.push(key);
				}
  			}
		}
		for (var index = 0; index < root.length; index++) {
			keys.push(index);
		}
		for (var i = 0; i < keys.length; i++) {
			var part = findPart(root[keys[i]]);
			if (part) {
				return part;
			}
			
		}
		return null;
	}
	$scope.removeCard=function(index) {
		$($scope.card).animate({marginLeft: window.innerWidth + "px",marginRight: -window.innerWidth + "px", opacity:0}, 500);
		/*alert(a);*/
		$scope.cards.splice(index, 1);
		$scope.setHash();
	}
	$scope.removeTodo=function(index) {
		$($scope.todo).animate({marginLeft: window.innerWidth + "px",marginRight: -window.innerWidth + "px", opacity:0}, 500);
		/*alert(a);*/
		$scope.todos.splice(index, 1);
		$scope.setHash();
	}
	$scope.addTodo=function(text){
			var obj = {
				"what": text,
				"time": new Date().toISOString(),
				"done":false
			};
			$scope.todos.unshift(obj);
			localStorage["todos"] = JSON.stringify($scope.todos, function (key, val) {
     			if (key == '$$hashKey') {
         			return undefined;
     			}
     			return val;
			});
        }
	$scope.updateTodo=function(index){
		$scope.removeTodo(index);
		localStorage["todos"] = JSON.stringify($scope.todos, function (key, val) {
			if (key == '$$hashKey') {
				return undefined;
			}
			return val;
		});
	}
	
	$scope.parseSearch = function() {
			window.setTimeout($scope.handleSearch(),1);
	}
	$scope.handleSearch = function() {
		if ($scope.search == null) {
			
		} else {
			var command = $scope.search.query;
			if (containsYoutubeID(command)) {
				$scope.addYoutubeCard(command);
				console.log('YouTube link detected');
			} else if (command.substring(0,4) === 'mail') {
				$scope.addMailCard();
			}
			else if (command.substring(0,4) === 'todo') {
				if (command.substring(0,5) === 'todo:') {
					var task = command.substring(6,command.length);
					$scope.addTodo(task);
					$scope.addTodoCard();
					console.log(task + ' added');
				} else {
					$scope.addTodoCard();
				}
			} else if (command.substring(0,7) === 'weather') {
				$scope.addWeatherCard();
			} else {
				$scope.addKnowledgeCard();
			}
		}
		setTimeout(function() {;
				console.log('card loaded!');
				$scope.$apply(); //this triggers a $digest
		 }, 500);
	}
	$scope.addCardAtTop = function(type, obj) {
		var add = true;
		for (var i = 0; i < $scope.cards.length; i++) {
				if ($scope.cards[i].card === type) {
					if (i === 0) {
						add = false;
					} else {
						$scope.removeCard(i);
					}
			}
		}
		if (add) {
			$scope.cards.unshift(obj);
		}
	}
	$scope.setHash = function() {
	localStorage["cards"] = JSON.stringify($scope.cards, function (key, val) {
     		if (key == '$$hashKey') {
         		return undefined;
     		}
     		return val;
		});
}
})
.
  directive('contenteditable', function() {
    return {
      restrict: 'A', // only activate on element attribute
      require: '?ngModel', // get a hold of NgModelController
      link: function(scope, element, attrs, ngModel) {
        if(!ngModel) return; // do nothing if no ng-model

        // Specify how UI should be updated
        ngModel.$render = function() {
          element.html(ngModel.$viewValue || '');
        };

        // Listen for change events to enable binding
        element.on('blur keyup change', function() {
          scope.$apply(read);
        });
        read(); // initialize

        // Write data to the model
        function read() {
          var html = element.html();
          // When we clear the content editable the browser leaves a <br> behind
          // If strip-br attribute is provided then we strip this out
          if( attrs.stripBr && html == '<br>' ) {
            html = '';
          }
          ngModel.$setViewValue(html);
        }
      }
    };
  });
  function loadWeather(location, woeid) {
  $.simpleWeather({
    location: location,
    woeid: woeid,
    unit: 'f',
    success: function(weather) {
      html = '<div class="weather-today"><h3>' + weather.city + '</h3><h2><i class="icon-'+weather.code+'"></i> '+weather.temp+'&deg;'+weather.units.temp+'</h2>';
      html += '<ul><li>'+weather.currently + '</li>';
      html += '<li style="font-weight: bold">'+weather.wind.speed+'mph</li>';
      html += '<li style="font-weight: bold">'+weather.humidity+'%</li></ul></div>'; 
	  for (var i = 0; i < 5; i++) {
	  	html += '<div class="forecast"><h3 class="forecast-day">' + weather.forecast[i].day + '</h3><i class="forecast-icon icon-'+weather.forecast[i].code+'"></i><div class="forecast-low-high"><div class="forecast-low">' + weather.forecast[i].low + '&deg;</div><div class="forecast-high">' + weather.forecast[i].high + '&deg;</div></div></div>';
	  }
	 
      $("#weather").html(html);
    },
    error: function(error) {
      $("#weather").html('<p>'+error+'</p>');
    }
  });
  $('.forecast').each( function(i){
			var pageWidth = $("#weather").width();
			var elementWidth = $(this).width();
			var elementLeft = $(this).position().left;
		
			if (pageWidth - (elementWidth + elementLeft) < 0) {
				$(this).css('opacity',0);
			} else {
				$(this).css('opacity',1);
			}
		});
}
function ValidURL(str) {
  var pattern = new RegExp('^(https?:\/\/)?'+ // protocol
    '((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|'+ // domain name
    '((\d{1,3}\.){3}\d{1,3}))'+ // OR ip (v4) address
    '(\:\d+)?(\/[-a-z\d%_.~+]*)*'+ // port and path
    '(\?[;&a-z\d%_.~+=-]*)?'+ // query string
    '(\#[-a-z\d_]*)?$','i'); // fragment locater
  if(!pattern.test(str)) {
    alert("Please enter a valid URL.");
    return false;
  } else {
    return true;
  }
}
function containsYoutubeID(str) {
	var matches = str.match(/watch\?v=([a-zA-Z0-9\-_]+)/);
	if (matches) {
		return true;
	}
	return false;
}
function getId(url) {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);

    if (match && match[2].length == 11) {
        return match[2];
    } else {
        return 'error';
    }
}
function decodeUrl(str){
    str = (str + '===').slice(0, str.length + (str.length % 4));
    return str.replace(/-/g, '+').replace(/_/g, '/');
}
