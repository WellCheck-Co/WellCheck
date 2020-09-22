<?php
$pass = getenv("API_ADM");
$method = getenv("METHOD");
$host = getenv("DOMAIN");
?>

<html>
  <head>
    <link rel="stylesheet" href="/css/bootstrap.min.css">
    <link rel="stylesheet" href="/css/jquery.dataTables.min.css">
    <link rel="stylesheet" href="/css/app.css">
  </head>
  <body>

    <div class="container" style="margin-top: 30px">
      <div class="row">
        <div id="menu" class="col-12 row">
          <div id="spinner1"  class="col-12" style="display: block">
            <div class="text-center">
              <div class="spinner-border" role="status" style="width: 3rem; height: 3rem;">
                <span class="sr-only">Loading...</span>
              </div>
            </div>
          </div>
          <div id="status" class="col-lg-3 col-12" >
            <div class="cont cont-hover">
              <h3>Status</h3>
              <br>
              <div id="apistatus" style="margin-bottom: 30px;">
                API : <span class="badge badge-secondary">Waiting</span>
              </div>
              <button type="button" class="btn btn-outline-primary" onclick="test()">Check</button>
            </div>
          </div>
          <div id="buttons" class="col-lg-9 col-12" style="display: None">
            <div class="cont cont-hover">
              <h2>Actions:</h2>
              <br>
              <button type="button" class="btn btn-outline-primary ml-auto mr-3" onclick="all_user()">List all users</button>
              <button type="button" class="btn btn-outline-primary ml-auto mr-3" onclick="mesure()">Points</button>
          </div>
          </div>
        </div>
        <div id="content" class="col-12 row">
          <div id="mesure" class="col-12 row cont cont-hover" style="width: calc(100% - 15px); margin-left: 15px">
		<input id="point" type="text" placeholder="Point id" class="form-control compinput col-md-12  col-sm-12 col-12" style="margin-bottom: 20px">
                
		<textarea id="mesure"  rows="14" cols="30" class="form-control compinput col-md-12  col-sm-12 col-12">
{
  'data': {
    "ph": ,
    "turbidity": ,
    "redox": ,
    "temp": ,
    "note": null, //overwritten if null
  },
  'pos': {
    'lon': ,
    'lat': ,
  }
}
               </textarea>
          </div>
          <div id="users"  class="col-12" style="display: none">
            <div class="cont cont-hover">
              <table id="userstable" class="table table-striped table-bordered table-sm" cellspacing="0" width="100%" style="text-align: center">
                <thead>
                  <tr>
                    <th class="th-sm">Id
                    </th>
                    <th class="th-sm">Name
                    </th>
                    <th class="th-sm">Email
                    </th>
                    <th class="th-sm">Phone
                    </th>
                    <th class="th-sm">Since
                    </th>
                    <th class="th-sm">Connect
                    </th>
                  </tr>
                </thead>
                <tbody id="usersbody">
                </tbody>
                <tfoot>
                  <tr>
                    <th>Id
                    </th>
                    <th>Name
                    </th>
                    <th>Email
                    </th>
                    <th>Phone
                    </th>
                    <th>Since
                    </th>
                    <th>Connect
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <script src="/js/jquery-3.3.1.min.js"></script>
    <script src="/js/bootstrap.bundle.min.js"></script>
    <script src="/js/jquery.dataTables.min.js"></script>
    <script>

      var method = "<?= $method ?> + ://";
      var host = "<?= $host ?>";
      var password = "<?= $pass ?>";
      var token = "";

      function get_token(){
        $.ajax({
          type: "POST",
          url: method + "api." + host +"/admin/login/",
          data: JSON.stringify({"password": password}),
          contentType: "application/json; charset=utf-8",
          success: store,
          error: store
        })
      }

      function test(){
        $("#apistatus")[0].innerHTML= 'API : <span class="badge badge-secondary">Waiting</span>';
        $.ajax({
          type: "GET",
          url: method + "api." + host +"/test/",
          success: store,
          error: store
        })
      }

      function store(e){
        if (e.succes){
          token = e.data && e.data.admtoken ? e.data.admtoken : token;
          $("#apistatus")[0].innerHTML='API <span class="badge badge-success">Online</span>';
          $("#spinner1")[0].style.display = "none";
          $("#buttons")[0].style.display = "block";
        } else {
          token = false;
          $("#apistatus")[0].innerHTML='API <span class="badge badge-danger">Offline</span>';
          $("#spinner1")[0].style.display = "none";
          $("#buttons")[0].style.display = "none";
        }
      }



      function all_user(){
        $("#apistatus")[0].innerHTML= 'API : <span class="badge badge-secondary">Waiting</span>';
        $.ajax({
          type: "GET",
          url: method + "api." + host +"/admin/allusers/",
          headers: {
            "admtoken":token,
          },
          success: print_user,
          error: store
        })
      }

      function connect(id){
        $.ajax({
          type: "POST",
          url: method + "api." + host +"/admin/spoof/",
          headers: {
            "admtoken":token,
          },
          data: JSON.stringify({"usr_id": id}),
          contentType: "application/json; charset=utf-8",
          success: redirect,
          error: store
        })
      }

      function redirect(e){
        if (e.succes){
          usr = e.data.usrtoken;
          time = Math.round(new Date(e.data.exp).getTime()/1000);
          url = method + "dashboard." + host + "/login?bindlocal=true&usrtoken=" + usr + "&usrtoken_exp=" + time;
          window.location.href = method + "dashboard." + host + "/login?bindlocal=true&usrtoken=" + usr + "&usrtoken_exp=" + time;
        }else{alert("error")}
      }

      function ifnull(e){
        return e == "" ? "..." : e;
      }

      function minTwoDigits(n) {
        return (n < 10 ? '0' : '') + n;
      }

      function print_user(e){
        users = e.data.users;
        store(e);
        t = ""
        for (i = 0; i < e.data.total; i++){
          date = new Date(Number(users[i].date));
          d_date = date.getFullYear() + "-" + minTwoDigits(date.getMonth()) + "-" + minTwoDigits(date.getDate()) + " " + minTwoDigits(date.getHours()) + "h" + minTwoDigits(date.getMinutes()) + "m";
          t += "<tr> \
            <td>" + ifnull(users[i].id) + "</td> \
            <td>" + ifnull(users[i].firstname) + "   " + ifnull(users[i].lastname) + "</td> \
            <td>" + ifnull(users[i].email) + "</td> \
            <td>" + ifnull(users[i].phone)+ "</td> \
            <td>" +  d_date + "</td> \
            <td><button type='button' class='btn btn-outline-primary ml-3 mr-3' onclick='connect("+ users[i].id +")'>Log as " + users[i].email + "</button> </td> \
          </tr>"
        }
        $("#usersbody")[0].innerHTML = t;
        $(document).ready(function () {
          $('#userstable').DataTable();
          $('.dataTables_length').addClass('bs-select');
          $("#users")[0].style.display = "block"
        });
        }
      get_token();
    </script>
  </body>
</html>
