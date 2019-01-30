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
          // console.log(data);
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
            console.log("Note data:", data.note);
            for (let i = 0; i < data.note.length; i++) {
              $(".notes").prepend("<div class='data-entry' data-id=" + data.note[i]._id + "><a href='' class='data-title' data-id=" +
                data.note[i]._id + ">" + data.note[i].title + "</a><button class=delete-note><i class='fas fa-2x fa-trash'></i></button></div>");
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

          $(".delete-note").on("click", function (event) {

            event.preventDefault();

            let selected = $(this).parent();
            let id = selected.data("id");

            $.ajax({
              type: "GET",
              url: "/delete/" + id,
              success: function (response) {
                // console.log(response);
                selected.remove();
              }
            });
          });

          // When user click's on note title, show the note, and allow for updates
          $(".data-title").on("click", function (event) {

            event.preventDefault();
            // Grab the element
            let selected = $(this);
            let id = selected.data("id");

            $.ajax({
              type: "GET",
              url: "/find/" + id,
              success: function (data) {

                // console.log(data);
                $(".notes").empty();
                $("#note-title").val(data.title);
                $("#note-message").val(data.message);
                $(".modal-footer").html('<button data-id="' + data._id + '"style="font-size: 22px;" type="button" class="update-note btn btn-sm btn-outline-primary">Update Note</button>');
              }
            });
          });

          // When user click's update button, update the specific note
          $(".modal-footer").on("click", "button.update-note", function (event) {

            event.preventDefault();

            // Save the selected element
            let id = $(this).data("id");

            $.ajax({
              type: "PUT",
              url: "/update/" + id,
              dataType: "json",
              data: {
                title: $("#note-title").val(),
                message: $("#note-message").val(),
              },
              // On successful call
              success: function (data) {

                console.log(data);

                $("#myModal").modal("hide");

              }
            });
          });

        });
    });
  });
});