window.onload = function () {
  $(document).on('click', '.rotate', function () {
    $(this).toggleClass("down");
  });

  $(document).on('click', '.move-action', function () {

    $(this).parent().parent()
    .find('.action-display')
    .addClass('fa-arrow-right')
    .removeClass('fa-plus')
    .toggleClass("down")
    .removeClass('rotate');

    $(this).parent().parent()
    .find(".menu-open")
    .prop('checked', false)
    .prop("disabled", true);

    $(this).parent().parent()
    .find(".menu-item")
    .css("background", "green");

    $(this).parent().parent()
    .find(".menu-open-button")
    .css("background", "green");
  });

  $(document).on('click', '.defence-action', function () {
    $(this).parent().parent()
    .find('.action-display')
    .addClass('fa-shield')
    .removeClass('fa-plus')
    .toggleClass("down")
    .removeClass('rotate');

    $(this).parent().parent()
    .find(".menu-open")
    .prop('checked', false)
    .prop("disabled", true);

    $(this).parent().parent()
    .find(".menu-item")
    .css("background", "green");

    $(this).parent().parent()
    .find(".menu-open-button")
    .css("background", "green");
  });

  $(document).on('click', '.recruit-action', function () {
    $(this).parent().parent()
    .find('.action-display')
    .addClass('fa-bug')
    .removeClass('fa-plus')
    .toggleClass("down")
    .removeClass('rotate');

    $(this).parent().parent()
    .find(".menu-open")
    .prop('checked', false)
    .prop("disabled", true);

    $(this).parent().parent()
    .find(".menu-item")
    .css("background", "green");

    $(this).parent().parent()
    .find(".menu-open-button")
    .css("background", "green");
  });

  $(document).on('click', '.harvest-action', function () {
    $(this).parent().parent()
    .find('.action-display')
    .addClass('fa-cog')
    .removeClass('fa-plus')
    .toggleClass("down")
    .removeClass('rotate');

    $(this).parent().parent()
    .find(".menu-open")
    .prop('checked', false)
    .prop("disabled", true);

    $(this).parent().parent()
    .find(".menu-item")
    .css("background", "green");

    $(this).parent().parent()
    .find(".menu-open-button")
    .css("background", "green");
  });
};