var peer;
var myStream;
var mediaRecorder;
var recordedChunks = [];

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

function register() {
    var name = document.getElementById('name').value;
    try {
        peer = new Peer(name);
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            myStream = stream;
            ajoutVideo(stream);

            // Afficher les options après inscription
            document.getElementById('register').style.display = 'none';
            document.getElementById('userAdd').style.display = 'block';
            document.getElementById('userShare').style.display = 'block';
            document.getElementById('stopRecording').style.display = 'block';

            // Gérer les appels entrants
            peer.on('call', function(call) {
                call.answer(myStream);
                call.on('stream', function(remoteStream) {
                    ajoutVideo(remoteStream);
                });
            });

            // Démarrer l'enregistrement
            startRecording(stream);

        }).catch(err => {
            console.log('Failed to get local stream', err);
        });
    } catch (error) {
        console.error(error);
    }
}

function appelUser() {
    try {
        var name = document.getElementById('add').value;
        document.getElementById('add').value = "";
        var call = peer.call(name, myStream);
        call.on('stream', function(remoteStream) {
            ajoutVideo(remoteStream);
        });
    } catch (error) {
        console.error(error);
    }
}

function addScreenShare() {
    var name = document.getElementById('share').value;
    document.getElementById('share').value = "";
    navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: true })
        .then((stream) => {
            let call = peer.call(name, stream);
        });
}

// Fonction pour démarrer l'enregistrement
function startRecording(stream) {
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = function(event) {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = function() {
        var blob = new Blob(recordedChunks, { type: 'video/webm' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'enregistrement.webm';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    mediaRecorder.start();
}

// Fonction pour arrêter l'enregistrement
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        document.getElementById('stopRecording').style.display = 'none'; // Cacher le bouton après arrêt
    }
}
