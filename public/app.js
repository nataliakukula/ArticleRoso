// DOM fully loaded
$(document).ready(function () {
  //Don't show message and buttons if SoundCloud is scraped
  if ($(".scraped").children().length == 0) {
    $(".container").show();
  } else {
    $(".container").hide();
    $("#loading").hide();
  }
  // Only show the loading on "/scrape" trigger
  $("#loading").hide();
  //Show loading gif before page redirects from the "/scrape"
  $(".scraping").on("click", function () {
    $("#loading").show();
    // $(".container").hide();
  });

  //Save the playlist
  $(function () {
    $(".save-playlist").on("click", function (event) {

      event.preventDefault();

      let id = $(this).data("id");
      // console.log(id);

      $.ajax("/playlist/" + id, {
        type: "PUT",
        data: {

          saved: true

        }
      }).then(
        function (data) {
          console.log(data);
          // Reload the page to get the updated list
          location.reload();
        }
      );
    });
  });

  // When user clicks the delete button for a saved playlist
  $(function () {
    $(".delete").on("click", function (event) {

      event.preventDefault();

      let id = $(this).data("id");

      $.ajax({
        type: "GET",
        url: "/clear/" + id,
        success: function (response) {
          console.log(response);
          location.reload();
        }
      });
    });
  });

  // Whenever someone clicks on the playlist's note
  $(function () {
    $(".note").click(function () {

      event.preventDefault();

      $(".notes").empty();
      $(".form-group").empty();

      let id = $(this).data("id");
      // console.log(id);

      $.ajax({
        method: "GET",
        url: "/note/" + id
      })
        .then(function (data) {
          // console.log("Playlist: ", data);
          $(".modal-subtitle").html(data.title);
          $(".form-group").append('<label for="note-title" class="col-form-label">Title:</label>');
          $(".form-group").append('<input type="text" class="form-control" id="note-title">');
          $(".form-group").append('<label for="note" class="col-form-label">Message:</label>');
          $(".form-group").append('<textarea class="form-control" id="note-message"></textarea>');
          $(".modal-footer").html('<button data-id="' + data._id + '"style="font-size: 22px;" type="button" class="submit-note btn btn-sm btn-outline-primary">Add Note</button>');

          // If a playlist has notes display them
          if (data.note.length > 0) {
            // console.log("Note data:", data.note);
            for (let i = 0; i < data.note.length; i++) {
              $(".notes").prepend("<p class='data-entry' data-id=" + data._id + "><span class='dataTitle' data-id=" +
                data._id + ">" + data.note[i].title + "</span><button class=delete><i class='fas fa-trash'></i></button></p>");
            };
          };

          //Create modal card on create event
          $("#myModal").modal("show");

          $(".submit-note").on("click", function () {

            event.preventDefault();

            let id = $(this).data("id");
            // console.log(id);

            $.ajax({
              type: "POST",
              dataType: "json",
              url: "/note/" + id,
              data: {
                title: $("#note-title").val(),
                message: $("#note-message").val()
              }
            })
              .then(function (data) {

                // console.log(data);

                $("#myModal").modal("hide");

              });
          });
        });
    });
  });

  // // When you click the savenote button
  // $(document).on("click", "#save-playlist", function () {
  //   // Grab the id associated with the article from the submit button
  //   var thisId = $(this).attr("data-id");

  //   // Run a POST request to change the note, using what's entered in the inputs
  //   $.ajax({
  //     method: "POST",
  //     url: "/articles/" + thisId,
  //     data: {
  //       // Value taken from title input
  //       title: $("#titleinput").val(),
  //       // Value taken from note textarea
  //       body: $("#bodyinput").val()
  //     }
  //   })
  //     // With that done
  //     .then(function (data) {
  //       // Log the response
  //       console.log(data);
  //       // Empty the notes section
  //       $("#notes").empty();
  //     });

  //   // Also, remove the values entered in the input and textarea for note entry
  //   $("#titleinput").val("");
  //   $("#bodyinput").val("");
  // });
});