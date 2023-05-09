var keycloak = new Keycloak();

function initKeycloak() {
  keycloak
    .init({ onLoad: "login-required" })
    .then(function () {
        console.log(keycloak);
        console.log(keycloak.idTokenParsed);

      // constructTableRows(keycloak.idTokenParsed);
      // pasteToken(keycloak.token);
    }).catch(function () {
      alert("failed to initialize");
    });
}

function constructTableRows(keycloakToken) {
  document.getElementById("row-username").innerHTML =
    keycloakToken.preferred_username;
  document.getElementById("row-firstName").innerHTML = keycloakToken.given_name;
  document.getElementById("row-lastName").innerHTML = keycloakToken.family_name;

}

function pasteToken(token) {
  document.getElementById("ta-token").value = token;
  document.getElementById("ta-refreshToken").value = keycloak.refreshToken;
}

var refreshToken = function () {
  keycloak.updateToken(-1).then(function () {
    document.getElementById("ta-token").value = keycloak.token;
    document.getElementById("ta-refreshToken").value = keycloak.refreshToken;
  });
};

var logout = function () {
  keycloak.logout({ redirectUri: "http://localhost:5500/logout.html" });
};
