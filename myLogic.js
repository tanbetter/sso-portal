var keycloak = new Keycloak();
const secretkey = "faa5cb541e047c179f3f3ac24f9df65d";
var base_url_dev = "http://localhost:8000/api";
// const base_url_dev = "http://3.0.104.107:801/api";

const base_url_redirect = "https://sso-landingpage.ingress-cdp-ry04.sso.go.th";
function initKeycloak() {
  keycloak
    .init({ onLoad: "login-required" })
    .then(function () {
      console.log(keycloak);
      console.log(keycloak.idTokenParsed);

      // constructTableRows(keycloak.idTokenParsed);
      // pasteToken(keycloak.token);
    })
    .catch(function () {
      alert("failed to initialize");
    });
}

const refreshToken = function () {
  keycloak.updateToken(-1).then(function () {
    document.getElementById("ta-token").value = keycloak.token;
    document.getElementById("ta-refreshToken").value = keycloak.refreshToken;
  });
};

const logout = function () {
  keycloak.logout({ redirectUri: base_url_redirect });
};
// ===================================================================

function access_token(app) {
  var urlencoded = new URLSearchParams();
  urlencoded.append("secret", secretkey);
  var requestOptions = {
    method: "POST",
    body: urlencoded,
    redirect: "follow",
  };
  fetch(base_url_dev + "/get-token", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      var token = result.data;
      console.log(token.access_token);
      get_menu(token.access_token, app);
    })
    .catch((error) => console.log("error", error));
}

function get_menu(token, app) {
  var form = new FormData();
  form.append("data", keycloak.idToken);
  form.append("application", app);

  var settings = {
    url: base_url_dev + "/get_menu",
    method: "POST",
    timeout: 0,
    headers: {
      Authorization: "Bearer " + token,
      contentType:
        "application/json; boundary=<calculated when request is sent>",
      "Access-Control-Allow-Origin": "*",
    },
    processData: false,
    // mimeType: "application/json; boundary=<calculated when request is sent>",
    contentType: false,
    data: form,
    crossorigin: true,
    mode: "no-cors",
  };

  $.ajax(settings).done(function (response) {
    bypass_token(response, app);
    // console.log(response);
  });
}

function bypass_token(token_key, app) {
  const list_permalink = [
    "https://www.google.co.th/",
    "https://twboonth.github.io/",
    "https://www.w3schools.com/",
    "http://localhost:8000/admin/",
    "https://www.google.co.th/",
  ];
  // console.log(list_permalink);
  // console.log(app);
  const checkAPP = app - 1;
  const permalink = list_permalink[checkAPP];
  console.log(permalink);
  acccess_token_bypass(token_key, permalink);
}

function acccess_token_bypass(permission, link) {
  var urlencoded = new URLSearchParams();
  urlencoded.append("secret", secretkey);
  var requestOptions = {
    method: "POST",
    body: urlencoded,
    redirect: "follow",
  };
  fetch(base_url_dev + "/get-token", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      var token = result.data;
      // console.log(token.access_token);
      get_data_bypass(token.access_token, permission, link);
    })
    .catch((error) => console.log("error", error));
}

function get_data_bypass(access_token, token_bypass, link) {
  // console.log(token_bypass);
  var form = new FormData();
  form.append("bypass", token_bypass);
  var settings = {
    url: base_url_dev + "/token_bypass",
    method: "POST",
    timeout: 0,
    headers: {
      Authorization: "Bearer " + access_token,
      contentType:
        "application/json; boundary=<calculated when request is sent>",
      "Access-Control-Allow-Origin": "*",
    },
    processData: false,
    // mimeType: "application/json; boundary=<calculated when request is sent>",
    contentType: false,
    data: form,
    crossorigin: true,
    mode: "no-cors",
  };

  $.ajax(settings).done(function (response) {
    // console.log(response);
  });
}
