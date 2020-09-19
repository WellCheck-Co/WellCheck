<?php
	$orders = [];
	$admpassword = getenv("API_ADM");
	$api_host = getenv("API_HOST");

	$curl = curl_init();

	curl_setopt_array($curl, array(
		CURLOPT_URL => "map_bck-end:8080/admin/login/",
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_TIMEOUT => 30,
		CURLOPT_POST => true,
		CURLOPT_POSTFIELDS => json_encode(["password" => $admpassword]),
		CURLOPT_HTTPHEADER => array(
			"Content-Type: application/json",
			"Accept: application/json"
		)
	));

	$admtoken = json_decode(curl_exec($curl))->data->admtoken;

	curl_setopt_array($curl, array(
		CURLOPT_URL => "map_bck-end:8080/admin/newOrders/",
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_TIMEOUT => 30,
		CURLOPT_CUSTOMREQUEST => "GET",
		CURLOPT_HTTPHEADER => array(
			"admtoken: $admtoken"
		)
	));

	$orders = json_decode(curl_exec($curl))->data->orders;

	curl_close($curl);
?>
<html>
	<header>
	</header>
	<body>
		<div class="container">
			<div class="row">
				<div class="col-12">
					</br>
					<h1 class="col-sm-12 col-12" style="text-align: center;">Orders waiting for validation</h1>
					</br>
					<ul class="list-group col-12 modalelist" style="height: auto;max-height: 400px;">
						<?php foreach($orders as $order): ?>
						<li class="list-group-item">
							<div class="row justify-content-md-center">
							<h1><?php echo $order->id ?></h1>
							<div class="col-12"></div>
								<div style="text-align: end" class="col-3" for="'userid_' + order.id">User :</div>
								<div style="text-align: left" class="col-9" id="user_<?php echo $order->id ?>"><?php echo $order->user->lastname . " " . $order->user->firstname . " ( " . $order->user->email . " )" ?></div>
								<div style="text-align: end" class="col-3" for="'devices_' + order.id">Devices ordered :</div>
								<div style="text-align: left" class="col-9" id="devices_<?php echo $order->id ?>"><?php echo $order->details->devicesNumber ?></div>
								<div style="text-align: end" class="col-3" for="'price_' + order.id">Total Price : </div>
								<div style="text-align: left" class="col-9" id="price_<?php echo $order->id ?>"><?php echo $order->payment->amount . "€ ( " . ($order->payment->paid ? "" : "not") . " paid )" ?></div>
								<div style="text-align: end" class="col-3" for="'date_' + order.id">Date :</div>
								<div style="text-align: left" class="col-9" id="date_<?php echo $order->id ?>"><?php echo $order->date ?></div>
								<div class="col-8">
									<div class="row justify-content-center">
										<button onclick="reject('<?php echo $order->id . '\',' . $order->user->id ?>)" type="button" class="btn btn-outline-danger ml-auto mr-3">Reject</button>
										<button onclick="accept('<?php echo $order->id . '\',' . $order->user->id ?>)" type="button" class="btn btn-outline-success mr-3">Accept</button>
									</div>
								</div>
							</div>
						</li>
						<?php endforeach; ?>
					</ul>
				</div>
			</div>
		</div>
		<script src="../js/axios.min.js"></script>
		<script src="https://code.jquery.com/jquery-3.4.1.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>
		<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.bundle.min.js" integrity="sha384-6khuMg9gaYr5AxOqhkVIODVIvm9ynTT5J4V1cfthmT+emCG6yVmEZsRHdxlotUnm" crossorigin="anonymous"></script>
		<link href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
		<script>
			var api_host = "<?php echo $api_host ?>";
			var admtoken = "<?php echo $admtoken ?>";
			var headers = {"Content-Type": "application/json", "Accept": "application/json", "admtoken": admtoken};

			accept = (order_id, user_id) => {
				var data = {};
				data['headers'] = headers;
				data['data'] = {
					"order_id": order_id,
					"user_id": user_id
				};
				axios.post(api_host + "/admin/validateOrder/", data.data, { headers: data.headers})
					  .then(response => {
						location.reload();
					})
			}
			
			reject = (order_id, user_id) => {
				var data = {};
				data['headers'] = headers;
				data['data'] = {
					"order_id": order_id,
					"user_id": user_id
				};
				axios.post(api_host + "/admin/rejectOrder/", data.data, { headers: data.headers})
          			.then(response => {
						location.reload();
					})
			}

		</script>
	</body>
</html>