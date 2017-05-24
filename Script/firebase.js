"use strict";

const config = {
    apiKey: "AIzaSyAD6rxrGfFQmImBrP2JnxCRE3l5k8SjpNA",
    authDomain: "bounce-72a28.firebaseapp.com",
    databaseURL: "https://bounce-72a28.firebaseio.com",
    projectId: "bounce-72a28",
    storageBucket: "bounce-72a28.appspot.com",
    messagingSenderId: "69347143131"
};
firebase.initializeApp(config);
let auth, database, storage, user, token;
let username, email, photoUrl, uid, emailVerified;
let logedin = false;

$(document).ready(function () {
    init();
    $(".login").click(function () {
        if (user) {
            logout();
        } else {
            login();
        }
    });
    $(".logout").click(function () {
        logout();
    });
});
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        updateLogin();
        $(".username").text(username);
        $(".userpic").attr("src", photoUrl);
        $(".login").text("Sign out");
        let disconnect = database.ref("Users/" + uid);
        disconnect.onDisconnect().remove();
        logedin = true;
    } else {
        $(".login").text("Sign in");
        $(".username").text("Not Logged In");
        $(".userpic").attr("src", "https://developers.google.com/experts/img/user/user-default.png");
        logedin = false;
    }
});

function login() {
    let provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        token = result.credential.accessToken;
        // The signed-in user info.
    }).catch(function(error) {
        let errorCode = error.code;
        let errorMessage = error.message;
        let email = error.email;
        console.log("Uh oh, something bad happened: ");
        console.log(errorCode);
        console.log(errorMessage);
    });
}

function updateLogin() {
    user = firebase.auth().currentUser;
    username = user.displayName;
    email = user.email;
    photoUrl = user.photoURL;
    emailVerified = user.emailVerified;
    uid = user.uid;
}

function init() {
    auth = firebase.auth();
    database = firebase.database();
    storage = firebase.storage();
}
function logout() {
    database.ref("Users/" + uid).remove();
    firebase.auth().signOut().then(function() {
        user = null;
    }, function(error) {
        console.error('Sign Out Error', error);
    });
}