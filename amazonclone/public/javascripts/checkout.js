//we can do this because publishable key javascript was set after stripe cdn in checkout.hbs
Stripe.setPublishableKey('pk_test_PUa6hRg4D4zPVPEnSkk0Hd8n');

var $form = $('#checkout-form'); //id from checkout.hbs, (#) for id, (.) for class

//submit to stripe for validation
$form.submit(function(event){
  $('#charge-error').addClass('hidden'); //to see new errors upon submission
  $form.find('button').prop('disabled', true); //so users cannot submit again during validation
  Stripe.card.createToken({
    number: $('#card-number').val(), //ids from checkout.hbs
    cvc: $('#card-cvc').val(),
    exp_month: $('#card-expiry-month').val(),
    exp_year: $('#card-expiry-year').val(),
    name: $('#card-name').val()
  }, stripeResponseHandler);
  return false; //make sure that submission to server stops before validation
});

function stripeResponseHandler(status, response) {
if (response.error) { // Problem!

    // Show the errors on the form
    $('#charge-error').text(response.error.message); //error placed outside of form
    $('#charge-error').removeClass('hidden');
    $form.find('button').prop('disabled', false); // Re-enable submission

  } else { // Token was created!

    // Get the token ID:
    var token = response.id;

    // Insert the token into the form so it gets submitted to the server:
    $form.append($('<input type="hidden" name="stripeToken" />').val(token));

    // Submit the form:
    $form.get(0).submit();

  }
}
