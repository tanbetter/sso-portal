var api_url = chatboxJq("[data-api-url]")[0].dataset.apiUrl
var authen_base_url = chatboxJq("[data-api-url]")[0].dataset.authenUrl

function acccess_token() {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("grant_type", authen_api_grant_type);
    urlencoded.append("client_id", authen_api_client_id);
    urlencoded.append("client_secret", authen_api_client_secret);
    urlencoded.append("username", document.getElementById("textfield").value);
    urlencoded.append("password", document.getElementById("textfield2").value);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    };
    fetch(authen_base_url+'/'+authen_api_url + '/connect/token', requestOptions)
        .then(response => response.json())
        .then((result) => {
            login_process = false
            sessionStorage.setItem("access_token", result.access_token);
            var jwt = parseJwt(result.access_token)
            sessionStorage.setItem("username_display", jwt.name);
            setTimeout(function() { window.location.href = homepage; }, 5000);
        })
        .catch((error) => {
            login_process = false;
            chatboxJq('.login_button').html('เข้าสู่ระบบ')
        });
}

function start_conversation(callback) {
    var myHeaders = new Headers();
    var requestOptions = {
        method: 'POST'
    };

    if (sessionStorage.getItem("access_token") && sessionStorage.getItem("access_token") !== 'undefined') {
        myHeaders.append("Authorization", "Bearer " + sessionStorage.getItem("access_token"));
        requestOptions.headers = myHeaders
    }

    fetch(api_url + "/startConversation", requestOptions)
        .then(handleErrors)
        .then(response => response.json())
        .then((result) => {
            console.log('start_conversation')
            sessionStorage.setItem("chat_secret", result.conversation_secret)
            callback(true)
        })
        .catch((error) => {
            console.error('initConversation ' + error)
            callback(false)
        });
}



var page = 1
var limit = 100



function apiChatHistory(callback) {
    var myHeaders = new Headers();
    myHeaders.append("x-conversation-secret", sessionStorage.getItem("chat_secret"));

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch(api_url + "/message?page=" + page + "&page_size=" + limit, requestOptions)
        .then(handleErrors)
        .then(response => response.json())
        .then(callback)
        .catch((error) => { console.error('Logs ' + error) });
}


function apiSendMessage(message, payload = '', callback) {
    var myHeaders = new Headers();
    myHeaders.append("x-conversation-secret", sessionStorage.getItem("chat_secret"));
    myHeaders.append("Content-Type", "application/json");

    var postdata = { "text": message }
    if (payload) {
        postdata.payload = payload
    } else {

    }
    var raw = JSON.stringify(postdata);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch(api_url + "/message", requestOptions)
        .then(handleErrors)
        .then(response => response.json())
        .then(callback)
        .catch((error) => {
            console.error(' Send Message ' + error);
            callback(error)
        });
}

function formTicket(postdata, callback) {
    var myHeaders = new Headers();
    myHeaders.append("x-conversation-secret", sessionStorage.getItem("chat_secret"));
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify(postdata);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch(api_url + "/createticket", requestOptions)
        .then(handleErrors)
        .then(response => response.json())
        .then(callback)
        .catch((error) => {
            console.error(' Send Message ' + error);
            callback(error)
        });
}

function masterTicket(callback) {
    
    var myHeaders = new Headers();
    myHeaders.append("x-conversation-secret", sessionStorage.getItem("chat_secret"));
    myHeaders.append("Content-Type", "application/json");


    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch(api_url + "/masterticket", requestOptions)
        .then(handleErrors)
        .then(response => response.json())
        .then(callback)
        .catch((error) => {
            console.error(' Send Message ' + error);
            callback(error)
        });
}
