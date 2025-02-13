var peer;
var myStream;

// Fonction pour ajouter une vidéo (locaux ou distants)
function ajoutVideo(stream) {
    try {
        var video = document.createElement('video');
        document.getElementById('participants').appendChild(video);
        video.autoplay = true;
        video.controls = true;
        video.srcObject = stream;
    } catch (error) {
        console.error(error);
    }
}

// Fonction pour enregistrer l'utilisateur
function register() {
    var name = document.getElementById('name').value;
    try {
        peer = new Peer(name);
        navigator.getUserMedia({ video: true, audio: true }, function(stream) {
            myStream = stream;
            ajoutVideo(stream);

            // Masquer le formulaire de nom et afficher les autres options
            document.getElementById('register').style.display = 'none';
            document.getElementById('userAdd').style.display = 'block';
            document.getElementById('userShare').style.display = 'block';

            // Gérer les appels entrants
            peer.on('call', function(call) {
                call.answer(myStream);
                call.on('stream', function(remoteStream) {
                    ajoutVideo(remoteStream);
                });
            });
        }, function(err) {
            console.log('Failed to get local stream', err);
        });
    } catch (error) {
        console.error(error);
    }
}

// Fonction pour appeler un autre utilisateur
function appelUser() {
    try {
        var name = document.getElementById('add').value;
        document.getElementById('add').value = ""; // Réinitialiser le champ
        var call = peer.call(name, myStream);
        call.on('stream', function(remoteStream) {
            ajoutVideo(remoteStream);
        });
    } catch (error) {
        console.error(error);
    }
}

// Fonction pour partager l'écran
function addScreenShare() {
    var name = document.getElementById('share').value;
    document.getElementById('share').value = "";

    navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: true })
        .then((stream) => {
            let call = peer.call(name, stream);
        }).catch(error => {
            console.error('Erreur lors du partage d\'écran', error);
        });
}

// Fonction pour arrêter l'enregistrement
function stopRecording() {
    // Arrêter tous les flux vidéo et audio
    if (myStream) {
        myStream.getTracks().forEach(track => track.stop());
        console.log('Enregistrement arrêté');
    }
}

