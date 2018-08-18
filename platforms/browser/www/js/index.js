/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var dbSize = 5 * 1024 * 1024; // 5MB

var db = openDatabase("Todo", "", "Todo manager", dbSize, function() {
    console.log('db successfully opened or created');
});

function onSuccess(transaction, resultSet) {
    console.log('Query completed: ' + JSON.stringify(resultSet));
}

function onError(transaction, error) {
    console.log('Query failed: ' + error.message);
}

function includeHTML() {
  var z, i, elmnt, file, xhttp;
  /*loop through a collection of all HTML elements:*/
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    /*search for elements with a certain atrribute:*/
    file = elmnt.getAttribute("w3-include-html");
    if (file) {
      /*make an HTTP request using the attribute value as the file name:*/
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status == 200) {elmnt.innerHTML = this.responseText;}
          if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
          /*remove the attribute, and call this function once more:*/
          elmnt.removeAttribute("w3-include-html");
          includeHTML();
        }
      }      
      xhttp.open("GET", file, true);
      xhttp.send();
      /*exit the function:*/
      return;
    }
  }
};

var app = {
    // Application Constructor
    initialize: function() {
        
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        
        //CREATE TABLE
        db.transaction(function (tx) {
            tx.executeSql("CREATE TABLE IF NOT EXISTS data(ID INTEGER PRIMARY KEY ASC, NAME TEXT, USERNAME TEXT, PASSWORD TEXT)",
                [], onSuccess, onError);
        });

        //HEAD
        $("#headApp").html("Password Saver");

        //DATATABBLE
        $('#data').DataTable();
        $(".dataTables_empty").hide();

        includeHTML();
        

        //LOAD PAGE URL
        var parts = window.location.search.substr(1).split("&");
        var $_GET = {};
        for (var i = 0; i < parts.length; i++) {
            var temp = parts[i].split("=");
            $_GET[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
        }
        
        //-VIEW
        if($_GET["mod"] == 'V'){
          $("#subtitle").html("Password View");  
          
          db.transaction(function (tx) {
              tx.executeSql('SELECT * FROM data WHERE ID = '+$_GET["ID"],[], function(tx, results){
                for (var i = 0; i < results.rows.length; i++) {
                    row = results.rows.item(i);
                    $("#data-name").val(row["NAME"]);
                    $("#data-username").val(row["USERNAME"]);
                    $("#data-password").val(row["PASSWORD"]);
                }
              });
          });
          
          $("#data-name").prop('disabled', true);
          $("#data-username").prop('disabled', true);
          $("$data-password").prop('disabled', true);
        }


        //EDIT
        if($_GET["mod"] == 'E'){
          $("#subtitle").html("Password Edit");  
          
          db.transaction(function (tx) {
              tx.executeSql('SELECT * FROM data WHERE ID = '+$_GET["ID"],[], function(tx, results){
                for (var i = 0; i < results.rows.length; i++) {
                    row = results.rows.item(i);
                    $("#data-name").val(row["NAME"]);
                    $("#data-username").val(row["USERNAME"]);
                    $("#data-password").val(row["PASSWORD"]);
                }
              });
          });

          $("#data-mod").val("E");
          $("#data-id").val($_GET["ID"]);
        }

    },

    doQuery : function(){
        //INSERT
        db.transaction(function (tx) {
            tx.executeSql("INSERT INTO todo(todo, added_on) VALUES (?,?)", ['super my todo item', new Date().toUTCString()], onSuccess, onError);
        });

        //SELECT
        db.transaction(function (tx) { 
        tx.executeSql('SELECT * FROM todo', [], function (tx, results) { 
              var len = results.rows.length, i; 
              msg = "<p>Found rows: " + len + "</p>"; 
              //document.querySelector('#status').innerHTML +=  msg; 

              for(var i=0; i<results.rows.length; i++) {
                var row = results.rows.item(i);
                //document.querySelector('#status').innerHTML += row["todo"]+"<br/>";
              }
          
           }, null); 
        });
    },

    doView : function(){  //SELECT
        db.transaction(function (tx) { 
        tx.executeSql('SELECT * FROM data', [], function (tx, results) { 
              var len = results.rows.length, i; 
              for(var i=0; i<results.rows.length; i++) {
                var row = results.rows.item(i);

                //alert(row["NAME"]);

                rowstmt =  '<tr role="row" class="odd">';
                rowstmt += '<td tabindex="0" class="sorting_1"><a href="add.html?ID='+row["ID"]+'&&mod=V">'+row["NAME"]+'</a></td>';                 
                rowstmt += '<td class=" actions">';
                rowstmt += '<a href="add.html?ID='+row["ID"]+'&&mod=E"class="btn btn-icon btn-pill btn-primary" data-toggle="tooltip" title="Edit"><i class="fa fa-fw fa-edit"></i></a>';
                rowstmt += '<a onclick = "app.doDelete(\''+row["ID"]+'\')" class="btn btn-icon btn-pill btn-danger" data-toggle="tooltip" title="Delete"><i class="fa fa-fw fa-trash"></i></a>';
                rowstmt += '</td>'
                rowstmt += '</tr>';
                
                $('table tbody').append(rowstmt);
              }
          
           }, null); 
        });
    },

    doAdd : function(){
      if($("#data-mod").val() == "E"){
        db.transaction(function (tx) {
             tx.executeSql("UPDATE data SET NAME = ?, USERNAME = ? ,PASSWORD = ? WHERE ID = "+$("#data-id").val(), 
                [$("#data-name").val(),
                 $("#data-username").val(),
                 $("#data-password").val()], 
                 onSuccess, onError);
          });
          alert("Data has Been Edited"); 
      } else{ 
          db.transaction(function (tx) {
             tx.executeSql("INSERT INTO data(NAME,USERNAME,PASSWORD) VALUES (?,?,?)", 
                [$("#data-name").val(),
                 $("#data-username").val(),
                 $("#data-password").val()], 
                 onSuccess, onError);
          });
          alert("Data Has Been Uploaded");
      }
    },

    doDelete : function(ID){
        if(confirm("Are you sure want to delete ?") == true){
          db.transaction(function (tx) {
             tx.executeSql("DELETE FROM data WHERE ID = "+ID, 
                [], 
                 onSuccess, onError);
          });
          alert("Data Has Been Delete");
          location.reload();
        }
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();
app.doView();

$("#add-data").click(function(){
    app.doAdd();
});