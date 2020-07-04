<?php
  function get_pdf($id, $start, $end, $docid, $DL = 'false'){
    header('Cache-Control: public');
    header('Content-Type: application/pdf');

    if ($DL == 'true'){
      header('Content-Disposition: attachment; filename="WC_report_'.$id.'.pdf"');
    }
    else {
      header('Content-Disposition: inline; filename="WC_report_'.$id.'.pdf"');
    }

    $res = scandir('/savedoc');
    $reco = $id.'_'.$start.'_'.$end;
    $file = "";
    for ($i = 2; $i <= count($res); $i++) {
      $dat = explode(".", $res[$i]);
      if (isset($dat[1]) && $dat[1] == $reco){
        $file =  $res[$i];
      }
    }

    if ($docid != NULL){ //doc id specifie explicitement en get
       $name = '/savedoc/report.*.'.$docid.'.pdf';
       $list = glob($name);
       $pdf_h = fopen($list[0],'r');
       $content = fread($pdf_h, filesize($list[0]));
       fclose ($pdf_h);
       //header('Content-Length: ' . strlen($content));
       print($content);
    } else if ($file == ""){ //file deja present en sauvegarde
      $curl = curl_init();
      curl_setopt_array($curl, array(
        CURLOPT_URL => "map_bck-end:8080/pdf/report/",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "POST",
        CURLOPT_POSTFIELDS =>"{\"points_id\": [\"".$id."\"], \"period_start\": ".$start.", \"period_end\": ".$end."}",
        CURLOPT_HTTPHEADER => array(
          "Content-Type: application/json"
        ),
      ));
      $response = curl_exec($curl);
      curl_close($curl);
      $resp = json_decode($response)->data;
      $file = base64_decode($resp->Content);
      $doc_id = $resp ->doc_id;
      print($file);
      if ($resp->Save == True){
        $name = '/savedoc/report.'.$id.'_'.$start.'_'.$end.'.'.$doc_id.'.pdf';
        $pdf = fopen ($name, 'w');
        fwrite ($pdf, $file);
        fclose ($pdf);
      }
    } else {
      $pdf_h = fopen('/savedoc'.'/' . $file,'r');
      $content = fread($pdf_h, filesize('/savedoc'.'/' . $file));
      fclose ($pdf_h);

      header('Content-Length: ' . strlen($content));
      print($content);
    }
  }
  if ((isset($_GET["id"]) &&  isset($_GET["from"]) && isset($_GET["to"])) || isset($_GET["doc"])) {
    get_pdf($_GET["id"], $_GET["from"], $_GET["to"], $_GET["doc"]);
  }
