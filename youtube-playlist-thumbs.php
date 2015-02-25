<?php
/*
Plugin Name: Youtube Playlist Thumbs
Description: Use the [ypt] shortcode to show a Youtube playlist. Videos within playlist can be triggered by links in page content.
Version: 0.1
Author: Joseph Stiles
License: GPL2
*/

if( !defined( 'ABSPATH' ) )
	exit;

//register the shortcode
add_shortcode("ypt", //The shortcode [ypt]
	"ypt_function"); //The function that activates when the shortcode is detected in content

function ypt_function($atts) {
  //process plugin
     $a = shortcode_atts( array( //these must be lowercase
        'playlist_id' => 'default', //default will be overwritten by the attribute value
    ), $atts );

$playlistId = $a['playlist_id'];
//Convert to number, check if number
$ypt_output =  '<div id="ypt_wrapper">  
                  <div class="video">
                    <div id="player" data-pl="'.$playlistId.'"></div>
                  </div>
                  <ul id="ypt_thumbs"></ul>
                </div>';

  return $ypt_output;
}

function ypt_assets() {

	wp_enqueue_script(
		'youtube-playlist-thumbs', //ID used in <script>
		plugin_dir_url( __FILE__ ) . 'assets/js/youtube-playlist-thumbs.js', //go get it
		array( 'jquery' ), //it needs jQuery
		'0', //version
		true //load it in the footer
	);
  wp_enqueue_style( 'youtube-playlist-thumbs', plugin_dir_url( __FILE__ ) . 'assets/css/youtube-playlist-thumbs.css' );

}
add_action( 'wp_enqueue_scripts', 'ypt_assets' );

// youtube-playlist-thumbs.js does all the heavy lifting.