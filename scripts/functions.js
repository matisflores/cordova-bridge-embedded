$(document).ready(function() {
	Embedded._bind('Embedded.Initialized',function() {
		Embedded._exec('device.platform', [], function(platform) {
			$('#who').html(platform.result);
		});

		Embedded._exec('device', [], function(device) {
			$('#details').html(JSON.stringify(device.result));
		});
	});
});