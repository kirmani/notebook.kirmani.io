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
      var scopes = 'https://www.googleapis.com/auth/gmail.modify';

      // Use a button to handle authentication the first time.
      function handleClientLoad() {
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
            image.src = resp.image.url;
            heading.appendChild(image);
			var username = document.createElement('h4')
			username.appendChild(document.createTextNode(resp.displayName))
            heading.appendChild(username);

            document.getElementById('user').appendChild(heading);
			
          });
        });
		gapi.client.load('gmail', 'v1', function() {
		 listThreads('me','',['CATEGORY_PROMOTIONS'], function(resp) {
		 	for (var i = 0; i < resp.length; i++) {
				getThread('me',resp[i].id,  function(threads) {

						var snippet = threads.messages[0].snippet;
						var subject = 'No Subject';
						var from = '';
						var i = 0;
						while (subject == 'No Subject' && from == '' && i < threads.messages[0].payload.headers.length) {
							if (threads.messages[0].payload.headers[i].name == 'Subject') {
								subject = threads.messages[0].payload.headers[i].value;
							}
							if (threads.messages[0].payload.headers[i].name == 'From') {
								from = threads.messages[0].payload.headers[i].value;
							}
							i++;
						}
						console.log(subject);
				});
			}
		 });
		});
      }
	  
	  /**
 * Retrieve Messages in user's mailbox matching query.
 *
 * @param  {String} userId User's email address. The special value 'me'
 * can be used to indicate the authenticated user.
 * @param  {String} query String used to filter the Messages listed.
 * @param  {Function} callback Function to call when the request is complete.
 */
function listMessages(userId, query, labelIds, callback) {
  var getPageOfMessages = function(request, result) {
    request.execute(function(resp) {
      result = result.concat(resp.messages);
      var nextPageToken = resp.nextPageToken;
      if (nextPageToken) {
        request = gapi.client.gmail.users.messages.list({
          'userId': userId,
          'pageToken': nextPageToken,
          'q': query,
		  'labelIds': labelIds
        });
        getPageOfMessages(request, result);
      } else {
        callback(result);
      }
    });
  };
  var initialRequest = gapi.client.gmail.users.messages.list({
    'userId': userId,
    'q': query,
	'labelIds': labelIds
  });
  getPageOfMessages(initialRequest, []);
}

/**
 * Retrieve Threads in the user's mailbox matching query.
 *
 * @param  {String} userId User's email address. The special value 'me'
 * can be used to indicate the authenticated user.
 * @param  {String} query String used to filter the Threads listed.
 * @param  {Function} callback Function to call when the request is complete.
 */
function listThreads(userId, query, labelIds, callback) {
  var getPageOfThreads = function(request, result) {
    request.execute(function (resp) {
      result = result.concat(resp.threads);
      var nextPageToken = resp.nextPageToken;
      if (nextPageToken) {
        request = gapi.client.gmail.users.threads.list({
          'userId': userId,
          'q': query,
          'pageToken': nextPageToken,
		  'labelIds': labelIds
        });
        getPageOfThreads(request, result);
      } else {
        callback(result);
      }
    });
  };
  var request = gapi.client.gmail.users.threads.list({
    'userId': userId,
    'q': query,
	'labelIds': labelIds
  });
  getPageOfThreads(request, []);
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
    'id': messageId
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