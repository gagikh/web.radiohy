$(document).ready(function() {
    fetch('backup.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok for backup.json');
            }
            return response.text();
        })
        .then(dataText => {
            // Remove "var stations = " from the beginning and potential trailing semicolon
            let jsonString = dataText.replace(/^var stations = /i, '');
            if (jsonString.endsWith(';')) {
                jsonString = jsonString.slice(0, -1);
            }
            
            try {
                const jsonData = JSON.parse(jsonString);
                
                var uri = jsonData.backup; 
                if (!uri || !uri.uri) {
                    console.error('Station data is not in the expected format:', jsonData);
                    $('#stations_list').html('<p>Error: Station data is not in the expected format.</p>');
                    return;
                }
                var lst = uri.uri;
                var n = lst.length;
                var dvx = document.getElementById('source_div');
                var rds = document.getElementById('stations_list');

                if (!dvx) {
                    console.error('Element with ID "source_div" not found.');
                    $('#stations_list').html('<p>Error: Player template not found.</p>');
                    return;
                }
                if (!rds) {
                    console.error('Element with ID "stations_list" not found.');
                    return;
                }

                var div = dvx.cloneNode(true);
                rds.removeChild(dvx);

                // String.prototype.endsWith is standard in ES6, but if needed for older environments:
                // String.prototype.endsWith = function (s) { 
                //       return this.length >= s.length && this.substr(this.length - s.length) == s;
                // }

                for (var i = 0; i < n; i++) {
                    var e = lst[i];
                    var clone = div.cloneNode(true);
                    
                    var audioPlayer = clone.querySelector("#html5_audio_player"); 
                    if (!audioPlayer) {
                        console.error('Audio player element not found in cloned template for station: ' + e.nickname);
                        continue; 
                    }

                    var url;
                    let pathPart = e.path || ""; // Ensure pathPart is a string
                    if (pathPart.startsWith('/')) {
                        pathPart = pathPart.substring(1);
                    }
                    if (e.port) {
                        url = `${e.protocol}://${e.hostname}:${e.port}/${pathPart}`;
                    } else {
                        url = `${e.protocol}://${e.hostname}/${pathPart}`;
                    }

                    audioPlayer.setAttribute('data-stream-url', url);
                        
                    var logo = clone.querySelector(".radio_logo"); 
                    if (logo && e.icon) {
                        logo.style.cssText = 'background: url("' + e.icon + '")' +
                            " no-repeat center;" +
                            " background-size:contain;float:left;height:100%;width:100%;";
                    }
                    
                    var txt = clone.querySelector(".station_text"); 
                    if (txt && e.webpage && e.nickname) {
                        txt.innerHTML = '<a href="' + e.webpage + '" target="_blank">' + e.nickname + '</a>';
                    }

                    clone.style.cssText = ''; 
                    rds.appendChild(clone);
                }
            } catch (e) {
                console.error('Failed to parse station data:', e);
                $('#stations_list').html('<p>Error loading radio station data. Please try again later.</p>');
            }
        })
        .catch(error => {
            console.error('Error fetching or processing backup.json:', error);
            $('#stations_list').html('<p>Could not load radio stations. Please check your connection or try again later.</p>');
        });
});

$(window).load( function() {
    var all_players_block = $('.radio_button .player').hide(); // These are the divs containing audio elements
    var all_players_button = $('.radio_button'); // These are the clickable areas
    var all_audio_tags = $('audio'); // Get all audio tags on the page

    $('.radio_button').click(function(e){
        e.preventDefault(); // Prevent default action first

        var current_radio_button = $(this); // The clicked button
        var current_player_div = current_radio_button.parent().find('.player'); // The .player div for this station
        var current_audio_element = current_player_div.find('audio')[0]; // The actual <audio> tag
        
        var isPlayingCurrently = current_radio_button.hasClass('playing'); // Check if this station was the one playing

        // First, stop all players and reset UI
        all_audio_tags.each(function() {
            this.pause();
            // this.src = ""; // Optional: clear src to stop buffering
        });
        all_players_block.hide();
        all_players_button.removeClass('playing');

        if (!isPlayingCurrently) { // If it wasn't playing, now play it
            current_player_div.show();
            current_radio_button.addClass('playing');
            var streamUrl = $(current_audio_element).attr('data-stream-url');
            if (streamUrl && current_audio_element.src !== streamUrl) { // Only set src if different or not set
                 current_audio_element.src = streamUrl;
            }
            current_audio_element.play();
        }
        // If it *was* playing, the actions above (pause all, remove class) effectively stop it.
    });
});
