// Load Youtube IFrame Player API code asynchronously. This boat is going nowhere without it.
var tag = document.createElement('script'); //Add a script tag
tag.src = "https://www.youtube.com/iframe_api"; //Set the SRC to get the API
var firstScriptTag = document.getElementsByTagName('script')[0]; //Find the first script tag in the html
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag); //Put this script tag before the first one

//Set some variables
var player;
var nowPlaying = "ypt-now-playing"; //For marking the current thumb
var nowPlayingClass = "." + nowPlaying;
var ypt_index = 0; //Playlists begin at the first video by default

jQuery(document).ready(function($) { //let the dom load first

  //Gather information from the DOM...
  var ypt_player = document.getElementById('player');
  var playlistID = ypt_player.getAttribute('data-pl');
  var ypt_thumbs = document.getElementById('ypt_thumbs');

  window.yptThumbHeight = function(){
    ypt_thumbs.style.height = document.getElementById('player').clientHeight + 'px'; //change the height of the thumb list
    //breaks if ypt_player.clientHeight + 'px';
  }

  //Once the Youtube Iframe API is ready...
  window.onYouTubeIframeAPIReady = function() { // Creates an <iframe> (and YouTube player) after the API code downloads. must be globally available
    player = new YT.Player('player', {
      height: '360',
      width: '640',
      playerVars: 
      {
        listType:'playlist',
        list: playlistID
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
  } //onYouTubeIframeAPIReady() 

  //Once the player is ready...
  function onPlayerReady(event) {
    yptThumbHeight(); //Set the thumb containter height
    //Get the playlist data
    var playListURL = 'http://gdata.youtube.com/feeds/api/playlists/' + playlistID + '?v=2&alt=json&callback=?';
      $.getJSON(playListURL, function(data) {
          var list_data = "";
          $.each(data.feed.entry, function(i, item) {
              var feedTitle = item.title.$t;
              var feedURL = item.link[1].href;
              var fragments = feedURL.split("/");
              var videoID = fragments[fragments.length - 2];
              var thumb = "http://img.youtube.com/vi/"+ videoID +"/mqdefault.jpg";
              list_data += '<li data-ypt-index="'+ i +'"><p>' + feedTitle + '</p><span><img alt="'+ feedTitle +'" src="'+ thumb +'"</span></li>';
          });
          $(list_data).appendTo(ypt_thumbs);
      });
  }//function onPlayerReady(event) {

  // When the player does something...
  function onPlayerStateChange(event) {  

    //Let's check on what video is playing
    var currentIndex = player.getPlaylistIndex();
    var the_thumbs = ypt_thumbs.getElementsByTagName('li');
    var currentThumb = the_thumbs[currentIndex];

    if (event.data == YT.PlayerState.PLAYING) { //A video is playing

      for (var i = 0; i < the_thumbs.length; i++) { //Loop through the thumbs
        the_thumbs[i].className = ""; //Remove nowplaying from each thumb
      }

      currentThumb.className = nowPlaying; //this will also erase any other class belonging to the li
      //need to do a match looking for now playing
    }

    //if a video has finished, and the current index is the last video, and that thumb already has the nowplaying class
    if (event.data == YT.PlayerState.ENDED && currentIndex == the_thumbs.length - 1 && the_thumbs[currentIndex].className == nowPlaying){ 
      jQuery.event.trigger('playlistEnd'); //Trigger a global event
     }
  } //function onPlayerStateChange(event) 

  //When the user changes the window size...
  window.addEventListener('resize', function(event){
    yptThumbHeight(); //change the height of the thumblist
  });

  //When the user clicks an element with a playlist index...
  $(document).on('click','[data-ypt-index]:not(".ypt-now-playing")',function(e){ //click on a thumb that is not currently playing
    ypt_index = Number($(this).attr('data-ypt-index')); //Get the ypt_index of the clicked item
    if(navigator.userAgent.match(/(iPad|iPhone|iPod)/g)){ //if IOS
       player.cuePlaylist({ //cue is required for IOS 7
          listType: 'playlist',
          list: playlistID,
          index: ypt_index,
          suggestedQuality: 'hd720' //quality is required for cue to work, for now
          // https://code.google.com/p/gdata-issues/issues/detail?id=5411
      }); //player.cuePlaylist
    } else { //yay it's not IOS!
      player.playVideoAt(ypt_index); //Play the new video, does not work for IOS 7
    }
    $(nowPlayingClass).removeClass(nowPlaying); //Remove "now playing" from the thumb that is no longer playing
    //When the new video starts playing, its thumb will get the now playing class
  }); //$(document).on('click','#ypt_thumbs...

}); //jQuery(document).ready(function( $ ) {