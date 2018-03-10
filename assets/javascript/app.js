/*
N.B.:
      It was necessary to make the following substitution in order to
      get the topic button click handler working:

         $(".topic-btn").on("click", function() {
                   was replaced by
         $("body").on("click", ".topic-btn", function() {

      I don't fully understand the issue here, but believe that this
      has to do with event delegation, which bootstrap is apparently
      using for buttons that are contained in the btn-toolbar class.
      A single click handler at the parent level (body) is used to
      handle (possibly) many buttons(?)

      [A similar change was made to fix the Animate click handler.]
 */

// Specify what function should run as soon as this page has been
// completely loaded
$(document).ready(readyFunc);

// The list of chosen topic strings is duplicated here so that all
// of the buttons can be regenerated if necessary
var button_topics = [];

// Three of the components needed to create a request to GIPHY
var urlPrefix = "https://api.giphy.com/v1/gifs/search?q=";
var ratingParam = "&rating:g";    // for "all audiences"
var api_key   = "&api_key=rdmjbu2d3yWAg2YCp3Slg0Gz3Ia34Aks&limit=10";

// Execute this code after this web page has been fully loaded
// All of the code in this function simply creates click handler
// delarations; no functions are actually executed

function readyFunc() {

    // This is the topic button click handler. It is called whenever
    // the user clicks on any of the existing topics.
    $("body").on("click", ".topic-btn", function() {
      var button_text  = $(this).text();
      var saveText = button_text;
      // if the text consists of more than one word, substitute
      // plus signs for any spaces, per URL encoding rules
      button_text = button_text.replace(/\s+/g, "+");
      var theUrl = urlPrefix + button_text + ratingParam + api_key;

      // asynchronosly request the metadata for up to 10 gifs
      $.ajax ({
        url: theUrl,
        method: "GET"
      }).then(function(response) {  // do this once the metadata arrives
          var results = response.data;
          var gifCount = results.length;
          var idPrefix = "gif";
          var rating;
          var stillUrl;
          var animatedUrl;

          // Display a message if no matching gifs were found
          if (gifCount <= 0) {
            var errDiv = $("#error-div");
            var errMsg = $("#error-msg");
            errMsg.html("Sorry, no gifs were found for " + saveText);
            errDiv.show();
            return
          }

          // create a movie-type rating, an image element, and a set of
          // animation attributes for each gif
          for (var i = 1; i <= gifCount; i++) {
            rating = results[i-1].rating;
            stillUrl = results[i-1].images.fixed_height_still.url;
            animatedUrl = results[i-1].images.fixed_height.url;
            var htmlString = "<p>Rating: " + rating + "</p>" + "<img";
            htmlString += (" class=\"gif-img gif\" ");
            htmlString += (" src="          + '"' + stillUrl    + '"');
            htmlString += (" data-still="   + '"' + stillUrl    + '"');
            htmlString += (" data-animate=" + '"' + animatedUrl + '"');
            htmlString += (" data-state=\"still\" >");

            // clear out any old content and then store the new content
            theId = '#' + idPrefix + ((i < 10) ? '0' : '') + i.toString();
            $(theId).html('');
            $(theId).html(htmlString);
          }

          // Clear out the unused slots if fewer than 10 gifs were returned
          if ( (gifCount > 0) && (gifCount < 10) ) {
            for (var i = gifCount+1; i <= 10; i++ ) {
              theId = idPrefix + ((i < 10) ? '0' : '') + i.toString();
              $(theId).html('');
            }
          }
      })
    });

    // This is the submit button click handler. It is called whenever a
    // new topic button must be created
    $("#submit").on("click", function() {
        // Hide any previously-displayed error or warning message
        $('#error-msg').html("");
        $('#error-div').hide();

        // Make sure that the user actually entered some text
        var textControl = $('#topic-input');
        if ( textControl.val().length <= 0 ) {
          $('#error-msg').html("Please enter one or more search terms into the text box");
          $('#error-div').show();
          return false;
        }

        // Create a button, using the search term(s) as the button's text
        var newText = textControl.val().trim();
        var newButton = $("<button>");
        newButton.addClass("btn btn-secondary btn-sm topic-btn");

        newButton.attr("button");
        newButton.text(newText);
        $('#buttons-div').append(newButton);
        button_topics.push(newText);
        // clear out the search text box
        textControl.val('');
        return false;
    });


    // This is the gif animate click handler. It is called whenever
    // the user clicks on a gif
    $("body").on("click", ".gif", function() {
      var state = $(this).attr('data-state');

      if ( state === 'still') {
        // transition from still to animated
        $(this).attr("src", $(this).attr('data-animate'));
        $(this).attr('data-state', 'animate');
      } else if (state === 'animate') {
        // transition from animated to still
        $(this).attr("src", $(this).attr('data-still'));
        $(this).attr('data-state', 'still');
      } else {
        // this should not happen
        $('#error-msg').html("");
        $('#error-div').hide();
        $('#error-msg').html("Some sort of internal error occurred.");                  
        $('#error-div').show();
      }
    });
}
