String.prototype.toTitleCase = function(){
  return this.replace(/\b(\w+)/g, function(m,p){ return p[0].toUpperCase() + p.substr(1).toLowerCase() })
}

var hidePreloader = function(option,callback){
    $('#subPreloaderModel').closeModal({
        out_duration:100,
        complete:function(){
            $('#main').css('display','block');
            $('#main').css('justify-content','inherit');
            $('#main').css('align-items','inherit');
            $('.lean-overlay').remove();
            $(".container .page-content").fadeIn(200,callback);
        }
    });
};
var showPreloader = function(){
    $('#main').css('display','flex');
    $('#main').css('justify-content','center');
    $('#main').css('align-items','center');
    $(".container .page-content").hide();
    $('#subPreloaderModel').openModal({dismissible:false},1);
};
var clearContent = function(){
    $(".container .page-content").empty();
};



function toggleFullScreen(elem) {

    console.log("elem valus is :"+elem);
    elem = document.getElementById(elem);
    console.log("elem valus afer is :"+elem);
    if ((document.fullScreenElement !== undefined && document.fullScreenElement === null) || (document.msFullscreenElement !== undefined && document.msFullscreenElement === null) || (document.mozFullScreen !== undefined && !document.mozFullScreen) || (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen)) {
        console.log("inside if no fullscreen");
      if (elem.requestFullScreen) {
        elem.requestFullScreen();
      }
      else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      }
      else if (elem.webkitRequestFullScreen) {
        elem.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    }
    else {
      if (document.cancelFullScreen) {
        document.cancelFullScreen();
      }
      else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      }
      else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
    }
}

var map_styles = [
    {
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#444444"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#f2f2f2"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },

    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#46bcec"
            },
            {
                "visibility": "on"
            }
        ]
    }
];

var styledMap = new google.maps.StyledMapType(map_styles, {
    name: "Styled Map"
});

var endpoints = {
    development: {
        COMMONS_URL : 'http://0.0.0.0:7102/',
        PACKET_RECEIVER_URL: 'http://0.0.0.0:7101/',
        VTS_URL: 'http://0.0.0.0:7103/',
        SMS_URL: 'http://0.0.0.0:7104/'
    },
    production: {
        COMMONS_URL : 'http://commons.curvecube.in/',
        PACKET_RECEIVER_URL: 'http://packet.curvecube.in/',
        VTS_URL: 'http://vts.curvecube.com',
        SMS_URL: 'http://sms.curvecube.com'
    }
};

var environment = "development";

