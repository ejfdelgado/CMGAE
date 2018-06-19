var  miseguridad = (function() {
        
    var diferidoToken = $.Deferred();
    var diferidoUsuario = $.Deferred();

    function getRecaptchaMode() {
      // Quick way of checking query params in the fragment. If we add more config
      // we might want to actually parse the fragment as a query string.
      return location.hash.indexOf('recaptcha=invisible') !== -1 ?
          'invisible' : 'normal';
    }

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyCmZ2333zq8CGiAL93DGkZIOs7sgKoMr5I",
        authDomain: "proyeccion-colombia1.firebaseapp.com",
        databaseURL: "https://proyeccion-colombia1.firebaseio.com",
        projectId: "proyeccion-colombia1",
        storageBucket: "proyeccion-colombia1.appspot.com",
        messagingSenderId: "569221347334"
    };
    var CLIENT_ID = '569221347334-37jpt735fngvk5iob9dpb36491ahfq8v.apps.googleusercontent.com';
    
    var handleSignedInUser = function() {
        console.log('Listo, acá hago algo');
    };

    var getUiConfig = function() {
      return {
        'callbacks': {
          // Called when the user has been successfully signed in.
          'signInSuccess': function(user, credential, redirectUrl) {
            handleSignedInUser(user);
            // Do not redirect.
            return false;
          }
        },
        // Opens IDP Providers sign-in flow in a popup.
        'signInFlow': 'popup',
        'signInOptions': [
          // TODO(developer): Remove the providers you don't need for your app.
          {
            provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            // Required to enable this provider in One-Tap Sign-up.
            authMethod: 'https://accounts.google.com',
            // Required to enable ID token credentials for this provider.
            clientId: CLIENT_ID
          },
          {
            provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
            scopes :[
              'public_profile',
              'email',
              //'user_likes',
              //'user_friends'
            ]
          },
          firebase.auth.TwitterAuthProvider.PROVIDER_ID,
          firebase.auth.GithubAuthProvider.PROVIDER_ID,
          {
            provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
            // Whether the display name should be displayed in Sign Up page.
            requireDisplayName: true
          },
          {
            provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
            recaptchaParameters: {
              size: getRecaptchaMode()
            }
          }
        ],
        // Terms of service url.
        'tosUrl': 'https://www.google.com',
        'credentialHelper': CLIENT_ID && CLIENT_ID != 'YOUR_OAUTH_CLIENT_ID' ?
            firebaseui.auth.CredentialHelper.GOOGLE_YOLO :
            firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM
      };
    };

    var salir = function() {
        var promesa = firebase.auth().signOut();
        promesa.then(function() {
            // Sign-out successful.
            console.log('Salida exitosa');
            diferidoToken = $.Deferred();
            diferidoUsuario = $.Deferred();
        }, function(error) {
            // An error happened.
            console.log('No se logró salir');
        });
        return promesa;
    };
    
    diferidoToken.promise().then(function() {}, function(error) {
        diferidoUsuario.reject(error);
    });
    
    var darToken = function() {
        return diferidoToken.promise();
    };
    
    var darUsuario = function() {
        return diferidoUsuario.promise();
    };
  
    initApp = function() {
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
              diferidoUsuario.resolve(user);
              user.getIdToken().then(function(accessToken) {
                diferidoToken.resolve(accessToken);
            });
          } else {
              diferidoToken.reject();
          }
        }, function(error) {
          diferidoToken.reject(error);
        });
    };
    
    $(document).ready(function() {
        firebase.initializeApp(config);
    
        // Initialize the FirebaseUI Widget using Firebase.
        var ui = new firebaseui.auth.AuthUI(firebase.auth());
        // The start method will wait until the DOM is loaded.
        ui.start('#firebaseui-auth-container', getUiConfig());
        
      window.addEventListener('load', function() {
        initApp();
      });
    });
      
      return {
          'logout': salir,
          'darToken': darToken,
          'darUsuario': darUsuario,
      };
    })();