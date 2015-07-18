window.onload = function () {
  $(document).on('click', '.rotate', function () {
    $(this).toggleClass("down");
  });

  function lockInAction(element, icon) {
    element.parent().parent()
    .find('.action-display')
    .addClass(icon)
    .removeClass('fa-plus')
    .toggleClass("down")
    .removeClass('rotate');

    element.parent().parent()
    .find(".menu-open")
    .prop('checked', false)
    .prop("disabled", true);

    element.parent().parent()
    .find(".menu-item")
    .css("background", "green");

    element.parent().parent()
    .find(".menu-open-button")
    .css("background", "green");

    scrollToNextAction();
  }

  $(document).on('click', '.move-action', function () {
    lockInAction($(this), 'fa-arrow-right');
  });

  $(document).on('click', '.defence-action', function () {
    lockInAction($(this), 'fa-shield');
  });

  $(document).on('click', '.recruit-action', function () {
    lockInAction($(this), 'fa-bug');
  });

  $(document).on('click', '.harvest-action', function () {
    lockInAction($(this), 'fa-cog');
  });

  function scrollToNextAction() {
    if ($('.fa-plus').length > 0) {
      $('#map').scrollTo($('.fa-plus'), {duration: 1000, axis: 'xy', offset: -150});
    }
  }
};